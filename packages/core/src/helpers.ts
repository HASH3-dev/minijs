import { BehaviorSubject, Observable, isObservable } from "rxjs";
import { PARENT_COMPONENT, COMPONENT_INSTANCE, DOM_CACHE } from "./constants";
import { Component } from "./base/Component";

/**
 * Check if a value is an Observable
 */
export function toObservable<T>(v: T | Observable<T>): Observable<T> | null {
  if (isObservable(v)) return v as Observable<T>;
  return null;
}

/**
 * Create a new BehaviorSubject (signal)
 */
export const signal = <T>(val: T): BehaviorSubject<T> =>
  new BehaviorSubject(val);

/**
 * Get the current value from a BehaviorSubject
 */
export const unwrap = <T>(val: BehaviorSubject<T>): T => val.value;

/**
 * Check if a value is a primitive type
 */
export function isPrimitive(value: any): boolean {
  return (
    value === null ||
    value === undefined ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  );
}

/**
 * Update text node content
 */
export function updateTextNode(node: Node, value: any): void {
  if (node.nodeType === Node.TEXT_NODE) {
    node.textContent = String(value);
  }
}

/**
 * Debug helper - logs complete component hierarchy via DOM tree
 * NOTE: Call this AFTER rendering is complete, not during @Mount
 */
export function logComponentHierarchy(
  component: Component,
  indent: number = 0,
  visited: Set<Component> = new Set()
): void {
  // Prevent infinite loops
  if (visited.has(component)) {
    console.log("  ".repeat(indent) + "⚠️ CIRCULAR REFERENCE DETECTED");
    return;
  }
  visited.add(component);

  const prefix = "".repeat(indent);
  const name = component.constructor.name;
  const id = component._instanceId;
  const parent = (component as any)[PARENT_COMPONENT];
  const parentName = parent?.constructor?.name || "null";

  console.groupCollapsed(
    `${prefix}📦 ${name} (id: ${id}, parent: ${parentName})`
  );
  console.log(component);

  // Navigate DOM tree to find child components
  (component as any).getRenderedNodes()?.forEach((dom: any) => {
    findComponentsInDOM(dom, indent + 1, visited);
  });

  console.groupEnd();
}

/**
 * Helper to find all components in a DOM tree
 */
function findComponentsInDOM(
  node: Node,
  indent: number,
  visited: Set<Component>
): void {
  // Check if this node has a component instance
  const comp = (node as any)[COMPONENT_INSTANCE];
  if (comp && comp instanceof Component && !visited.has(comp)) {
    logComponentHierarchy(comp, indent, visited);
    return; // Don't traverse children as logComponentHierarchy will do it
  }

  // Traverse children
  if (node.childNodes) {
    node.childNodes.forEach((child) => {
      findComponentsInDOM(child, indent, visited);
    });
  }
}
