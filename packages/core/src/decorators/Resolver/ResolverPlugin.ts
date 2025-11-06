import { DecoratorPlugin } from "../../lifecycle/DecoratorPlugin";
import { Component } from "../../base/Component";
import { RESOLVERS_METADATA } from "./constants";
import {
  RENDER_STATE,
  PARENT_COMPONENT,
  SERVICE_COMPONENT,
} from "../../constants";
import { LifecyclePhase } from "../../base/ReactiveComponent";
import { ResolverType, ResolverClass } from "./types";
import { isClass } from "../../utils";
import {
  Observable,
  of,
  from,
  forkJoin,
  catchError,
  map,
  startWith,
  lastValueFrom,
} from "rxjs";
import {
  registerResolvedData,
  getOrCreateInjector,
  INJECTOR_TOKEN,
} from "../../di";
import { RenderState } from "../../types";
import { signal } from "../../helpers";

/**
 * Plugin that executes @UseResolvers logic
 * Resolves data and emits states to component.renderState$
 */
export class ResolverDecoratorPlugin extends DecoratorPlugin {
  readonly id = "resolver-decorator";
  readonly phase = LifecyclePhase.Created;
  readonly priority = 20; // After Guards (10), before LoadData (30)

  /**
   * Execute resolver setup
   * Resolves data and emits states to renderState$
   */
  async execute(component: Component): Promise<void> {
    // Get resolvers from metadata
    let resolvers = this.getMetadata<ResolverType[]>(
      component,
      RESOLVERS_METADATA
    );

    // If not found on instance, try prototype
    if (!resolvers || resolvers.length === 0) {
      resolvers = (component.constructor.prototype as any)[RESOLVERS_METADATA];
    }

    if (!resolvers || resolvers.length === 0) {
      return;
    }

    // Ensure component has injector
    if (!component.injector && !(component as any)[INJECTOR_TOKEN]) {
      // Create empty injector with parent for hierarchy
      const parentComponent = (component as any)[PARENT_COMPONENT];
      (component as any)[INJECTOR_TOKEN] = getOrCreateInjector(
        component,
        [],
        parentComponent
      );
    }

    // Get component's injector for resolver instantiation
    const injector = component.injector;
    if (!injector) {
      throw new Error(
        `[ResolverPlugin] No injector found on component ${component.constructor.name}. ` +
          `Make sure component has @UseProviders or <Provider>.`
      );
    }

    // Instantiate resolvers via injector (resolves dependencies automatically)
    const resolverMap = new Map<any, any>();

    for (const resolver of [resolvers].flat()) {
      let resolverInstance: any;
      let resolverKey: any;

      // If resolver is a class, just instantiate it
      // Dependencies will be resolved via @Inject property decorators
      if (isClass(resolver)) {
        const ResolverClass = resolver as ResolverClass;
        resolverKey = ResolverClass;
        // Simply instantiate - @Inject will handle dependencies
        resolverInstance = new ResolverClass();
      } else {
        // Already an instance
        resolverKey = resolver.constructor;
        resolverInstance = resolver;
      }

      // Set injector on instance
      resolverInstance.injector = injector;
      resolverInstance[SERVICE_COMPONENT] = component;
      resolverInstance.jsx = component.jsx;

      // Store instance with key
      resolverMap.set(resolverKey, resolverInstance);
    }

    // Register tokens with null FIRST (so @Inject doesn't fail during loading)
    for (const [key] of resolverMap.entries()) {
      registerResolvedData(component, key, null);
    }

    // Set initial LOADING state
    (component as any)[RENDER_STATE] = RenderState.LOADING;

    // Execute all resolvers
    try {
      const finalState = await lastValueFrom(
        this.executeResolvers(component, resolverMap)
      );

      // Emit final state to renderState$
      (component as any)[RENDER_STATE] = finalState;
    } catch (error) {
      // Emit ERROR state on failure
      (component as any)[RENDER_STATE] = RenderState.ERROR;
    }
  }

  /**
   * Execute all resolvers and return final state
   */
  private executeResolvers(
    component: Component,
    resolverMap: Map<any, any>
  ): Observable<RenderState> {
    if (resolverMap.size === 0) {
      return of(RenderState.SUCCESS);
    }

    // Execute all resolvers in parallel
    const executions$ = Array.from(resolverMap.entries()).map(
      ([key, instance]) => {
        const resolvedData$ = signal(null);
        // Register RESOLVED DATA using new helper
        registerResolvedData(component, key, resolvedData$);
        const result = instance.resolve();

        // Convert to Observable
        let result$: Observable<any>;
        if (result instanceof Observable) {
          result$ = result;
        } else if (result instanceof Promise) {
          result$ = from(result);
        } else {
          result$ = of(result);
        }

        // Process result
        return result$.pipe(
          startWith(null),
          map((data) => {
            // Determine if data is empty
            let state: RenderState;
            if (typeof instance.isEmpty === "function") {
              // Use custom isEmpty if provided
              state = instance.isEmpty(data)
                ? RenderState.EMPTY
                : RenderState.SUCCESS;
            } else {
              // Default: null or undefined is empty
              state =
                data === null || data === undefined
                  ? RenderState.EMPTY
                  : RenderState.SUCCESS;
            }

            resolvedData$.next(data);

            return { state, error: null };
          }),
          catchError((error) => {
            console.error("[ResolverPlugin] Error resolving:", error);
            return of({
              state: RenderState.ERROR,
              error: error instanceof Error ? error : new Error(String(error)),
            });
          })
        );
      }
    );

    // Execute all in parallel
    return forkJoin(executions$).pipe(
      map((results) => {
        // Determine overall state
        const states = results.map((r) => r.state);

        if (states.some((s) => s === RenderState.ERROR)) {
          return RenderState.ERROR;
        }
        if (states.some((s) => s === RenderState.LOADING)) {
          return RenderState.LOADING;
        }
        if (states.every((s) => s === RenderState.EMPTY)) {
          return RenderState.EMPTY;
        }

        return RenderState.SUCCESS;
      }),
      catchError(() => of(RenderState.ERROR))
    );
  }
}
