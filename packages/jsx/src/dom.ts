import {
  Component,
  toObservable,
  Application,
  PARENT_COMPONENT,
} from "@mini/core";
import { Subscription } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { SUBSCRIPTIONS } from "./constants";
import {
  COMPONENT_INSTANCE,
  MUTATION_OBSERVER,
  COMPONENT_PLACEHOLDER,
  DOM_CACHE,
  LIFECYCLE_EXECUTED,
} from "@mini/core";

/**
 * Attach unmount detection to a DOM node
 */
export function attachUnmountDetection(node: Node, instance: Component) {
  setTimeout(() => {
    if (!node.parentNode) return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.removedNodes.forEach((removed) => {
          if (removed === node || removed.contains(node)) {
            instance.destroy();
            observer.disconnect();
          }
        });
      });
    });

    let parent: ParentNode | null = node.parentNode;
    while (parent) {
      observer.observe(parent, { childList: true, subtree: true });
      parent = parent.parentNode;
    }

    (node as any)[MUTATION_OBSERVER] = observer;
  }, 0);
}

/**
 * Set attribute on an HTML element
 */
export function setAttr(el: HTMLElement, k: string, v: any) {
  if (k in el) {
    try {
      (el as any)[k] = v;
    } catch {}
  } else {
    el.setAttribute(k, String(v));
  }
}

/**
 * Apply props to an HTML element
 */
export function applyProps(
  el: HTMLElement,
  props: any = {},
  instance?: Component
) {
  // Use current rendering instance if no instance provided
  const componentInstance =
    instance || Application.getCurrentRenderingInstance();

  const subs: Subscription[] = [];
  for (const [k, v] of Object.entries(props)) {
    if (k === "children") {
      appendChildren(el, v, componentInstance);
      continue;
    }
    if (k.startsWith("on") && typeof v === "function") {
      el.addEventListener(k.slice(2).toLowerCase(), v as any);
      continue;
    }

    // Handle reactive attributes
    const obs = toObservable(v as any);
    if (obs) {
      const observable = componentInstance
        ? obs.pipe(takeUntil(componentInstance.$.unmount$))
        : obs;
      const s = observable.subscribe((val) => setAttr(el, k, val as any));
      (s as any).label = componentInstance?.constructor.name;
      subs.push(s);
    } else {
      setAttr(el, k, v as any);
    }
  }
  (el as any)[SUBSCRIPTIONS] = subs;
}

/**
 * Append children to an HTML element
 */
export function appendChildren(
  el: HTMLElement,
  child: any,
  instance?: Component
) {
  // Use current rendering instance if no instance provided
  const componentInstance =
    instance || Application.getCurrentRenderingInstance();

  if (Array.isArray(child)) {
    child.forEach((c) => appendChildren(el, c, instance));
  } else if (child == null || child === false) {
    // skip null/false for conditional rendering
  } else if (typeof child === "string" || typeof child === "number") {
    el.appendChild(document.createTextNode(String(child)));
  } else if (child instanceof Node) {
    el.appendChild(child);
  } else if (child instanceof Component) {
    // Component instance - add as placeholder comment node
    // Application.processRenderedTree will replace this with rendered DOM

    // IMPORTANT: Set parent component for DI hierarchy
    if (componentInstance) {
      child[PARENT_COMPONENT] = componentInstance;
    }

    const placeholder = document.createComment("component-placeholder");
    (placeholder as any)[COMPONENT_PLACEHOLDER] = child;
    el.appendChild(placeholder);
  } else {
    // Check if it's an Observable
    const obs = toObservable(child as any);
    if (obs) {
      // Create markers to track position
      const startMarker = document.createComment("obs-start");
      const endMarker = document.createComment("obs-end");
      el.appendChild(startMarker);
      el.appendChild(endMarker);

      let currentNodes: Node[] = [];

      const subscription = obs
        .pipe(
          componentInstance ? takeUntil(componentInstance.$.unmount$) : (x) => x
        )
        .subscribe((val) => {
          // Remove old nodes and destroy components
          currentNodes.forEach((node) => {
            // Check if node has a component instance
            const componentInstance = (node as any)[COMPONENT_INSTANCE];
            if (
              componentInstance &&
              typeof componentInstance.destroy === "function"
            ) {
              componentInstance.destroy();
            }

            if (node.parentNode) {
              node.parentNode.removeChild(node);
            }
          });
          currentNodes = [];

          // Handle the new value
          // Skip rendering for null, undefined, and false (conditional rendering)
          if (val == null || val === false) {
            // Do nothing - nodes already removed above
            return;
          }

          if (Array.isArray(val)) {
            // Observable emits array (e.g., from pipe(map(...)))
            const fragment = document.createDocumentFragment();
            val.forEach((item: any) => {
              if (item instanceof Component) {
                // Component - render it using Application
                // IMPORTANT: Set parent so DI and lifecycle work correctly
                if (componentInstance) {
                  item[PARENT_COMPONENT] = componentInstance;
                }
                const rendered = Application.render(item);
                fragment.appendChild(rendered);
                currentNodes.push(rendered);
              } else if (item instanceof Node) {
                fragment.appendChild(item);
                currentNodes.push(item);
              } else if (item != null && item !== false) {
                const textNode = document.createTextNode(String(item ?? ""));
                fragment.appendChild(textNode);
                currentNodes.push(textNode);
              }
            });
            endMarker.parentNode?.insertBefore(fragment, endMarker);
          } else if (val instanceof Component) {
            // Observable emits a Component
            // CRITICAL: Create a NEW instance instead of reusing
            // This ensures proper lifecycle and DI setup every time
            const ComponentClass = val.constructor as any;
            const newInstance = new ComponentClass();

            // Copy props AND children from original
            newInstance.props = val.props || {};
            newInstance.children = val.children;

            // Set parent for DI
            if (componentInstance) {
              newInstance[PARENT_COMPONENT] = componentInstance;
              console.log(
                "[MINI-DEBUG] jsx/dom.ts Observable: Set parent",
                newInstance.constructor.name,
                "→",
                componentInstance.constructor.name
              );
            } else {
              console.log(
                "[MINI-DEBUG] jsx/dom.ts Observable: NO PARENT for",
                newInstance.constructor.name
              );
            }

            const rendered = Application.render(newInstance);

            // If rendered is a DocumentFragment, we need to track its children
            // because the fragment itself won't remain in the DOM
            if (rendered instanceof DocumentFragment) {
              const children = Array.from(rendered.childNodes);
              endMarker.parentNode?.insertBefore(rendered, endMarker);
              // Track the actual nodes that were inserted, not the fragment
              currentNodes.push(...children);
            } else {
              endMarker.parentNode?.insertBefore(rendered, endMarker);
              currentNodes.push(rendered);
            }
          } else if (val instanceof Node) {
            // Observable emits a single Node
            endMarker.parentNode?.insertBefore(val, endMarker);
            currentNodes.push(val);
          } else {
            // Observable emits single primitive value (string, number, etc)
            const textNode = document.createTextNode(String(val));
            endMarker.parentNode?.insertBefore(textNode, endMarker);
            currentNodes.push(textNode);
          }
        });

      (subscription as any).label = componentInstance?.constructor.name;

      (startMarker as any)[SUBSCRIPTIONS] = [subscription];
    }
  }
}
