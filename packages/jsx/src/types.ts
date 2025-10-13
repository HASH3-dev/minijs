export type ChildType = Node | string | number | boolean | null | undefined;

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
    interface Element extends Node {}
    interface ElementChildrenAttribute {
      children: {};
    }
    interface ElementClass {
      render(): any;
    }
    interface ElementAttributesProperty {
      props: {};
    }
    interface IntrinsicAttributes {
      children?: any;
    }
  }
}
