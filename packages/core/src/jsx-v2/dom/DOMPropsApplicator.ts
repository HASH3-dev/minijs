import { IPropsApplicator } from "../abstractions/IPropsApplicator";
import { RenderContext } from "../abstractions/RenderContext";
import { PropStrategy } from "../types";
import { RefStrategy } from "../strategies/RefStrategy";
import { EventStrategy } from "../strategies/EventStrategy";
import { StyleStrategy } from "../strategies/StyleStrategy";
import { ObservableStrategy } from "../strategies/ObservableStrategy";
import { AttributeStrategy } from "../strategies/AttributeStrategy";

/**
 * DOMPropsApplicator - DOM Implementation
 * Applies props to DOM elements using strategy pattern
 * Extends IPropsApplicator for Liskov Substitution
 *
 * @example
 * ```typescript
 * const applicator = DOMPropsApplicator.getInstance();
 * applicator.apply(element, { id: 'test', onClick: handler }, context);
 * ```
 */
export class DOMPropsApplicator extends IPropsApplicator {
  private static instance?: DOMPropsApplicator;
  private strategies: PropStrategy[];

  private constructor() {
    super();

    // Register default strategies in priority order
    // AttributeStrategy MUST be last (fallback)
    this.strategies = [
      new RefStrategy(),
      new EventStrategy(),
      new StyleStrategy(),
      new ObservableStrategy(),
      new AttributeStrategy(), // Fallback - always last
    ];
  }

  /**
   * Get singleton instance
   */
  static getInstance(): DOMPropsApplicator {
    if (!this.instance) {
      this.instance = new DOMPropsApplicator();
    }
    return this.instance;
  }

  /**
   * Apply props to a DOM element
   */
  apply(element: any, props: any, context: RenderContext): void {
    if (!props) return;

    // Get component from context for subscriptions
    const component = context.component;

    for (const [key, value] of Object.entries(props)) {
      // Skip 'children' - handled by ChildrenRenderer
      if (key === "children") continue;

      // Skip 'key' - handled by ElementFactory
      if (key === "key") continue;

      // Find first strategy that can handle this prop
      const strategy = this.strategies.find((s) => s.canHandle(key, value));

      if (strategy) {
        strategy.apply(element, key, value, component);
      }
      // No else needed - AttributeStrategy handles everything as fallback
    }
  }

  /**
   * Reset singleton instance (useful for testing)
   * @internal
   */
  static resetInstance(): void {
    this.instance = undefined;
  }
}
