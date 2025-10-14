import { Subject } from "rxjs";

/**
 * Base Component class with generic props support
 * Props must be accessed via this.props.[propName]
 */
export abstract class Component<P extends Record<string, any> = {}> {
  props!: Readonly<P & { slot?: string }>;
  children?: any;

  // Private storage for injector
  private __injector_storage?: any;

  // Injector for dependency injection (set by @Provide decorator or Provider component)
  get __mini_injector(): any | undefined {
    return this.__injector_storage;
  }

  set __mini_injector(value: any) {
    this.__injector_storage = value;
  }

  /**
   * Public accessor for the injector
   * Allows components to manually get dependencies
   */
  get injector(): any | undefined {
    // Try own injector first
    if (this.__mini_injector) {
      return this.__mini_injector;
    }
    // Fallback to parent injector
    return this.__getParentInjector();
  }

  // Parent component reference (set by JSX runtime)
  __parent_component?: Component;

  constructor() {
    // Props will be set by JSX handler before render
  }

  private __lifecycle_signals = {
    unmount$: new Subject<void>(),
    mounted$: new Subject<void>(),
  };

  /** Lifecycle signals */
  get $() {
    return this.__lifecycle_signals;
  }

  /** Cleanup all subscriptions */
  destroy() {
    this.$.unmount$.next();
    this.$.unmount$.complete();
  }

  /**
   * Get parent injector by traversing up the component tree
   * Used by @Provide decorator and Provider component
   */
  protected __getParentInjector(): any | undefined {
    let current: Component | undefined = this.__parent_component;
    while (current) {
      if (current.__mini_injector) {
        return current.__mini_injector;
      }
      current = current.__parent_component;
    }
    return undefined;
  }

  /** Users implement render to return a DOM node or JSX-compiled element */
  abstract render(): any;
}
