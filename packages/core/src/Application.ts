import { Component } from "./Component";
import { getChildSlots } from "./decorators/Child";
import {
  DOM_CACHE,
  LIFECYCLE_EXECUTED,
  COMPONENT_INSTANCE,
  MUTATION_OBSERVER,
  COMPONENT_PLACEHOLDER,
  PARENT_COMPONENT,
} from "./constants";
import { MOUNT_METHODS } from "./decorators/Mount/constants";
import { setupWatchers } from "./decorators/Watch";
import { toObservable } from "./helpers";

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
        component[PARENT_COMPONENT] = options.parent;
      } else if (options?.context) {
        component[PARENT_COMPONENT] = options.context;
      }
      return component;
    }

    // Create new instance
    const instance = new component();
    instance.props = props || {};

    // Set parent for DI
    if (options?.parent) {
      instance[PARENT_COMPONENT] = options.parent;
    } else if (options?.context) {
      instance[PARENT_COMPONENT] = options.context;
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
    // BUT: if parent changed, we need to re-render for DI to work correctly
    const cachedDom = (component as any)[DOM_CACHE];
    if (cachedDom) {
      const cachedParent = (component as any).__cachedParent;
      const currentParent = component[PARENT_COMPONENT];

      // If parent is the same, use cache
      if (cachedParent === currentParent) {
        return cachedDom;
      }

      // Parent changed - clear cache and re-render
      delete (component as any)[DOM_CACHE];
      delete (component as any)[LIFECYCLE_EXECUTED];
    }

    // Setup destroy chain if this component has a parent
    // This handles Components from JSX (not just from properties)
    const parent = component[PARENT_COMPONENT];
    console.log(
      "[MINI-DEBUG] Application.renderBottomUp:",
      component.constructor.name,
      "parent =",
      parent ? parent.constructor.name : "NONE"
    );
    if (parent) {
      this.setupDestroyChain(parent, component);
    }

    // 1. Render children in properties FIRST (recursive, bottom-up)
    this.renderChildren(component);

    // 2. Set current rendering instance so subscriptions use correct component
    const previousInstance = this.currentRenderingInstance;
    this.currentRenderingInstance = component;

    // 3. Now render this component (may still have Component children in JSX)
    let domResult = component.render();

    // 4. Check if render returned an Observable
    const obs = toObservable(domResult);
    if (obs) {
      // Render returned Observable - subscribe and process
      // This is used by Guards, Resolvers, etc.
      const placeholder = document.createComment("observable-render-start");
      const endMarker = document.createComment("observable-render-end");
      const fragment = document.createDocumentFragment();
      fragment.appendChild(placeholder);
      fragment.appendChild(endMarker);

      let currentNode: Node | null = null;

      obs.subscribe((value: any) => {
        // CRITICAL: Set parent and setup destroy chain BEFORE processing
        // processRenderedTree converts Components to DOM, so we must do this first!
        this.setParentForTree(value, component);
        this.setupDestroyChainForTree(value, component);

        // Now process the value (converts Components to DOM)
        const processed = this.processRenderedTree(value);

        // Remove old node if exists
        if (currentNode && currentNode.parentNode) {
          currentNode.parentNode.removeChild(currentNode);
        }

        // Insert new node between markers
        if (endMarker.parentNode) {
          endMarker.parentNode.insertBefore(processed, endMarker);
          currentNode = processed;

          // Cache and attach metadata
          (component as any)[DOM_CACHE] = processed;
          (processed as any)[COMPONENT_INSTANCE] = component;

          // Attach unmount detection if not already done
          if (!(processed as any)[MUTATION_OBSERVER]) {
            this.attachUnmountDetection(processed, component);
          }

          // Execute lifecycle if not already done
          if (!(component as any)[LIFECYCLE_EXECUTED]) {
            this.executeLifecycle(component);
          }
        }
      });

      return fragment;
    }

    // 5. Process any Component instances in the rendered result
    // IMPORTANT: Must be done BEFORE restoring currentRenderingInstance
    // so that nested components can find their parent
    domResult = this.processRenderedTree(domResult);

    // 6. Restore previous instance (AFTER processing tree!)
    this.currentRenderingInstance = previousInstance;
    console.log(
      "[MINI-DEBUG] Application: RESTORE currentRenderingInstance =",
      previousInstance ? previousInstance.constructor.name : "NONE"
    );

    // 7. Cache result and attach metadata
    (component as any)[DOM_CACHE] = domResult;
    (component as any).__cachedParent = component[PARENT_COMPONENT];
    (domResult as any)[COMPONENT_INSTANCE] = component;

    // 8. Attach unmount detection (must be done before lifecycle to ensure cleanup works)
    this.attachUnmountDetection(domResult, component);

    // 9. Execute lifecycle hooks
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
      const component = (node as any)[COMPONENT_PLACEHOLDER]; // Note: This is set by jsx-runtime
      if (component instanceof Component) {
        // Replace placeholder with rendered component
        return this.renderBottomUp(component);
      }
    }

    // If it's a DocumentFragment, process its children
    if (node instanceof DocumentFragment) {
      const children = Array.from(node.childNodes);
      children.forEach((child) => {
        const processed = this.processRenderedTree(child);
        if (processed !== child) {
          node.replaceChild(processed, child);
        }
      });
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
   * Recursively sets parent component for all components in a tree (including JSX structures)
   */
  private static setParentForTree(node: any, parent: Component): void {
    if (node instanceof Component) {
      node[PARENT_COMPONENT] = parent;
      // Also process children of this component
      if (node.children) {
        if (Array.isArray(node.children)) {
          node.children.forEach((child) => this.setParentForTree(child, node));
        } else {
          this.setParentForTree(node.children, node);
        }
      }
    } else if (node instanceof DocumentFragment || node instanceof Element) {
      Array.from(node.childNodes).forEach((child) => {
        this.setParentForTree(child, parent);
      });
    } else if (Array.isArray(node)) {
      node.forEach((item) => {
        this.setParentForTree(item, parent);
      });
    } else if (node && typeof node === "object" && node.type) {
      // JSX element structure - check props.children
      if (node.props && node.props.children) {
        if (Array.isArray(node.props.children)) {
          node.props.children.forEach((child: any) =>
            this.setParentForTree(child, parent)
          );
        } else {
          this.setParentForTree(node.props.children, parent);
        }
      }
    }
  }

  /**
   * Recursively setup destroy chain for all components in a tree (including JSX structures)
   */
  private static setupDestroyChainForTree(node: any, parent: Component): void {
    if (node instanceof Component) {
      this.setupDestroyChain(parent, node);
      // Also process children of this component
      if (node.children) {
        if (Array.isArray(node.children)) {
          node.children.forEach((child) =>
            this.setupDestroyChainForTree(child, node)
          );
        } else {
          this.setupDestroyChainForTree(node.children, node);
        }
      }
    } else if (
      node instanceof Comment &&
      (node as any)[COMPONENT_PLACEHOLDER]
    ) {
      // Component placeholder - setup chain for the component
      const comp = (node as any)[COMPONENT_PLACEHOLDER];
      if (comp instanceof Component) {
        this.setupDestroyChain(parent, comp);
      }
    } else if (node instanceof DocumentFragment || node instanceof Element) {
      Array.from(node.childNodes).forEach((child) => {
        this.setupDestroyChainForTree(child, parent);
      });
    } else if (Array.isArray(node)) {
      node.forEach((item) => {
        this.setupDestroyChainForTree(item, parent);
      });
    } else if (node && typeof node === "object" && node.type) {
      // JSX element structure - check props.children
      if (node.props && node.props.children) {
        if (Array.isArray(node.props.children)) {
          node.props.children.forEach((child: any) =>
            this.setupDestroyChainForTree(child, parent)
          );
        } else {
          this.setupDestroyChainForTree(node.props.children, parent);
        }
      }
    }
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
          child[PARENT_COMPONENT] = component;
          // Setup destroy chain: when parent unmounts, destroy child
          this.setupDestroyChain(component, child);
          // Render child and replace with DOM
          const renderedChild = this.renderBottomUp(child);
          (component as any)[propertyKey] = renderedChild;
        } else if (Array.isArray(child)) {
          // Array of children
          const renderedChildren = child.map((c) => {
            if (c instanceof Component) {
              // Update parent for DI hierarchy
              c[PARENT_COMPONENT] = component;
              // Setup destroy chain
              this.setupDestroyChain(component, c);
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
        component.children[PARENT_COMPONENT] = component;
        // Setup destroy chain
        this.setupDestroyChain(component, component.children);
        component.children = this.renderBottomUp(component.children);
      } else if (Array.isArray(component.children)) {
        component.children = component.children.map((child) => {
          if (child instanceof Component) {
            // Update parent for DI hierarchy
            child[PARENT_COMPONENT] = component;
            // Setup destroy chain
            this.setupDestroyChain(component, child);
            return this.renderBottomUp(child);
          }
          return child;
        });
      }
    }
  }

  /**
   * Setup reactive destroy chain: when parent unmounts, child destroys
   * This propagates unmount signals through the component tree
   */
  private static setupDestroyChain(parent: Component, child: Component): void {
    // Skip if already setup to avoid duplicate subscriptions
    if ((child as any).__destroyChainSetup) {
      return;
    }

    // Mark as setup before subscribing
    (child as any).__destroyChainSetup = true;

    // Subscribe to parent's unmount signal
    parent.$.unmount$.subscribe({
      next: () => {
        // When parent unmounts, destroy child
        // This will clear child's cache and emit its own unmount$ signal
        // which propagates to its children, creating a chain reaction
        child.destroy();
      },
      complete: () => {
        // Also destroy on complete to handle edge cases
        child.destroy();
      },
    });
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

      (node as any)[MUTATION_OBSERVER] = observer;
    }, 0);
  }

  /**
   * Executes component lifecycle hooks
   */
  private static executeLifecycle(component: Component): void {
    // Check if already executed to prevent duplicates
    if ((component as any)[LIFECYCLE_EXECUTED]) {
      return;
    }
    (component as any)[LIFECYCLE_EXECUTED] = true;

    // Setup @Watch decorators (must be done before @Mount methods)
    setupWatchers(component);

    // Call all @Mount decorated methods
    const mountMethods = (component.constructor.prototype as any)[
      MOUNT_METHODS
    ];
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
