import { Component } from "../../base/Component";
import { IElementFactory } from "../abstractions/IElementFactory";
import { IPropsApplicator } from "../abstractions/IPropsApplicator";
import { IChildrenRenderer } from "../abstractions/IChildrenRenderer";
import { RenderContext, createDOMContext } from "../abstractions/RenderContext";
import { RendererFactory } from "../RendererFactory";

/**
 * JSXInterpreter - Singleton (Coordinator)
 * Main entry point for JSX V2 rendering
 * Uses RendererFactory for centralized renderer selection (LSP)
 *
 * This is the core of the JSX V2 system - it coordinates:
 * 1. Element creation (via IElementFactory from RendererFactory)
 * 2. Props application (via IPropsApplicator from RendererFactory)
 * 3. Children rendering (via IChildrenRenderer from RendererFactory)
 *
 * Render target (DOM, SSR, etc) is chosen via RendererFactory.setRenderTarget()
 *
 * @example
 * ```typescript
 * // Set render target (optional, defaults to DOM)
 * RendererFactory.setRenderTarget(RenderTarget.DOM);
 *
 * // Use interpreter
 * const interpreter = JSXInterpreter.getInstance();
 * const element = interpreter.createElement('div', { id: 'test' }, parentComponent);
 * ```
 */
export class JSXInterpreter {
  private static instance?: JSXInterpreter;

  private elementFactory: IElementFactory;
  private propsApplicator: IPropsApplicator;
  private childrenRenderer: IChildrenRenderer;

  private constructor() {
    // Get implementations from centralized factory
    // Render target can be changed via RendererFactory.setRenderTarget()
    this.elementFactory = RendererFactory.getElementFactory();
    this.propsApplicator = RendererFactory.getPropsApplicator();
    this.childrenRenderer = RendererFactory.getChildrenRenderer();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): JSXInterpreter {
    if (!this.instance) {
      this.instance = new JSXInterpreter();
    }
    return this.instance;
  }

  /**
   * Create an element from JSX
   * Main entry point - called by JSX runtime
   *
   * @param type - Element type (string for HTML/SVG, function for Component)
   * @param props - Element props
   * @param parent - Parent component (for DI hierarchy)
   * @returns Created Node or Component instance
   */
  createElement(type: any, props: any, parent?: Component): Node | Component {
    // Create render context
    const context: RenderContext = createDOMContext(parent);

    // Step 1: Create the element using abstraction (via RendererFactory)
    const element = this.elementFactory.create(type, props, context);

    // Step 2: Apply props if it's a DOM element using abstraction (via RendererFactory)
    if (element instanceof Element && props) {
      this.propsApplicator.apply(element, props, context);

      // Step 3: Render children if present
      if (props.children !== undefined) {
        // Accept both HTMLElement and SVGElement
        this.childrenRenderer.render(
          element as HTMLElement | SVGElement,
          props.children,
          context
        );
      }
    }

    // Note: Components are returned as-is, they will be rendered by Application

    return element;
  }

  /**
   * Reset singleton instance (useful for testing)
   * Should be called after RendererFactory.setRenderTarget() if changing target
   * @internal
   */
  static resetInstance(): void {
    this.instance = undefined;
  }
}
