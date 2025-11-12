import { Application } from "../../../Application";

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
