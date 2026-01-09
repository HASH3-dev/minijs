import { Component } from "../../base/Component";
import { RenderContext } from "./RenderContext";

/**
 * Abstract Element Factory
 * Defines contract for creating elements in different render targets
 *
 * Implementations:
 * - DOMElementFactory: Creates DOM nodes (HTMLElement, SVGElement, Text, etc)
 * - SSRElementFactory: Creates string representations or virtual nodes
 *
 * Liskov Substitution Principle:
 * Any implementation can be substituted without breaking the system
 */
export abstract class IElementFactory {
  /**
   * Create an element based on type
   *
   * @param type - Element type (string for HTML/SVG, function for Component)
   * @param props - Element properties
   * @param context - Render context
   * @returns Created element (type depends on render target)
   *
   * DOM: Node | Component
   * SSR: string | VNode
   */
  abstract create(type: any, props: any, context: RenderContext): any;

  /**
   * Create a text node
   *
   * @param text - Text content
   * @param context - Render context
   * @returns Text representation
   *
   * DOM: Text node
   * SSR: escaped string
   */
  abstract createTextNode(text: string, context: RenderContext): any;

  /**
   * Create a comment node
   *
   * @param text - Comment text
   * @param context - Render context
   * @returns Comment representation
   *
   * DOM: Comment node
   * SSR: HTML comment string
   */
  abstract createComment(text: string, context: RenderContext): any;

  /**
   * Create a document fragment or equivalent
   *
   * @param context - Render context
   * @returns Fragment representation
   *
   * DOM: DocumentFragment
   * SSR: array or concatenated string
   */
  abstract createFragment(context: RenderContext): any;

  /**
   * Check if a tag requires special handling (e.g., SVG)
   *
   * @param tag - Tag name
   * @returns true if tag requires special handling
   */
  abstract isSpecialTag(tag: string): boolean;
}
