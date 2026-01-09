import { ChildRenderStrategy } from "../../types";
import { RenderContext } from "../../abstractions/RenderContext";
import { IChildrenRenderer } from "../../abstractions/IChildrenRenderer";

/**
 * NullChildStrategy - Handles null, undefined, and false values
 * Used for conditional rendering
 *
 * @example
 * ```tsx
 * <div>{condition && <span>Visible</span>}</div>
 * // When condition is false, this strategy handles it
 * ```
 */
export class NullChildStrategy implements ChildRenderStrategy {
  canHandle(child: any): boolean {
    return child == null || child === false;
  }

  render(
    parent: any,
    child: any,
    context: RenderContext,
    renderer: IChildrenRenderer
  ): void | string {
    // Do nothing - null/false children are skipped for conditional rendering
    return;
  }
}
