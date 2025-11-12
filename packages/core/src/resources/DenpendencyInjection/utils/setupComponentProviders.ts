import { Application } from "../../../Application";
import { SERVICE_COMPONENT } from "../../../constants";
import { Provider } from "../types";
import { resolveDependencies } from "./resolveDependencies";
import { resolveExisting } from "./resolveExisting";

/**
 * Setup component providers in Application registry
 */
export function setupComponentProviders(
  component: any,
  providers: Provider[],
  parentComponent?: any
): void {
  // Get or create provider map for this component
  let providerMap = (Application as any).componentProviders.get(component);
  if (!providerMap) {
    providerMap = new Map();
    (Application as any).componentProviders.set(component, providerMap);
  }

  // Register each provider
  for (const provider of providers) {
    const token = provider.provide;

    // Create instance based on provider type
    let instance: any;

    if ("useValue" in provider) {
      instance = provider.useValue;
    } else if ("useFactory" in provider && provider.useFactory) {
      instance = provider.useFactory();
    } else if ("useClass" in provider && provider.useClass) {
      const ServiceClass = provider.useClass;
      instance = new ServiceClass();

      // Link service to component for DI context
      instance[SERVICE_COMPONENT] = component;

      // If service has dependencies via @Inject, resolve them
      const injector = (Application as any).componentInjectors.get(component);
      if (injector) {
        resolveDependencies(instance, injector);
      }
    } else if ("useExisting" in provider) {
      // Resolve from parent or current
      instance = resolveExisting(component, provider.useExisting);
    }

    // Store in provider map
    providerMap.set(token, instance);
  }
}
