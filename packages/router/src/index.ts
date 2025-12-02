/**
 * @mini/router - Sistema de roteamento para Mini Framework
 *
 * Exporta:
 * - Router (singleton global)
 * - RouterService (BY_COMPONENT scoped)
 * - @Route decorator
 * - RouteSwitcher component
 */

// Export types
export type {
  RouteMetadata,
  RouteMatch,
  NavigationOptions,
  RouteState,
} from "./types";

// Export route matching utilities
export { parsePattern, matchPath, findBestMatch } from "./RouteMatch";
export type { MatchResult } from "./RouteMatch";

// Export Router service and singleton instance
export { Router, router } from "./Router";

// Export RouterService (BY_COMPONENT scoped)
export { RouterService } from "./RouterService";

// Export Route decorator and helpers
export {
  Route,
  getRoutePath,
  getRouteConfig,
  isRoute,
} from "./decorators/Route";
export type {
  RouteConfig,
  RouteMetadataStored,
} from "./decorators/Route/types";

// Export RouteSwitcher component
export { RouteSwitcher } from "./RouteSwitcher";
export type { RouteSwitcherProps } from "./RouteSwitcher";

// Export Link component and types
export { Link } from "./components/Link";
export type { LinkProps } from "./components/Link";
