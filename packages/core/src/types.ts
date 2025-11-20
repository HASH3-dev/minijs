/**
 * Metadata key for storing child slot information
 */

import { Signal } from "./resources/Signal";
import { Component } from "./base/Component";
import { Observable } from "rxjs";

/**
 * Enum for component render states
 * Used by Resolvers, LoadData, and other async operations
 */
export enum RenderState {
  IDLE = "idle",
  LOADING = "loading",
  SUCCESS = "success",
  ERROR = "error",
  EMPTY = "empty",
}

export type ChildType =
  | Node
  | string
  | number
  | boolean
  | null
  | undefined
  | Component;

export type ElementType = ChildType;

export type OmitByPrefix<T, Prefix extends string> = {
  [K in keyof T as K extends `${Prefix}${infer Rest}` ? never : K]: T[K];
};

export type ReplaceEventHandlers<T, Prefix extends string> = {
  [K in keyof T as K extends `${Prefix}${infer Rest}`
    ? `${Prefix}${Capitalize<Rest>}`
    : never]: T[K];
};

export type IfEquals<X, Y, A, B> = (<T>() => T extends X ? 1 : 2) extends <
  T
>() => T extends Y ? 1 : 2
  ? A
  : B;

export type WritableKeys<T> = {
  [P in keyof T]: IfEquals<
    { [Q in P]: T[P] },
    { -readonly [Q in P]: T[P] },
    P,
    never
  >;
}[keyof T];

export type ReadonlyKeys<T> = Exclude<keyof T, WritableKeys<T>>;

export type ExcludeFunctions<T> = {
  [K in keyof T as K extends string
    ? T[K] extends (...args: any[]) => any
      ? never
      : K
    : K]: T[K];
};

export type OnlyFunctions<T> = Exclude<keyof T, keyof ExcludeFunctions<T>>;

export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

export type SignalProperties<T> = {
  [P in keyof T]:
    | T[P]
    | Signal<NonNullable<T[P]>>
    | Observable<NonNullable<T[P]>>;
};

export type MiniElement<T extends Element> = SignalProperties<
  DeepPartial<
    Omit<
      OmitByPrefix<T, "on">,
      | "children"
      | "slot"
      | "class"
      | "style"
      | ReadonlyKeys<T>
      | OnlyFunctions<T>
    >
  > & {
    children?: any;
    slot?: string;
    className?: string;
  } & Partial<ReplaceEventHandlers<T, "on">> &
    Record<string, any>
> & {
  style?:
    | Signal<Partial<CSSStyleDeclaration>>
    | Observable<Partial<CSSStyleDeclaration>>
    | SignalProperties<Partial<CSSStyleDeclaration>>;
};
