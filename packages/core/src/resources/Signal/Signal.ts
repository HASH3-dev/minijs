import { distinct, map, Observable, ReplaySubject, skip, take } from "rxjs";
import { iterable } from "../../utils/iterable";
import type {
  DeepPathType,
  DeepPropertyType,
  UnwrapIterable,
  UnwrapObservable,
} from "./types";
import { DeepRequired } from "../../types";

/**
 * A signal is a type of observable that emits a value and keeps state.
 * It can set a initial value or not.
 * It can be used to store a value that is updated over time.
 * @template T The type of the value emitted by the signal.
 * @template R The unwrapped type of the value emitted by the signal.
 */
export class Signal<
  T = undefined,
  R = UnwrapObservable<T>
> extends ReplaySubject<R> {
  private _value: R | undefined;
  private _initialized = false;

  constructor(value?: T) {
    super(1);

    if (value instanceof Observable) {
      value.subscribe(this);
      if (value instanceof Signal) {
        this._initialized = value.isInitialized();
      }
    } else if (value !== undefined) {
      this.next(value as R);
      this._initialized = true;
    }
  }

  /**
   * Check if the signal has been initialized with a value.
   * Will return true if next() has been called at least once.
   * @returns {boolean} whether the signal has been initialized
   */
  isInitialized(): boolean {
    return this._initialized;
  }

  /**
   * Emits a new value to the signal.
   * Sets the internal initialized flag to true.
   * Calls super.next() to emit the value to subscribers.
   * @param value The value to emit to the signal.
   */
  next(value: R): void {
    this._value = value;
    this._initialized = true;
    super.next(value);
  }

  /**
   * Get the current value of the signal.
   * Same as getValue(), but with proper typing.
   * @returns The current value of the signal.
   */
  get value(): R {
    return this.getValue() as R;
  }

  /**
   * Returns the current value of the signal.
   * If the signal is uninitialized, this will return undefined.
   * @returns The current value of the signal.
   */
  getValue(): R {
    return this._value as R;
  }

  /**
   * Get a new signal that follows the path specified by the internalProp.
   * The new signal will emit the value at the path specified by internalProp.
   * For example, if internalProp is "a.b.c", the new signal will emit the value at a.b.c.
   * If the path does not exist, the new signal will emit undefined.
   * The new signal will just emit the value when the internalProp changes.
   * @param internalProp The path to the value to get.
   * @returns A new signal that follows the path specified by internalProp.
   * @example
   * const signal = new Signal({ a: { b: { c: 1 } } });
   * const newSignal = signal.get("a.b.c");
   * newSignal.subscribe((value) => console.log(value)); // output: 1
   */
  get<K extends keyof DeepPathType<DeepRequired<R>>>(
    internalProp: K
  ): Signal<DeepPropertyType<DeepRequired<R>, K extends string ? K : string>> {
    const path = (internalProp as string).split(".");
    const s = new Signal<
      DeepPropertyType<DeepRequired<R>, K extends string ? K : string>
    >();

    this.pipe(
      map((val) => path.reduce((acc, key) => ((acc as any) ?? {})?.[key], val)),
      distinct((e) => JSON.stringify(e))
    ).subscribe(s as any);
    return s;
  }

  /**
   * Set the value of the signal.
   * If the value is a function, it will be called with the previous value as an argument.
   * The return value of the function will be emitted as the new value of the signal.
   * If the value is not a function, it will be emitted as the new value of the signal.
   * @param value The value to emit to the signal.
   * @example
   * signal.set((prev) => prev + 1);
   * // or
   * signal.set(2);
   */
  set(value: R | ((prev: R) => R)) {
    if (typeof value === "function") {
      this.next((value as (prev: R) => R)(this._value as R));
    } else {
      this.next(value);
    }
  }

  /**
   * Applies a given function to each value emitted by the signal.
   * The function will receive the unwrapped value of the signal as an argument.
   * The return value of the function will be emitted as the new value of the signal.
   * @template U The type of the value emitted by the new signal.
   * @template J The type of the value emitted by this signal.
   * @param fn The function to apply to each value emitted by the signal.
   * @returns A new signal that emits the result of applying the function to each value of this signal.
   * @example
   * const signal = new Signal(1);
   * const newSignal = signal.map((value) => value + 1);
   * newSignal.subscribe((value) => console.log(value)); // output: 2
   * // works with an Array as well
   * const signal = new Signal([1, 2, 3]);
   * const newSignal = signal.map((value) => value + 1);
   * newSignal.subscribe((value) => console.log(value)); // output: [2, 3, 4]
   * // or with any other iterable object as well, like a Set for example
   * const signal = new Signal(new Set([1, 2, 3, 3]));
   * const newSignal = signal.map((value) => value + 1);
   * newSignal.subscribe((value) => console.log(value)); // output: [2, 3, 4]
   */
  map<U, J = UnwrapIterable<R>>(fn: (value: J) => U): Signal<U> {
    const s = new Signal<U>();

    this.pipe(map((e) => iterable(e).map(fn as any))).subscribe(s as any);

    return s;
  }

  /**
   * Applies a given function to each value emitted by the signal,
   * reducing the iterable of values to a single value.
   * The function will receive the unwrapped value of the signal as an argument,
   * as well as the accumulator value.
   * The initial value of the accumulator will be the provided initialValue.
   * The return value of the function will be emitted as the new value of the signal.
   * @template U The type of the value emitted by the new signal.
   * @template J The type of the value emitted by this signal.
   * @param fn The function to apply to each value emitted by the signal.
   * @param initialValue The initial value of the accumulator.
   * @returns A new signal that emits the result of applying the function to each value of this signal.
   * @example
   * const signal = new Signal(1);
   * const newSignal = signal.reduce((acc, value) => acc + value, 0);
   * newSignal.subscribe((value) => console.log(value)); // output: 1
   * // works with an Array as well
   * const signal = new Signal([1, 2, 3]);
   * const newSignal = signal.reduce((acc, value) => acc + value, 0);
   * newSignal.subscribe((value) => console.log(value)); // output: 6
   * // or with any other iterable object as well, like a Set for example
   * const signal = new Signal(new Set([1, 2, 3, 3]));
   * const newSignal = signal.reduce((acc, value) => acc + value, 0);
   * newSignal.subscribe((value) => console.log(value)); // output: 6
   */
  reduce<U, J = UnwrapIterable<R>>(
    fn: (acc: U, value: J) => U,
    initialValue: U
  ): Signal<U> {
    const s = new Signal<U>();
    this.pipe(
      map((e) => iterable(e).reduce(fn as any, initialValue))
    ).subscribe(s as any);

    return s;
  }

  /**
   * Filters the values emitted by the signal according to the given function.
   * The function will receive the unwrapped value of the signal as an argument.
   * The return value of the function will be used to determine whether the value should be emitted or not.
   * The function will be called for each value emitted by the signal.
   * If the function returns true, the value will be emitted. If the function returns false, the value will be skipped.
   * @template J The type of the value emitted by this signal.
   * @param fn The function to apply to each value emitted by the signal.
   * @returns A new signal that emits only the values that pass the filter.
   * @example
   * const signal = new Signal(1);
   * const newSignal = signal.filter((value) => value % 2 === 0);
   * newSignal.subscribe((value) => console.log(value)); // output: undefined
   * // works with an Array as well
   * const signal = new Signal([1, 2, 3, 4]);
   * const newSignal = signal.filter((value) => value % 2 === 0);
   * newSignal.subscribe((value) => console.log(value)); // output: [2, 4]
   * // or with any other iterable object as well, like a Set for example
   * const signal = new Signal(new Set([1, 2, 3, 3]));
   * const newSignal = signal.filter((value) => value % 2 === 0);
   * newSignal.subscribe((value) => console.log(value)); // output: [2]
   */
  filter<J = UnwrapIterable<R>>(fn: (value: J) => boolean): Signal<R> {
    const s = new Signal<R>();
    this.pipe(map((e) => iterable(e).filter(fn as any))).subscribe(s as any);

    return s;
  }

  /**
   * If the signal emits a value that is undefined or an empty array, or if a checker function is provided and it returns true, emits the given value instead.
   * If the signal emits a value that is not undefined or an empty array, or if the checker function returns false, emits the original value.
   * @template K The type of the value to emit if the signal emits an undefined or empty array value.
   * @param value The value to emit if the signal emits an undefined or empty array value.
   * @param checker An optional function to check if the signal emits an undefined or empty array value.
   * @returns A new signal that emits the given value if the signal emits an undefined or empty array value, or the original value otherwise.
   * @example
   * const signal = new Signal<number[]>([]);
   * const newSignal = signal
   *  .map((value) => <span>this is the value: ${value}</span>)
   *  .orElse(<span>no value</span>);
   *
   * newSignal.subscribe((value) => console.log(value)); // output: <span>no value</span>
   */
  orElse<K>(value: K, checker?: (value: R) => boolean): Signal<R> | Signal<K> {
    const s = new Signal(value);

    this.pipe(
      map((e) => {
        return (
          checker
            ? checker(e)
            : e === undefined || (Array.isArray(e) && e.length === 0)
        )
          ? value
          : e;
      })
    ).subscribe(s as any);

    return s;
  }

  /**
   * Takes a function that returns a new observable and emits the value of that observable when the original signal emits a value.
   * The function is called with the value of the original signal as an argument.
   * @template T The type of the value emitted by the new signal.
   * @param fn The function to call with the value of the original signal as an argument.
   * @returns A new signal that emits the value of the new observable.
   * @example
   * const signal = new Signal(1);
   * signal.then((value) => console.log(value)); // output: 2
   * signal.next((value) => value * 2);
   * // This makes signal compatible with Promise, so you can use it like a Promise
   *
   * setTimeout(() => {
   *   signal.next((value) => value * 2);
   * }, 1000)
   * const value = await signal; // output: 2 after 1 second
   */
  then<T>(fn: (value: R) => T): Signal<T> {
    const s = new Signal<T>();

    this.pipe(take(1)).subscribe({
      next: (val) => s.next(fn(val) as UnwrapObservable<T>),
      error: (err) => s.error(err),
      complete: () => s.complete(),
    });

    return s;
  }

  /**
   * Catches errors emitted by the signal and emits the result of the provided function as a new value.
   * The function is called with the error as an argument.
   * @template U The type of the value emitted by the new signal.
   * @param fn The function to call with the error as an argument.
   * @returns A new signal that emits the value of the new observable.
   * @example
   * const signal = new Signal<number>(1);
   * signal
   *  .map((value) => {
   *    throw new Error("Error");
   *  })
   *  .catch((err) => {
   *    console.error(err);
   *    return of(2);
   *  })
   *  .subscribe((value) => console.log(value)); // output: 2
   */
  catch<U>(fn: (value: any) => U): Signal<U> {
    const s = new Signal<U>();

    this.pipe(take(1)).subscribe({
      next: (val) => s.next(val as UnwrapObservable<U>),
      error: (err) => s.next(fn(err) as UnwrapObservable<U>),
      complete: () => s.complete(),
    });

    return s;
  }

  /**
   * Subscribes to the completion of the signal and calls the provided function when completed.
   * The function is called after the signal has completed (either normally or with an error).
   * @param fn The function to call when the signal completes.
   * @returns A new signal that emits the value of the new observable.
   * @example
   * const signal = new Signal<number>(1);
   * signal
   *  .finally(() => console.log('Completed'))
   *  .subscribe((value) => console.log(value)); // output: Completed, 1
   */
  finally<R>(fn: () => any): Signal<R> {
    const s = new Signal<R>();
    this.pipe(take(1)).subscribe({
      next: (val) => s.next(val as UnwrapObservable<R>),
      error: (err) => s.error(err as UnwrapObservable<R>),
      complete: () => {
        s.complete();
        fn() as UnwrapObservable<R>;
      },
    });

    return s;
  }
}
