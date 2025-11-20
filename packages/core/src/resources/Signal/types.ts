import { Observable } from "rxjs";
import { Signal } from "./Signal";

export type UnwrapObservable<T> = T extends Observable<infer U> ? U : T;
export type UnwrapIterable<T> = T extends Iterable<infer U> ? U : T;

/**
 * Generates the paths strings for all properties and nested object properties, all in plain string format
 * @example
 * type T = { a: { b: { c: 1 } } }
 * type R = DeepPathType<T> // {'a': {b: {c: number}}, 'a.b': {c: number}, 'a.b.c': number}
 */
export type DeepPathType<T> = T extends object
  ? {
      [K in keyof T as K extends string ? K : never]: T[K];
    } & {
      [K in keyof T as K extends string
        ? T[K] extends (infer U)[]
          ? U extends object
            ? `${K}.${number}.${Extract<keyof DeepPathType<U>, string>}`
            : never
          : T[K] extends object
          ? `${K}.${Extract<keyof DeepPathType<T[K]>, string>}`
          : never
        : never]: K extends keyof T
        ? T[K] extends (infer U)[]
          ? U extends object
            ? DeepPathType<U>[Extract<keyof DeepPathType<U>, string> & string]
            : never
          : T[K] extends object
          ? DeepPathType<T[K]>[Extract<keyof DeepPathType<T[K]>, string> &
              string]
          : never
        : never;
    }
  : {};

/**
 * Gets the type of a property at a given path
 * @example
 * type T = { a: { b: { c: number } } }
 * type Result = DeepPropertyType<T, "a.b.c"> // number
 */
export type DeepPropertyType<
  T,
  P extends string
> = P extends keyof DeepPathType<T> ? DeepPathType<T>[P] : never;

type Friend = {
  name: string;
  age: number;
  address: {
    street: string;
    city: string;
  };
};
type User = {
  name: string;
  age: number;
  address: {
    street: string;
    city: string;
  };
  friends: Friend[];
};
type R = DeepPathType<User>; // {'a': {b: {c: number}}, 'a.b': {c: number}, 'a.b.c': number}
type J = DeepPropertyType<User, "address.street">;

export type DeepUnwrapObservable<T> = T extends Signal<infer U>
  ? DeepUnwrapObservable<U>
  : T extends object
  ? { [K in keyof T]: DeepUnwrapObservable<T[K]> }
  : T;
