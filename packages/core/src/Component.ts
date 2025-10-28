import { Subject, BehaviorSubject } from "rxjs";
import {
  DOM_CACHE,
  LIFECYCLE_EXECUTED,
  PARENT_COMPONENT,
  RENDER_STATE,
  LAST_RENDER_METHOD,
} from "./constants";
import { INJECTOR_TOKEN, GET_PARENT_INJECTOR } from "@mini/di";
import { RenderState } from "./types";

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
  get [INJECTOR_TOKEN](): any | undefined {
    return this.__injector_storage;
  }

  set [INJECTOR_TOKEN](value: any) {
    this.__injector_storage = value;
  }

  /**
   * Public accessor for the injector
   * Allows components to manually get dependencies
   */
  get injector(): any | undefined {
    // Try own injector first
    if ((this as any)[INJECTOR_TOKEN]) {
      return (this as any)[INJECTOR_TOKEN];
    }
    // Fallback to parent injector
    return this[GET_PARENT_INJECTOR]?.();
  }

  // Parent component reference (set by JSX runtime)
  [PARENT_COMPONENT]?: Component;

  constructor() {
    // Props will be set by JSX handler before render
  }

  private __lifecycle_signals = {
    unmount$: new Subject<void>(),
    mounted$: new Subject<void>(),
  };

  private __render_state$ = new BehaviorSubject<RenderState>(
    RenderState.SUCCESS
  );

  /** Lifecycle signals */
  get $() {
    return this.__lifecycle_signals;
  }

  /**
   * Observable of current render state
   * Emits when state changes (loading/error/empty/success)
   */
  get renderState$() {
    return this.__render_state$.asObservable();
  }

  /**
   * Get current render state
   */
  get [RENDER_STATE](): RenderState {
    return this.__render_state$.value;
  }

  /**
   * Set render state and trigger re-render
   */
  set [RENDER_STATE](state: RenderState) {
    if (this.__render_state$.value !== state) {
      this.__render_state$.next(state);
      // Trigger re-render by calling destroy
      if (state !== RenderState.SUCCESS) {
        this.destroy();
      }
    }
  }

  /**
   * Clear cache and reset for re-render
   * Used when component will be re-rendered (e.g., from Observable)
   */
  clearCache() {
    delete (this as any)[DOM_CACHE];
    delete (this as any)[LIFECYCLE_EXECUTED];
    delete (this as any).__cachedParent;
    delete (this as any).__destroyChainSetup;

    // Re-create lifecycle signals if they were completed
    this.__lifecycle_signals = {
      unmount$: new Subject<void>(),
      mounted$: new Subject<void>(),
    };
  }

  /** Cleanup all subscriptions */
  destroy() {
    this.$.unmount$.next();
    this.$.unmount$.complete();

    // Clear DOM cache to allow re-rendering if component instance is reused
    this.clearCache();
  }

  /**
   * Get parent injector by traversing up the component tree
   * Used by @Provide decorator and Provider component
   */
  protected [GET_PARENT_INJECTOR](): any | undefined {
    console.log(
      "[MINI-DEBUG] Component.GET_PARENT_INJECTOR called for",
      this.constructor.name
    );
    let current: Component | undefined = this[PARENT_COMPONENT];
    let depth = 0;
    while (current) {
      console.log(
        "[MINI-DEBUG]   Checking parent at depth",
        depth,
        ":",
        current.constructor.name,
        "has injector?",
        !!current[INJECTOR_TOKEN]
      );
      if (current[INJECTOR_TOKEN]) {
        console.log(
          "[MINI-DEBUG]   ✅ Found injector at",
          current.constructor.name
        );
        return current[INJECTOR_TOKEN];
      }
      current = current[PARENT_COMPONENT];
      depth++;
    }
    console.log("[MINI-DEBUG]   ❌ NO injector found in parent chain");
    return undefined;
  }

  // Backward compatibility
  protected __getParentInjector(): any | undefined {
    return (this as any)[GET_PARENT_INJECTOR]();
  }

  /**
   * Helper to determine which render method to call based on state
   * Tracks last render to avoid duplicate renders when using fallback
   * @internal
   */
  __getRenderMethod(state: RenderState): (() => any) | null {
    const lastMethod = (this as any)[LAST_RENDER_METHOD];

    // Map states to method names
    const methodMap: Record<RenderState, string> = {
      [RenderState.IDLE]: "render",
      [RenderState.LOADING]: "renderLoading",
      [RenderState.SUCCESS]: "render",
      [RenderState.ERROR]: "renderError",
      [RenderState.EMPTY]: "renderEmpty",
    };

    const methodName = methodMap[state];
    const hasMethod = typeof (this as any)[methodName] === "function";

    // If method exists, use it
    if (hasMethod) {
      (this as any)[LAST_RENDER_METHOD] = methodName;
      return (this as any)[methodName].bind(this);
    }

    // Method doesn't exist - use render() as fallback
    // But check if we already used render() as fallback
    if (lastMethod === "render" && methodName !== "render") {
      // Already rendered with render() as fallback, don't render again
      return null;
    }

    // Use render() as fallback and track it
    (this as any)[LAST_RENDER_METHOD] = "render";
    return this.render.bind(this);
  }

  /**
   * Main render method - must be implemented by all components
   * Returns DOM node or JSX element
   *
   * @remarks
   * This method is called when component state is SUCCESS or as fallback
   * for other states when specific render methods are not implemented.
   */
  abstract render(): any;

  /**
   * Optional render method called during LOADING state
   *
   * @remarks
   * If not implemented, falls back to render().
   * Used by @LoadData and @UseResolvers during data fetching.
   *
   * @example
   * renderLoading() {
   *   return <div>Loading...</div>;
   * }
   */
  renderLoading?(): any;

  /**
   * Optional render method called during ERROR state
   *
   * @remarks
   * If not implemented, falls back to render().
   * Used by @LoadData, @UseResolvers, and @UseGuards on errors.
   *
   * @example
   * renderError() {
   *   return <div>Error loading data</div>;
   * }
   */
  renderError?(): any;

  /**
   * Optional render method called during EMPTY state
   *
   * @remarks
   * If not implemented, falls back to render().
   * Used by @LoadData and @UseResolvers when data is empty.
   * EMPTY is determined by:
   * - Default: data === null || data === undefined
   * - Custom: @LoadData(isEmptyFn) or Resolver.isEmpty(data)
   *
   * @example
   * renderEmpty() {
   *   return <div>No data available</div>;
   * }
   */
  renderEmpty?(): any;
}
