/**
 * @Route decorator
 * Marks a component as a route and stores its path pattern as metadata
 */

import "reflect-metadata";
import { ROUTE_PATH_METADATA, ROUTE_CONFIG_METADATA } from "./constants";
import type { RouteConfig, RouteMetadataStored } from "./types";

/**
 * Decorator to mark a component as a route
 * @param pathOrConfig Route path pattern or full configuration
 * @example
 * @Route("/users/:id")
 * export class UserPage extends Component {}
 *
 * @Route({ path: "/about", exact: true, title: "About Us" })
 * export class AboutPage extends Component {}
 */
export function Route(pathOrConfig: string | RouteConfig): ClassDecorator {
  return function <T extends Function>(target: T): T {
    // Parse config
    const config: RouteMetadataStored =
      typeof pathOrConfig === "string"
        ? { path: pathOrConfig }
        : {
            path: pathOrConfig.path,
            exact: pathOrConfig.exact,
            title: pathOrConfig.title,
          };

    // Store path metadata (for quick access)
    Reflect.defineMetadata(ROUTE_PATH_METADATA, config.path, target);

    // Store full config metadata
    Reflect.defineMetadata(ROUTE_CONFIG_METADATA, config, target);

    return target;
  };
}

/**
 * Helper to get route path from a component class
 * @param target Component class
 * @returns Route path or undefined if not a route
 */
export function getRoutePath(target: Function): string | undefined {
  return Reflect.getMetadata(ROUTE_PATH_METADATA, target);
}

/**
 * Helper to get full route config from a component class
 * @param target Component class
 * @returns Route config or undefined if not a route
 */
export function getRouteConfig(
  target: Function
): RouteMetadataStored | undefined {
  return Reflect.getMetadata(ROUTE_CONFIG_METADATA, target);
}

/**
 * Helper to check if a component is a route
 * @param target Component class
 * @returns True if component has @Route decorator
 */
export function isRoute(target: Function): boolean {
  return Reflect.hasMetadata(ROUTE_PATH_METADATA, target);
}
