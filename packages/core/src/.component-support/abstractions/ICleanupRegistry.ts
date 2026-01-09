/**
 * ICleanupRegistry - Interface for managing cleanup functions
 * Enables LSP - DOM executes cleanups, SSR can skip
 *
 * @example
 * ```typescript
 * // DOM: executes all cleanup functions
 * class DOMCleanupRegistry implements ICleanupRegistry {
 *   execute() { this.cleanups.forEach(fn => fn()); }
 * }
 *
 * // SSR: no-op (nothing to cleanup)
 * class SSRCleanupRegistry implements ICleanupRegistry {
 *   execute() { /* noop *\/ }
 * }
 * ´´´
 */
export interface ICleanupRegistry {
  /**
   * Register a cleanup function
   * Will be called when component is destroyed
   */
  register(fn: () => void): void;

  /**
   * Execute all registered cleanup functions
   * Called during component destruction
   */
  execute(): void;

  /**
   * Clear all cleanup functions without executing
   */
  clear(): void;

  /**
   * Get count of registered cleanups
   */
  getCount(): number;
}
