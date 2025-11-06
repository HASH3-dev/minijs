/**
 * Injector for DI resolution
 * Uses Application's static WeakMaps for global registry
 */
import { Application } from "../Application";
import { PARENT_COMPONENT, SERVICE_COMPONENT } from "../constants";
import { InjectionScope } from "./types";

/**
 * Injector resolves dependencies from Application's global DI registry
 * Each @Injectable service gets an instance in its prototype
 */
export class Injector {
  /**
   * Resolve a token to an instance
   * @param token The dependency token to resolve
   * @param context The requesting service/component instance
   */
  resolve<T>(token: any, context: any): T {
    // Get the component - either from SERVICE_COMPONENT or use context directly
    const component = context[SERVICE_COMPONENT] || context;

    if (!component) {
      throw new Error(
        `[Injector] No component context. Use @UseProviders or Provider.`
      );
    }

    // Get scope
    const scope = this.getScope(token);

    // BY_COMPONENT: memoization per component
    if (scope === InjectionScope.BY_COMPONENT) {
      return this.resolveByComponent(token, component);
    }

    // Default: resolve from component tree
    return this.resolveFromTree(token, component);
  }

  /**
   * Resolve from component provider tree (recursive parent lookup)
   */
  private resolveFromTree(token: any, component: any): any {
    let current = component;
    const tokenName = typeof token === "function" ? token.name : String(token);

    while (current) {
      const providers = (Application as any).componentProviders.get(current);

      // if (providers) {
      //   // Debug: log all available tokens
      //   const tokens = Array.from(providers.keys()).map((t: any) =>
      //     typeof t === "function" ? t.name : String(t)
      //   );
      // }

      if (providers?.has(token)) {
        return providers.get(token);
      }

      // Move to parent
      current = current[PARENT_COMPONENT];
    }

    // Not found
    console.error(`[Injector] Could not find provider for: ${tokenName}`);
    throw new Error(`[Injector] No provider for: ${tokenName}`);
  }

  /**
   * BY_COMPONENT scope with memoization
   */
  private resolveByComponent(token: any, component: any): any {
    // Check cache
    let cache = (Application as any).componentScopedCache.get(component);
    if (cache?.has(token)) {
      return cache.get(token);
    }

    // Resolve normally
    const instance = this.resolveFromTree(token, component);

    // Memoize
    if (!cache) {
      cache = new WeakMap();
      (Application as any).componentScopedCache.set(component, cache);
    }
    cache.set(token, instance);

    return instance;
  }

  /**
   * Get injection scope of a token
   */
  private getScope(token: any): InjectionScope {
    const metadata = (Application as any).injectables.get(token);
    return metadata?.scope ?? InjectionScope.SINGLETON;
  }
}
