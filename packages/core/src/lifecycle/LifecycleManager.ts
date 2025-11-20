import { Component } from "../base/Component";
import { LifecyclePhase } from "../base/ReactiveComponent";
import { concatMap, filter, from, takeUntil } from "rxjs";

/**
 * Interface that all lifecycle hooks must implement
 * Plugins declare phase and priority, manager coordinates execution
 */
export interface LifecycleHook {
  /**
   * Unique identifier for this hook
   */
  readonly id: string;

  /**
   * Which lifecycle phase this hook runs in
   */
  readonly phase: LifecyclePhase;

  /**
   * Priority determines execution order (0-1000)
   * Lower numbers execute first
   */
  readonly priority: number;

  /**
   * Execute the plugin logic
   * Called by manager when phase is reached
   * Can be async - manager will wait
   */
  execute(component: Component): void | Promise<void>;
}

export interface HookContext {
  component: Component;
  [key: string]: any;
}

/**
 * Manages lifecycle plugin registration and coordinated execution
 * Uses concatMap to ensure phases execute sequentially
 */
export class LifecycleManager {
  private plugins: LifecycleHook[] = [];

  /**
   * Register a lifecycle plugin
   */
  registerHook(plugin: LifecycleHook): void {
    // Check for duplicate IDs
    if (this.plugins.some((p) => p.id === plugin.id)) {
      console.warn(
        `[LifecycleManager] Plugin with id "${plugin.id}" already registered, skipping`
      );
      return;
    }

    this.plugins.push(plugin);
  }

  /**
   * Unregister a plugin by ID
   */
  unregisterHook(id: string): void {
    this.plugins = this.plugins.filter((p) => p.id !== id);
  }

  /**
   * Setup coordinated plugin execution for a component
   * Uses concatMap to ensure phases execute sequentially
   */
  setupPlugins(component: Component): void {
    component.lifecycle$
      .pipe(
        // takeUntil prevents memory leaks by completing when component unmounts
        takeUntil(component.$.unmount$),
        filter((e) => !component.blockedLifecyclePhases.has(e)),
        // concatMap ensures each phase completes before next starts
        concatMap((phase) =>
          // Convert async execution to Observable
          from(this.executePhasePlugins(phase, component))
        )
      )
      .subscribe({
        error: (error) => {
          console.error(
            "[LifecycleManager] Error in lifecycle execution:",
            error
          );
          component.emitError(error);
        },
      });
  }

  /**
   * Execute Created phase plugins SYNCHRONOUSLY
   * This is critical for plugins that need to modify component behavior
   * before render() is called (e.g., Guards, Resolvers)
   *
   * Note: The plugins execute() methods are synchronous (they just setup),
   * but they may return Observables/Promises that execute async later
   */
  executeCreatedPhaseSync(component: Component): void {
    // Filter plugins for Created phase and sort by priority
    const createdPlugins = this.plugins
      .filter((p) => p.phase === LifecyclePhase.Created)
      .sort((a, b) => a.priority - b.priority);

    // Execute each plugin synchronously
    for (const plugin of createdPlugins) {
      try {
        plugin.execute(component);
        // Note: If execute() returns Promise, we don't await it
        // The plugin should handle async work by modifying render()
        // to return Observable/Promise
      } catch (error) {
        console.error(
          `[LifecycleManager] Error in plugin ${plugin.id} (phase: Created):`,
          error
        );
        component.emitError(error as Error);
      }
    }
  }

  /**
   * Execute all plugins for a specific phase
   * Runs plugins sequentially by priority
   */
  private async executePhasePlugins(
    phase: LifecyclePhase,
    component: Component
  ): Promise<void> {
    // Filter plugins for this phase and sort by priority
    const phasePlugins = this.plugins
      .filter((p) => p.phase === phase)
      .sort((a, b) => a.priority - b.priority);

    // Execute each plugin sequentially
    for (const plugin of phasePlugins) {
      try {
        await plugin.execute(component);
      } catch (error) {
        console.error(
          `[LifecycleManager] Error in plugin ${plugin.id} (phase: ${phase}):`,
          error
        );
        component.emitError(error as Error);
      }
    }
  }

  /**
   * Get all registered plugins for debugging
   */
  getHooks(): LifecycleHook[] {
    return [...this.plugins];
  }
}

// Global instance
export const lifecycleManager = new LifecycleManager();
