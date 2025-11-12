import { Component } from "../base/Component";
import { COMPONENT_INSTANCE, MUTATION_OBSERVER } from "../constants";

/**
 * Handles rendering of Observable values
 * Manages subscription lifecycle and DOM updates
 */
export class ObservableRenderer {
  /**
   * Render an Observable into the DOM with automatic updates
   * Creates placeholder markers and updates content between them
   */
  render(
    observable: any,
    component: Component,
    processTree: (node: any) => Node,
    setParentForTree: (node: any, parent: Component) => void,
    setupDestroyChain: (node: any, parent: Component) => void,
    attachUnmountDetection: (node: Node, component: Component) => void,
    executeLifecycle: (component: Component) => void
  ): DocumentFragment {
    const placeholder = document.createComment("observable-render-start");
    const endMarker = document.createComment("observable-render-end");
    const fragment = document.createDocumentFragment();
    fragment.appendChild(placeholder);
    fragment.appendChild(endMarker);

    let currentNode: Node | null = null;

    observable.subscribe((value: any) => {
      // CRITICAL: Set parent and setup destroy chain BEFORE processing
      // processTree converts Components to DOM, so we must do this first!
      setParentForTree(value, component);
      setupDestroyChain(value, component);

      // Now process the value (converts Components to DOM)
      const processed = processTree(value);

      // Remove old node if exists
      if (currentNode && currentNode.parentNode) {
        currentNode.parentNode.removeChild(currentNode);
      }

      // Insert new node between markers
      if (endMarker.parentNode) {
        endMarker.parentNode.insertBefore(processed, endMarker);
        currentNode = processed;

        // Cache and attach metadata
        (component as any).DOM_CACHE = processed;
        (processed as any)[COMPONENT_INSTANCE] = component;

        // Attach unmount detection if not already done
        if (!(processed as any)[MUTATION_OBSERVER]) {
          attachUnmountDetection(processed, component);
        }

        // Execute lifecycle if not already done
        if (!(component as any).LIFECYCLE_EXECUTED) {
          executeLifecycle(component);
        }
      }
    });

    return fragment;
  }

  /**
   * Check if a value is an Observable
   */
  isObservable(value: any): boolean {
    return value && typeof value.subscribe === "function";
  }
}
