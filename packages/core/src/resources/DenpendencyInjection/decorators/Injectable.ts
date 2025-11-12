/**
 * @Injectable decorator
 * Registers class in Application's global registry and injects Injector
 */
import "reflect-metadata";
import { Application } from "../../../Application";
import { INJECTABLE_INJECTOR } from "../../../constants";
import { Injector } from "../Injector";
import { InjectionScope, InjectableOptions } from "../types";

/**
 * Decorator to mark a class as injectable
 * - Registers in Application.injectables
 * - Injects Injector instance in prototype (eager)
 */
export function Injectable(options?: InjectableOptions) {
  return function <T extends new (...args: any[]) => any>(target: T) {
    // Get scope
    const scope = options?.scope ?? InjectionScope.SINGLETON;

    // Get constructor dependencies from TypeScript metadata
    const dependencies: any[] =
      Reflect.getMetadata("design:paramtypes", target) || [];

    // Register in Application's global registry
    (Application as any).injectables.set(target, {
      token: target,
      scope,
      dependencies,
    });

    // Inject Injector instance in prototype (eager)
    Object.defineProperty(target.prototype, INJECTABLE_INJECTOR, {
      value: new Injector(),
      writable: false,
      enumerable: false,
      configurable: false,
    });

    return target;
  };
}
