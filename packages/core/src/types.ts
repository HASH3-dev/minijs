/**
 * Metadata key for storing child slot information
 */

import { Component } from "./base/Component";

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
