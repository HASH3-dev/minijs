import { RendererFactory } from "../jsx-v2/RendererFactory";
import { RenderTarget } from "../jsx-v2/abstractions/RenderContext";
import { debugLog } from "../utils/debug";

/**
 * Rendering version enum
 * Allows switching between v1 (procedural) and v2 (OOP) implementations
 */
export enum RenderingVersion {
  /** V1 - Current implementation (procedural/functional) */
  V1 = "v1",
  /** V2 - New implementation (OOP with design patterns) */
  V2 = "v2",
}

// Re-export RenderTarget for convenience
export { RenderTarget };

/**
 * Global rendering configuration
 * Centralized control for rendering version and target
 *
 * @example
 * ```typescript
 * import { RenderingConfig, RenderingVersion, RenderTarget } from '@minijs/core';
 *
 * // Use V1 (default)
 * RenderingConfig.setVersion(RenderingVersion.V1);
 *
 * // Use V2 with DOM (default target)
 * RenderingConfig.setVersion(RenderingVersion.V2);
 *
 * // Use V2 with explicit target
 * RenderingConfig.setVersion(RenderingVersion.V2, RenderTarget.DOM);
 *
 * // Use V2 with SSR (future)
 * RenderingConfig.setVersion(RenderingVersion.V2, RenderTarget.SSR);
 * ```
 */
export class RenderingConfig {
  private static version: RenderingVersion = RenderingVersion.V1;

  /**
   * Set which rendering version to use
   * Must be called BEFORE importing Application or Component
   *
   * @param version - V1 (current) or V2 (OOP)
   * @param target - Optional render target (DOM, SSR) - only affects V2
   *
   * @example
   * ```typescript
   * // Use V1
   * RenderingConfig.setVersion(RenderingVersion.V1);
   *
   * // Use V2 with DOM (default)
   * RenderingConfig.setVersion(RenderingVersion.V2);
   *
   * // Use V2 with explicit target
   * RenderingConfig.setVersion(RenderingVersion.V2, RenderTarget.DOM);
   * ```
   */
  static setVersion(version: RenderingVersion, target?: RenderTarget): void {
    this.version = version;

    // If V2, configure RendererFactory
    if (version === RenderingVersion.V2) {
      // Use provided target or default to DOM
      const renderTarget = target ?? RenderTarget.DOM;
      RendererFactory.setRenderTarget(renderTarget);

      debugLog(
        `Rendering version set to: ${version} with target: ${renderTarget}`
      );
    } else {
      debugLog(`Rendering version set to: ${version}`);
    }
  }

  /**
   * Get current rendering version
   */
  static getVersion(): RenderingVersion {
    return this.version;
  }

  /**
   * Check if using V2 (OOP implementation)
   */
  static isV2(): boolean {
    return this.version === RenderingVersion.V2;
  }

  /**
   * Check if using V1 (current implementation)
   */
  static isV1(): boolean {
    return this.version === RenderingVersion.V1;
  }
}
