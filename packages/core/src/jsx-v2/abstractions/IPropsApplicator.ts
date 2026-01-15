import { RenderContext } from "./RenderContext";

/**
 * Abstract Props Applicator
 * Defines contract for applying props to elements in different render targets
 *
 * Implementations:
 * - DOMPropsApplicator: Applies props to DOM elements (sets attributes, events, etc)
 * - SSRPropsApplicator: Converts props to string attributes for HTML
 *
 * Liskov Substitution Principle:
 * Any implementation can be substituted without breaking the system
 */
export abstract class IPropsApplicator {
  /**
   * Apply props to an element
   *
   * @param element - Element to apply props to (type depends on render target)
   * @param props - Props object
   * @param context - Render context
   * @returns void for DOM, string/object for SSR
   *
   * DOM: modifies element directly, returns void
   * SSR: returns string representation of attributes
   */
  abstract apply(
    element: any,
    props: any,
    context: RenderContext
  ): void | string | Record<string, any>;
}
