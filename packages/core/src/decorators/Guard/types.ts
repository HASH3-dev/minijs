import { INJECTOR_TOKEN } from "../../di";
import { Observable } from "rxjs";

/**
 * Interface for guards that control component rendering
 */
export interface Guard {
  /**
   * Check if the component can be activated/rendered
   * @returns true if component can be rendered, false otherwise
   */
  canActivate(): boolean | Promise<boolean> | Observable<boolean>;

  /**
   * Optional fallback content to render when guard blocks access
   * @returns Content to render instead of the component
   */
  fallback?(): any;

  /**
   * Injector reference (set by the decorator)
   */
  [INJECTOR_TOKEN]?: any;

  /**
   * Public injector accessor (set by the decorator)
   */
  injector?: any;
}

/**
 * Type for guard class constructor
 */
export type GuardClass = new (...args: any[]) => Guard;

/**
 * Type for guard (can be instance or class)
 */
export type GuardType = Guard | GuardClass;
