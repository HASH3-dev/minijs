import { Subject } from "rxjs";
import {
  CHILDREN_HIERARCHY,
  DOM_CACHE,
  LAST_RENDER_METHOD,
  LIFECYCLE_EXECUTED,
  PARENT_COMPONENT,
  RENDER_STATE,
} from "../constants";
import { createElement } from "../jsx";
import {
  GET_PARENT_INJECTOR,
  INJECTOR_TOKEN,
} from "../resources/DenpendencyInjection";
import { Injector } from "../resources/DenpendencyInjection/Injector";
import { signal } from "../resources/Signal";
import { RenderState } from "../types";
import { CleanableComponent } from "./CleanableComponent";

export interface RenderStateValues {
  state: RenderState;
  data?: any;
  label?: string | symbol;
}

export interface ICompomponet {
  [key: string | symbol]: any;
}

/**
 * Base Component class with generic props support
 * Props must be accessed via this.props.[propName]
 *
 * Now extends CleanableComponent for better architecture,
 * but maintains 100% backward compatibility
 */
export abstract class Component<P extends Record<string, any> = {}>
  extends CleanableComponent
  implements ICompomponet
{
  props!: Readonly<P & { slot?: string }>;
  children?: any;

  // Instance ID for debugging
  private static _instanceCounter = 0;
  _instanceId: string;

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
   * Creates injector lazily if needed - every component can use DI
   */
  get injector(): any {
    // Try own injector first
    if ((this as any)[INJECTOR_TOKEN]) {
      return (this as any)[INJECTOR_TOKEN];
    }

    // No own injector - create one lazily
    // Injector uses global maps and component instance for hierarchy
    const injector = new Injector();
    (this as any)[INJECTOR_TOKEN] = injector;

    return injector;
  }

  // Parent component reference (set by JSX runtime)
  private __parent_component?: Component;

  get [PARENT_COMPONENT](): Component | undefined {
    return this.__parent_component;
  }

  set [PARENT_COMPONENT](value: Component | undefined) {
    this.__parent_component = value;
  }

  private __children_hierarchy?: Array<Component>;

  // Parent component reference (set by JSX runtime)
  get [CHILDREN_HIERARCHY](): Array<Component> | undefined {
    return this.__children_hierarchy;
  }

  set [CHILDREN_HIERARCHY](value: Component | Array<Component> | undefined) {
    this.__children_hierarchy = [
      ...new Set(
        [...(this.__children_hierarchy ?? []), ...[value].flat()].filter(
          Boolean
        ) as Array<Component>
      ).values(),
    ];
  }

  constructor() {
    super();
    // Assign unique instance ID for debugging
    this._instanceId = `${
      this.constructor.name
    }_${++Component._instanceCounter}`;
    const Application = require("../Application").Application;
    Application.componentInstances.add(this);
    // Props will be set by JSX handler before render
  }

  private __lifecycle_signals = {
    unmount$: new Subject<void>(),
    mounted$: new Subject<void>(),
  };

  private __render_state$ = signal<RenderStateValues>({
    state: RenderState.SUCCESS,
  });

  /**
   * Lifecycle signals - convenience API
   * Provides easy access to mounted$ and unmount$ observables
   */
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
  get [RENDER_STATE](): RenderStateValues {
    return this.__render_state$.value;
  }

  /**
   * Set render state and trigger re-render
   */
  set [RENDER_STATE](values: RenderStateValues) {
    this.__render_state$.next(values);
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

    // Clear base class cache
    this._clearRenderCache();

    // Re-create lifecycle signals if they were completed
    this.__lifecycle_signals = {
      unmount$: new Subject<void>(),
      mounted$: new Subject<void>(),
    };
  }

  /**
   * Cleanup all subscriptions
   * Overrides base class to maintain backward compatibility
   * Now delegates to _unmount() for proper cleanup
   */
  destroy() {
    // Delegate to RenderableComponent._unmount() which handles:
    // - BeforeDestroy phase
    // - unmount$ signal
    // - DI cache cleanup
    // - cleanup functions
    // - render cache clear
    // - Destroyed phase
    if (this[PARENT_COMPONENT]?.[CHILDREN_HIERARCHY]) {
      this[PARENT_COMPONENT][CHILDREN_HIERARCHY] = this[PARENT_COMPONENT][
        CHILDREN_HIERARCHY
      ].filter((c: any) => c !== this);
    }
    super.destroy();

    // Clear component cache to allow re-rendering if instance is reused
    this.clearCache();
  }

  /**
   * Emit an error from this component
   * Public API for lifecycle hooks and plugins to report errors
   */
  emitError(error: Error): void {
    this._emitError(error);
  }

  /**
   * Get parent injector by traversing up the component tree
   * Used by @Provide decorator and Provider component
   */
  protected [GET_PARENT_INJECTOR](): any | undefined {
    let current: Component | undefined = this[PARENT_COMPONENT];
    while (current) {
      if (current[INJECTOR_TOKEN]) {
        return current[INJECTOR_TOKEN];
      }
      current = current[PARENT_COMPONENT];
    }
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

  jsx(type: any, props: any, ...children: any[]) {
    props = props || {};
    if (children) {
      props.children = children;
    }
    const nodes = createElement(type, props, this as any);

    return nodes;
  }
}
