import { MOUNT_METHODS } from "./constants";

/**
 * Decorator to mark a method as a mount lifecycle hook
 */
export function Mount() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    // Store mount methods on the prototype
    if (!target[MOUNT_METHODS]) {
      target[MOUNT_METHODS] = [];
    }
    target[MOUNT_METHODS].push(originalMethod);

    return descriptor;
  };
}

export { MOUNT_METHODS } from "./constants";
export type { UnmountLike } from "./types";
