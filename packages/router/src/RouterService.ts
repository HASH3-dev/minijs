/**
 * RouterService - BY_COMPONENT scoped service
 * Provides component-specific route information and navigation methods
 */

import { Injectable, InjectionScope } from "@mini/core";
import { router } from "./Router";
import { map } from "rxjs";
import type { Component } from "@mini/core";

@Injectable({ scope: InjectionScope.BY_COMPONENT })
export class RouterService {
  private component: Component;

  /**
   * Constructor receives the component instance
   * This is automatically injected by the DI system for BY_COMPONENT scoped services
   */
  constructor(component: Component) {
    this.component = component;
  }

  /**
   * Get route params from component metadata
   * Extracts params from @Route decorator
   */
  get params(): Record<string, string> {
    // TODO: Extract from component's route metadata
    // For now, return empty object
    return {};
  }

  /**
   * Observable of route params
   */
  get params$() {
    return router.route$.pipe(map((route) => route.params || {}));
  }

  /**
   * Get current query params
   */
  get query(): Record<string, string> {
    return router.currentQuery;
  }

  /**
   * Observable of query params
   */
  get query$() {
    return router.route$.pipe(map((route) => route.query));
  }

  /**
   * Get current hash (without #)
   */
  get hash(): string {
    return router.currentHash;
  }

  /**
   * Get full URL href
   */
  get href(): string {
    return window.location.href;
  }

  /**
   * Get protocol (http: or https:)
   */
  get protocol(): string {
    return window.location.protocol;
  }

  /**
   * Get host (hostname:port)
   */
  get host(): string {
    return window.location.host;
  }

  /**
   * Get pathname
   */
  get pathname(): string {
    return router.currentPath;
  }

  /**
   * Get a specific segment from the path
   * @param index Segment index (0-based)
   * @example
   * // For path "/user/123/profile"
   * getSegment(0) // "user"
   * getSegment(1) // "123"
   * getSegment(2) // "profile"
   */
  getSegment(index: number): string | undefined {
    const segments = router.currentPath.split("/").filter((s) => s.length > 0);
    return segments[index];
  }

  /**
   * Navigate to a new path (pushState)
   * @param path Path to navigate to
   */
  push(path: string): void {
    router.navigate(path);
  }

  /**
   * Navigate to a new path (replaceState)
   * @param path Path to navigate to
   */
  replace(path: string): void {
    router.navigate(path, { replace: true });
  }

  /**
   * Go back in history
   */
  back(): void {
    router.back();
  }

  /**
   * Go forward in history
   */
  forward(): void {
    router.forward();
  }
}
