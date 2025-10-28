import { Component } from "./Component";
import {
  GET_PARENT_INJECTOR,
  Injector,
  INJECTOR_TOKEN,
  normalizeProvider,
} from "@mini/di";
import type { ProviderShorthand } from "@mini/di";
import { PARENT_COMPONENT } from "./constants";

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
  get [INJECTOR_TOKEN](): Injector | undefined {
    if (!super[INJECTOR_TOKEN] && this.props?.values) {
      const parentInjector: Injector | undefined = super[
        GET_PARENT_INJECTOR
      ]?.();
      const providers = (this.props.values || []).map(normalizeProvider);
      super[INJECTOR_TOKEN] = new Injector(providers, parentInjector);
    }
    return super[INJECTOR_TOKEN];
  }

  set [INJECTOR_TOKEN](value: Injector | undefined) {
    super[INJECTOR_TOKEN] = value;
  }

  render() {
    // Ensure injector exists BEFORE processing children
    this[INJECTOR_TOKEN];

    // Handle function children (render prop pattern)
    if (typeof this.children === "function") {
      const ComponentClass = this.children();

      if (typeof ComponentClass === "function") {
        // Create instance with Provider as parent
        const instance = new ComponentClass();
        instance.props = {};
        instance[PARENT_COMPONENT] = this;

        // Render and return directly
        return instance.render();
      }
    }

    // Handle Component instance children
    if (this.children instanceof Component) {
      // Set Provider as parent so DI works
      this.children[PARENT_COMPONENT] = this;

      // Return the children as-is - Application will render it properly
      return this.children;
    }

    // If children is already rendered Node, return it
    if (this.children instanceof Node) {
      return this.children;
    }

    // Fallback to empty comment node
    return document.createComment("Provider");
  }
}
