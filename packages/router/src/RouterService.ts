/**
 * RouterService - BY_COMPONENT scoped service
 * Provides component-specific route information and navigation methods
 */

import { Injectable, InjectionScope, signal } from "@mini/core";
import { router } from "./Router";
import { map } from "rxjs";
import type { Component } from "@mini/core";
import { getAscenssorRoutePath } from "./decorators/Route";

@Injectable({ scope: InjectionScope.BY_COMPONENT })
export class RouterService {
  /**
   * Constructor receives the component instance
   * This is automatically injected by the DI system for BY_COMPONENT scoped services
   */
  constructor(
    private component: Component,
    private _params: Record<string, string>
  ) {
    router.params = this._params;
  }

  /**
   * Get route params from component metadata
   * Extracts params from @Route decorator
   */
  get params(): Record<string, string> {
    // TODO: Extract from component's route metadata
    // For now, return empty object
    return this._params;
  }

  /**
   * Observable of route params
   */
  get params$() {
    return signal(router.route$.pipe(map((route) => route.params || {})));
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
    return signal(router.route$.pipe(map((route) => route.query)));
  }

  /**
   * Get current hash (without #)
   */
  get hash(): string {
    return router.currentHash;
  }

  /**
   * Observable of hash
   */
  get hash$() {
    return signal(router.route$.pipe(map((route) => route.hash)));
  }

  /**
   * Get full URL href
   */
  get href(): string {
    return window.location.href;
  }

  get href$() {
    return signal(router.route$.pipe(map(() => window.location.href)));
  }

  /**
   * Get protocol (http: or https:)
   */
  get protocol(): string {
    return window.location.protocol;
  }

  get protocol$() {
    return signal(router.route$.pipe(map(() => window.location.protocol)));
  }

  /**
   * Get host (hostname:port)
   */
  get host(): string {
    return window.location.host;
  }

  get host$() {
    return signal(router.route$.pipe(map(() => window.location.host)));
  }

  /**
   * Get pathname
   */
  get pathname(): string {
    return router.currentPath;
  }

  get pathname$() {
    return signal(router.route$.pipe(map((route) => route.path)));
  }

  /**
   * Get the specific segment path that render this component
   */
  getSegment(index: number): string | undefined {
    return getAscenssorRoutePath(this.component);
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
