import { Component } from "../../base/Component";
import { PARENT_COMPONENT } from "../../constants";
import { getChildSlots } from "../../resources/Child";
import { processSlottedChildren } from "../utils/slots";
import { SVG_TAGS, SVG_NAMESPACE } from "../constants";
import { Fragment } from "../Fragment";
import { IElementFactory } from "../abstractions/IElementFactory";
import { RenderContext } from "../abstractions/RenderContext";

/**
 * DOMElementFactory - DOM Implementation
 * Creates DOM elements (HTMLElement, SVGElement, Text, etc)
 * Extends IElementFactory for Liskov Substitution
 *
 * @example
 * ```typescript
 * const factory = DOMElementFactory.getInstance();
 * const div = factory.create('div', { id: 'myDiv' }, context);
 * ```
 */
export class DOMElementFactory extends IElementFactory {
  private static instance?: DOMElementFactory;

  private constructor() {
    super();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): DOMElementFactory {
    if (!this.instance) {
      this.instance = new DOMElementFactory();
    }
    return this.instance;
  }

  /**
   * Create an element based on type
   */
  create(type: any, props: any, context: RenderContext): Node | Component {
    // Handle functions (Components or Fragment)
    if (typeof type === "function") {
      return this.createComponent(type, props, context);
    }

    // Handle HTML/SVG elements
    return this.createDOMElement(type as string, props, context);
  }

  /**
   * Create a Component instance or Fragment
   */
  private createComponent(
    type: Function,
    props: any,
    context: RenderContext
  ): Node | Component {
    // Special case: Fragment
    if (type === Fragment) {
      return Fragment(props);
    }

    // Component class - instantiate
    const componentInstance = new (type as any)();

    // Set parent for DI hierarchy
    const parent = context.component;
    if (parent) {
      componentInstance[PARENT_COMPONENT] = parent;
    }

    // Store props (without children)
    const { children, ...propsWithoutChildren } = props || {};
    componentInstance.props = propsWithoutChildren;

    // Set children as direct property
    if (children !== undefined) {
      componentInstance.children = children;
    }

    // Process @Child decorated properties
    const childSlots = getChildSlots(componentInstance);
    if (childSlots && children) {
      const slottedChildren = processSlottedChildren(children);

      // Assign children to @Child decorated properties
      childSlots.forEach((propertyKey: string, slotName: string) => {
        const slotChildren = slottedChildren.get(slotName);
        if (slotChildren) {
          componentInstance[propertyKey] =
            slotChildren.length === 1 ? slotChildren[0] : slotChildren;
        }
      });
    }

    return componentInstance;
  }

  /**
   * Create an HTML or SVG element
   */
  private createDOMElement(
    tag: string,
    props: any,
    context: RenderContext
  ): HTMLElement | SVGElement {
    // Create with proper namespace
    const element = SVG_TAGS.has(tag)
      ? document.createElementNS(SVG_NAMESPACE, tag)
      : document.createElement(tag);

    // Store key if provided (for list reconciliation)
    if (props && props.key != null) {
      (element as any).key = props.key;
    }

    return element;
  }

  /**
   * Create a text node
   */
  createTextNode(text: string, context: RenderContext): Text {
    return document.createTextNode(text);
  }

  /**
   * Create a comment node
   */
  createComment(text: string, context: RenderContext): Comment {
    return document.createComment(text);
  }

  /**
   * Create a document fragment
   */
  createFragment(context: RenderContext): DocumentFragment {
    return document.createDocumentFragment();
  }

  /**
   * Check if a tag is an SVG tag
   */
  isSpecialTag(tag: string): boolean {
    return SVG_TAGS.has(tag);
  }

  /**
   * Reset singleton instance (useful for testing)
   * @internal
   */
  static resetInstance(): void {
    this.instance = undefined;
  }
}
