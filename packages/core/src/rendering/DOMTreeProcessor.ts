import { Component } from "../base/Component";
import { COMPONENT_PLACEHOLDER } from "../constants";

/**
 * Processes a rendered tree, converting Component instances to DOM nodes
 * Uses visitor pattern to traverse and transform the tree
 */
export class DOMTreeProcessor {
  /**
   * Process a node and convert it to a DOM Node
   * Handles Components, primitives, DocumentFragments, and Elements
   */
  process(node: any, renderComponent: (component: Component) => Node): Node {
    // If it's a Component, render it
    if (node instanceof Component) {
      return renderComponent(node);
    }

    // If it's not a Node, convert to text
    if (!(node instanceof Node)) {
      if (node == null) {
        return document.createComment("empty");
      }
      return document.createTextNode(String(node));
    }

    // Check if it's a placeholder comment node
    if (node.nodeType === Node.COMMENT_NODE) {
      const component = (node as any)[COMPONENT_PLACEHOLDER];
      if (component instanceof Component) {
        // Replace placeholder with rendered component
        return renderComponent(component);
      }
    }

    // If it's a DocumentFragment, process its children
    if (node instanceof DocumentFragment) {
      const children = Array.from(node.childNodes);
      children.forEach((child) => {
        const processed = this.process(child, renderComponent);
        if (processed !== child) {
          node.replaceChild(processed, child);
        }
      });
    }

    // If it's an Element, process its children
    if (node instanceof Element) {
      const children = Array.from(node.childNodes);
      children.forEach((child) => {
        const processed = this.process(child, renderComponent);
        if (processed !== child) {
          node.replaceChild(processed, child);
        }
      });
    }

    return node;
  }
}
