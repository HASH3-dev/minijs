import { map, Observable, ReplaySubject } from "rxjs";

export class Signal<T = undefined> extends ReplaySubject<any> {
  private _value: T | undefined;

  constructor(value?: T) {
    super(1);

    if (value instanceof Observable) {
      value.subscribe(this);
    }

    if (value !== undefined) {
      this.next(value);
    }
  }

  next(value: T): void {
    this._value = value;
    super.next(value);
  }

  get value(): T {
    return this.getValue() as T;
  }

  getValue(): T {
    return this._value as T;
  }

  set(value: T | ((prev: T) => T)) {
    if (typeof value === "function") {
      this.next((value as (prev: T) => T)(this._value as T));
    } else {
      this.next(value);
    }
  }

  map<U, J = T extends Array<infer K> ? K : T>(
    fn: (value: J) => U
  ): Signal<U | U[]> {
    const s = new Signal<U | U[]>();

    this.pipe(
      map((e) => (Array.isArray(e) ? e.map(fn) : fn(e as unknown as J)))
    ).subscribe(s);

    return s;
  }

  reduce<U, J = T extends Array<infer K> ? K : T>(
    fn: (acc: U, value: J) => U,
    initialValue: U
  ): Signal<U> {
    const s = new Signal<U>();
    this.pipe(
      map((e) =>
        Array.isArray(e)
          ? e.reduce(fn, initialValue)
          : fn(initialValue, e as unknown as J)
      )
    ).subscribe(s);

    return s;
  }

  filter<J = T extends Array<infer K> ? K : T>(
    fn: (value: J) => boolean
  ): Signal<T> {
    const s = new Signal<T>();
    this.pipe(
      map((e) =>
        Array.isArray(e) ? e.filter(fn) : fn(e as unknown as J) ? e : undefined
      )
    ).subscribe(s);

    return s;
  }

  orElse<K>(value: K, checker?: (value: K) => boolean): Signal<T> | Signal<K> {
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
    ).subscribe(s);

    return s;
  }
}
