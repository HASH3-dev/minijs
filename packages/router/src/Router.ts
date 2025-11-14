/**
 * Router - Global singleton service for route management
 * Handles browser history, navigation, and route state
 */

import { BehaviorSubject } from "rxjs";
import { Injectable, signal } from "@mini/core";
import type { RouteState, NavigationOptions } from "./types";
import { matchPath } from "./RouteMatch";

@Injectable()
export class Router {
  private currentRoute$ = signal<RouteState>(this.getCurrentState());
  private initialized = false;
  private _params: Record<string, string> = {};

  /**
   * Observable of current route state
   */
  get route$() {
    return this.currentRoute$.asObservable();
  }

  /**
   * Get current path
   */
  get currentPath(): string {
    return this.currentRoute$.value.path;
  }

  /**
   * Get current query params
   */
  get currentQuery(): Record<string, string> {
    return this.currentRoute$.value.query;
  }

  /**
   * Get current hash
   */
  get currentHash(): string {
    return this.currentRoute$.value.hash;
  }

  set params(params: Record<string, string>) {
    console.log("[Router] params changed", params);
    if (JSON.stringify(this._params) === JSON.stringify(params)) {
      return;
    }

    this._params = params || {};
    this.currentRoute$.next({
      ...this.currentRoute$.value,
      params,
    });
  }

  get params(): Record<string, string> {
    return this._params || {};
  }

  /**
   * Initialize router with History API listener
   * Should be called once at app startup
   */
  initialize(): void {
    if (this.initialized) {
      return;
    }

    // Listen to popstate (back/forward buttons)
    window.addEventListener("popstate", () => {
      this.syncUrl();
    });

    // Listen to pushState/replaceState
    // Intercept these methods to detect programmatic navigation
    const originalPushState = history.pushState.bind(history);
    const originalReplaceState = history.replaceState.bind(history);

    history.pushState = (
      data: any,
      unused: string,
      url?: string | URL | null
    ) => {
      originalPushState(data, unused, url);
      this.syncUrl();
    };

    history.replaceState = (
      data: any,
      unused: string,
      url?: string | URL | null
    ) => {
      originalReplaceState(data, unused, url);
      this.syncUrl();
    };

    const url = new URL(window.location.href);
    if (/\/+$/.test(url.pathname)) {
      url.pathname = url.pathname.replace(/\/*?$/, "");
      history.replaceState(null, "", url.toString());
    }

    this.initialized = true;
    this.syncUrl(); // Sync initial state
  }

  /**
   * Navigate to a new path
   * @param path Path to navigate to
   * @param options Navigation options
   */
  navigate(path: string, options: NavigationOptions = {}): void {
    const url = this.buildUrl(path);

    if (options.replace) {
      history.replaceState(options.state || null, "", url);
    } else {
      history.pushState(options.state || null, "", url);
    }

    this.syncUrl();
  }

  /**
   * Navigate back in history
   */
  back(): void {
    history.back();
  }

  /**
   * Navigate forward in history
   */
  forward(): void {
    history.forward();
  }

  /**
   * Replace current URL without navigation
   * @param path New path
   */
  replace(path: string): void {
    this.navigate(path, { replace: true });
  }

  /**
   * Parse query string into object
   * @param queryString Query string (with or without leading ?)
   */
  parseQuery(queryString: string): Record<string, string> {
    const query: Record<string, string> = {};

    // Remove leading ?
    const cleaned = queryString.startsWith("?")
      ? queryString.slice(1)
      : queryString;

    if (!cleaned) {
      return query;
    }

    // Parse each param
    cleaned.split("&").forEach((param) => {
      const [key, value] = param.split("=");
      if (key) {
        query[decodeURIComponent(key)] = value ? decodeURIComponent(value) : "";
      }
    });

    return query;
  }

  /**
   * Match current path against a pattern
   * @param pattern Route pattern
   */
  matchPath(pattern: string): {
    matched: boolean;
    params: Record<string, string>;
  } {
    const result = matchPath(this.currentPath, pattern);
    return {
      matched: result.matched,
      params: result.params,
    };
  }

  /**
   * Sync internal state with current URL
   * Called when URL changes
   */
  private syncUrl(): void {
    const newState = this.getCurrentState();
    this.currentRoute$.next(newState);
  }

  /**
   * Get current route state from window.location
   */
  private getCurrentState(): RouteState {
    return {
      path: window.location.pathname,
      query: this.parseQuery(window.location.search),
      hash: window.location.hash.slice(1), // Remove leading #
      params: this.params,
    };
  }

  /**
   * Build full URL from path
   * @param path Path (may include query and hash)
   */
  private buildUrl(path: string): string {
    // If it's a full URL, return as-is
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }

    // Ensure leading slash
    return path.startsWith("/") ? path : `/${path}`;
  }
}

/**
 * Global router instance
 * Export singleton for convenience
 */
export const router = new Router();
