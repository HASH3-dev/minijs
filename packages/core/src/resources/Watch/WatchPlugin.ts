import { DecoratorPlugin } from "../../lifecycle/DecoratorPlugin";
import { Component } from "../../base/Component";
import { WATCH_PROPERTIES } from "./constants";
import type { WatchConfig } from "./types";
import { LifecyclePhase } from "../../base/ReactiveComponent";
import { takeUntil } from "rxjs";

/**
 * Plugin that sets up @Watch decorated property subscriptions
 * Executed by LifecycleManager at AfterMount phase
 */
export class WatchDecoratorPlugin extends DecoratorPlugin {
  readonly id = "watch-decorator";
  readonly phase = LifecyclePhase.AfterMount;
  readonly priority = 50; // Execute before Mount (100)

  /**
   * Execute watch setup
   * Called by LifecycleManager when AfterMount phase is reached
   */
  execute(component: Component): void {
    // Get watch configurations from metadata
    const watchConfigs =
      this.getMetadata<WatchConfig[]>(component, WATCH_PROPERTIES) || [];

    if (watchConfigs.length === 0) {
      return;
    }

    this.setupWatchers(component, watchConfigs);
  }

  /**
   * Setup all watchers
   */
  private setupWatchers(component: Component, configs: WatchConfig[]): void {
    // Ensure the component has lifecycle signals
    if (!component.$ || !component.$.unmount$) {
      console.warn(
        `[WatchPlugin] Component ${component.constructor.name} does not have lifecycle signals`
      );
      return;
    }

    // Setup each watcher
    for (const config of configs) {
      const observable = (component as any)[config.propertyName];

      if (!observable) {
        console.warn(
          `[WatchPlugin] Property "${config.propertyName}" not found on component ${component.constructor.name}`
        );
        continue;
      }

      if (typeof observable.pipe !== "function") {
        console.warn(
          `[WatchPlugin] Property "${config.propertyName}" is not an observable on component ${component.constructor.name}`
        );
        continue;
      }

      try {
        // Subscribe with automatic cleanup on unmount
        const subscription = observable
          .pipe(takeUntil(component.$.unmount$))
          .subscribe((value: any) => {
            try {
              config.method.call(component, value);
            } catch (error) {
              console.error(
                `[WatchPlugin] Error in watch handler for ${config.propertyName}:`,
                error
              );
              component.emitError(error as Error);
            }
          });

        // Register cleanup (belt and suspenders approach)
        this.registerCleanup(component, () => {
          if (subscription && !subscription.closed) {
            subscription.unsubscribe();
          }
        });
      } catch (error) {
        console.error(
          `[WatchPlugin] Error setting up watch for ${config.propertyName}:`,
          error
        );
        component.emitError(error as Error);
      }
    }
  }
}
