/**
 * Fragment component - groups multiple children without adding extra DOM nodes
 * Same behavior as React.Fragment or <>...</>
 *
 * @example
 * ```tsx
 * <Fragment>
 *   <div>Child 1</div>
 *   <div>Child 2</div>
 * </Fragment>
 * ```
 *
 * @param props - Fragment props (only children is supported)
 * @returns DocumentFragment or Text node
 */
export const Fragment = (props: { children?: any } = {}): Node => {
  const { children } = props;

  // No children - return empty text node
  if (!children) {
    return document.createTextNode("");
  }

  // Single Node child - return directly
  if (children instanceof Node) {
    return children;
  }

  // Array of children - use DocumentFragment
  if (Array.isArray(children)) {
    const fragment = document.createDocumentFragment();

    children.forEach((child) => {
      if (child instanceof Node) {
        fragment.appendChild(child);
      } else if (child != null) {
        // Convert primitives to text nodes
        fragment.appendChild(document.createTextNode(String(child)));
      }
    });

    return fragment;
  }

  // Single primitive value - return as text node
  return document.createTextNode(String(children));
};
