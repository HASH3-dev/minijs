import { MOUNT_METHODS } from "../constants";

/**
 * Decorator to mark a method as a mount lifecycle hook
 */
export function Mount() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    // Store mount methods on the prototype
    if (!target[MOUNT_METHODS]) {
      target[MOUNT_METHODS] = [];
    }
    target[MOUNT_METHODS].push(propertyKey);

    return descriptor;
  };
}
