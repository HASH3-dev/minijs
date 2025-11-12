import { PARENT_COMPONENT } from "../../../constants";
import { Application } from "../../../Application";

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

  throw new Error(
    `[DI] Cannot resolve useExisting: ${token.name || String(token)}`
  );
}
