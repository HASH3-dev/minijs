/**
 * Types for Resolver decorator
 */

import { INJECTOR_TOKEN } from "../../di";
import { Observable } from "rxjs";

/**
 * Interface for resolvers that load data before component renders
 */
export interface Resolver<T = any> {
  /**
   * Resolve data for the component
   * @returns Data, Promise, or Observable of data
   */
  resolve(): T | Promise<T> | Observable<T>;

  /**
   * Optional method to determine if resolved data is empty
   * @param data The resolved data
   * @returns true if data should be considered empty
   */
  isEmpty?(data: T): boolean;

  /**
   * Injector reference (set by the decorator)
   */
  [INJECTOR_TOKEN]?: any;

  /**
   * Public injector accessor (set by the decorator)
   */
  injector?: any;
}

/**
 * Type for resolver class constructor
 */
export type ResolverClass<T = any> = new (...args: any[]) => Resolver<T>;

/**
 * Type for resolver (can be instance or class)
 */
export type ResolverType<T = any> = Resolver<T> | ResolverClass<T>;

/**
 * Resolved data with state information
 */
export interface ResolvedData<T = any> {
  /**
   * Resolved data
   */
  data?: T;

  /**
   * Error (available when state is ERROR)
   */
  error?: Error;
}
