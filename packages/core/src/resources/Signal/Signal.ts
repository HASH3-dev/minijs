import { map, Observable, ReplaySubject, skip, take } from "rxjs";
import { iterable } from "../../utils/iterable";
import type { UnwrapIterable, UnwrapObservable } from "./types";

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

  isInitialized(): boolean {
    return this._initialized;
  }

  next(value: R): void {
    this._value = value;
    this._initialized = true;
    super.next(value);
  }

  get value(): R {
    return this.getValue() as R;
  }

  getValue(): R {
    return this._value as R;
  }

  set(value: R | ((prev: R) => R)) {
    if (typeof value === "function") {
      this.next((value as (prev: R) => R)(this._value as R));
    } else {
      this.next(value);
    }
  }

  map<U, J = UnwrapIterable<R>>(fn: (value: J) => U): Signal<U> {
    const s = new Signal<U>();

    this.pipe(map((e) => iterable(e).map(fn as any))).subscribe(s as any);

    return s;
  }

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

  filter<J = UnwrapIterable<R>>(fn: (value: J) => boolean): Signal<R> {
    const s = new Signal<R>();
    this.pipe(map((e) => iterable(e).filter(fn as any))).subscribe(s as any);

    return s;
  }

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

  then<T>(fn: (value: R) => T): Signal<T> {
    const s = new Signal<T>();

    this.pipe(skip(this.isInitialized() ? 1 : 0), take(1)).subscribe({
      next: (val) => s.next(fn(val) as UnwrapObservable<T>),
    });

    return s;
  }

  catch<U>(fn: (value: any) => U): Signal<U> {
    const s = new Signal<U>();

    this.pipe(take(1)).subscribe({
      error: (err) => s.next(fn(err) as UnwrapObservable<U>),
    });

    return s;
  }

  finally(fn: () => any) {
    this.pipe(take(1)).subscribe({ complete: fn });
  }
}
