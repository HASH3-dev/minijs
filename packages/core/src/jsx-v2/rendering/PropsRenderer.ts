import { Component } from "../../base/Component";
import { PropStrategy } from "../types";
import { RefStrategy } from "../strategies/RefStrategy";
import { EventStrategy } from "../strategies/EventStrategy";
import { StyleStrategy } from "../strategies/StyleStrategy";
import { ObservableStrategy } from "../strategies/ObservableStrategy";
import { AttributeStrategy } from "../strategies/AttributeStrategy";

/**
 * PropsRenderer - Singleton
 * Applies props to elements using registered strategies
 *
 * Uses Strategy Pattern to handle different prop types:
 * - RefStrategy: handles 'ref' prop
 * - EventStrategy: handles 'onClick', 'onInput', etc
 * - StyleStrategy: handles 'style' prop (static and reactive)
 * - ObservableStrategy: handles reactive attributes
 * - AttributeStrategy: handles static attributes (fallback)
 *
 * Strategies are checked in order - first match wins
 *
 * @example
 * ```typescript
 * const renderer = PropsRenderer.getInstance();
 * renderer.apply(element, { id: 'test', onClick: handler }, component);
 * ```
 */
export class PropsRenderer {
  private static instance?: PropsRenderer;
  private strategies: PropStrategy[];

  private constructor() {
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
  static getInstance(): PropsRenderer {
    if (!this.instance) {
      this.instance = new PropsRenderer();
    }
    return this.instance;
  }

  /**
   * Apply props to an element
   *
   * @param element - Element to apply props to
   * @param props - Props object
   * @param component - Parent component (for subscriptions and DI)
   */
  apply(element: Element, props: any, component?: Component): void {
    if (!props) return;

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
