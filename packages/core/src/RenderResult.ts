import { Component } from "./base/Component";

/**
 * Result of a managed render operation
 * Provides methods to manipulate and clean up rendered DOM nodes
 */
export class RenderResult {
  private nodes: Node[];
  private componentInstance?: Component;

  constructor(
    fragment: DocumentFragment | Node,
    componentInstance?: Component
  ) {
    if (fragment instanceof DocumentFragment) {
      // Store nodes before they get moved out of the fragment
      this.nodes = Array.from(fragment.childNodes);
    } else {
      this.nodes = [fragment];
    }
    this.componentInstance = componentInstance;
  }

  /**
   * Get all DOM nodes from this render
   */
  getNodes(): Node[] {
    return [...this.nodes];
  }

  getRenderedNodes(): Node[] | undefined {
    return this.componentInstance?.getRenderedNodes();
  }

  /**
   * Get the first node (useful for single-node renders)
   */
  getFirstNode(): Node | undefined {
    return this.nodes[0];
  }

  /**
   * Append all nodes to a parent element
   */
  appendTo(parent: HTMLElement): this {
    this.nodes.forEach((node) => {
      parent.appendChild(node);
    });
    return this;
  }

  /**
   * Insert all nodes before a reference node
   */
  insertBefore(parent: HTMLElement, referenceNode: Node | null): this {
    this.nodes.forEach((node) => {
      parent.insertBefore(node, referenceNode);
    });
    return this;
  }

  /**
   * Remove all nodes from the DOM
   */
  remove(): void {
    this.nodes.forEach((node) => {
      if (node.parentNode) {
        node.parentNode.removeChild(node);
      }
    });
  }

  /**
   * Remove all nodes and destroy the component instance if present
   */
  destroy(): void {
    // Remove from DOM
    this.remove();

    // Destroy component instance if present
    if (this.componentInstance) {
      this.componentInstance.destroy();
    }

    // Clear references
    this.nodes = [];
    this.componentInstance = undefined;
  }

  /**
   * Check if any nodes are still in the DOM
   */
  isInDOM(): boolean {
    return this.nodes.some((node) => node.parentNode !== null);
  }

  /**
   * Get the component instance associated with this render (if any)
   */
  getComponent(): Component | undefined {
    return this.componentInstance;
  }
}
