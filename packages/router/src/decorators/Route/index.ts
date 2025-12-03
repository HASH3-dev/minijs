/**
 * @Route decorator
 * Marks a component as a route and stores its path pattern as metadata
 */

import "reflect-metadata";
import {
  ROUTE_PATH_METADATA,
  ROUTE_CONFIG_METADATA,
  ROUTE_SEGMENT_CACHE,
} from "./constants";
import type { RouteConfig, RouteMetadataStored } from "./types";
import { Component, ComponentClass, PARENT_COMPONENT } from "@mini/core";

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
    const path = ((pathOrConfig as RouteConfig)?.path ?? pathOrConfig)
      .replace(/(\/\/*)/g, "/")
      .replace(/\/$/, "");

    // Parse config
    const config: RouteMetadataStored =
      typeof pathOrConfig === "string"
        ? { path }
        : {
            path,
            exact: pathOrConfig.exact,
            title: pathOrConfig.title,
          };

    // Store path metadata (for quick access)
    Reflect.defineMetadata(ROUTE_PATH_METADATA, config.path, target.prototype);

    // Store full config metadata
    Reflect.defineMetadata(ROUTE_CONFIG_METADATA, config, target.prototype);

    return target;
  };
}

/**
 * Helper to get route path from a component class
 * @param target Component class
 * @returns Route path or undefined if not a route
 */
export function getRoutePath(
  target: Component | ComponentClass
): string | undefined {
  return Reflect.getMetadata(ROUTE_PATH_METADATA, normalizeTarget(target));
}

export function getAscenssorRoutePath(
  target: Component | ComponentClass
): string | undefined {
  target = normalizeTarget(target);

  if ((target as any)[ROUTE_SEGMENT_CACHE]) {
    return (target as any)[ROUTE_SEGMENT_CACHE];
  }

  let parent = (target as any)[PARENT_COMPONENT];
  let fullPath = "/";
  while (parent) {
    if (!isRoute(parent)) {
      parent = (parent as any)[PARENT_COMPONENT];
      continue;
    }

    fullPath = getRoutePath(parent) + fullPath;
    parent = (parent as any)[PARENT_COMPONENT];
  }

  // TODO: precisa funcionar com BASE_URL que n termina com /
  fullPath = (import.meta.env.BASE_URL + fullPath).replace(/(\/\/*)/g, "/");

  (target as any)[ROUTE_SEGMENT_CACHE] = fullPath;
  return fullPath;
}

/**
 * Helper to get full route config from a component class
 * @param target Component class
 * @returns Route config or undefined if not a route
 */
export function getRouteConfig(
  target: Component | ComponentClass
): RouteMetadataStored | undefined {
  target = normalizeTarget(target);
  return Reflect.getMetadata(ROUTE_CONFIG_METADATA, target);
}

/**
 * Helper to check if a component is a route
 * @param target Component class
 * @returns True if component has @Route decorator
 */
export function isRoute(target: Component | ComponentClass): boolean {
  return Reflect.hasMetadata(ROUTE_PATH_METADATA, normalizeTarget(target));
}

function normalizeTarget(target: any) {
  if (typeof target === "function") {
    return target.prototype;
  }
  return target;
}
