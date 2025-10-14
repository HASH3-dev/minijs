import { Component } from "./Component";
import { getChildSlots } from "./decorators/Child";

/**
 * Options for rendering components
 */
export interface RenderOptions {
  /** Parent component for DI hierarchy */
  parent?: Component;
  /** Alternative: any component with injector for DI context */
  context?: Component;
}

/**
 * Options for creating component instances
 */
export interface CreateOptions extends RenderOptions {
  /** Skip lifecycle hooks execution */
  skipLifecycle?: boolean;
}

/**
 * Component class type
 */
export type ComponentClass<T = Component> = new (...args: any[]) => T;

/**
 * Application manages the component tree lifecycle with two-phase rendering:
 * 1. Build Phase: Instantiate all components top-down
 * 2. Render Phase: Execute render() bottom-up (ensures DI works)
 */
export class Application {
  private rootComponent: Component;
  private rootDom?: Node;
  private mountTarget?: HTMLElement;

  constructor(rootComponent: Component | Node) {
    // If it's already a Node (shouldn't happen with new implementation, but handle it)
    if (
      rootComponent instanceof Node &&
      !(rootComponent instanceof Component)
    ) {
      throw new Error(
        "Application expects a Component instance. Did you forget to use JSX?"
      );
    }
    this.rootComponent = rootComponent as Component;
  }

  /**
   * Renders the application and returns the DOM node
   */
  render(): Node {
    if (this.rootDom) {
      return this.rootDom;
    }

    this.rootDom = Application.renderBottomUp(this.rootComponent);
    return this.rootDom;
  }

  /**
   * Renders and mounts the application to a DOM element
   * @param selector CSS selector or HTMLElement
   */
  mount(selector: string | HTMLElement): void {
    const dom = this.render();

    const target =
      typeof selector === "string"
        ? document.querySelector(selector)
        : selector;

    if (!target) {
      throw new Error(`Mount target not found: ${selector}`);
    }

    target.appendChild(dom);
    this.mountTarget = target as HTMLElement;
  }

  /**
   * Unmounts the application from the DOM
   */
  unmount(): void {
    if (this.rootDom && this.rootDom.parentNode) {
      this.rootDom.parentNode.removeChild(this.rootDom);
    }
    this.rootDom = undefined;
    this.mountTarget = undefined;
  }

  /**
   * Gets the root component instance
   */
  getRoot(): Component {
    return this.rootComponent;
  }

  /**
   * Renders a component within the application context (inherits root DI)
   */
  renderComponent(component: ComponentClass, props?: any): Node {
    return Application.render(component, props, { parent: this.rootComponent });
  }

  // === Static Methods for Standalone Rendering ===

  /**
   * Renders a component standalone or with parent context
   * @param component Component class or instance
   * @param props Props to pass to the component
   * @param options Rendering options (parent for DI)
   */
  static render(
    component: Component | ComponentClass,
    props?: any,
    options?: RenderOptions
  ): Node {
    const instance = this.createInstance(component, props, options);
    return this.renderBottomUp(instance);
  }

  /**
   * Renders a component within a parent context (shorthand for DI)
   * @param component Component class
   * @param props Props
   * @param parentContext Parent component with injector
   */
  static renderInContext(
    component: ComponentClass,
    props: any,
    parentContext: Component
  ): Node {
    return this.render(component, props, { parent: parentContext });
  }

  /**
   * Creates a component instance without rendering
   * @param component Component class or instance
   * @param props Props to pass
   * @param options Creation options
   */
  static createInstance(
    component: Component | ComponentClass,
    props?: any,
    options?: CreateOptions
  ): Component {
    // If already an instance, return it
    if (component instanceof Component) {
      // Update parent if provided
      if (options?.parent) {
        component.__parent_component = options.parent;
      } else if (options?.context) {
        component.__parent_component = options.context;
      }
      return component;
    }

    // Create new instance
    const instance = new component();
    instance.props = props || {};

    // Set parent for DI
    if (options?.parent) {
      instance.__parent_component = options.parent;
    } else if (options?.context) {
      instance.__parent_component = options.context;
    }

    return instance;
  }

  // === Private Rendering Methods ===

  // Track current rendering instance for proper subscription context
  private static currentRenderingInstance: Component | undefined;

  /**
   * Get the current rendering instance (used by jsx runtime for subscriptions)
   */
  static getCurrentRenderingInstance(): Component | undefined {
    return this.currentRenderingInstance;
  }

  /**
   * Renders a component and its children bottom-up
   * Children are rendered first, then the component itself
   */
  private static renderBottomUp(component: Component | any): Node {
    // If not a Component, handle as primitive or Node
    if (!(component instanceof Component)) {
      if (component instanceof Node) {
        return component;
      }
      // Primitive value (string, number, etc)
      if (component != null) {
        return document.createTextNode(String(component));
      }
      return document.createComment("empty");
    }

    // Check if already rendered to prevent duplicate lifecycle calls
    if ((component as any).__domCache) {
      return (component as any).__domCache;
    }

    // 1. Render children in properties FIRST (recursive, bottom-up)
    this.renderChildren(component);

    // 2. Set current rendering instance so subscriptions use correct component
    const previousInstance = this.currentRenderingInstance;
    this.currentRenderingInstance = component;

    // 3. Now render this component (may still have Component children in JSX)
    let domResult = component.render();

    // 4. Restore previous instance
    this.currentRenderingInstance = previousInstance;

    // 5. Process any Component instances in the rendered result
    domResult = this.processRenderedTree(domResult);

    // 6. Cache result and attach metadata
    (component as any).__domCache = domResult;
    (domResult as any).__mini_instance = component;

    // 7. Attach unmount detection (must be done before lifecycle to ensure cleanup works)
    this.attachUnmountDetection(domResult, component);

    // 8. Execute lifecycle hooks
    this.executeLifecycle(component);

    return domResult;
  }

  /**
   * Recursively processes a rendered tree, converting Component instances to DOM
   */
  private static processRenderedTree(node: any): Node {
    // If it's a Component, render it
    if (node instanceof Component) {
      return this.renderBottomUp(node);
    }

    // If it's not a Node, convert to text
    if (!(node instanceof Node)) {
      if (node == null) {
        return document.createComment("empty");
      }
      return document.createTextNode(String(node));
    }

    // Check if it's a placeholder comment node
    if (node.nodeType === Node.COMMENT_NODE) {
      const component = (node as any).__mini_component;
      if (component instanceof Component) {
        // Replace placeholder with rendered component
        return this.renderBottomUp(component);
      }
    }

    // If it's an Element, process its children
    if (node instanceof Element) {
      const children = Array.from(node.childNodes);
      children.forEach((child) => {
        const processed = this.processRenderedTree(child);
        if (processed !== child) {
          node.replaceChild(processed, child);
        }
      });
    }

    return node;
  }

  /**
   * Renders all children of a component
   * Replaces Component instances with their rendered DOM nodes
   */
  private static renderChildren(component: Component): void {
    // Render children via @Child decorated properties
    const childSlots = getChildSlots(component.constructor);
    if (childSlots) {
      childSlots.forEach((propertyKey) => {
        const child = (component as any)[propertyKey];

        if (child instanceof Component) {
          // Update parent for DI hierarchy
          child.__parent_component = component;
          // Render child and replace with DOM
          const renderedChild = this.renderBottomUp(child);
          (component as any)[propertyKey] = renderedChild;
        } else if (Array.isArray(child)) {
          // Array of children
          const renderedChildren = child.map((c) => {
            if (c instanceof Component) {
              // Update parent for DI hierarchy
              c.__parent_component = component;
              return this.renderBottomUp(c);
            }
            return c;
          });
          (component as any)[propertyKey] = renderedChildren;
        }
      });
    }

    // Render generic children property
    if (component.children) {
      if (component.children instanceof Component) {
        // Update parent for DI hierarchy
        component.children.__parent_component = component;
        component.children = this.renderBottomUp(component.children);
      } else if (Array.isArray(component.children)) {
        component.children = component.children.map((child) => {
          if (child instanceof Component) {
            // Update parent for DI hierarchy
            child.__parent_component = component;
            return this.renderBottomUp(child);
          }
          return child;
        });
      }
    }
  }

  /**
   * Attach unmount detection to a DOM node
   */
  private static attachUnmountDetection(node: Node, instance: Component): void {
    setTimeout(() => {
      if (!node.parentNode) return;

      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.removedNodes.forEach((removed) => {
            if (removed === node || removed.contains(node)) {
              instance.destroy();
              observer.disconnect();
            }
          });
        });
      });

      let parent: ParentNode | null = node.parentNode;
      while (parent) {
        observer.observe(parent, { childList: true, subtree: true });
        parent = parent.parentNode;
      }

      (node as any).__mini_observer = observer;
    }, 0);
  }

  /**
   * Executes component lifecycle hooks
   */
  private static executeLifecycle(component: Component): void {
    // Check if already executed to prevent duplicates
    if ((component as any).__lifecycle_executed) {
      return;
    }
    (component as any).__lifecycle_executed = true;

    // Call all @Mount decorated methods
    const mountMethods = (component.constructor.prototype as any)
      .__mini_mount_methods;
    if (Array.isArray(mountMethods)) {
      mountMethods.forEach((mountFn) => {
        if (typeof mountFn === "function") {
          const cleanup = mountFn.call(component);
          // If mount returns a cleanup function, register it for unmount
          if (cleanup && typeof cleanup === "function") {
            component.$.unmount$.subscribe({ complete: () => cleanup() });
          }
        }
      });
    }

    // Emit mounted signal
    if (component.$ && component.$.mounted$) {
      component.$.mounted$.next();
    }
  }
}
