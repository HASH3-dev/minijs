/**
 * @UseProviders decorator
 * Modern replacement for @Provide that uses plugin architecture
 * Works with InjectorManager for persistent provider storage
 */
import "reflect-metadata";
import { USE_PROVIDERS_METADATA } from "../constants";
import type { UseProvidersMetadata } from "../types";
import type { ProviderShorthand } from "../../DenpendencyInjection";

/**
 * Class decorator to provide dependencies to a component and its children
 * Stores metadata that will be processed by UseProvidersPlugin during lifecycle
 *
 * @param providers Array of providers to register for this component
 * @example
 * ```typescript
 * @UseProviders([MyService, AnotherService])
 * class MyComponent extends Component {
 *   @Inject(MyService) service!: MyService;
 * }
 * ```
 */
export function UseProviders(providers: ProviderShorthand[]) {
  return function <T extends new (...args: any[]) => any>(target: T) {
    // Store metadata on the prototype for the plugin to read
    const metadata: UseProvidersMetadata = {
      providers,
    };

    Reflect.defineMetadata(USE_PROVIDERS_METADATA, metadata, target.prototype);

    return target;
  };
}
