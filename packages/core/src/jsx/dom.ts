import { isObservable, Observable, Subscription } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { Application } from "../Application";
import { Component } from "../base/Component";
import {
  SUBSCRIPTIONS,
  COMPONENT_PLACEHOLDER,
  COMPONENT_INSTANCE,
} from "../constants";
import { toObservable } from "../helpers";

/**
 * Set attribute on an HTML element
 */
export const setAttr = (el: HTMLElement, k: string, v: any) => {
  if (k in el) {
    try {
      (el as any)[k] = v;
    } catch {}
  } else {
    el.setAttribute(k, String(v));
  }
};

/**
 * Apply props to an HTML element
 */
export const applyProps = (
  el: HTMLElement,
  props: any,
  parentComponent?: Component
) => {
  props = props || {};
  // Parent component passed explicitly (immutable approach)
  const componentInstance = parentComponent;

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
    const obs = isObservable(v as any);
    if (obs) {
      const observable = componentInstance
        ? (v as Observable<any>).pipe(takeUntil(componentInstance.$.unmount$))
        : (v as Observable<any>);
      const s = observable.subscribe((val) => setAttr(el, k, val as any));
      (s as any).label = componentInstance?.constructor.name;
      subs.push(s);
    } else {
      setAttr(el, k, v as any);
    }
  }
  (el as any)[SUBSCRIPTIONS] = subs;
};

/**
 * Append children to an HTML element
 */
export const appendChildren = (
  el: HTMLElement,
  child: any,
  parentComponent?: Component
) => {
  // Parent component passed explicitly (immutable approach)

  if (Array.isArray(child)) {
    child.forEach((c) => appendChildren(el, c, parentComponent));
    return;
  } else if (child == null || child === false) {
    // skip null/false for conditional rendering
    return;
  } else if (typeof child === "string" || typeof child === "number") {
    el.appendChild(document.createTextNode(String(child)));
    return;
  } else if (child instanceof Node) {
    el.appendChild(child);
    return;
  } else if (child instanceof Component) {
    const placeholder = document.createComment("component-placeholder");
    (placeholder as any)[COMPONENT_PLACEHOLDER] = child;

    el.appendChild(placeholder);
    return;
  }

  // Check if it's an Observable
  const obs = toObservable(child as any);
  if (!obs) {
    return;
  }
  // Create markers to track position
  const startMarker = document.createComment("obs-start");
  const endMarker = document.createComment("obs-end");
  el.appendChild(startMarker);
  el.appendChild(endMarker);
  (startMarker as any)[COMPONENT_INSTANCE] = (endMarker as any)[
    COMPONENT_INSTANCE
  ] = child;

  let currentNodes: ChildNode[] = [];

  const observable = obs;
  const subscription = observable.subscribe((val) => {
    // CASO 1: Renderização condicional (false/null) - DESTRUIR
    if (val === false || val === null) {
      currentNodes.forEach((node) => {
        // if (node instanceof Component) {
        (node as any)[COMPONENT_INSTANCE]?.destroy();
        // } else {
        node.remove?.();
        // }
      });
      currentNodes = [];
      return;
    }

    // CASO 2: Primitivo (string, number, boolean) - ATUALIZAR TEXTO
    if (
      typeof val === "string" ||
      typeof val === "number" ||
      typeof val === "boolean"
    ) {
      // Se já tem um text node, apenas atualiza
      if (
        currentNodes.length === 1 &&
        currentNodes[0].nodeType === Node.TEXT_NODE
      ) {
        currentNodes[0].textContent = String(val);
        return;
      }

      // Senão, remove os nodes antigos e cria novo text node
      currentNodes.forEach((node) => {
        node.remove();
      });
      currentNodes = [];

      const textNode = document.createTextNode(String(val));
      endMarker.parentNode?.insertBefore(textNode, endMarker);
      currentNodes.push(textNode);
      return;
    }

    // CASO 3: Component - VERIFICAR SE É MESMA INSTÂNCIA
    if (val instanceof Component) {
      const previousComponent =
        currentNodes.length > 0
          ? (startMarker as any)[COMPONENT_INSTANCE]
          : null;

      // Se é a MESMA instância, não fazer nada
      if (previousComponent === val) {
        return;
      }

      // Instância diferente - destruir antigo e criar novo
      currentNodes.forEach((node) => {
        (node as any)[COMPONENT_INSTANCE]?.destroy();
      });
      currentNodes = [];

      // Renderizar novo component
      const renderResult = Application.render(val, undefined, {
        parent: parentComponent,
      });
      // renderResult.getComponent()?.replaceChild(renderResult.getNodes());
      renderResult.insertBefore(
        endMarker.parentNode! as HTMLElement,
        endMarker
      );
      currentNodes.push(...(renderResult.getNodes()! as ChildNode[]));
      return;
    }

    // CASO 4: Array - processar cada item
    if (Array.isArray(val)) {
      // Remover nodes antigos
      currentNodes.forEach((node) => {
        node.remove();
      });
      currentNodes = [];

      // Processar array
      const fragment = document.createDocumentFragment();
      val.forEach((item: any) => {
        if (item instanceof Component) {
          const renderResult = Application.render(item, undefined, {
            parent: parentComponent,
          });
          renderResult.insertBefore(
            endMarker.parentNode! as HTMLElement,
            endMarker
          );

          // renderResult.getComponent()?.replaceChild(renderResult.getNodes());
          currentNodes.push(...(renderResult.getNodes() as ChildNode[]));
          renderResult.appendTo(fragment as any);
          // return;
        } else if (item instanceof Node) {
          fragment.appendChild(item);
          currentNodes.push(item as ChildNode);
        } else if (item != null && item !== false) {
          const textNode = document.createTextNode(String(item ?? ""));
          fragment.appendChild(textNode);
          currentNodes.push(textNode);
        }
      });
      endMarker.parentNode?.insertBefore(fragment, endMarker);
      return;
    }

    // CASO 5: Node - inserir diretamente
    if (val instanceof Node) {
      // Remover nodes antigos
      currentNodes.forEach((node) => {
        node.remove();
      });
      currentNodes = [];

      if (val instanceof DocumentFragment) {
        const children = Array.from(val.childNodes);
        endMarker.parentNode?.insertBefore(val, endMarker);
        currentNodes.push(...children);
      } else {
        endMarker.parentNode?.insertBefore(val, endMarker);
        currentNodes.push(val as ChildNode);
      }
      return;
    }

    // CASO padrão: tratar como string
    // Remover nodes antigos
    currentNodes.forEach((node) => {
      node.remove();
    });
    currentNodes = [];

    const textNode = document.createTextNode(String(val));
    endMarker.parentNode?.insertBefore(textNode, endMarker);
    currentNodes.push(textNode);
  });

  (startMarker as any)[SUBSCRIPTIONS] = [subscription];
};
