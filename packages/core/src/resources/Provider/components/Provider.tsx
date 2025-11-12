import { Component } from "../../../base/Component";
import type { ProviderShorthand } from "../../DenpendencyInjection";

/**
 * Provider component for hierarchical dependency injection
 * Wraps children and provides dependencies to all descendants
 *
 * UseProvidersPlugin will automatically detect this component
 * and use props.values as the provider list.
 *
 * @example
 * ```tsx
 * <Provider values={[UserService, { provide: API_URL, useValue: 'https://api.com' }]}>
 *   <App />
 * </Provider>
 * ```
 */
export class Provider extends Component<{ values: ProviderShorthand[] }> {
  render() {
    // Simply render children - DI is handled by @UseProviders decorator
    return this.children.map((child: any) => {
      // Handle Component instance children
      if (child instanceof Component) {
        return child;
      }

      // Handle function children (render prop pattern)
      if (typeof child === "function") {
        const ComponentClass = child();
        if (typeof ComponentClass === "function") {
          const instance = new ComponentClass();
          instance.props = {};
          return instance.render();
        } else {
          return ComponentClass;
        }
      }

      // If children is already rendered Node, return it
      if (child instanceof Node) {
        return child;
      }

      // Fallback to empty comment node
      return document.createComment("Provider");
    })[0];
  }
}
