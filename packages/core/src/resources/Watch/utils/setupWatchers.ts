import { takeUntil } from "rxjs";
import { WATCH_PROPERTIES } from "../constants";
import type { WatchConfig } from "../types";

/**
 * Setup watchers for a component instance
 * This should be called during component mount lifecycle
 *
 * @param instance - The component instance to setup watchers for
 */
export function setupWatchers(instance: any) {
  const prototype = Object.getPrototypeOf(instance);
  const watchConfigs: WatchConfig[] = prototype[WATCH_PROPERTIES] || [];

  if (watchConfigs.length === 0) {
    return;
  }

  // Ensure the component has lifecycle signals
  if (!instance.$ || !instance.$.unmount$) {
    console.warn(
      "Component does not have lifecycle signals, watchers will not work properly"
    );
    return;
  }

  // Setup each watcher
  for (const config of watchConfigs) {
    const observable = instance[config.propertyName];

    if (!observable) {
      console.warn(
        `Property "${config.propertyName}" not found on component instance`
      );
      continue;
    }

    if (typeof observable.pipe !== "function") {
      console.warn(
        `Property "${config.propertyName}" is not an observable (missing pipe method)`
      );
      continue;
    }

    // Subscribe with automatic cleanup on unmount
    observable.pipe(takeUntil(instance.$.unmount$)).subscribe((value: any) => {
      config.method.call(instance, value);
    });
  }
}
