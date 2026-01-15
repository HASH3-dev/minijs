import { RenderTarget } from "../jsx-v2/abstractions/RenderContext";
import { RendererFactory } from "../jsx-v2/RendererFactory";
import {
  ILifecycleManager,
  INodeRegistry,
  ICleanupRegistry,
  IRenderStateManager,
  IInjectorFacade,
} from "./abstractions";

/**
 * Manager interfaces collection
 */
export interface ComponentManagers {
  lifecycle: ILifecycleManager;
  nodes: INodeRegistry;
  cleanup: ICleanupRegistry;
  renderState: IRenderStateManager;
  injector: IInjectorFacade;
}

/**
 * ManagerFactory - Creates component managers based on render target
 * Central point for composition strategy
 *
 * @example
 * ```typescript
 * // DOM target
 * const managers = ManagerFactory.createManagers();
 * managers.lifecycle.getMounted$(); // real observable
 *
 * // SSR target
 * RendererFactory.setRenderTarget(RenderTarget.SSR);
 * const managers = ManagerFactory.createManagers();
 * managers.lifecycle.getMounted$(); // EMPTY observable (no-op)
 * ```
 */
export class ManagerFactory {
  /**
   * Create managers based on current or specified render target
   *
   * @param target - Optional render target override
   * @returns Component managers collection
   */
  static createManagers(target?: RenderTarget): ComponentManagers {
    const renderTarget = target ?? RendererFactory.getRenderTarget();

    // For now, use a simple implementation that works with both DOM and SSR
    // Future: Create separate DOM and SSR implementations
    // This is a transitional implementation that maintains backward compatibility

    return {
      lifecycle: this.createLifecycleManager(renderTarget),
      nodes: this.createNodeRegistry(renderTarget),
      cleanup: this.createCleanupRegistry(renderTarget),
      renderState: this.createRenderStateManager(renderTarget),
      injector: this.createInjectorFacade(renderTarget),
    };
  }

  /**
   * Create lifecycle manager
   * @internal
   */
  private static createLifecycleManager(
    target: RenderTarget
  ): ILifecycleManager {
    // Import here to avoid circular dependencies
    const { DOMLifecycleManager } = require("./dom/DOMLifecycleManager");

    if (target === RenderTarget.SSR) {
      // Future: return new SSRLifecycleManager();
      // For now, SSR uses same manager but observables won't be subscribed
      return new DOMLifecycleManager();
    }

    return new DOMLifecycleManager();
  }

  /**
   * Create node registry
   * @internal
   */
  private static createNodeRegistry(target: RenderTarget): INodeRegistry {
    const { DOMNodeRegistry } = require("./dom/DOMNodeRegistry");

    if (target === RenderTarget.SSR) {
      // Future: return new SSRNodeRegistry();
      return new DOMNodeRegistry();
    }

    return new DOMNodeRegistry();
  }

  /**
   * Create cleanup registry
   * @internal
   */
  private static createCleanupRegistry(target: RenderTarget): ICleanupRegistry {
    const { DOMCleanupRegistry } = require("./dom/DOMCleanupRegistry");

    if (target === RenderTarget.SSR) {
      // Future: return new SSRCleanupRegistry();
      return new DOMCleanupRegistry();
    }

    return new DOMCleanupRegistry();
  }

  /**
   * Create render state manager
   * @internal
   */
  private static createRenderStateManager(
    target: RenderTarget
  ): IRenderStateManager {
    const { DOMRenderStateManager } = require("./dom/DOMRenderStateManager");
    return new DOMRenderStateManager();
  }

  /**
   * Create injector facade
   * @internal
   */
  private static createInjectorFacade(target: RenderTarget): IInjectorFacade {
    const { DOMInjectorFacade } = require("./dom/DOMInjectorFacade");
    return new DOMInjectorFacade();
  }
}
