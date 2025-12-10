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
  (Application as any).injectableRefs =
    (Application as any).injectableRefs || new Map();
  if (!providerMap) {
    providerMap = new Map();
    (Application as any).componentProviders.set(component, providerMap);
    const finalizationRef = new FinalizationRegistry(() => {
      (Application as any).injectableRefs
        .get(component)
        .forEach((value: any, key: any) => {
          (Application as any).injectables.delete(key);
        });
      (Application as any).injectableRefs.delete(component);
    });

    finalizationRef.register(component, component.name);
  }

  if (!(Application as any).injectableRefs.has(component)) {
    ((Application as any).injectableRefs as Map<any, any>).set(
      component,
      (Application as any).componentProviders.get(component)
    );
  }

  // Register the resolved data
  providerMap.set(token, data);
}
