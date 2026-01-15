import { Component } from "../../base/Component";
import { PARENT_COMPONENT } from "../../constants";
import { getChildSlots } from "../../resources/Child";
import { processSlottedChildren } from "../utils/slots";
import { SVG_TAGS, SVG_NAMESPACE } from "../constants";
import { Fragment } from "../Fragment";

/**
 * ElementFactory - Singleton
 * Factory for creating different types of elements (HTML, SVG, Components, Fragment)
 *
 * Responsibilities:
 * - Create HTML elements
 * - Create SVG elements with proper namespace
 * - Instantiate Component classes
 * - Handle Fragment
 * - Process @Child decorated properties
 *
 * @example
 * ```typescript
 * const factory = ElementFactory.getInstance();
 * const div = factory.create('div', { id: 'myDiv' });
 * const component = factory.create(MyComponent, { prop: 'value' });
 * ```
 */
export class ElementFactory {
  private static instance?: ElementFactory;

  private constructor() {
    // Private constructor for Singleton pattern
  }

  /**
   * Get singleton instance
   * @returns ElementFactory instance
   */
  static getInstance(): ElementFactory {
    if (!this.instance) {
      this.instance = new ElementFactory();
    }
    return this.instance;
  }

  /**
   * Create an element based on type
   * @param type - Element type (string for HTML/SVG, function for Component/Fragment)
   * @param props - Element properties
   * @param parent - Parent component (for DI hierarchy)
   * @returns Created Node or Component instance
   */
  create(type: any, props: any, parent?: Component): Node | Component {
    // Handle functions (Components or Fragment)
    if (typeof type === "function") {
      return this.createComponent(type, props, parent);
    }

    // Handle HTML/SVG elements
    return this.createDOMElement(type as string, props);
  }

  /**
   * Create a Component instance or Fragment
   * @param type - Component class or Fragment function
   * @param props - Component props
   * @param parent - Parent component
   * @returns Component instance or Fragment node
   */
  private createComponent(
    type: Function,
    props: any,
    parent?: Component
  ): Node | Component {
    // Special case: Fragment
    if (type === Fragment) {
      return Fragment(props);
    }

    // Component class - instantiate
    const componentInstance = new (type as any)();

    // Set parent for DI hierarchy
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
   * @param tag - HTML/SVG tag name
   * @param props - Element properties
   * @returns Created HTMLElement or SVGElement
   */
  private createDOMElement(tag: string, props: any): HTMLElement | SVGElement {
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
   * Check if a tag is an SVG tag
   * @param tag - Tag name to check
   * @returns true if tag is SVG
   */
  isSVGTag(tag: string): boolean {
    return SVG_TAGS.has(tag);
  }

  /**
   * Create a text node
   * @param text - Text content
   * @returns Text node
   */
  createTextNode(text: string): Text {
    return document.createTextNode(text);
  }

  /**
   * Create a comment node
   * @param text - Comment text
   * @returns Comment node
   */
  createComment(text: string): Comment {
    return document.createComment(text);
  }

  /**
   * Create a document fragment
   * @returns Document fragment
   */
  createFragment(): DocumentFragment {
    return document.createDocumentFragment();
  }

  /**
   * Reset singleton instance (useful for testing)
   * @internal
   */
  static resetInstance(): void {
    this.instance = undefined;
  }
}
