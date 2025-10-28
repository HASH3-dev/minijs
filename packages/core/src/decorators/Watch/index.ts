import { takeUntil } from "rxjs";
import { WATCH_PROPERTIES } from "./constants";
import type { WatchConfig } from "./types";

/**
 * Decorator to automatically subscribe to an observable property
 *
 * This is a syntax sugar that automatically:
 * - Subscribes to the specified observable property when the component mounts
 * - Unsubscribes automatically when the component unmounts (using takeUntil)
 * - Calls the decorated method whenever the observable emits
 *
 * @param propertyName - Name of the observable property to watch
 *
 * @example
 * ```typescript
 * class MyComponent extends Component {
 *   data = signal<any>(null);
 *
 *   @Watch('data')
 *   handleDataChange() {
 *     console.log('Data changed:', this.data.value);
 *   }
 * }
 * ```
 */
export function Watch(propertyName: string) {
  return function (
    target: any,
    methodName: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    // Store watch configurations on the prototype
    if (!target[WATCH_PROPERTIES]) {
      target[WATCH_PROPERTIES] = [];
    }

    const config: WatchConfig = {
      propertyName,
      method: originalMethod,
    };

    target[WATCH_PROPERTIES].push(config);

    return descriptor;
  };
}

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

export { WATCH_PROPERTIES } from "./constants";
export type { WatchConfig } from "./types";
