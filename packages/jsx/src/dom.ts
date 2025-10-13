import { Component, toObservable } from "@mini/core";
import { Subscription } from "rxjs";
import { takeUntil } from "rxjs/operators";

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

    (node as any).__mini_observer = observer;
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
  const subs: Subscription[] = [];
  for (const [k, v] of Object.entries(props)) {
    if (k === "children") {
      appendChildren(el, v, instance);
      continue;
    }
    if (k.startsWith("on") && typeof v === "function") {
      el.addEventListener(k.slice(2).toLowerCase(), v as any);
      continue;
    }

    // Handle reactive attributes
    const obs = toObservable(v as any);
    if (obs) {
      const observable = instance
        ? obs.pipe(takeUntil(instance.$.unmount$))
        : obs;
      const s = observable.subscribe((val) => setAttr(el, k, val as any));
      subs.push(s);
    } else {
      setAttr(el, k, v as any);
    }
  }
  (el as any).__mini_subs = subs;
}

/**
 * Append children to an HTML element
 */
export function appendChildren(
  el: HTMLElement,
  child: any,
  instance?: Component
) {
  if (Array.isArray(child)) {
    child.forEach((c) => appendChildren(el, c, instance));
  } else if (child == null || child === false) {
    // skip null/false for conditional rendering
  } else if (typeof child === "string" || typeof child === "number") {
    el.appendChild(document.createTextNode(String(child)));
  } else if (child instanceof Node) {
    el.appendChild(child);
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
        .pipe(instance ? takeUntil(instance.$.unmount$) : (x) => x)
        .subscribe((val) => {
          // Remove old nodes
          currentNodes.forEach((node) => {
            if (node.parentNode) {
              node.parentNode.removeChild(node);
            }
          });
          currentNodes = [];

          // Handle the new value
          if (Array.isArray(val)) {
            // Observable emits array (e.g., from pipe(map(...)))
            const fragment = document.createDocumentFragment();
            val.forEach((item: any) => {
              if (item instanceof Node) {
                fragment.appendChild(item);
                currentNodes.push(item);
              } else if (item != null && item !== false) {
                const textNode = document.createTextNode(String(item ?? ""));
                fragment.appendChild(textNode);
                currentNodes.push(textNode);
              }
            });
            endMarker.parentNode?.insertBefore(fragment, endMarker);
          } else if (val instanceof Node) {
            // Observable emits a single Node
            endMarker.parentNode?.insertBefore(val, endMarker);
            currentNodes.push(val);
          } else if (val != null && val !== false) {
            // Observable emits single primitive value
            const textNode = document.createTextNode(String(val ?? ""));
            endMarker.parentNode?.insertBefore(textNode, endMarker);
            currentNodes.push(textNode);
          }
        });

      (startMarker as any).__mini_subs = [subscription];
    }
  }
}
