import { signal } from "../../resources/Signal";
import { RenderState } from "../../types";
import { LAST_RENDER_METHOD } from "../../constants";
import {
  IRenderStateManager,
  RenderStateValues,
} from "../abstractions/IRenderStateManager";

/**
 * DOM implementation of render state management
 * Manages render state (loading/error/empty/success) and determines which render method to call
 */
export class DOMRenderStateManager implements IRenderStateManager {
  private state$ = signal<RenderStateValues>({
    state: RenderState.SUCCESS,
  });

  getState$() {
    return this.state$.asObservable();
  }

  getState(): RenderStateValues {
    return this.state$.value;
  }

  setState(values: RenderStateValues): void {
    this.state$.next(values);
  }

  /**
   * Helper to determine which render method to call based on state
   * Tracks last render to avoid duplicate renders when using fallback
   */
  getRenderMethod(component: any): (() => any) | null {
    const state = this.state$.value.state;
    const lastMethod = component[LAST_RENDER_METHOD];

    // Map states to method names
    const methodMap: Record<RenderState, string> = {
      [RenderState.IDLE]: "render",
      [RenderState.LOADING]: "renderLoading",
      [RenderState.SUCCESS]: "render",
      [RenderState.ERROR]: "renderError",
      [RenderState.EMPTY]: "renderEmpty",
    };

    const methodName = methodMap[state];
    const hasMethod = typeof component[methodName] === "function";

    // If method exists, use it
    if (hasMethod) {
      component[LAST_RENDER_METHOD] = methodName;
      return component[methodName].bind(component);
    }

    // Method doesn't exist - use render() as fallback
    // But check if we already used render() as fallback
    if (lastMethod === "render" && methodName !== "render") {
      // Already rendered with render() as fallback, don't render again
      return null;
    }

    // Use render() as fallback and track it
    component[LAST_RENDER_METHOD] = "render";
    return component.render.bind(component);
  }
}
