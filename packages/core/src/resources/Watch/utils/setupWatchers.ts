import { combineLatest, Observable, takeUntil } from "rxjs";
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

  const methodsSubscriptions = new Map<string, Observable<any>[]>();

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

    const pipedObservable = observable.pipe(...(config.pipes ?? []));

    if (methodsSubscriptions.has(config.method.name)) {
      methodsSubscriptions.get(config.method.name)?.push(pipedObservable);
    } else {
      methodsSubscriptions.set(config.method.name, [pipedObservable]);
    }
  }

  alert(watchConfigs[0].method.name);

  // Subscribe with automatic cleanup on unmount
  methodsSubscriptions.forEach((observables, methodName) => {
    combineLatest(observables)
      .pipe(takeUntil(instance.$.unmount$))
      .subscribe((values: any) => {
        instance[methodName].apply(instance, values);
      });
  });
}
