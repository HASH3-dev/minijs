import { Component } from "../../base/Component";
import { PropStrategy } from "../types";
import { setAttr } from "../utils/setAttr";

/**
 * AttributeStrategy - Handles static attributes (fallback strategy)
 * This is the default strategy that handles any attribute not handled by other strategies
 *
 * Always returns true for canHandle() since it's the fallback
 * Should be registered last in PropsRenderer
 *
 * @example
 * ```tsx
 * <div id="myDiv" className="container" data-test="value">
 *   Content
 * </div>
 * ```
 */
export class AttributeStrategy implements PropStrategy {
  canHandle(key: string, value: any): boolean {
    // This is the fallback strategy - handles everything not handled by others
    // Should be registered last
    return true;
  }

  apply(
    element: Element,
    key: string,
    value: any,
    component?: Component
  ): void {
    setAttr(element as HTMLElement | SVGElement, key, value);
  }
}
