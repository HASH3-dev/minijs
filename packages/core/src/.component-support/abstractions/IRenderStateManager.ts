import { Observable } from "rxjs";
import { RenderState } from "../../types";

export interface RenderStateValues {
  state: RenderState;
  data?: any;
  label?: string | symbol;
}

/**
 * IRenderStateManager - Interface for managing component render state
 * Enables LSP - same implementation for DOM and SSR
 *
 * @example
 * ```typescript
 * class DOMRenderStateManager implements IRenderStateManager {
 *   setState(values) { this.state$.next(values); }
 * }
 * ```
 */
export interface IRenderStateManager {
  /**
   * Get render state observable
   * Emits when state changes (loading/error/empty/success)
   */
  getState$(): Observable<RenderStateValues>;

  /**
   * Get current state value
   */
  getState(): RenderStateValues;

  /**
   * Set new render state
   * Triggers re-render if applicable
   */
  setState(values: RenderStateValues): void;

  /**
   * Get render method based on current state
   * Returns the method to call (render, renderLoading, renderError, renderEmpty)
   */
  getRenderMethod(component: any): (() => any) | null;
}
