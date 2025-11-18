/**
 * @Inject decorator
 * Creates a lazy getter that resolves dependencies via Application's DI registry
 */
import { Application } from "../../../Application";
import { SERVICE_COMPONENT } from "../../../constants";
import { Injector } from "../Injector";

/**
 * Property decorator to inject a dependency
 * Creates a lazy getter that resolves via Injector
 */
export function Inject<T>(token: any) {
  return function (target: any, propertyKey: string | symbol) {
    // Store metadata for later resolution
    let metadata = (Application as any).injectMetadata.get(target.constructor);
    if (!metadata) {
      metadata = new Map();
      (Application as any).injectMetadata.set(target.constructor, metadata);
    }
    metadata.set(propertyKey, token);

    // Create lazy getter
    Object.defineProperty(target, propertyKey, {
      get(this: any) {
        // Get or create injector for this component/service
        const component = this[SERVICE_COMPONENT] || this;

        if (!component) {
          const className = this.constructor.name;
          throw new Error(
            `[Inject] No component context for ${className}.${String(
              propertyKey
            )}. ` + `Use @UseProviders or Provider.`
          );
        }

        // Get or create injector
        let injector = (Application as any).componentInjectors.get(component);
        if (!injector) {
          injector = new Injector();
          (Application as any).componentInjectors.set(component, injector);
        }

        // Resolve dependency
        return injector.resolve(token, this);
      },
      enumerable: true,
      configurable: true,
    });
  };
}
