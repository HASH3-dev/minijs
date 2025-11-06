import { Application } from "../Application";
import { Component } from "../base/Component";
import { PARENT_COMPONENT } from "../constants";
import { getChildSlots } from "../decorators/Child";
import { applyProps } from "./dom";
import { processSlottedChildren } from "./slots";

export const Fragment = (props: { children?: any } = {}) => {
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
};

export function jsx(type: any, props: any, key?: any) {
  // Create the node tree without setting parents
  // const nodes = createElement(type, props, this as any);
  // return nodes;
}
export const jsxs = console.log;
export const jsxDEV = console.log;

export function createElement(type: any, props: any, parent: any): Node {
  if (typeof type === "function") {
    // Special case: Fragment is a function but not a component class
    if (type === Fragment) {
      return Fragment(props);
    }

    // Component class instance
    const componentInstance = new type();

    // Set parent if we have one
    if (parent) {
      componentInstance[PARENT_COMPONENT] ??= parent;
    }

    // Store props on the instance (without children)
    const { children, ...propsWithoutChildren } = props || {};
    componentInstance.props = propsWithoutChildren;

    // Set children as direct property
    if (children !== undefined) {
      componentInstance.children = children;
    }

    // DO NOT set parent here - will be set by traverseAndAddParents()
    // This ensures immutable parent assignment based on structure

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

    // Return component instance (will be rendered by Application)
    return componentInstance;
  }

  // DOM element
  const el = document.createElement(type);
  // Parent will be passed by applyProps when needed
  applyProps(el, props, parent);
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
