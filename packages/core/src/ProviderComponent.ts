import { Component } from "./Component";
import { Injector, normalizeProvider } from "@mini/di";
import type { ProviderShorthand } from "@mini/di";

/**
 * Provider component for hierarchical dependency injection
 * Wraps children and provides dependencies to all descendants
 *
 * @example
 * ```tsx
 * <Provider values={[UserService, { provide: API_URL, useValue: 'https://api.com' }]}>
 *   <App />
 * </Provider>
 * ```
 */
export class Provider extends Component<{ values: ProviderShorthand[] }> {
  // Override getter to create injector lazily
  get __mini_injector(): Injector | undefined {
    if (!super.__mini_injector && this.props?.values) {
      const parentInjector: Injector | undefined = super.__getParentInjector();
      const providers = (this.props.values || []).map(normalizeProvider);
      super.__mini_injector = new Injector(providers, parentInjector);
    }
    return super.__mini_injector;
  }

  set __mini_injector(value: Injector | undefined) {
    super.__mini_injector = value;
  }

  render() {
    // Ensure injector exists BEFORE processing children
    this.__mini_injector;

    // Provider requires a render prop (function) to work correctly
    // Otherwise children are created before Provider and won't have access to the injector
    if (typeof this.children === "function") {
      const ComponentClass = this.children();

      if (typeof ComponentClass === "function") {
        // Create instance with Provider as parent
        const instance = new ComponentClass();
        instance.props = {};
        instance.__parent_component = this;

        // Render and return directly
        return instance.render();
      }
    }

    // If children is not a function, it was created before Provider
    // In this case, just return the children as-is (they won't have DI access)
    if (this.children instanceof Node) {
      return this.children;
    }

    // Fallback to empty comment node
    return document.createComment("Provider");
  }
}
