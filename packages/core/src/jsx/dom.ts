import { isObservable, Observable, Subject, Subscription } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { Application } from "../Application";
import { Component } from "../base/Component";
import {
  SUBSCRIPTIONS,
  COMPONENT_PLACEHOLDER,
  COMPONENT_INSTANCE,
  OBSERVABLES,
  KEYED_ELEMENTS,
} from "../constants";
import { toObservable } from "../helpers";
import { Signal } from "../resources/Signal";

/**
 * SVG attributes that need special handling (case-sensitive)
 */
const SVG_ATTRIBUTES = new Set([
  "viewBox",
  "preserveAspectRatio",
  "xmlns",
  "xmlnsXlink",
  "xmlSpace",
  "fillOpacity",
  "strokeOpacity",
  "strokeWidth",
  "strokeLinecap",
  "strokeLinejoin",
  "strokeDasharray",
  "strokeDashoffset",
  "strokeMiterlimit",
  "clipPath",
  "textAnchor",
  "dominantBaseline",
  "baselineShift",
  "fontFamily",
  "fontSize",
  "fontWeight",
  "fontStyle",
]);

/**
 * Set attribute on an HTML/SVG element
 */
export const setAttr = (el: HTMLElement | SVGElement, k: string, v: any) => {
  // For SVG elements, prefer setAttribute for most attributes
  if (el instanceof SVGElement) {
    // Handle special SVG attributes or use setAttribute
    if (k === "className") {
      el.setAttribute("class", String(v));
    } else if (k === "xlinkHref" || k === "xlink:href") {
      el.setAttributeNS("http://www.w3.org/1999/xlink", "href", String(v));
    } else if (k === "xmlnsXlink") {
      el.setAttributeNS(
        "http://www.w3.org/2000/xmlns/",
        "xmlns:xlink",
        String(v)
      );
    } else {
      el.setAttribute(k, String(v));
    }
    return;
  }

  // For HTML elements, try property first
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
  const observables: Subject<any>[] = [];
  for (const [k, v] of Object.entries(props)) {
    if (k === "children") {
      appendChildren(el, v, componentInstance);
      continue;
    }
    // Handle ref prop - call the function with the element
    if (k === "ref") {
      if (v instanceof Signal) {
        v.set(el);
      } else if (typeof v === "function") {
        v(el);
      }
      continue;
    }
    if (k.startsWith("on") && typeof v === "function") {
      el.addEventListener(k.slice(2).toLowerCase(), v as any);
      continue;
    }

    if (k === "style") {
      if (!isObservable(v)) {
        for (const [sk, sv] of Object.entries(v as object)) {
          if (isObservable(sv)) {
            const observable = componentInstance
              ? (sv as Observable<any>).pipe(
                  takeUntil(componentInstance.$.unmount$)
                )
              : (sv as Observable<any>);
            const s = observable.subscribe(
              (val) => (el.style[sk as any] = val as any)
            );
            (s as any).label = componentInstance?.constructor.name;
            subs.push(s);
            observables.push(observable as Subject<any>);
          } else {
            el.style[sk as any] = sv as any;
          }
        }
        continue;
      } else {
        const observable = componentInstance
          ? (v as Observable<any>).pipe(takeUntil(componentInstance.$.unmount$))
          : (v as Observable<any>);
        const s = observable.subscribe((val) =>
          Object.entries(val as object).forEach(
            ([sk, sv]) => (el.style[sk as any] = sv as any)
          )
        );
        (s as any).label = componentInstance?.constructor.name;
        subs.push(s);
        observables.push(observable as Subject<any>);
        continue;
      }
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
      observables.push(observable as Subject<any>);
    } else {
      setAttr(el, k, v as any);
    }
  }
  (el as any)[SUBSCRIPTIONS] = [...((el as any)[SUBSCRIPTIONS] ?? []), ...subs];
  (el as any)[OBSERVABLES] = [
    ...((el as any)[OBSERVABLES] ?? []),
    ...observables,
  ];
};

/**
 * Render component placeholders found inside a Node
 */
export const renderPlaceholdersInNode = (
  node: Node,
  parentComponent?: Component
) => {
  const walker = document.createTreeWalker(node, NodeFilter.SHOW_COMMENT, null);

  const placeholdersToRender: Array<{
    placeholder: Comment;
    component: Component;
  }> = [];

  // Collect all placeholders first
  let currentNode: Node | null = walker.nextNode();
  while (currentNode) {
    const comment = currentNode as Comment;
    const component = (comment as any)[COMPONENT_PLACEHOLDER];

    if (component instanceof Component) {
      placeholdersToRender.push({ placeholder: comment, component });
    }

    currentNode = walker.nextNode();
  }

  // Render all collected placeholders
  placeholdersToRender.forEach(({ placeholder, component }) => {
    const renderResult = Application.render(component, undefined, {
      parent: parentComponent,
    });

    // Insert rendered nodes before the placeholder
    renderResult.insertBefore(
      placeholder.parentNode! as HTMLElement,
      placeholder
    );

    // Remove the placeholder comment
    placeholder.remove();
  });
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
    // Renderizar placeholders dentro do Node
    renderPlaceholdersInNode(child, parentComponent);
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

    // CASO 4: Array - processar cada item COM RECONCILIAÇÃO POR KEY
    if (Array.isArray(val)) {
      // Inicializar cache de elementos com key se não existir
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

      // Criar maps para reconciliação
      const newKeys = new Set<string | number>();
      const newKeyedItems = new Map<string | number, any>();

      // Identificar quais items têm keys
      val.forEach((item: any) => {
        if (item instanceof Node && (item as any).key != null) {
          const key = (item as any).key;
          newKeys.add(key);
          newKeyedItems.set(key, item);
        }
      });

      // Se nenhum item tem key, usar comportamento antigo (sem cache)
      if (newKeys.size === 0) {
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

            currentNodes.push(...(renderResult.getNodes() as ChildNode[]));
            renderResult.appendTo(fragment as any);
          } else if (item instanceof Node) {
            fragment.appendChild(item);
            currentNodes.push(item as ChildNode);
            renderPlaceholdersInNode(item, parentComponent);
          } else if (item != null && item !== false) {
            const textNode = document.createTextNode(String(item ?? ""));
            fragment.appendChild(textNode);
            currentNodes.push(textNode);
          }
        });
        endMarker.parentNode?.insertBefore(fragment, endMarker);
        return;
      }

      // RECONCILIAÇÃO EFICIENTE COM KEYS - MANTÉM ORDEM EXATA DO ARRAY

      // 1. REMOVER elementos cujas keys não existem mais
      const keysToRemove: (string | number)[] = [];
      keyedCache.forEach((cached, key) => {
        if (!newKeys.has(key)) {
          keysToRemove.push(key);
          // Remover do DOM
          cached.nodes.forEach((node) => {
            (node as any)[COMPONENT_INSTANCE]?.destroy();
            node.remove();
          });
        }
      });
      keysToRemove.forEach((key) => keyedCache.delete(key));

      // 2. PROCESSAR cada item NA ORDEM DO ARRAY
      const newNodes: ChildNode[] = [];
      let previousNode: ChildNode | null = null; // Último node processado

      val.forEach((item: any, index: number) => {
        if (item instanceof Node && (item as any).key != null) {
          const key = (item as any).key;

          // CASO 1: Key já existe - REUTILIZAR nodes do cache
          if (keyedCache.has(key)) {
            const cached = keyedCache.get(key)!;
            const firstNode = cached.nodes[0];

            // Calcular onde o node deveria estar
            // Deve estar após o previousNode (ou após startMarker se for o primeiro)
            const shouldBeAfter = previousNode || startMarker;
            const isInCorrectPosition =
              firstNode.previousSibling === shouldBeAfter;

            // Se não está na posição correta, mover
            if (!isInCorrectPosition) {
              // Inserir após shouldBeAfter (que significa antes do nextSibling)
              const insertBefore = shouldBeAfter.nextSibling;
              cached.nodes.forEach((node) => {
                endMarker.parentNode?.insertBefore(node, insertBefore);
              });
            }

            // Atualizar referência para o último node deste item
            previousNode = cached.nodes[cached.nodes.length - 1];
            newNodes.push(...cached.nodes);
          }
          // CASO 2: Key nova - CRIAR elemento
          else {
            const fragment = document.createDocumentFragment();
            let nodesToAdd: ChildNode[] = [];

            if (item instanceof Component) {
              const renderResult = Application.render(item, undefined, {
                parent: parentComponent,
              });
              const nodes = renderResult.getNodes() as ChildNode[];
              renderResult.appendTo(fragment as any);
              nodesToAdd = nodes;

              // Armazenar no cache
              keyedCache.set(key, { nodes: nodes, data: item });
            } else {
              fragment.appendChild(item);
              nodesToAdd = [item as ChildNode];
              renderPlaceholdersInNode(item, parentComponent);

              // Armazenar no cache
              keyedCache.set(key, { nodes: [item as ChildNode], data: item });
            }

            // Inserir após previousNode (ou após startMarker se for o primeiro)
            const shouldBeAfter = previousNode || startMarker;
            const insertBefore = shouldBeAfter.nextSibling;
            endMarker.parentNode?.insertBefore(fragment, insertBefore);

            // Atualizar referência
            previousNode = nodesToAdd[nodesToAdd.length - 1];
            newNodes.push(...nodesToAdd);
          }
        } else {
          // Item sem key - criar sempre
          const fragment = document.createDocumentFragment();
          let nodesToAdd: ChildNode[] = [];

          if (item instanceof Component) {
            const renderResult = Application.render(item, undefined, {
              parent: parentComponent,
            });
            const nodes = renderResult.getNodes() as ChildNode[];
            renderResult.appendTo(fragment as any);
            nodesToAdd = nodes;
          } else if (item instanceof Node) {
            fragment.appendChild(item);
            nodesToAdd = [item as ChildNode];
            renderPlaceholdersInNode(item, parentComponent);
          } else if (item != null && item !== false) {
            const textNode = document.createTextNode(String(item ?? ""));
            fragment.appendChild(textNode);
            nodesToAdd = [textNode];
          }

          // Inserir após previousNode
          if (nodesToAdd.length > 0) {
            const shouldBeAfter = previousNode || startMarker;
            const insertBefore = shouldBeAfter.nextSibling;
            endMarker.parentNode?.insertBefore(fragment, insertBefore);
            previousNode = nodesToAdd[nodesToAdd.length - 1];
            newNodes.push(...nodesToAdd);
          }
        }
      });

      // 3. LIMPAR nodes órfãos e atualizar currentNodes
      // Remover TODOS os nodes que não estão em newNodes
      currentNodes.forEach((node) => {
        if (!newNodes.includes(node)) {
          (node as any)[COMPONENT_INSTANCE]?.destroy();
          node.remove();
        }
      });

      // 4. LIMPAR cache de keys que não estão mais sendo usadas
      // Isso garante que se um item saiu do array, sua key é removida do cache
      const activeKeys = new Set(
        newNodes.map((node) => (node as any).key).filter((k) => k != null)
      );
      keyedCache.forEach((cached, key) => {
        if (!activeKeys.has(key) && !newKeys.has(key)) {
          // Remove do cache se não está ativa E não está no novo array
          keyedCache.delete(key);
        }
      });

      currentNodes = newNodes;

      // 5. VERIFICAÇÃO FINAL: contar nodes REAIS no DOM entre os markers
      const actualDOMNodes: ChildNode[] = [];
      let node = startMarker.nextSibling;
      while (node && node !== endMarker) {
        actualDOMNodes.push(node);
        node = node.nextSibling;
      }

      // Verificar se há descompasso entre o esperado e o real
      const hasLengthMismatch = actualDOMNodes.length !== val.length;
      const hasNodesMismatch = actualDOMNodes.length !== currentNodes.length;

      if (hasLengthMismatch || hasNodesMismatch) {
        console.warn(
          `[MiniJS] Descompasso detectado: currentNodes=${
            currentNodes.length
          }, array=${val.length}. Forçando sincronização...
          [MiniJS] Descompasso detectado!
          \n- Array length: ${val.length}
          \n- currentNodes: ${currentNodes.length}
          \n- DOM real: ${actualDOMNodes.length}
          \n- Keys no array: ${Array.from(newKeys).join(", ")}
          \n- Keys no cache: ${Array.from(keyedCache.keys()).join(", ")}`
        );
        console.warn(
          `[MiniJS] Descompasso detectado: currentNodes=${currentNodes.length}, array=${val.length}. Forçando sincronização...`
        );

        // Forçar reconstrução completa em caso de descompasso
        currentNodes.forEach((node) => {
          (node as any)[COMPONENT_INSTANCE]?.destroy();
          node.remove();
        });
        keyedCache.clear();
        currentNodes = [];

        // Processar tudo novamente
        const fragment = document.createDocumentFragment();
        val.forEach((item: any) => {
          if (item instanceof Node && (item as any).key != null) {
            const key = (item as any).key;

            if (item instanceof Component) {
              const renderResult = Application.render(item, undefined, {
                parent: parentComponent,
              });
              const nodes = renderResult.getNodes() as ChildNode[];
              renderResult.appendTo(fragment as any);
              keyedCache.set(key, { nodes: nodes, data: item });
              currentNodes.push(...nodes);
            } else {
              fragment.appendChild(item);
              renderPlaceholdersInNode(item, parentComponent);
              keyedCache.set(key, { nodes: [item as ChildNode], data: item });
              currentNodes.push(item as ChildNode);
            }
          } else {
            // Item sem key
            if (item instanceof Component) {
              const renderResult = Application.render(item, undefined, {
                parent: parentComponent,
              });
              const nodes = renderResult.getNodes() as ChildNode[];
              renderResult.appendTo(fragment as any);
              currentNodes.push(...nodes);
            } else if (item instanceof Node) {
              fragment.appendChild(item);
              renderPlaceholdersInNode(item, parentComponent);
              currentNodes.push(item as ChildNode);
            } else if (item != null && item !== false) {
              const textNode = document.createTextNode(String(item ?? ""));
              fragment.appendChild(textNode);
              currentNodes.push(textNode);
            }
          }
        });
        endMarker.parentNode?.insertBefore(fragment, endMarker);
      }

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

        // Renderizar placeholders dentro dos children do fragment
        children.forEach((child) => {
          renderPlaceholdersInNode(child, parentComponent);
        });
      } else {
        endMarker.parentNode?.insertBefore(val, endMarker);
        currentNodes.push(val as ChildNode);

        // Renderizar placeholders dentro do Node
        renderPlaceholdersInNode(val, parentComponent);
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

  (startMarker as any)[SUBSCRIPTIONS] = [
    ...((startMarker as any)[SUBSCRIPTIONS] ?? []),
    subscription,
  ];
  (startMarker as any)[OBSERVABLES] = [
    ...((startMarker as any)[OBSERVABLES] ?? []),
    observable,
  ];
};
