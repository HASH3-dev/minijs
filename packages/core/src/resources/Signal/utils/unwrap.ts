import { Signal } from "../Signal";
import { DeepUnwrapObservable } from "../types";
import { deepPromiseAll } from "./deepPromiseAll";
import { signal } from "./signal";

/**
 * Get the current value of a Signal as a plain value or extract deeply nested signals values
 * @example
 * const value = unwrap(signal(1)); // 1
 * const value = unwrap(signal(signal(1))); // 1
 * const value = unwrap({value1: signal(1), value2: signal(2)}); // {value1: 1, value2: 2}
 */
export const unwrap = <T>(val: T): Signal<Promise<DeepUnwrapObservable<T>>> => {
  function _unwrap<T>(val: T): DeepUnwrapObservable<T> {
    if (val instanceof Signal && val.isInitialized()) {
      return val.value as DeepUnwrapObservable<T>;
    }

    if (Array.isArray(val)) {
      return val.map(_unwrap) as DeepUnwrapObservable<T>;
    }

    if (typeof val === "object" && val !== null && val.constructor === Object) {
      return Object.fromEntries(
        Object.entries(val as any).map(([key, value]) => [key, _unwrap(value)])
      ) as DeepUnwrapObservable<T>;
    }

    return val as DeepUnwrapObservable<T>;
  }

  return signal(deepPromiseAll(_unwrap(val)));
};

// Tests
// const a = unwrap(signal(1));
// const b = unwrap(signal(signal(1)));
// const c = unwrap(
//   signal({
//     value1: signal(1),
//     value2: signal(2),
//     value3: [{ value4: signal(4) }],
//   })
// );

// console.log(a, b, c);
