import { Provider, ProviderShorthand } from "../types";

/**
 * Normalize provider shorthand to full Provider format
 * NOTE: We do NOT normalize InjectionToken to Symbol here anymore,
 * because each call to token.toString() creates a new unique Symbol.
 * We keep the InjectionToken instance as-is to use as Map key.
 */
export function normalizeProvider(provider: ProviderShorthand): Provider {
  // If it's a class, create a useClass provider
  if (typeof provider === "function") {
    return {
      provide: provider,
      useClass: provider as new (...args: any[]) => any,
    };
  }

  if (provider && typeof provider === "object" && "provide" in provider) {
    // Keep tokens as-is (including InjectionToken instances)
    return provider as Provider;
  }

  // Should not reach here, but if it does, treat as a class provider
  throw new Error(
    `[DI] Invalid provider format: ${
      typeof provider === "object" ? JSON.stringify(provider) : String(provider)
    }`
  );
}
