import { COMPONENT_INSTANCE } from "../constants";
import { RenderableComponent } from "./RenderableComponent";

/**
 * Adds cleanup capability
 * Maintains backward compatibility with existing cleanup mechanisms
 */
export abstract class CleanableComponent extends RenderableComponent {
  private _cleanupFns: Array<() => void> = [];
  private _childrenRendered: Set<Node> = new Set<Node>();
  private _childrenMetadata: Set<Node> = new Set<Node>();
  private _childrenMetadataTags: Set<string> = new Set<string>();
  private _childPlaceholderMetadata: Node | null = null;

  private _fragment!: DocumentFragment;

  childrenNodes: Node[] = [];

  /**
   * Register a cleanup function
   * Will be called when component is destroyed
   */
  registerCleanup(fn: () => void): void {
    this._cleanupFns.push(fn);
  }

  addNode(node: Node | Node[]): void {
    const nodes = this.normalizeNodes(node);
    nodes.forEach((node) => {
      if (
        this._childrenRendered.has(node) ||
        this._childrenMetadata.has(node)
      ) {
        return;
      }

      (node as any)[COMPONENT_INSTANCE] = this;

      if (node.nodeType === Node.COMMENT_NODE) {
        if (this._childrenMetadataTags.has((node as Comment).data)) return;
        this._childrenMetadata.add(node);
        this._childrenMetadataTags.add((node as Comment).data);
      } else {
        this._childrenRendered.add(node);
      }
    });

    if (this._childPlaceholderMetadata) {
      this.childrenNodes = [...this._childrenMetadata];
      this.childrenNodes.splice(
        this.childrenNodes.indexOf(this._childPlaceholderMetadata) + 1,
        0,
        ...this._childrenRendered
      );
    } else {
      this.childrenNodes.push(...nodes);
    }
  }

  private normalizeNodes(node: Node | Node[]) {
    return [
      node instanceof DocumentFragment ? Array.from(node.childNodes) : node,
    ].flat();
  }

  setPlaceholderNode(node: Node | null): void {
    this._childPlaceholderMetadata = node;
  }

  getPlaceholderNode(): Node | null {
    return this._childPlaceholderMetadata;
  }

  getRenderedNodes(): Node[] {
    return [...this._childrenRendered];
  }

  addChildrenToFragment(fragment: DocumentFragment): void {
    this._fragment = fragment;
    this.childrenNodes.forEach((node) => {
      fragment.appendChild(node);
    });
  }

  renderChildren(node: Node | Node[]): void {
    const newNodes = this.normalizeNodes(node);

    this.addNode(newNodes);
    (this.getPlaceholderNode() as ChildNode)?.after(...newNodes);
  }

  replaceChild(newNode: Node | Node[]): void {
    const newNodes = this.normalizeNodes(newNode);

    this._childrenRendered.forEach((node) => {
      (node as ChildNode).remove();
    });

    this.childrenNodes = this.childrenNodes.filter(
      (node) => !this._childrenRendered.has(node)
    );

    this._childrenRendered.clear();

    this.addNode(newNodes);

    (this.getPlaceholderNode() as ChildNode)?.after(...newNodes);
  }

  /**
   * Destroy component and run all cleanups
   * This maintains compatibility with the existing destroy() behavior
   */
  destroy(): void {
    this._unmount(() => {
      const cleanupFns = (this as any)._cleanupFns || [];
      cleanupFns.forEach((fn: () => void) => {
        try {
          fn();
        } catch (error) {
          console.error(`Cleanup error in ${this.constructor.name}:`, error);
        }
      });
      (this as any)._cleanupFns = [];

      this.childrenNodes.forEach((node) => {
        if (node.parentNode) {
          node.parentNode.removeChild(node);
        }
      });
    });
  }
}
