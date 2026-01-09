import { PARENT_COMPONENT } from "../constants";
import { getChildSlots } from "../resources/Child";
import type { MiniElement } from "../types";
import { applyProps, renderPlaceholdersInNode } from "./dom";
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
        // Renderizar placeholders dentro do Node
        renderPlaceholdersInNode(child);
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

// SVG elements that need to be created with SVG namespace
const SVG_TAGS = new Set([
  "svg",
  "path",
  "circle",
  "rect",
  "line",
  "polyline",
  "polygon",
  "ellipse",
  "g",
  "text",
  "tspan",
  "defs",
  "use",
  "symbol",
  "marker",
  "clipPath",
  "mask",
  "pattern",
  "linearGradient",
  "radialGradient",
  "stop",
  "image",
  "foreignObject",
  "animate",
  "animateTransform",
  "animateMotion",
  "set",
  "feBlend",
  "feColorMatrix",
  "feComponentTransfer",
  "feComposite",
  "feConvolveMatrix",
  "feDiffuseLighting",
  "feDisplacementMap",
  "feFlood",
  "feGaussianBlur",
  "feImage",
  "feMerge",
  "feMorphology",
  "feOffset",
  "feSpecularLighting",
  "feTile",
  "feTurbulence",
  "filter",
  "title",
  "desc",
  "metadata",
]);

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

    // Return component instance (will be rendered by Application)
    return componentInstance;
  }

  // Create SVG element with proper namespace if needed
  const el = SVG_TAGS.has(type)
    ? document.createElementNS("http://www.w3.org/2000/svg", type)
    : document.createElement(type);

  // Store key on the element if provided (for list reconciliation)
  if (props && props.key != null) {
    (el as any).key = props.key;
  }

  // Parent will be passed by applyProps when needed
  applyProps(el, props, parent);
  return el;
}

declare global {
  namespace JSX {
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
