import { Observable, Subject, Subscription } from "rxjs";
import { mergeMap, takeUntil } from "rxjs/operators";
import { Component } from "./base/Component";
import {
  CHILDREN_HIERARCHY,
  COMPONENT_INSTANCE,
  COMPONENT_PLACEHOLDER,
  DOM_CACHE,
  LIFECYCLE_EXECUTED,
  MUTATION_OBSERVER,
  OBSERVABLES,
  PARENT_COMPONENT,
  SUBSCRIPTIONS,
} from "./constants";
import { getChildSlots } from "./resources/Child";
import { validateDependencyGraph } from "./resources/DenpendencyInjection";
import { toObservable } from "./helpers";
import { RenderResult } from "./RenderResult";

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
  // === Static DI Registry (Global) ===

  /** Registry of all @Injectable decorated classes */
  static injectables = new Map<
    Function,
    {
      token: Function;
      scope: any; // InjectionScope
      dependencies: any[]; // Token[]
    }
  >();

  /** Inject metadata: Class → Map<propertyKey, token> */
  static injectMetadata = new WeakMap<Function, Map<string | symbol, any>>();

  /** Injector instances per component */
  static componentInjectors = new WeakMap<any, any>();

  /** Hierarchical provider tree: Component → Map<Token, Instance> */
  static componentProviders = new WeakMap<any, Map<any, any>>();

  /** Cache for BY_COMPONENT scoped instances */
  static componentScopedCache = new WeakMap<any, WeakMap<any, any>>();

  static componentInstances = new Set<Component>();

  // === Instance Properties ===

  private rootComponent: Component;
  private rootDom?: Node;
  private mountTarget?: HTMLElement;

  constructor(rootComponent: ComponentClass) {
    this.rootComponent = Application.createInstance(rootComponent);
  }

  /**
   * Renders the application and returns the DOM node
   */
  render(): Node {
    if (this.rootDom) {
      return this.rootDom;
    }

    this.rootDom = Application.recursiveRender(this.rootComponent);
    return this.rootDom;
  }

  /**
   * Renders and mounts the application to a DOM element
   * Validates dependency graph before mounting
   * @param selector CSS selector or HTMLElement
   */
  mount(selector: string | HTMLElement): void {
    // Validate dependency graph before mounting
    try {
      validateDependencyGraph();
    } catch (error) {
      console.error("[Application] Dependency graph validation failed:", error);
      throw error;
    }

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
  renderComponent(component: ComponentClass, props?: any): RenderResult {
    return Application.render(component, props, { parent: this.rootComponent });
  }

  // === Static Methods for Standalone Rendering ===

  /**
   * Renders a component standalone or with parent context
   * Returns a RenderResult for easy manipulation and cleanup of rendered nodes
   * @param component Component class or instance
   * @param props Props to pass to the component
   * @param options Rendering options (parent for DI)
   */
  static render(
    component: Component | ComponentClass,
    props?: any,
    options?: RenderOptions
  ): RenderResult {
    const instance = this.createInstance(component, props, options);
    const rendered = this.recursiveRender(instance, options?.parent);
    return new RenderResult(rendered, instance);
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
  ): RenderResult {
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
   * Renders a component and its children recursively
   * Children are rendered first, then the component itself (bottom-up)
   */
  static recursiveRender(
    component: Component | any,
    parentComponent?: Component
  ): Node {
    // If not a Component, handle as primitive or Node
    if (!(component instanceof Component)) {
      if (component instanceof Node) {
        return component;
      }
      if (Array.isArray(component)) {
        const fragment = document.createDocumentFragment();
        component
          .map((item) => this.recursiveRender(item, parentComponent))
          .forEach((item) => fragment.appendChild(item));
        return fragment;
      }
      // Primitive value (string, number, etc)
      if (component !== null) {
        return document.createTextNode(String(component));
      }
      return document.createComment("empty");
    }

    if (parentComponent) {
      component[PARENT_COMPONENT] = parentComponent;
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
    if (parent) {
      this.setupDestroyChain(parent, component);
    }

    // 1. Execute lifecycle (mount) - Guards can override render
    component._mount();

    // 2. Render children in properties (recursive, bottom-up)
    this.renderChildren(component);

    // 3. Set current rendering instance so subscriptions use correct component
    // this.currentRenderingInstance = component;

    // 4. Now render this component (may still have Component children in JSX)
    // Guards will have overridden render() by now if needed
    let domResult = component.render();
    // this.currentRenderingInstance = undefined;

    // 5. Check if render returned an Observable
    const obs = toObservable(domResult);
    // if (obs) {
    // Render returned Observable - subscribe and process
    // This is used by Guards, Resolvers, etc.
    const componentNameStart = document.createComment(
      `<${component.constructor.name}>`
    );
    const componentNameEnd = document.createComment(
      `</${component.constructor.name}>`
    );
    const placeholder = document.createComment("observable-render-start");
    const endMarker = document.createComment("observable-render-end");
    component.addNode([
      componentNameStart,
      placeholder,
      endMarker,
      componentNameEnd,
    ]);
    component.setPlaceholderNode(placeholder);

    const fragment = document.createDocumentFragment();
    component.addChildrenToFragment(fragment);

    // Attach unmount detection to the markers
    // When markers are removed from DOM, destroy the component
    this.attachUnmountDetection(component.getPlaceholderNode()!, component);

    let mountedNotified = false;

    obs!
      .pipe(takeUntil(component.$.unmount$), mergeMap(toObservable))
      .subscribe({
        next: (value: any) => {
          if (!mountedNotified) {
            this.setupDestroyChainForTree(value, component);

            // Now process the value (converts Components to DOM)
            const processed = this.processRenderedTree(value, component);

            [processed].flat().forEach((node) => {
              // Cache and attach metadata
              (component as any)[DOM_CACHE] = node;

              // Attach unmount detection if not already done
              if (!(node as any)[MUTATION_OBSERVER]) {
                // this.attachUnmountDetection(node, component);
              }
            });

            component.renderChildren(processed);

            // Notify mounted only once when first value is emitted
            component._notifyMounted();
            mountedNotified = true;
          } else {
            // Remove old node if exists (but only the DOM node, don't destroy component)
            // If value is false/null, just remove and don't render anything
            if (value === null || value === false) {
              component.destroy();
              return;
            }

            const processed = this.processRenderedTree(value, component);

            [processed].flat().forEach((node) => {
              // Application.exchangeComponentMetadata(
              //   component.getRenderedNodes()[0],
              //   node
              // );
              // Cache and attach metadata
              (component as any)[DOM_CACHE] = node;
              if (!(node as any)[MUTATION_OBSERVER]) {
                // this.attachUnmountDetection(node, component);
              }
            });

            component.replaceChild(processed);
          }
        },
        complete: () => {
          // component.destroy();
        },
        error: (error) => {
          console.error(error);
          // component.destroy();
        },
      });

    return fragment;
  }

  private static exchangeComponentMetadata(currentNode: Node, toNode: Node) {
    if (!currentNode || !toNode) {
      return;
    }

    Object.assign(toNode, {
      [MUTATION_OBSERVER]: (currentNode as any)?.[MUTATION_OBSERVER],
      [COMPONENT_INSTANCE]: (currentNode as any)?.[COMPONENT_INSTANCE],
      [SUBSCRIPTIONS]: (currentNode as any)?.[SUBSCRIPTIONS],
      [OBSERVABLES]: (currentNode as any)?.[OBSERVABLES],
    });

    Object.assign(currentNode, {
      [MUTATION_OBSERVER]: null,
      [COMPONENT_INSTANCE]: null,
      [SUBSCRIPTIONS]: null,
      [OBSERVABLES]: null,
    });
  }

  /**
   * Recursively processes a rendered tree, converting Component instances to DOM
   * @param node The node to process
   * @param parentComponent The parent component for setting PARENT_COMPONENT on child components
   */
  private static processRenderedTree(
    node: any,
    parentComponent?: Component
  ): Node {
    // If it's a Component, render it
    if (node instanceof Component) {
      // Set parent if not already set (respects JSX instantiation)
      if (parentComponent) {
        node[PARENT_COMPONENT] = parentComponent;
        parentComponent[CHILDREN_HIERARCHY] = node;
      }

      const result = this.recursiveRender(node, parentComponent);
      return result;
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
        return this.recursiveRender(component, parentComponent);
      }
    }

    // If it's a DocumentFragment, process its children
    if (node instanceof DocumentFragment || node instanceof Element) {
      const children = Array.from(node.childNodes);
      children.forEach((child) => {
        const processed = this.processRenderedTree(child, parentComponent);
        if (processed !== child) {
          node.replaceChild(processed, child);
        }
      });
    }

    return node;
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
    const setupHierarchy = (component: Component, child: Component) => {
      if (component) {
        child[PARENT_COMPONENT] = component;
        component[CHILDREN_HIERARCHY] = child;
      }
      // Setup destroy chain: when parent unmounts, destroy child
      // this.setupDestroyChain(component, child);
      // Render child and replace with DOM
      const renderedChild = this.recursiveRender(child, component);
      return renderedChild;
    };

    // Render children via @Child decorated properties
    const childSlots = getChildSlots(component);
    if (childSlots) {
      childSlots.forEach((propertyKey) => {
        const child = (component as any)[propertyKey];

        if (child instanceof Component) {
          // Update parent for DI hierarchy
          const renderedChild = setupHierarchy(component, child);
          (component as any)[propertyKey] = renderedChild;
        } else if (Array.isArray(child)) {
          // Array of children
          const renderedChildren = child.map((c) => {
            if (c instanceof Component) {
              return setupHierarchy(component, c);
            }
            return c;
          });
          (component as any)[propertyKey] = renderedChildren;
        }
      });
    }
  }

  /**
   * Setup reactive destroy chain: when parent unmounts, child destroys
   * This propagates unmount signals through the component tree
   */
  private static setupDestroyChain(
    parent: Component | Node | Observable<any>,
    child: Component
  ): void {
    if (!(parent instanceof Component)) {
      return;
    }
    // Skip if already setup to avoid duplicate subscriptions
    if ((child as any).__destroyChainSetup) {
      return;
    }

    // Mark as setup before subscribing
    (child as any).__destroyChainSetup = true;

    // Subscribe to parent's unmount signal
    // Use takeUntil to prevent memory leaks if child is destroyed independently
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
   * Handles DocumentFragments by waiting for children to be moved to the real DOM first
   */
  private static attachUnmountDetection(node: Node, instance: Component): void {
    if (!node.parentNode) return;

    // If parent is a DocumentFragment, we need special handling
    if (node.parentNode instanceof DocumentFragment) {
      // Create a temporary observer that watches for the node to be moved
      // from the fragment to the actual DOM
      const tempObserver = new MutationObserver(() => {
        // Check if node now has a real parent (not a fragment)
        if (node.parentNode && !(node.parentNode instanceof DocumentFragment)) {
          // Node was moved to real DOM, disconnect temp observer
          tempObserver.disconnect();
          // Now attach the real unmount detection
          this.attachUnmountDetection(node, instance);
        }
      });

      // Observe the fragment for when children are moved
      tempObserver.observe(node.parentNode, { childList: true });
      return;
    }

    // Normal case: parent is not a fragment
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.removedNodes.forEach((removed) => {
          (removed as any)[SUBSCRIPTIONS]?.forEach((sub: Subscription) => {
            sub.unsubscribe();
          });
          (removed as any)[OBSERVABLES]?.forEach((observable: Subject<any>) => {
            observable.complete();
          });
          if (removed === node) {
            observer.disconnect();
            (node as any)[COMPONENT_INSTANCE]?.destroy();
          }
        });
      });
    });

    // let parent: Node | null = node;
    observer.observe(node.parentNode, { childList: true });
    // while (parent) {
    //   if ((parent as any)["observed"]) break;
    //   observer.observe(parent, { childList: true });

    //   // if ((parent as any)[COMPONENT_INSTANCE]) {
    //   //   instance[PARENT_COMPONENT] ??= (parent as any)[COMPONENT_INSTANCE];
    //   // }
    //   (parent as any)["observed"] = true;
    //   parent = parent.parentNode;
    // }

    (node as any)[MUTATION_OBSERVER] = observer;
  }

  /**
   * Destroys component and all its children recursively (bottom-up)
   * This ensures proper cleanup of the entire component tree
   */
  static destroyComponentAndChildren(component: Component): void {
    // 1. Destroy children first (bottom-up approach)
    if (component.children) {
      const children = Array.isArray(component.children)
        ? component.children
        : [component.children];

      children.forEach((child) => {
        if (child instanceof Component) {
          this.destroyComponentAndChildren(child);
        }
      });
    }

    // 2. Destroy the component itself
    // This will clean DI caches, emit unmount$, execute cleanup functions
    component.destroy();
  }
}
