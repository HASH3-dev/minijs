import { BehaviorSubject, map, Observable } from "rxjs";

export class Signal<T> extends BehaviorSubject<T> {
  constructor(value: T) {
    super(value);
  }

  set(value: T | ((prev: T) => T)) {
    if (typeof value === "function") {
      this.next((value as (prev: T) => T)(this.value));
    } else {
      this.next(value);
    }
  }

  map<U, J = T extends Array<infer K> ? K : T>(
    fn: (value: J) => U
  ): Observable<U | U[]> {
    return this.pipe(
      map((e) => (Array.isArray(e) ? e.map(fn) : fn(e as unknown as J)))
    );
  }

  reduce<U, J = T extends Array<infer K> ? K : T>(
    fn: (acc: U, value: J) => U,
    initialValue: U
  ): Observable<U> {
    return this.pipe(
      map((e) =>
        Array.isArray(e)
          ? e.reduce(fn, initialValue)
          : fn(initialValue, e as unknown as J)
      )
    );
  }

  filter<J = T extends Array<infer K> ? K : T>(
    fn: (value: J) => boolean
  ): Observable<T[]> {
    return this.pipe(
      map((e) =>
        Array.isArray(e) ? e.filter(fn) : fn(e as unknown as J) ? [e] : []
      )
    );
  }
}
