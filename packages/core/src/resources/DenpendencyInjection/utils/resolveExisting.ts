import { PARENT_COMPONENT } from "../../../constants";
import { Application } from "../../../Application";
import { InjectionToken } from "../InjectionToken";

/**
 * Resolve existing token from component tree
 */
export function resolveExisting(component: any, token: any): any {
  let current = component;

  while (current) {
    const providers = (Application as any).componentProviders.get(current);
    if (providers?.has(token)) {
      return providers.get(token);
    }
    current = current[PARENT_COMPONENT];
  }

  // Create a better error message for InjectionToken
  const tokenName =
    token instanceof InjectionToken
      ? token.description
      : token.name || String(token);

  throw new Error(`[DI] Cannot resolve useExisting: ${tokenName}`);
}
