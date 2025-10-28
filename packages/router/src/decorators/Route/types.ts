/**
 * Types for Route decorator
 */

/**
 * Route configuration options
 */
export interface RouteConfig {
  /**
   * Route path pattern (e.g., "/user/:id")
   */
  path: string;

  /**
   * Optional exact match requirement
   * If true, path must match exactly (no nested routes)
   */
  exact?: boolean;

  /**
   * Optional title for the route (for SEO, navigation, etc)
   */
  title?: string;
}

/**
 * Stored route metadata on component
 */
export interface RouteMetadataStored {
  path: string;
  exact?: boolean;
  title?: string;
}
