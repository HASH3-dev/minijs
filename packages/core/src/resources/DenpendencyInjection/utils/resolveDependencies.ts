import { Application } from "../../../Application";
import { Injector } from "../Injector";

/**
 * Resolve dependencies for a service instance using @Inject metadata
 */
export function resolveDependencies(instance: any, injector: Injector): void {
  const injectMetadata = (Application as any).injectMetadata.get(
    instance.constructor
  );

  if (!injectMetadata) {
    return;
  }

  // Resolve each dependency
  for (const [propertyKey, token] of injectMetadata.entries()) {
    try {
      instance[propertyKey] = injector.resolve(token, instance);
    } catch (error) {
      console.warn(
        `[DI] Failed to resolve ${String(propertyKey)} for ${
          instance.constructor.name
        }:`,
        error
      );
    }
  }
}
