import { Observable } from "rxjs";

/**
 * ILifecycleManager - Interface for component lifecycle management
 * Enables LSP - DOM and SSR can have different implementations
 *
 * @example
 * ```typescript
 * // DOM: real observables
 * class DOMLifecycleManager implements ILifecycleManager {
 *   getMounted$() { return this.mounted$.asObservable(); }
 * }
 *
 * // SSR: no-op observables
 * class SSRLifecycleManager implements ILifecycleManager {
 *   getMounted$() { return EMPTY; }
 * }
 * ```
 */
export interface ILifecycleManager {
  /**
   * Get mounted observable
   * Emits when component is mounted to DOM (DOM only)
   */
  getMounted$(): Observable<void>;

  /**
   * Get unmount observable
   * Emits when component is about to unmount (DOM only)
   */
  getUnmount$(): Observable<void>;

  /**
   * Trigger mounted event
   * Called by framework when component is mounted
   */
  triggerMounted(): void;

  /**
   * Trigger unmount event
   * Called by framework before component is destroyed
   */
  triggerUnmount(): void;

  /**
   * Complete and cleanup all observables
   */
  complete(): void;
}
