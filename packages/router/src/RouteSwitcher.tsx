/**
 * RouteSwitcher Component
 * Renders route components based on current path
 */

import {
  Component,
  ComponentClass,
  LifecyclePhase,
  Provider,
} from "@mini/core";
import {
  distinctUntilChanged,
  filter,
  map,
  of,
  switchMap,
  takeUntil,
} from "rxjs";
import {
  getAscenssorRoutePath,
  getRouteConfig,
  isRoute,
} from "./decorators/Route";
import { findBestMatch } from "./RouteMatch";
import { router } from "./Router";
import { RouterService } from "./RouterService";

/**
 * RouteSwitcher props
 */
export interface RouteSwitcherProps {
  /**
   * Route components (must have @Route decorator)
   */
  children: () => ComponentClass[];

  /**
   * Fallback component for 404 (no route matched)
   */
  fallback?: () =>
    | string
    | number
    | boolean
    | Node
    | ComponentClass
    | null
    | undefined;
}

/**
 * RouteSwitcher Component
 * Matches current route and renders appropriate component
 *
 * @example
 * <RouteSwitcher fallback={() => NotFoundPage}>
 *   {() => [
 *     HomePage,
 *     AboutPage,
 *     UserPage
 *   ]}
 * </RouteSwitcher>
 */
export class RouteSwitcher extends Component<RouteSwitcherProps> {
  private currentPath: string = "";
  private ascenssorRoutePath: string = "";

  constructor() {
    super();

    this.lifecycle$
      .pipe(
        takeUntil(this.$.unmount$),
        filter((e) => e === LifecyclePhase.BeforeMount)
      )
      .subscribe(() => {
        this.ascenssorRoutePath = getAscenssorRoutePath(this) ?? "";
      });

    // Initialize router if not already initialized
    if (!(router as any)["initialized"]) {
      router.initialize();
    }

    // Subscribe to route changes and trigger re-render
    const sub = router.route$
      .pipe(takeUntil(this.$.unmount$))
      .subscribe((route) => {
        this.currentPath = route.path.replace(/\/$/, "");
        // Force re-render by destroying and letting framework re-create
        // this.destroy();
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

    if (!this.children) {
      return routes;
    }

    // Iterate through children
    const children = this.children[0]();

    for (const child of children) {
      // Get the component class (could be instance or class)
      const ComponentClass = child;

      if (!ComponentClass) {
        continue;
      }

      // Check if it's a route component
      if (isRoute(ComponentClass)) {
        const config = getRouteConfig(ComponentClass);
        if (config) {
          let path = this.getComponentPath(ComponentClass);

          routes.push({
            component: child,
            path,
            exact: config.exact,
          });
        }
      }
    }

    return routes;
  }

  private getComponentPath(ComponentClass: Component): string {
    const config = getRouteConfig(ComponentClass);

    return [this.ascenssorRoutePath, config?.path]
      .join("/")
      .replace(/(\/\/*)/g, "/")
      .replace(/\/$/, "");
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

  render() {
    return router.route$.pipe(
      map((route) => route.path),
      distinctUntilChanged(),
      map(() => {
        const { component, params } = this.findMatchingRoute() ?? {};

        const path = [
          component?._instanceId ?? component?.name,
          JSON.stringify(params),
        ].join("-");

        return path;
      }),
      distinctUntilChanged(),
      switchMap((route) => {
        // if (!route) {
        //   return of(false);
        // }

        const match = this.findMatchingRoute();

        // No match - render fallback (404)
        if (!match) {
          if (this.props.fallback !== undefined) {
            return of(this.props.fallback());
          }

          // Default 404
          return of(
            <div style={{ padding: "20px", textAlign: "center" }}>
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
          return of(<div>Error: Invalid route component</div>);
        }

        // Create component instance with params
        // The component will receive RouterService via DI which has access to params
        return of(
          <Provider
            values={[
              {
                provide: RouterService,
                useValue: new RouterService(
                  match.component,
                  match.params ?? {}
                ),
              },
            ]}
          >
            <match.component />;
          </Provider>
        );
      })
    );
  }
}
