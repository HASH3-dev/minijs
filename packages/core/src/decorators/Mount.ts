/**
 * Mount decorator - marks a method to be called when the component is mounted
 * The method is executed by Application.executeLifecycle()
 * Supports multiple @Mount methods on the same class
 */
export function Mount() {
  return function (target: any, key: string, desc: PropertyDescriptor) {
    const fn = desc.value;
    if (typeof fn !== "function")
      throw new Error("@Mount must decorate a method");

    // Store mount methods in an array to support multiple @Mount decorators
    if (!target.__mini_mount_methods) {
      target.__mini_mount_methods = [];
    }
    target.__mini_mount_methods.push(fn);

    return desc;
  };
}
