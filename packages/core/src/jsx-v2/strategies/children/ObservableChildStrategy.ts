import { Observable, isObservable } from "rxjs";
import { ChildRenderStrategy } from "../../types";
import { RenderContext } from "../../abstractions/RenderContext";
import { IChildrenRenderer } from "../../abstractions/IChildrenRenderer";
import { toObservable } from "../../../helpers";
import { Component } from "../../../base/Component";
import { Application } from "../../../Application";
import {
  SUBSCRIPTIONS,
  OBSERVABLES,
  COMPONENT_INSTANCE,
} from "../../../constants";

/**
 * ObservableChildStrategy - Handles Observable children
 * SIMPLIFIED - Delegates rendering to other strategies through the renderer
 * Only manages: subscription, markers, and smart reconciliation
 *
 * Smart reconciliation:
 * - null/false: Remove all (conditional rendering)
 * - text → text: Update textContent (optimization)
 * - component → same component: Do nothing (optimization)
 * - anything else: Replace completely
 *
 * @example
 * ```tsx
 * const text$ = signal('Hello');
 * <div>{text$}</div>
 *
 * const items$ = signal([1, 2, 3]);
 * <ul>{items$.pipe(map(items => items.map(i => <li key={i}>{i}</li>)))}</ul>
 * ```
 */
export class ObservableChildStrategy implements ChildRenderStrategy {
  canHandle(child: any): boolean {
    // Use isObservable() for detection, not toObservable()
    // toObservable() converts, isObservable() just checks
    return isObservable(child);
  }

  render(
    parent: any,
    child: any,
    context: RenderContext,
    renderer: IChildrenRenderer
  ): void | string {
    const observable = toObservable(child);
    if (!observable) {
      return;
    }

    // DOM: Subscribe and manage reactive updates
    if (parent instanceof HTMLElement) {
      this.subscribeAndRender(parent, observable, context, renderer);
      return;
    }

    // SSR: Observable children cannot be rendered in SSR
    return "<!-- SSR observable rendering not supported -->";
  }

  /**
   * Subscribe to observable and intelligently reconcile updates
   */
  private subscribeAndRender(
    el: HTMLElement,
    observable: Observable<any>,
    context: RenderContext,
    renderer: IChildrenRenderer
  ): void {
    // Create markers to track position
    const startMarker = document.createComment("obs-start");
    const endMarker = document.createComment("obs-end");
    el.appendChild(startMarker);
    el.appendChild(endMarker);

    let currentNodes: ChildNode[] = [];
    let previousValue: any = undefined;

    const subscription = observable.subscribe((val) => {
      // OPTIMIZATION 1: Same component instance - do nothing
      if (val instanceof Component && val === previousValue) {
        return;
      }

      // OPTIMIZATION 2: Text node update (string/number → string/number)
      if (this.isPrimitive(val) && this.isPrimitive(previousValue)) {
        if (
          currentNodes.length === 1 &&
          currentNodes[0].nodeType === Node.TEXT_NODE
        ) {
          currentNodes[0].textContent = String(val);
          previousValue = val;
          return;
        }
      }

      // CASE: null/false - Remove everything (conditional rendering)
      if (val === null || val === false) {
        this.cleanupNodes(currentNodes);
        currentNodes.length = 0;
        previousValue = val;
        return;
      }

      // CASE: Array - pass to ArrayChildStrategy with reconciliation metadata
      // DON'T clean nodes here! ArrayChildStrategy will handle reconciliation
      if (Array.isArray(val)) {
        const reconciliationContext = {
          ...context,
          metadata: {
            ...context.metadata,
            reconciliation: {
              reconcile: true,
              markers: { start: startMarker, end: endMarker },
              currentNodes,
            },
          },
        };

        // Delegate to renderer - ArrayChildStrategy will handle reconciliation
        renderer.render(
          endMarker.parentNode as any,
          val,
          reconciliationContext
        );

        // currentNodes will be updated by ArrayChildStrategy
        previousValue = val;
        return;
      }

      // DEFAULT: Replace with new content (for non-arrays)
      this.cleanupNodes(currentNodes);
      currentNodes.length = 0;

      // For non-arrays: handle inline like V1 (can't delegate to renderer)
      // Because strategies use appendChild, not insertBefore(endMarker)

      // CASE: Component - render it
      if (val instanceof Component) {
        const renderResult = Application.render(val as any, undefined, {
          parent: context.component as any,
        });
        renderResult.insertBefore(
          endMarker.parentNode! as HTMLElement,
          endMarker
        );
        currentNodes.push(...(renderResult.getNodes()! as ChildNode[]));
      }
      // CASE: Node - insert it
      else if (val instanceof Node) {
        if (val instanceof DocumentFragment) {
          const children = Array.from(val.childNodes);
          endMarker.parentNode?.insertBefore(val, endMarker);
          currentNodes.push(...children);
        } else {
          endMarker.parentNode?.insertBefore(val, endMarker);
          currentNodes.push(val as ChildNode);
        }
      }
      // CASE: Default - treat as string
      else {
        const textNode = document.createTextNode(String(val));
        endMarker.parentNode?.insertBefore(textNode, endMarker);
        currentNodes.push(textNode);
      }

      previousValue = val;
    });

    // Store subscription for cleanup
    (startMarker as any)[SUBSCRIPTIONS] = [
      ...((startMarker as any)[SUBSCRIPTIONS] ?? []),
      subscription,
    ];
    (startMarker as any)[OBSERVABLES] = [
      ...((startMarker as any)[OBSERVABLES] ?? []),
      observable,
    ];
  }

  /**
   * Check if value is a primitive (string, number, boolean)
   */
  private isPrimitive(value: any): boolean {
    return (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    );
  }

  /**
   * Cleanup nodes - destroy components and remove from DOM
   */
  private cleanupNodes(nodes: ChildNode[]): void {
    nodes.forEach((node) => {
      (node as any)[COMPONENT_INSTANCE]?.destroy();
      node.remove();
    });
  }

  /**
   * Get all nodes between two markers
   */
  private getNodesBetweenMarkers(
    startMarker: Comment,
    endMarker: Comment
  ): ChildNode[] {
    const nodes: ChildNode[] = [];
    let node = startMarker.nextSibling;
    while (node && node !== endMarker) {
      nodes.push(node);
      node = node.nextSibling;
    }
    return nodes;
  }
}
