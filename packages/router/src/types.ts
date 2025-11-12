/**
 * Types for the Router system
 */

/**
 * Route configuration metadata
 */
export interface RouteMetadata {
  path: string;
  params?: Record<string, string>;
}

/**
 * Matched route information
 */
export interface RouteMatch {
  path: string;
  params: Record<string, string>;
  query: Record<string, string>;
  hash: string;
  score: number;
}

/**
 * Navigation options
 */
export interface NavigationOptions {
  replace?: boolean;
  state?: any;
}

/**
 * Current route state
 */
export interface RouteState {
  path: string;
  query: Record<string, string>;
  hash: string;
  params?: Record<string, string>;
}
