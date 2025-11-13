import { BehaviorSubject, of, Subject, switchMap } from "rxjs";
import { AbstractStorage } from "../adapters/AbstractStorage";
import { PERSISTENT_STATE_ORIGINAL_SIGNAL } from "../constants";

export function PersistentSate(
  storage: AbstractStorage | { new (): AbstractStorage }
): PropertyDecorator {
  return function (target: any, propertyKey: string | symbol) {
    let instantiate = false;

    if (typeof storage === "function") {
      storage = new storage();
    }

    Object.defineProperty(target, propertyKey, {
      get(this: any) {
        if (!instantiate) {
          (storage as AbstractStorage).link(propertyKey, this);
          (storage as AbstractStorage).sync();
          instantiate = true;
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
