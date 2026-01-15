import { AbstractStorage } from "../adapters/AbstractStorage";
import { PERSISTENT_STATE_ORIGINAL_SIGNAL } from "../constants";

export function PersistentSate(
  storage: AbstractStorage | { new (): AbstractStorage }
): PropertyDecorator {
  return function (target: any, propertyKey: string | symbol) {
    if (typeof storage === "function") {
      storage = new storage();
    }

    Object.defineProperty(target, propertyKey, {
      get(this: any) {
        const storageInstanceKey = Symbol.for(
          `__mini_persistent_state_${String(propertyKey)}`
        );

        if (!this[storageInstanceKey]) {
          (storage as AbstractStorage).link(propertyKey, this);
          (storage as AbstractStorage).sync();
          this[storageInstanceKey] = true;
        }

        return (storage as AbstractStorage)?.signal;
      },
      set(this: any, value: any) {
        (this as any)[PERSISTENT_STATE_ORIGINAL_SIGNAL] = value;
      },
      enumerable: true,
      configurable: true,
    });
  };
}
