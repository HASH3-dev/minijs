import { LIFECYCLE_EXECUTED } from "../constants";
import { lifecycleManager } from "../lifecycle/LifecycleManager";
import { LifecyclePhase, ReactiveComponent } from "./ReactiveComponent";

/**
 * Adds rendering capabilities and caching
 */
export abstract class RenderableComponent extends ReactiveComponent {
  private _renderCache?: Node;
  private _cachedParent?: any;
  private _cleaned = false;

  /**
   * Main render method - must be implemented
   */
  abstract render(): any;

  /**
   * Get cached render result
   * @internal
   */
  _getCachedRender(): Node | undefined {
    return this._renderCache;
  }

  /**
   * Set render cache
   * @internal
   */
  _setCachedRender(node: Node, parent: any): void {
    this._renderCache = node;
    this._cachedParent = parent;
  }

  /**
   * Clear render cache
   * @internal
   */
  _clearRenderCache(): void {
    this._renderCache = undefined;
    this._cachedParent = undefined;
  }

  /**
   * Check if cache is valid
   * @internal
   */
  _isCacheValid(currentParent: any): boolean {
    return (
      this._renderCache !== undefined && this._cachedParent === currentParent
    );
  }

  /**
   * Called by framework after component is fully rendered and mounted
   * Emits lifecycle phases and mounted signal
   * @internal
   */
  _notifyMounted(): void {
    this._emitPhase(LifecyclePhase.Mounted);
    this._emitPhase(LifecyclePhase.AfterMount);

    // Emit mounted$ signal for backward compatibility
    // This is emitted here (not in MountPlugin) to ensure it always fires
    // even for components without @Mount decorators
    if ((this as any).$ && (this as any).$.mounted$) {
      (this as any).$.mounted$.next();
    }
  }

  /**
   * Mount component in lifecycle
   * Registers in DI, executes lifecycle
   * @internal
   */

  _mount(): void {
    // Check if already executed to prevent duplicates
    if ((this as any)[LIFECYCLE_EXECUTED]) {
      return;
    }
    (this as any)[LIFECYCLE_EXECUTED] = true;

    // CRITICAL: Execute Created phase plugins SYNCHRONOUSLY
    // This allows Guards/Resolvers to override render() BEFORE it's called
    lifecycleManager.executeCreatedPhaseSync(this as any);

    // Setup remaining lifecycle phases to execute reactively
    lifecycleManager.setupPlugins(this as any);

    // Emit BeforeMount phase
    this._emitPhase(LifecyclePhase.BeforeMount);
  }

  /**
   * Unmount component completely
   * Cleans DI, emits unmount$, cleanup
   * @internal
   */
  _unmount(cb: Function): void {
    // Emit BeforeDestroy phase
    this._emitPhase(LifecyclePhase.BeforeDestroy);

    // Emit unmount$ signal for subscriptions cleanup
    if ((this as any).$ && (this as any).$.unmount$) {
      (this as any).$.unmount$.next();
      (this as any).$.unmount$.complete();
    }

    cb();

    // Clean DI caches
    this._cleanupDICache();

    // Clear render cache
    this._clearRenderCache();

    // Emit Destroyed phase
    this._emitPhase(LifecyclePhase.Destroyed);

    // Clean instance
    this._cleanupInstance();
  }

  _cleanupInstance() {
    if (this._cleaned) {
      return;
    }

    const Application = require("../Application").Application;
    //TODO: O router não limpa as instancias de componentes, só cria novas,
    // isso bagunça a descoberta de dependeneciass
    Application.componentInstances.delete(this);
    this._cleaned = true;
  }

  /**
   * Cleanup DI caches for this component
   * @internal
   */
  _cleanupDICache(): void {
    // Import Application to access static maps
    // We'll do this in the implementation
    const Application = require("../Application").Application;

    // Remove from component scoped cache
    if (Application.componentScopedCache.has(this)) {
      Application.componentScopedCache.delete(this);
    }

    // Remove from component injectors
    if (Application.componentInjectors.has(this)) {
      Application.componentInjectors.delete(this);
    }

    // Remove from component providers
    if (Application.componentProviders.has(this)) {
      Application.componentProviders
        .get(this)
        .forEach((value: any, key: any) => {
          (Application.injectables as Map<any, any>).delete(key);
        });
      Application.componentProviders.delete(this);
    }
  }
}
