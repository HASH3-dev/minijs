import { Application } from "../../../Application";
import { SERVICE_COMPONENT } from "../../../constants";
import { Provider } from "../types";
import { resolveDependencies } from "./resolveDependencies";
import { resolveExisting } from "./resolveExisting";

/**
 * Setup component providers in Application registry
 * Uses two-phase registration to handle factory dependencies
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

  // Phase 1: Register providers without factory dependencies
  // This includes useValue, useClass, and useExisting
  for (const provider of providers) {
    const token = provider.provide;
    let instance: any;

    if ("useValue" in provider) {
      instance = provider.useValue;
      providerMap.set(token, instance);
    } else if ("useClass" in provider && provider.useClass) {
      try {
        // reuse instance
        instance = resolveExisting(component, provider.useClass);
      } catch (e) {
        const ServiceClass = provider.useClass;
        instance = new ServiceClass();

        // Link service to component for DI context
        instance[SERVICE_COMPONENT] = component;
      }
      providerMap.set(token, instance);
    } else if ("useExisting" in provider) {
      // Resolve from parent or current
      instance = resolveExisting(component, provider.useExisting);
      providerMap.set(token, instance);
    }
  }

  // Phase 2: Register factory providers with dependencies
  // At this point, all non-factory providers are already registered
  for (const provider of providers) {
    if ("useFactory" in provider && provider.useFactory) {
      const token = provider.provide;

      // Resolve dependencies if deps are specified
      const deps = provider.deps || [];
      const resolvedDeps = deps.map((depToken) =>
        resolveExisting(component, depToken)
      );

      const instance = provider.useFactory(...resolvedDeps);
      providerMap.set(token, instance);
    }
  }
}
