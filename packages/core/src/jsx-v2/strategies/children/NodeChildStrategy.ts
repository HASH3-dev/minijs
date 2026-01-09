import { ChildRenderStrategy } from "../../types";
import { RenderContext } from "../../abstractions/RenderContext";
import { IChildrenRenderer } from "../../abstractions/IChildrenRenderer";
import { Component } from "../../../base/Component";
import { Application } from "../../../Application";
import { COMPONENT_PLACEHOLDER } from "../../../constants";

/**
 * NodeChildStrategy - Handles DOM Node instances
 * Appends nodes directly and renders any component placeholders inside
 * FULLY SELF-CONTAINED - includes placeholder rendering logic
 *
 * @example
 * ```tsx
 * const node = document.createElement('div');
 * <div>{node}</div>
 * ```
 */
export class NodeChildStrategy implements ChildRenderStrategy {
  canHandle(child: any): boolean {
    return child instanceof Node;
  }

  render(
    parent: any,
    child: any,
    context: RenderContext,
    renderer: IChildrenRenderer
  ): void | string {
    const node = child as Node;

    // DOM: Append node and render placeholders inside it
    // Accept both HTMLElement and SVGElement
    if (parent instanceof Element) {
      parent.appendChild(node);
      this.renderPlaceholdersInNode(node, context.component);
      return;
    }

    // SSR: Convert node to HTML string (not implemented yet)
    return "<!-- SSR node rendering not implemented -->";
  }

  /**
   * Render component placeholders found inside a Node
   * This allows nested components to be properly rendered
   */
  private renderPlaceholdersInNode(
    node: Node,
    parentComponent?: Component
  ): void {
    const walker = document.createTreeWalker(
      node,
      NodeFilter.SHOW_COMMENT,
      null
    );

    const placeholdersToRender: Array<{
      placeholder: Comment;
      component: Component;
    }> = [];

    // Collect all placeholders first
    let currentNode: Node | null = walker.nextNode();
    while (currentNode) {
      const comment = currentNode as Comment;
      const component = (comment as any)[COMPONENT_PLACEHOLDER];

      if (component instanceof Component) {
        placeholdersToRender.push({ placeholder: comment, component });
      }

      currentNode = walker.nextNode();
    }

    // Render all collected placeholders
    placeholdersToRender.forEach(({ placeholder, component }) => {
      const renderResult = Application.render(component as any, undefined, {
        parent: parentComponent as any,
      });

      // Insert rendered nodes before the placeholder
      renderResult.insertBefore(
        placeholder.parentNode! as HTMLElement,
        placeholder
      );

      // Remove the placeholder comment
      placeholder.remove();
    });
  }
}
