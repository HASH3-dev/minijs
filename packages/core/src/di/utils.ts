/**
 * Utility functions for DI system
 */
import { Application } from "../Application";
import { Injector } from "./Injector";
import { Provider, ProviderShorthand } from "./types";
import { PARENT_COMPONENT, SERVICE_COMPONENT } from "../constants";

/**
 * Normalize provider shorthand to full Provider format
 */
export function normalizeProvider(provider: ProviderShorthand): Provider {
  // If it's a class, create a useClass provider
  if (typeof provider === "function") {
    return {
      provide: provider,
      useClass: provider as new (...args: any[]) => any,
    };
  }

  // Already a full provider
  return provider as Provider;
}

/**
 * Get or create injector for a component
 * Creates injector with given providers and parent hierarchy
 */
export function getOrCreateInjector(
  component: any,
  providers: ProviderShorthand[],
  parentComponent?: any
): Injector {
  // Check if injector already exists
  const existing = (Application as any).componentInjectors.get(component);
  if (existing) {
    return existing;
  }

  // Create new injector
  const injector = new Injector();

  // Store in registry
  (Application as any).componentInjectors.set(component, injector);

  // Setup providers in Application registry
  const normalizedProviders = providers.map(normalizeProvider);
  setupComponentProviders(component, normalizedProviders, parentComponent);

  return injector;
}

/**
 * Setup component providers in Application registry
 */
function setupComponentProviders(
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

/**
 * Resolve dependencies for a service instance using @Inject metadata
 */
function resolveDependencies(instance: any, injector: Injector): void {
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

/**
 * Resolve existing token from component tree
 */
function resolveExisting(component: any, token: any): any {
  let current = component;

  while (current) {
    const providers = (Application as any).componentProviders.get(current);
    if (providers?.has(token)) {
      return providers.get(token);
    }
    current = current[PARENT_COMPONENT];
  }

  throw new Error(
    `[DI] Cannot resolve useExisting: ${token.name || String(token)}`
  );
}

/**
 * Register resolved data from a resolver
 * Used by @Resolver decorator
 */
export function registerResolvedData(
  component: any,
  token: any,
  data: any
): void {
  // Get or create provider map for this component
  let providerMap = (Application as any).componentProviders.get(component);
  if (!providerMap) {
    providerMap = new Map();
    (Application as any).componentProviders.set(component, providerMap);
  }

  // Register the resolved data
  providerMap.set(token, data);
}
