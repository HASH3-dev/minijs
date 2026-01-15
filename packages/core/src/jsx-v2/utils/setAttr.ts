/**
 * Convert camelCase to kebab-case
 */
function camelToKebab(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

/**
 * Set attribute on an HTML or SVG element
 * Handles special cases for SVG attributes
 *
 * @param el - HTML or SVG element
 * @param key - Attribute key
 * @param value - Attribute value
 */
export function setAttr(
  el: HTMLElement | SVGElement,
  key: string,
  value: any
): void {
  // For SVG elements, prefer setAttribute with kebab-case conversion
  if (el instanceof SVGElement) {
    if (key === "className") {
      el.setAttribute("class", String(value));
    } else if (key === "xlinkHref" || key === "xlink:href") {
      el.setAttributeNS("http://www.w3.org/1999/xlink", "href", String(value));
    } else if (key === "xmlnsXlink") {
      el.setAttributeNS(
        "http://www.w3.org/2000/xmlns/",
        "xmlns:xlink",
        String(value)
      );
    } else {
      // Convert camelCase to kebab-case for SVG (strokeWidth -> stroke-width)
      const attrName = camelToKebab(key);
      el.setAttribute(attrName, String(value));
    }
    return;
  }

  // For HTML elements, try property first
  if (key in el) {
    try {
      (el as any)[key] = value;
    } catch {}
  } else {
    el.setAttribute(key, String(value));
  }
}
