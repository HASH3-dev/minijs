import { Provider, ProviderShorthand } from "../types";

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
