/**
 * INodeRegistry - Interface for managing component nodes
 * Enables LSP - DOM stores Nodes, SSR stores HTML strings
 *
 * @example
 * ```typescript
 * // DOM: stores real DOM nodes
 * class DOMNodeRegistry implements INodeRegistry {
 *   register(node: Node) { this.nodes.add(node); }
 * }
 *
 * // SSR: stores HTML strings
 * class SSRNodeRegistry implements INodeRegistry {
 *   register(html: string) { this.htmlParts.push(html); }
 * }
 * ```
 */
export interface INodeRegistry {
  /**
   * Register a node
   * DOM: Node instance
   * SSR: HTML string
   */
  register(node: any): void;

  /**
   * Unregister a node
   */
  unregister(node: any): void;

  /**
   * Get all registered nodes
   * DOM: returns Node[]
   * SSR: returns string[]
   */
  getNodes(): any[];

  /**
   * Clear all nodes
   */
  clear(): void;

  /**
   * Check if has any nodes
   */
  hasNodes(): boolean;
}
