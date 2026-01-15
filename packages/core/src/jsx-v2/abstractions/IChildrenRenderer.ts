import { RenderContext } from "./RenderContext";

/**
 * Abstract Children Renderer
 * Defines contract for rendering children in different render targets
 *
 * Implementations:
 * - DOMChildrenRenderer: Appends children to DOM elements
 * - SSRChildrenRenderer: Converts children to HTML string
 *
 * Liskov Substitution Principle:
 * Any implementation can be substituted without breaking the system
 */
export abstract class IChildrenRenderer {
  /**
   * Render children into a parent element
   *
   * @param parent - Parent element (type depends on render target)
   * @param children - Children to render (can be any, array, Node, Component, Observable, etc)
   * @param context - Render context
   * @returns void for DOM, string for SSR
   *
   * DOM: appends children to parent element, returns void
   * SSR: returns string representation of children
   */
  abstract render(
    parent: any,
    children: any,
    context: RenderContext
  ): void | string;
}
