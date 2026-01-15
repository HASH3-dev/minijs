/**
 * IInjectorFacade - Interface for dependency injection management
 * Enables LSP - same implementation for DOM and SSR
 *
 * @example
 * ```typescript
 * class DOMInjectorFacade implements IInjectorFacade {
 *   getOrCreate() {
 *     if (!this.injector) {
 *       this.injector = new Injector();
 *     }
 *     return this.injector;
 *   }
 * }
 * ```
 */
export interface IInjectorFacade {
  /**
   * Get or create injector instance
   * Lazily creates injector if not exists
   */
  getOrCreate(): any;

  /**
   * Get parent injector by traversing component tree
   * Returns undefined if no parent has injector
   */
  getParentInjector(component: any): any | undefined;

  /**
   * Set injector instance
   */
  setInjector(injector: any): void;

  /**
   * Check if has injector
   */
  hasInjector(): boolean;
}
