import { Component, getChildSlots } from "@mini/core";
import { applyProps, attachUnmountDetection } from "./dom";
import { processSlottedChildren } from "./slots";

// Track the currently rendering component instance
let currentRenderingInstance: Component | undefined;

export function Fragment(props: { children?: any } = {}) {
  const { children } = props;

  // If no children, return empty text node
  if (!children) {
    return document.createTextNode("");
  }

  // If single child and it's a Node, return it directly
  if (children instanceof Node) {
    return children;
  }

  // If array of children, use DocumentFragment to group them
  if (Array.isArray(children)) {
    const fragment = document.createDocumentFragment();
    children.forEach((child) => {
      if (child instanceof Node) {
        fragment.appendChild(child);
      } else if (child != null) {
        // Convert primitives to text nodes
        fragment.appendChild(document.createTextNode(String(child)));
      }
    });
    return fragment;
  }

  // Single primitive value
  return document.createTextNode(String(children));
}

export function jsx(type: any, props: any, key?: any) {
  return createElement(type, props);
}
export const jsxs = jsx;
export const jsxDEV = jsx;

export function createElement(
  type: any,
  props: any,
  instance?: Component
): Node {
  if (typeof type === "function") {
    // Special case: Fragment is a function but not a component class
    if (type === Fragment) {
      return Fragment(props);
    }

    // Component class instance
    const componentInstance = new type();

    // Store props on the instance (without children)
    const { children, ...propsWithoutChildren } = props || {};
    componentInstance.props = propsWithoutChildren;

    // Set children as direct property
    if (children !== undefined) {
      componentInstance.children = children;
    }

    // Set parent component reference for DI hierarchy
    const parentInstance = instance || currentRenderingInstance;
    if (parentInstance) {
      componentInstance.__parent_component = parentInstance;
    }

    // Process children and populate @Child decorated properties
    const childSlots = getChildSlots(type);
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

    // Set current rendering instance (for nested component creation)
    const previousInstance = currentRenderingInstance;
    currentRenderingInstance = componentInstance;

    // Restore previous instance
    currentRenderingInstance = previousInstance;

    // Return component instance (will be rendered by Application)
    return componentInstance;
  }

  // DOM element - use current rendering instance or passed instance
  const el = document.createElement(type);
  applyProps(el, props, instance || currentRenderingInstance);
  return el;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
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
