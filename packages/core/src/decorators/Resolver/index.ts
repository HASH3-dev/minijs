/**
 * @UseResolvers decorator
 * Loads data before rendering component and makes resolved data available via DI
 */

import { Component } from "../../Component";
import { isClass } from "../../utils";
import { applyDI } from "../../utils/applyDI";
import { RESOLVERS_METADATA } from "./constants";
import { ResolverType, ResolverClass } from "./types";
import { Observable, of, from, forkJoin, catchError, map } from "rxjs";
import { INJECTOR_TOKEN } from "@mini/di";
import { RENDER_STATE } from "../../constants";
import { RenderState } from "../../types";

/**
 * Decorator to load data before rendering component
 * Resolved data is made available via DI using resolver class as token
 * @param resolvers Array of resolver instances or classes
 * @example
 * // Define resolver
 * class UserResolver implements Resolver<User> {
 *   resolve(): Observable<User> {
 *     return this.http.get<User>('/api/user');
 *   }
 *
 *   // Optional: custom isEmpty logic
 *   isEmpty(data: User): boolean {
 *     return !data || !data.id;
 *   }
 * }
 *
 * // Use in component
 * @UseResolvers([UserResolver, PostsResolver])
 * export class UserPage extends Component {
 *   @Inject(UserResolver) user!: User;
 *   @Inject(PostsResolver) posts!: Posts[];
 *
 *   render() {
 *     // Only called when all resolvers succeed
 *     return <div>User: {this.user.name}</div>;
 *   }
 *
 *   renderLoading() {
 *     return <div>Loading...</div>;
 *   }
 *
 *   renderError() {
 *     return <div>Error loading data</div>;
 *   }
 *
 *   renderEmpty() {
 *     return <div>No data available</div>;
 *   }
 * }
 */
export function UseResolvers(resolvers: ResolverType[]) {
  return function <T extends new (...args: any[]) => any>(Ctor: T) {
    const WrappedComponent = class extends Ctor {
      private resolverMap: Map<any, any>;

      constructor(...args: any[]) {
        super(...args);

        // Store resolvers metadata
        (this as any)[RESOLVERS_METADATA] = resolvers;

        // Create map to store resolver instances temporarily
        this.resolverMap = new Map();

        // Instantiate resolvers
        for (const resolver of [resolvers].flat()) {
          let resolverInstance: any;
          let resolverKey: any;

          // If resolver is a class, instantiate it
          if (isClass(resolver)) {
            const ResolverClass = resolver as ResolverClass;
            resolverKey = ResolverClass;
            resolverInstance = new ResolverClass();
          } else {
            resolverKey = resolver.constructor;
            resolverInstance = resolver;
          }

          // Set up injector references for DI in resolver
          applyDI(this, resolverInstance);

          // Store instance with key
          this.resolverMap.set(resolverKey, resolverInstance);
        }

        // Set initial LOADING state
        (this as any)[RENDER_STATE] = RenderState.LOADING;

        // Start resolving immediately
        this.executeResolvers().subscribe({
          next: (finalState) => {
            // Set final state (SUCCESS/ERROR/EMPTY)
            (this as any)[RENDER_STATE] = finalState;
          },
          error: () => {
            // Set ERROR state on failure
            (this as any)[RENDER_STATE] = RenderState.ERROR;
          },
        });
      }

      /**
       * Execute all resolvers
       */
      private executeResolvers(): Observable<RenderState> {
        if (this.resolverMap.size === 0) {
          return of(RenderState.SUCCESS);
        }

        const injector = (this as any)[INJECTOR_TOKEN];

        // Execute all resolvers in parallel
        const executions$ = Array.from(this.resolverMap.entries()).map(
          ([key, instance]) => {
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

                // Register RESOLVED DATA in injector using resolver class as token
                if (injector) {
                  injector.providers.set(key, {
                    provide: key,
                    useValue: data, // Register the DATA, not the resolver instance
                  });
                }

                return { state, error: null };
              }),
              catchError((error) => {
                return of({
                  state: RenderState.ERROR,
                  error:
                    error instanceof Error ? error : new Error(String(error)),
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

      render() {
        // Get current state
        const currentState = (this as any)[RENDER_STATE];

        // Use helper to determine which render method to call
        const renderMethod = (this as any).__getRenderMethod(currentState);

        // If null, skip render (already rendered with fallback)
        if (renderMethod === null) {
          return null;
        }

        // Call the appropriate render method
        return renderMethod();
      }
    } as T;

    // Preserve original class name
    Object.defineProperty(WrappedComponent, "name", {
      value: Ctor.name,
      writable: false,
    });

    return WrappedComponent;
  };
}

// Re-export types
export type {
  Resolver as ResolverInterface,
  ResolverClass,
  ResolverType,
  ResolvedData,
} from "./types";
export { RenderState } from "../../types";
export { RESOLVERS_METADATA } from "./constants";
