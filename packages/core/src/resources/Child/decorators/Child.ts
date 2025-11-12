import { CHILD_METADATA_KEY } from "../constants";

/**
 * Decorator to mark a property as a child slot receiver
 * @param slotName - Optional slot name. If not provided, receives default children
 * @example
 * class Modal {
 *   @Child('header') header: any;
 *   @Child('footer') footer: any;
 *   @Child() defaultContent: any;
 * }
 */
export function Child(slotName?: string) {
  return function (target: any, propertyKey: string) {
    // Get or create the child slots metadata map for this class
    if (!target[CHILD_METADATA_KEY]) {
      target[CHILD_METADATA_KEY] = new Map();
    }
    const childSlots = target[CHILD_METADATA_KEY] as Map<string, string>;

    // Store the mapping: slotName -> propertyKey
    // If no slotName is provided, use undefined to represent default children
    childSlots.set(slotName || "", propertyKey);
  };
}
