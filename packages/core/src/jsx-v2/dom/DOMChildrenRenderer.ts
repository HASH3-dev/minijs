import { IChildrenRenderer } from "../abstractions/IChildrenRenderer";
import { RenderContext } from "../abstractions/RenderContext";
import { ChildRenderStrategy } from "../types";
import { NullChildStrategy } from "../strategies/children/NullChildStrategy";
import { ArrayChildStrategy } from "../strategies/children/ArrayChildStrategy";
import { ObservableChildStrategy } from "../strategies/children/ObservableChildStrategy";
import { ComponentChildStrategy } from "../strategies/children/ComponentChildStrategy";
import { NodeChildStrategy } from "../strategies/children/NodeChildStrategy";
import { PrimitiveChildStrategy } from "../strategies/children/PrimitiveChildStrategy";

/**
 * DOM implementation of children rendering
 * Uses Strategy Pattern - delegates all logic to specific strategies
 * Singleton pattern for efficient reuse
 *
 * CLEAN & MINIMAL - All complex logic is in the strategies themselves
 */
export class DOMChildrenRenderer extends IChildrenRenderer {
  private static instance: DOMChildrenRenderer;
  private strategies: ChildRenderStrategy[];

  /**
   * Private constructor - initializes strategies
   */
  private constructor() {
    super();
    // Order matters! Must match V1 logic:
    // Check explicit types first, Observable LAST (since toObservable() can convert many types)
    this.strategies = [
      new NullChildStrategy(),
      new ArrayChildStrategy(),
      new ComponentChildStrategy(),
      new NodeChildStrategy(),
      new PrimitiveChildStrategy(),
      new ObservableChildStrategy(), // LAST! toObservable() is a fallback
    ];
  }

  /**
   * Get singleton instance
   */
  static getInstance(): DOMChildrenRenderer {
    if (!this.instance) {
      this.instance = new DOMChildrenRenderer();
    }
    return this.instance;
  }

  /**
   * Main render method - uses Strategy Pattern
   * Delegates to appropriate strategy based on child type
   *
   * This is now SUPER CLEAN - just finds the right strategy and delegates!
   */
  render(el: HTMLElement, child: any, context: RenderContext): void {
    for (const strategy of this.strategies) {
      if (strategy.canHandle(child)) {
        strategy.render(el, child, context, this);
        return;
      }
    }

    // Fallback: treat as string if no strategy handles it
    el.appendChild(document.createTextNode(String(child)));
  }
}
