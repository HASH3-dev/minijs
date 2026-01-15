/**
 * JSX V2 - Object-Oriented Architecture
 * Main exports for the new JSX rendering system
 */

// Import for internal use
import { MiniElement } from "../types";
import { JSXInterpreter } from "./interpreter/JSXInterpreter";

// Main interpreter (coordinator)
export { JSXInterpreter } from "./interpreter/JSXInterpreter";

// Fragment component
export { Fragment } from "./Fragment";

// Centralized renderer factory (single point of renderer selection)
export { RendererFactory } from "./RendererFactory";

// Abstractions (for SSR and custom renderers)
export * from "./abstractions";

// DOM implementations
export { DOMElementFactory } from "./dom/DOMElementFactory";
export { DOMPropsApplicator } from "./dom/DOMPropsApplicator";
export { DOMChildrenRenderer } from "./dom/DOMChildrenRenderer";

// Legacy exports (backward compatibility - will be deprecated)
export { ElementFactory } from "./interpreter/ElementFactory";
export { PropsRenderer } from "./rendering/PropsRenderer";

// Types
export type {
  PropStrategy,
  ElementCreator,
  ChildType,
  SubscriptionOptions,
} from "./types";

// Constants
export { SVG_TAGS, SVG_NAMESPACE } from "./constants";

// Utils
export { setAttr } from "./utils/setAttr";

// Strategies (for advanced customization)
export { RefStrategy } from "./strategies/RefStrategy";
export { EventStrategy } from "./strategies/EventStrategy";
export { StyleStrategy } from "./strategies/StyleStrategy";
export { ObservableStrategy } from "./strategies/ObservableStrategy";
export { AttributeStrategy } from "./strategies/AttributeStrategy";

/**
 * Main JSX creation function (V2)
 * This is called by the JSX runtime
 *
 * @example
 * ```tsx
 * // Automatically used by JSX transform
 * const element = <div id="test">Hello</div>;
 * // Becomes: jsx('div', { id: 'test', children: 'Hello' })
 * ```
 */
export function jsx(type: any, props: any, key?: any) {
  const interpreter = JSXInterpreter.getInstance();
  return interpreter.createElement(type, props);
}

/**
 * JSX for multiple children (same as jsx in V2)
 */
export const jsxs = jsx;

/**
 * JSX for development mode (same as jsx in V2)
 */
export const jsxDEV = jsx;

/**
 * createElement function (React-like API)
 * Provided for compatibility
 */
export function createElement(type: any, props: any, parent?: any): any {
  const interpreter = JSXInterpreter.getInstance();
  return interpreter.createElement(type, props, parent);
}

declare global {
  namespace JSX {
    // @ts-ignore
    type IntrinsicElements = {
      [K in keyof HTMLElementTagNameMap]: MiniElement<HTMLElementTagNameMap[K]>;
    } & {
      [J in keyof SVGElementTagNameMap]: MiniElement<SVGElementTagNameMap[J]>;
    };

    interface Element extends Node {}

    interface ElementChildrenAttribute {
      children: {};
    }

    interface ElementClass {
      render(): any;
    }

    interface ElementAttributesProperty {
      props: {};
    }

    interface IntrinsicAttributes {
      children?: any;
    }
  }
}
