/**
 * RouteSwitcher Component
 * Renders route components based on current path
 */

import { Component } from "@mini/core";
import { Mount } from "@mini/core";
import { router } from "./Router";
import { getRoutePath, getRouteConfig, isRoute } from "./decorators/Route";
import { findBestMatch } from "./RouteMatch";
import { takeUntil } from "rxjs";

/**
 * RouteSwitcher props
 */
export interface RouteSwitcherProps {
  /**
   * Route components (must have @Route decorator)
   */
  children?: any[];

  /**
   * Fallback component for 404 (no route matched)
   */
  fallback?: any;
}

/**
 * RouteSwitcher Component
 * Matches current route and renders appropriate component
 *
 * @example
 * <RouteSwitcher fallback={<NotFoundPage />}>
 *   <HomePage />
 *   <AboutPage />
 *   <UserPage />
 * </RouteSwitcher>
 */
export class RouteSwitcher extends Component<RouteSwitcherProps> {
  private currentPath: string = "";

  @Mount()
  onMount() {
    // Initialize router if not already initialized
    if (!(router as any)["initialized"]) {
      router.initialize();
    }

    // Subscribe to route changes and trigger re-render
    const sub = router.route$
      .pipe(takeUntil(this.$.unmount$))
      .subscribe((route) => {
        this.currentPath = route.path;
        // Force re-render by destroying and letting framework re-create
        this.destroy();
      });
  }

  /**
   * Extract route information from children
   */
  private extractRoutes(): Array<{
    component: any;
    path: string;
    exact?: boolean;
  }> {
    const routes: Array<{
      component: any;
      path: string;
      exact?: boolean;
    }> = [];

    if (!this.props.children) {
      return routes;
    }

    // Iterate through children
    const children = Array.isArray(this.props.children)
      ? this.props.children
      : [this.props.children];

    for (const child of children) {
      // Get the component class (could be instance or class)
      const ComponentClass =
        typeof child === "function" ? child : child?.constructor;

      if (!ComponentClass) {
        continue;
      }

      // Check if it's a route component
      if (isRoute(ComponentClass)) {
        const config = getRouteConfig(ComponentClass);
        if (config) {
          routes.push({
            component: child,
            path: config.path,
            exact: config.exact,
          });
        }
      }
    }

    return routes;
  }

  /**
   * Find matching route for current path
   */
  private findMatchingRoute() {
    const routes = this.extractRoutes();

    if (routes.length === 0) {
      return null;
    }

    // Get all route patterns
    const patterns = routes.map((r) => r.path);

    // Find best match
    const bestMatch = findBestMatch(this.currentPath, patterns);

    if (!bestMatch) {
      return null;
    }

    // Find the route that matched
    const matchedRoute = routes.find((r) => r.path === bestMatch.pattern);

    if (!matchedRoute) {
      return null;
    }

    // Check exact match requirement
    if (matchedRoute.exact && bestMatch.pattern !== this.currentPath) {
      return null;
    }

    return {
      component: matchedRoute.component,
      params: bestMatch.result.params,
    };
  }

  render(): Component | Node {
    const match = this.findMatchingRoute();

    // No match - render fallback (404)
    if (!match) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default 404
      return (
        <div style="padding: 20px; text-align: center;">
          <h1>404 - Not Found</h1>
          <p>The page you are looking for does not exist.</p>
        </div>
      );
    }

    // Render matched component
    const ComponentClass =
      typeof match.component === "function"
        ? match.component
        : match.component?.constructor;

    if (!ComponentClass) {
      return <div>Error: Invalid route component</div>;
    }

    // Create component instance with params
    // The component will receive RouterService via DI which has access to params
    return <ComponentClass />;
  }
}
