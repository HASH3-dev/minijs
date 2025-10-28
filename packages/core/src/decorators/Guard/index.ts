import { Component } from "../../Component";
import { INJECTOR_TOKEN } from "@mini/di";
import { isClass } from "../../utils";
import { GUARDS_TOKEN } from "./constants";
import { GuardType, GuardClass } from "./types";
import { applyDI } from "../../utils/applyDI";
import { Observable, of, from, forkJoin, catchError, map } from "rxjs";

/**
 * Guard decorator - controls component rendering based on guard conditions
 * Supports synchronous, Promise-based, and Observable guards
 * @param guards Array of guard instances or classes
 */
export function UseGuards(guards: GuardType[]) {
  return function <T extends new (...args: any[]) => any>(Ctor: T) {
    const WrappedComponent = class extends Ctor {
      constructor(...args: any[]) {
        super(...args);
        // Store guards on the instance
        (this as any)[GUARDS_TOKEN] = guards;
      }

      render() {
        // Get guards from instance
        const instanceGuards = (this as any)[GUARDS_TOKEN] as GuardType[];

        // Instantiate and setup guards
        const guardInstances = [instanceGuards]
          .flat()
          .map((guard: GuardType) => {
            let guardInstance: any = guard;
            // If guard is a class, instantiate it and set up DI
            if (isClass(guard)) {
              const GuardClass = guard as GuardClass;
              guardInstance = new GuardClass();
            }

            // Set up injector references for DI
            applyDI(this, guardInstance);

            return guardInstance;
          });

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

        // If no guards, render normally
        if (guardChecks$.length === 0) {
          return super.render();
        }

        // Execute all guards in parallel using forkJoin
        return forkJoin(guardChecks$).pipe(
          map((results) => {
            // Find first guard that blocked
            const blockedGuard = results.find((r) => !r.canActivate);

            if (blockedGuard) {
              // Guard blocked - render fallback
              return blockedGuard.guard.fallback?.() ?? null;
            } else {
              // All guards passed - render component
              return super.render();
            }
          }),
          catchError(() => {
            // If any error in processing, render first guard's fallback or null
            return of(guardInstances[0]?.fallback?.() ?? null);
          })
        );
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
export type { Guard as GuardInterface, GuardClass, GuardType } from "./types";
export { GUARDS_TOKEN } from "./constants";
