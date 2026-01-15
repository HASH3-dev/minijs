import { Component } from "../base/Component";
import { RenderContext } from "./abstractions/RenderContext";
import { IChildrenRenderer } from "./abstractions/IChildrenRenderer";

/**
 * Interface for property application strategies
 * Implements Strategy Pattern for different prop types
 */
export interface PropStrategy {
  /**
   * Check if this strategy can handle the given prop
   * @param key - Property key
   * @param value - Property value
   * @returns true if this strategy can handle this prop
   */
  canHandle(key: string, value: any): boolean;

  /**
   * Apply the property to the element
   * @param element - DOM element to apply prop to
   * @param key - Property key
   * @param value - Property value
   * @param component - Parent component (for subscriptions)
   */
  apply(element: Element, key: string, value: any, component?: Component): void;
}

/**
 * Interface for element creators
 * Implements Factory Pattern for different element types
 */
export interface ElementCreator {
  /**
   * Check if this creator can create the given type
   * @param type - Element type to create
   * @returns true if this creator can handle this type
   */
  canCreate(type: any): boolean;

  /**
   * Create an element of the given type
   * @param type - Element type to create
   * @param props - Properties for the element
   * @param parent - Parent component (for DI)
   * @returns Created DOM node or Component instance
   */
  create(type: any, props: any, parent?: Component): Node | Component;
}

/**
 * Type for child nodes that can be rendered
 */
export type ChildType =
  | Node
  | Component
  | string
  | number
  | boolean
  | null
  | undefined
  | ChildType[];

/**
 * Options for subscription management
 */
export interface SubscriptionOptions {
  /** Component to attach subscription to (for automatic cleanup) */
  component?: Component;
  /** Custom label for debugging */
  label?: string;
}

/**
 * Interface for child rendering strategies
 * Implements Strategy Pattern for different child types
 */
export interface ChildRenderStrategy {
  /**
   * Check if this strategy can handle the given child
   * @param child - Child to check
   * @returns true if this strategy can handle this child
   */
  canHandle(child: any): boolean;

  /**
   * Render the child into the parent element
   * @param parent - Parent element (HTMLElement for DOM, string buffer for SSR)
   * @param child - Child to render
   * @param context - Render context
   * @param renderer - Children renderer instance (for recursive calls)
   * @returns void for DOM, string for SSR (depends on render target)
   */
  render(
    parent: any,
    child: any,
    context: RenderContext,
    renderer: IChildrenRenderer
  ): void | string;
}
