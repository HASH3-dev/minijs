import { Component } from "../../base/Component";
import { Signal } from "../../resources/Signal";
import { PropStrategy } from "../types";

/**
 * RefStrategy - Handles 'ref' prop
 * Allows components to get direct reference to DOM elements
 *
 * Supports two types of refs:
 * 1. Function refs: (element) => void
 * 2. Signal refs: Signal<Element>
 *
 * @example
 * ```tsx
 * const myRef = signal<HTMLDivElement>();
 * <div ref={myRef}>Content</div>
 *
 * // Or with function
 * <div ref={(el) => console.log(el)}>Content</div>
 * ```
 */
export class RefStrategy implements PropStrategy {
  canHandle(key: string, value: any): boolean {
    return key === "ref";
  }

  apply(
    element: Element,
    key: string,
    value: any,
    component?: Component
  ): void {
    if (value instanceof Signal) {
      // Signal ref - set the element
      value.set(element);
    } else if (typeof value === "function") {
      // Function ref - call with element
      value(element);
    }
  }
}
