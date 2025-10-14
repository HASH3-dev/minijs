import { Component } from "@mini/core";

/**
 * Process children and group them by slot name
 * Returns a Map where key is slot name (or "" for default) and value is array of children
 */
export function processSlottedChildren(children: any): Map<string, any[]> {
  const slotMap = new Map<string, any[]>();

  const processChild = (child: any) => {
    if (child == null || child === false) {
      return;
    }

    // Check if child is a Component instance (before rendering)
    if (child instanceof Component) {
      if (child.props && child.props.slot) {
        const slotName = child.props.slot;
        if (!slotMap.has(slotName)) {
          slotMap.set(slotName, []);
        }
        slotMap.get(slotName)!.push(child);
        return;
      }
    }

    // Check if child is a Node with __mini_instance (already rendered)
    if (child instanceof Node) {
      const instance = (child as any).__mini_instance;
      if (instance && instance.props && instance.props.slot) {
        const slotName = instance.props.slot;
        if (!slotMap.has(slotName)) {
          slotMap.set(slotName, []);
        }
        slotMap.get(slotName)!.push(child);
        return;
      }
    }

    // Default slot (no slot attribute or not a component)
    if (!slotMap.has("")) {
      slotMap.set("", []);
    }
    slotMap.get("")!.push(child);
  };

  if (Array.isArray(children)) {
    children.forEach(processChild);
  } else {
    processChild(children);
  }

  return slotMap;
}
