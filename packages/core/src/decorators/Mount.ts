/**
 * Mount decorator - runs a method when the component is mounted
 */
export function Mount() {
  return function (target: any, key: string, desc: PropertyDescriptor) {
    const fn = desc.value;
    if (typeof fn !== "function")
      throw new Error("@Mount must decorate a method");
    const originalRender = target.render;
    target.render = function (...args: any[]) {
      const already = this.__mini_mounted;
      const node = originalRender.apply(this, args);
      if (!already) {
        this.__mini_mounted = true;
        const cleanup = fn.call(this);
        if (cleanup && typeof cleanup === "function") {
          this.$.unmount$.subscribe({ complete: () => cleanup() });
        }
        this.$.mounted$.next();
      }
      return node;
    };
  };
}
