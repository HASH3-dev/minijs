import { catchError, forkJoin, from, map, Observable, of } from "rxjs";
import { Component } from "../../base/Component";
import { LifecyclePhase } from "../../base/ReactiveComponent";
import { SERVICE_COMPONENT } from "../../constants";
import { DecoratorPlugin } from "../../lifecycle/DecoratorPlugin";
import { isClass } from "../../utils";
import { GUARDS_TOKEN } from "./constants";
import { GuardType } from "./types";

/**
 * Plugin that executes @UseGuards logic
 * Overrides component render to check guards first
 */
export class GuardDecoratorPlugin extends DecoratorPlugin {
  readonly id = "guard-decorator";
  readonly phase = LifecyclePhase.Created;
  readonly priority = 3; // Execute before StatefulRenderPlugin (priority 5)

  /**
   * Execute guard setup
   * Overrides component render to check guards
   */
  execute(component: Component): void {
    // Get guards from metadata - check both instance and prototype
    let guards = this.getMetadata<GuardType[]>(component, GUARDS_TOKEN);

    // If not found on instance, try prototype
    if (!guards || guards.length === 0) {
      guards = (component.constructor.prototype as any)[GUARDS_TOKEN];
    }

    if (!guards || guards.length === 0) {
      return;
    }

    // Store original render method
    const originalRender = component.render.bind(component);

    // Override render to check guards first
    component.render = () => {
      return this.executeGuardsAndRender(guards, component, originalRender);
    };
  }

  /**
   * Execute all guards and render based on result
   */
  private executeGuardsAndRender(
    guards: GuardType[],
    component: Component,
    originalRender: () => any
  ): any {
    // Get component's injector for guard instantiation
    const injector = component.injector;

    if (!injector) {
      console.warn(
        `[GuardPlugin] No injector found on component ${component.constructor.name}. ` +
          `Guards require DI. Make sure component or parent has @UseProviders. Rendering without guards.`
      );
      // No injector - render without guards
      return originalRender();
    }

    // Instantiate guards
    const guardInstances = guards.map((guard: GuardType) =>
      this.instantiateGuard(guard as any, injector, component)
    );

    // Convert all guard results to Observables
    const guardChecks$: Observable<{
      canActivate: boolean;
      guard: any;
    }>[] = guardInstances.map((guard) => {
      const result = guard.canActivate();

      // Convert result to Observable based on type
      let result$: Observable<boolean>;

      if (result instanceof Observable) {
        result$ = result;
      } else if (result instanceof Promise) {
        result$ = from(result);
      } else {
        result$ = of(result);
      }

      // Catch errors and treat as false (guard blocks)
      return result$.pipe(
        catchError(() => of(false)),
        map((canActivate) => ({ canActivate, guard }))
      );
    });

    // Execute all guards in parallel using forkJoin
    return forkJoin(guardChecks$).pipe(
      map((results) => {
        // Find first guard that blocked
        const blockedGuard = results.find((r) => !r.canActivate);

        if (blockedGuard) {
          // Guard blocked - render fallback
          return blockedGuard.guard.fallback?.() ?? null;
        } else {
          // All guards passed - render component normally
          return originalRender();
        }
      }),
      catchError((error) => {
        console.error("[GuardPlugin] Guard error", error);
        // If any error in processing, render first guard's fallback or null
        return of(guardInstances[0]?.fallback?.() ?? null);
      })
    );
  }

  /**
   * Instantiate a guard class
   * Guards must be @Injectable and use @Inject for dependencies
   */
  private instantiateGuard(
    GuardClass: any,
    injector: any,
    component: Component
  ): any {
    let instance = GuardClass;
    if (isClass(GuardClass)) {
      // Create instance (no constructor params - DI via @Inject properties)
      instance = new GuardClass();
    }

    // CRITICAL: Set component context for @Inject properties
    // This allows @Inject lazy getters to resolve dependencies
    instance[SERVICE_COMPONENT] = component;
    instance.jsx = component.jsx;

    return instance;
  }
}
