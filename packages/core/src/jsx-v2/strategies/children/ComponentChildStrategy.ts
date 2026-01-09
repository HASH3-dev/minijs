import { ChildRenderStrategy } from "../../types";
import { RenderContext } from "../../abstractions/RenderContext";
import { IChildrenRenderer } from "../../abstractions/IChildrenRenderer";
import { Component } from "../../../base/Component";
import { COMPONENT_PLACEHOLDER } from "../../../constants";

/**
 * ComponentChildStrategy - Handles Component instances
 * Creates placeholder comments that will be rendered later
 *
 * @example
 * ```tsx
 * <div>
 *   <MyComponent />
 * </div>
 * ```
 */
export class ComponentChildStrategy implements ChildRenderStrategy {
  canHandle(child: any): boolean {
    return child instanceof Component;
  }

  render(
    parent: any,
    child: any,
    context: RenderContext,
    renderer: IChildrenRenderer
  ): void | string {
    const component = child as Component;

    // DOM: Create placeholder comment
    if (parent instanceof HTMLElement) {
      const placeholder = document.createComment("component-placeholder");
      (placeholder as any)[COMPONENT_PLACEHOLDER] = component;
      parent.appendChild(placeholder);
      return;
    }

    // SSR: Render component to string (not implemented yet)
    // This would call Application.renderToString(component)
    return "<!-- SSR component rendering not implemented -->";
  }
}
