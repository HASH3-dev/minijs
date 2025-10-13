import { BehaviorSubject, Observable, isObservable } from "rxjs";

/**
 * Check if a value is an Observable
 */
export function toObservable<T>(v: T | Observable<T>): Observable<T> | null {
  if (isObservable(v)) return v as Observable<T>;
  return null;
}

/**
 * Create a new BehaviorSubject (signal)
 */
export const signal = <T>(val: T): BehaviorSubject<T> =>
  new BehaviorSubject(val);

/**
 * Get the current value from a BehaviorSubject
 */
export const unwrap = <T>(val: BehaviorSubject<T>): T => val.value;
