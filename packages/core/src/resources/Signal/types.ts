import { Observable } from "rxjs";

export type UnwrapObservable<T> = T extends Observable<infer U> ? U : T;
export type UnwrapIterable<T> = T extends Iterable<infer U> ? U : T;
export type DeepPath<T, P extends string> = P extends `${infer K}.${infer R}`
  ? K extends keyof T
    ? T[K] extends object
      ? DeepPath<T[K], R>
      : never
    : never
  : P extends keyof T
  ? T[P]
  : never;
