/**
 * Types for LoadData decorator
 */

import { Observable } from "rxjs";

/**
 * Loading state for data loading methods
 */
export enum LoadDataState {
  IDLE = "idle",
  LOADING = "loading",
  SUCCESS = "success",
  ERROR = "error",
  EMPTY = "empty",
}

/**
 * Configuration for @LoadData decorator
 */
export interface LoadDataConfig {
  /**
   * Whether to automatically call the method on mount
   * @default true
   */
  autoLoad?: boolean;

  /**
   * Cache key for the loaded data
   * If provided, data will be cached
   */
  cacheKey?: string;
}

/**
 * Metadata stored for each @LoadData method
 */
export interface LoadDataMethodMetadata {
  /**
   * Method name
   */
  methodName: string;

  /**
   * Configuration
   */
  config: LoadDataConfig;

  /**
   * Current state
   */
  state: LoadDataState;

  /**
   * Loaded data
   */
  data?: any;

  /**
   * Error if state is ERROR
   */
  error?: Error;
}
