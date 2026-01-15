import { Component } from "../../base/Component";
import { PropStrategy } from "../types";

/**
 * EventStrategy - Handles event props (onClick, onInput, etc)
 * Automatically converts camelCase event names to lowercase and adds listeners
 *
 * @example
 * ```tsx
 * <button onClick={(e) => console.log('clicked')}>Click me</button>
 * <input onInput={(e) => console.log(e.target.value)} />
 * ```
 */
export class EventStrategy implements PropStrategy {
  canHandle(key: string, value: any): boolean {
    return key.startsWith("on") && typeof value === "function";
  }

  apply(
    element: Element,
    key: string,
    value: any,
    component?: Component
  ): void {
    // Convert onClick -> click, onInput -> input, etc
    const eventName = key.slice(2).toLowerCase();
    element.addEventListener(eventName, value as EventListener);
  }
}
