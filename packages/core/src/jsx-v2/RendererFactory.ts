import { RenderTarget } from "./abstractions/RenderContext";
import { IElementFactory } from "./abstractions/IElementFactory";
import { IPropsApplicator } from "./abstractions/IPropsApplicator";
import { IChildrenRenderer } from "./abstractions/IChildrenRenderer";
import { DOMElementFactory } from "./dom/DOMElementFactory";
import { DOMPropsApplicator } from "./dom/DOMPropsApplicator";
import { DOMChildrenRenderer } from "./dom/DOMChildrenRenderer";
import { debugLog } from "../utils/debug";

/**
 * RendererFactory - Centralized factory for renderer implementations
 * Uses configuration to determine which renderer to use (DOM, SSR, etc)
 *
 * This is the single point where render target is chosen.
 * Enables Liskov Substitution - any renderer can be swapped.
 *
 * @example
 * ```typescript
 * // Get DOM implementations
 * const factory = RendererFactory.getElementFactory(RenderTarget.DOM);
 *
 * // Future: Get SSR implementations
 * const factory = RendererFactory.getElementFactory(RenderTarget.SSR);
 * ```
 */
export class RendererFactory {
  private static renderTarget: RenderTarget = RenderTarget.DOM;

  /**
   * Set the global render target
   * Must be called before any rendering occurs
   *
   * @param target - RenderTarget (DOM, SSR, etc)
   */
  static setRenderTarget(target: RenderTarget): void {
    this.renderTarget = target;
    debugLog(`Render target set to: ${target}`);
  }

  /**
   * Get current render target
   */
  static getRenderTarget(): RenderTarget {
    return this.renderTarget;
  }

  /**
   * Get ElementFactory implementation for current render target
   *
   * @param target - Optional override render target
   * @returns IElementFactory implementation
   */
  static getElementFactory(
    target: RenderTarget = this.renderTarget
  ): IElementFactory {
    switch (target) {
      case RenderTarget.DOM:
        return DOMElementFactory.getInstance();

      case RenderTarget.SSR:
        // Future: return SSRElementFactory.getInstance();
        throw new Error(
          "SSR not implemented yet. Use RenderTarget.DOM for now."
        );

      default:
        throw new Error(`Unknown render target: ${target}`);
    }
  }

  /**
   * Get PropsApplicator implementation for current render target
   *
   * @param target - Optional override render target
   * @returns IPropsApplicator implementation
   */
  static getPropsApplicator(
    target: RenderTarget = this.renderTarget
  ): IPropsApplicator {
    switch (target) {
      case RenderTarget.DOM:
        return DOMPropsApplicator.getInstance();

      case RenderTarget.SSR:
        // Future: return SSRPropsApplicator.getInstance();
        throw new Error(
          "SSR not implemented yet. Use RenderTarget.DOM for now."
        );

      default:
        throw new Error(`Unknown render target: ${target}`);
    }
  }

  /**
   * Get ChildrenRenderer implementation for current render target
   *
   * @param target - Optional override render target
   * @returns IChildrenRenderer implementation
   */
  static getChildrenRenderer(
    target: RenderTarget = this.renderTarget
  ): IChildrenRenderer {
    switch (target) {
      case RenderTarget.DOM:
        return DOMChildrenRenderer.getInstance();

      case RenderTarget.SSR:
        // Future: return SSRChildrenRenderer.getInstance();
        throw new Error(
          "SSR not implemented yet. Use RenderTarget.DOM for now."
        );

      default:
        throw new Error(`Unknown render target: ${target}`);
    }
  }

  /**
   * Check if using DOM rendering
   */
  static isDOM(): boolean {
    return this.renderTarget === RenderTarget.DOM;
  }

  /**
   * Check if using SSR rendering
   */
  static isSSR(): boolean {
    return this.renderTarget === RenderTarget.SSR;
  }
}
