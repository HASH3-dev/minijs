import { Application } from "../../../Application";
import { Injector } from "../Injector";
import { ProviderShorthand } from "../types";
import { normalizeProvider } from "./normalizeProvider";
import { setupComponentProviders } from "./setupComponentProviders";

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
