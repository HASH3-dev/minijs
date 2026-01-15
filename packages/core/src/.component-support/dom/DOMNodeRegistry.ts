import { INodeRegistry } from "../abstractions/INodeRegistry";

/**
 * DOM implementation of node registry
 * Manages a Set of DOM nodes associated with a component
 */
export class DOMNodeRegistry implements INodeRegistry {
  private nodes = new Set<Node>();

  register(node: Node): void {
    this.nodes.add(node);
  }

  unregister(node: Node): void {
    this.nodes.delete(node);
  }

  getNodes(): Node[] {
    return Array.from(this.nodes);
  }

  clear(): void {
    this.nodes.clear();
  }

  hasNodes(): boolean {
    return this.nodes.size > 0;
  }
}
