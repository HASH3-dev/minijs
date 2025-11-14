import { OperatorFunction } from "rxjs";
import { WATCH_PROPERTIES } from "../constants";
import type { WatchConfig } from "../types";

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
export function Watch(
  propertyName: string,
  pipes?: OperatorFunction<any, any>[]
) {
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
      pipes,
    };

    target[WATCH_PROPERTIES].push(config);

    return descriptor;
  };
}
