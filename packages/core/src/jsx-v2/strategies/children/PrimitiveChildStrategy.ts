import { ChildRenderStrategy } from "../../types";
import { RenderContext } from "../../abstractions/RenderContext";
import { IChildrenRenderer } from "../../abstractions/IChildrenRenderer";

/**
 * PrimitiveChildStrategy - Handles primitive values (string, number)
 * Converts primitives to text nodes in DOM
 *
 * @example
 * ```tsx
 * <div>Hello World</div>
 * <span>{42}</span>
 * <p>{'Dynamic text'}</p>
 * ```
 */
export class PrimitiveChildStrategy implements ChildRenderStrategy {
  canHandle(child: any): boolean {
    return typeof child === "string" || typeof child === "number";
  }

  render(
    parent: any,
    child: any,
    context: RenderContext,
    renderer: IChildrenRenderer
  ): void | string {
    // DOM: Create text node and append
    if (parent instanceof HTMLElement) {
      const textNode = document.createTextNode(String(child));
      parent.appendChild(textNode);
      return;
    }

    // SSR: Return string representation
    return String(child);
  }
}
