import { CHILD_METADATA_KEY } from "../constants";

/**
 * Helper to get child slot metadata from a component class
 * @internal Used by JSX runtime
 */
export function getChildSlots(
  componentClass: any
): Map<string, string> | undefined {
  return componentClass[CHILD_METADATA_KEY];
}
