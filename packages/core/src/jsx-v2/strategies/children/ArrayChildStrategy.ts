import { ChildRenderStrategy } from "../../types";
import { RenderContext } from "../../abstractions/RenderContext";
import { IChildrenRenderer } from "../../abstractions/IChildrenRenderer";
import { Component } from "../../../base/Component";
import { Application } from "../../../Application";
import { COMPONENT_INSTANCE, KEYED_ELEMENTS } from "../../../constants";

/**
 * Reconciliation metadata passed from Observable
 */
interface ReconciliationMetadata {
  reconcile: true;
  markers: { start: Comment; end: Comment };
  currentNodes: ChildNode[];
}

/**
 * ArrayChildStrategy - Handles array of children
 * FULLY SELF-CONTAINED - includes keyed reconciliation logic
 *
 * Two modes:
 * 1. Simple mode (default): Just iterate and render each child
 * 2. Reconciliation mode (from Observable): Smart keyed reconciliation
 *
 * @example
 * ```tsx
 * // Simple
 * <ul>{items.map(item => <li>{item}</li>)}</ul>
 *
 * // With reconciliation (from Observable)
 * <ul>{items$.pipe(map(items => items.map(i => <li key={i}>{i}</li>)))}</ul>
 * ```
 */
export class ArrayChildStrategy implements ChildRenderStrategy {
  canHandle(child: any): boolean {
    return Array.isArray(child);
  }

  render(
    parent: any,
    child: any,
    context: RenderContext,
    renderer: IChildrenRenderer
  ): void | string {
    const children = child as any[];

    // Check if reconciliation is requested (from Observable)
    const reconciliationData = context.metadata
      ?.reconciliation as ReconciliationMetadata;

    if (reconciliationData && parent instanceof HTMLElement) {
      // RECONCILIATION MODE - Smart keyed reconciliation
      this.renderWithReconciliation(
        children,
        reconciliationData,
        context,
        renderer
      );
      return;
    }

    // SIMPLE MODE - Just iterate
    if (parent instanceof HTMLElement) {
      children.forEach((c) => renderer.render(parent, c, context));
      return;
    }

    // SSR: Concatenate string results
    return children
      .map((c) => renderer.render(parent, c, context))
      .filter((result) => result != null)
      .join("");
  }

  /**
   * Render array with efficient key-based reconciliation
   * This is used when array comes from an Observable
   */
  private renderWithReconciliation(
    items: any[],
    reconciliationData: ReconciliationMetadata,
    context: RenderContext,
    renderer: IChildrenRenderer
  ): void {
    const { markers, currentNodes } = reconciliationData;
    const { start: startMarker, end: endMarker } = markers;
    const parentComponent = context.component;

    // Initialize keyed elements cache if not exists
    if (!(startMarker as any)[KEYED_ELEMENTS]) {
      (startMarker as any)[KEYED_ELEMENTS] = new Map<
        string | number,
        { nodes: ChildNode[]; data: any }
      >();
    }

    const keyedCache = (startMarker as any)[KEYED_ELEMENTS] as Map<
      string | number,
      { nodes: ChildNode[]; data: any }
    >;

    // Identify which items have keys
    const newKeys = new Set<string | number>();
    items.forEach((item: any) => {
      if (item instanceof Node && (item as any).key != null) {
        newKeys.add((item as any).key);
      }
    });

    // If no items have keys, use simple rendering
    if (newKeys.size === 0) {
      this.renderSimple(items, endMarker, currentNodes, context, renderer);
      return;
    }

    // KEY-BASED RECONCILIATION

    // 1. Remove elements whose keys no longer exist
    const keysToRemove: (string | number)[] = [];
    keyedCache.forEach((cached, key) => {
      if (!newKeys.has(key)) {
        keysToRemove.push(key);
        cached.nodes.forEach((node) => {
          (node as any)[COMPONENT_INSTANCE]?.destroy();
          node.remove();
        });
      }
    });
    keysToRemove.forEach((key) => keyedCache.delete(key));

    // 2. Process each item in array order
    const newNodes: ChildNode[] = [];
    let previousNode: ChildNode | null = null;

    items.forEach((item: any) => {
      if (item instanceof Node && (item as any).key != null) {
        const key = (item as any).key;

        // Key exists - REUSE nodes from cache
        if (keyedCache.has(key)) {
          const cached = keyedCache.get(key)!;
          const firstNode = cached.nodes[0];

          const shouldBeAfter = previousNode || startMarker;
          const isInCorrectPosition =
            firstNode.previousSibling === shouldBeAfter;

          if (!isInCorrectPosition) {
            const insertBefore = shouldBeAfter.nextSibling;
            cached.nodes.forEach((node) => {
              endMarker.parentNode?.insertBefore(node, insertBefore);
            });
          }

          previousNode = cached.nodes[cached.nodes.length - 1];
          newNodes.push(...cached.nodes);
        }
        // New key - CREATE element
        else {
          const nodesToAdd = this.createKeyedElement(
            item,
            key,
            keyedCache,
            parentComponent
          );

          const shouldBeAfter = previousNode || startMarker;
          const insertBefore = shouldBeAfter.nextSibling;
          nodesToAdd.forEach((node) => {
            endMarker.parentNode?.insertBefore(node, insertBefore);
          });

          previousNode = nodesToAdd[nodesToAdd.length - 1];
          newNodes.push(...nodesToAdd);
        }
      } else {
        // Item without key - always create
        const nodesToAdd = this.createNonKeyedElement(item, parentComponent);

        if (nodesToAdd.length > 0) {
          const shouldBeAfter = previousNode || startMarker;
          const insertBefore = shouldBeAfter.nextSibling;
          nodesToAdd.forEach((node) => {
            endMarker.parentNode?.insertBefore(node, insertBefore);
          });
          previousNode = nodesToAdd[nodesToAdd.length - 1];
          newNodes.push(...nodesToAdd);
        }
      }
    });

    // 3. Clean orphaned nodes
    currentNodes.forEach((node) => {
      if (!newNodes.includes(node)) {
        (node as any)[COMPONENT_INSTANCE]?.destroy();
        node.remove();
      }
    });

    currentNodes.length = 0;
    currentNodes.push(...newNodes);
  }

  /**
   * Simple array rendering without keys
   * Matches V1 behavior: always clear and re-render from scratch
   */
  private renderSimple(
    items: any[],
    endMarker: Comment,
    currentNodes: ChildNode[],
    context: RenderContext,
    renderer: IChildrenRenderer
  ): void {
    // Remove ALL old nodes
    currentNodes.forEach((node) => node.remove());
    currentNodes.length = 0;

    // Create fragment and render all items into it
    const fragment = document.createDocumentFragment();
    items.forEach((item: any) => {
      if (item instanceof Component) {
        const renderResult = Application.render(item as any, undefined, {
          parent: context.component as any,
        });
        renderResult.insertBefore(
          endMarker.parentNode! as HTMLElement,
          endMarker
        );
        currentNodes.push(...(renderResult.getNodes() as ChildNode[]));
        renderResult.appendTo(fragment as any);
      } else if (item instanceof Node) {
        fragment.appendChild(item);
        currentNodes.push(item as ChildNode);
      } else if (item != null && item !== false) {
        const textNode = document.createTextNode(String(item ?? ""));
        fragment.appendChild(textNode);
        currentNodes.push(textNode);
      }
    });

    // Insert all at once
    endMarker.parentNode?.insertBefore(fragment, endMarker);
  }

  /**
   * Create element with key and store in cache
   */
  private createKeyedElement(
    item: any,
    key: string | number,
    keyedCache: Map<string | number, { nodes: ChildNode[]; data: any }>,
    parentComponent?: Component
  ): ChildNode[] {
    let nodesToAdd: ChildNode[] = [];

    if (item instanceof Component) {
      const renderResult = Application.render(item as any, undefined, {
        parent: parentComponent as any,
      });
      const nodes = renderResult.getNodes() as ChildNode[];
      nodesToAdd = nodes;
      keyedCache.set(key, { nodes, data: item });
    } else {
      nodesToAdd = [item as ChildNode];
      keyedCache.set(key, { nodes: [item as ChildNode], data: item });
    }

    return nodesToAdd;
  }

  /**
   * Create element without key
   */
  private createNonKeyedElement(
    item: any,
    parentComponent?: Component
  ): ChildNode[] {
    const nodesToAdd: ChildNode[] = [];

    if (item instanceof Component) {
      const renderResult = Application.render(item as any, undefined, {
        parent: parentComponent as any,
      });
      const nodes = renderResult.getNodes() as ChildNode[];
      nodesToAdd.push(...nodes);
    } else if (item instanceof Node) {
      nodesToAdd.push(item as ChildNode);
    } else if (item != null && item !== false) {
      const textNode = document.createTextNode(String(item ?? ""));
      nodesToAdd.push(textNode);
    }

    return nodesToAdd;
  }
}
