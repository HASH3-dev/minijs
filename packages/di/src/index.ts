/**
 * Hierarchical DI container with automatic dependency resolution
 * Supports Liskov Substitution Principle and circular dependency detection
 */
import "reflect-metadata";
import {
  GET_PARENT_INJECTOR,
  INJECTOR_TOKEN,
  SCOPE_METADATA,
} from "./constants";
import { InjectionScope, InjectableOptions } from "./types";

export type Token<T = any> =
  | (abstract new (...args: any[]) => T)
  | (new (...args: any[]) => T)
  | symbol;

export interface Provider<T = any> {
  provide: Token<T>;
  useClass?: new (...args: any[]) => T;
  useValue?: T;
  useFactory?: (...args: any[]) => T;
  deps?: Token[]; // Dependencies for useFactory
  multi?: boolean; // Support for multi-providers (future)
}

// Shorthand: can pass Token directly instead of full Provider object
export type ProviderShorthand = Token | Provider;

/**
 * Normalize provider shorthand to full Provider object
 */
function normalizeProvider(p: ProviderShorthand): Provider {
  if (typeof p === "function" || typeof p === "symbol") {
    return { provide: p, useClass: p as any };
  }
  return p;
}

/**
 * Hierarchical Injector with automatic dependency resolution
 */
export class Injector {
  private parent?: Injector;
  private instances = new Map<Token, any>();
  private providers: Provider[];
  private resolving = new Set<Token>(); // Track tokens being resolved (circular dependency detection)
  private ownerComponent?: any; // Component that owns this injector
  private componentInstances = new WeakMap<any, Map<Token, any>>(); // BY_COMPONENT scoped instances

  constructor(
    providers: ProviderShorthand[] = [],
    parent?: Injector,
    ownerComponent?: any
  ) {
    this.providers = providers.map(normalizeProvider);
    this.parent = parent;
    this.ownerComponent = ownerComponent;
  }

  /**
   * Get instance of a token, creating it if necessary
   * Throws if token is not provided in this injector or any parent
   * @param token The token to resolve
   * @param requestingComponent Optional component requesting the dependency (for BY_COMPONENT scope)
   */
  get<T>(token: Token<T>, requestingComponent?: any): T {
    // Check the scope of the token
    const scope = getScope(token);

    // Handle BY_COMPONENT scope
    if (scope === InjectionScope.BY_COMPONENT && requestingComponent) {
      return this.getComponentScoped(token, requestingComponent);
    }

    // 1. Check if already instantiated (singleton per injector)
    if (this.instances.has(token)) {
      return this.instances.get(token);
    }

    // 2. Detect circular dependency
    if (this.resolving.has(token)) {
      const tokenName =
        typeof token === "function" ? token.name : token.toString();
      throw new Error(`Circular dependency detected for token: ${tokenName}`);
    }

    // 3. Find provider in this injector
    const provider = this.findProvider(token);

    if (!provider) {
      // Try parent injector
      if (this.parent) {
        return this.parent.get(token, requestingComponent);
      }

      // No provider found
      const tokenName =
        typeof token === "function" ? token.name : token.toString();
      throw new Error(`No provider found for token: ${tokenName}`);
    }

    // 4. Mark as resolving
    this.resolving.add(token);

    try {
      // 5. Instantiate with dependency resolution
      const instance = this.instantiate(provider);
      this.instances.set(token, instance);
      return instance;
    } finally {
      // 6. Remove from resolving set
      this.resolving.delete(token);
    }
  }

  /**
   * Get or create a component-scoped instance
   * @param token The token to resolve
   * @param component The component requesting the dependency
   */
  private getComponentScoped<T>(token: Token<T>, component: any): T {
    // Get or create the component's instance map
    let componentMap = this.componentInstances.get(component);
    if (!componentMap) {
      componentMap = new Map<Token, any>();
      this.componentInstances.set(component, componentMap);
    }

    // Check if already instantiated for this component
    if (componentMap.has(token)) {
      return componentMap.get(token);
    }

    // Find provider in this injector or parents
    const provider = this.findProvider(token);
    if (!provider) {
      if (this.parent) {
        return this.parent.getComponentScoped(token, component);
      }
      const tokenName =
        typeof token === "function" ? token.name : token.toString();
      throw new Error(`No provider found for token: ${tokenName}`);
    }

    // Instantiate for this component
    const instance = this.instantiateComponentScoped(provider, component);
    componentMap.set(token, instance);
    return instance;
  }

  /**
   * Instantiate a component-scoped provider
   * @param provider The provider to instantiate
   * @param component The component context
   */
  private instantiateComponentScoped<T>(
    provider: Provider<T>,
    component: any
  ): T {
    // useValue - return directly
    if (provider.useValue !== undefined) {
      return provider.useValue;
    }

    // useFactory - execute factory with resolved deps
    if (provider.useFactory) {
      const deps = provider.deps || [];
      const resolvedDeps = deps.map((dep) => this.get(dep, component));
      return provider.useFactory(...resolvedDeps);
    }

    // useClass or provide directly (must be a constructor)
    const Ctor = (provider.useClass || provider.provide) as new (
      ...args: any[]
    ) => T;

    // Get constructor parameter types from TypeScript metadata
    const deps: Token[] = Reflect.getMetadata("design:paramtypes", Ctor) || [];

    // Resolve all constructor dependencies with component context
    const resolvedDeps = deps.map((dep) => this.get(dep, component));

    // Create instance with resolved dependencies + component as last parameter
    const instance = new Ctor(...resolvedDeps, component);

    return instance;
  }

  /**
   * Check if token is provided (in this injector or parents)
   */
  has(token: Token): boolean {
    if (this.findProvider(token)) return true;
    if (this.parent) return this.parent.has(token);
    return false;
  }

  /**
   * Find provider in this injector (not parents)
   */
  private findProvider(token: Token): Provider | undefined {
    return this.providers.find((p) => p.provide === token);
  }

  /**
   * Instantiate a provider, resolving its dependencies
   */
  private instantiate<T>(provider: Provider<T>): T {
    // useValue - return directly
    if (provider.useValue !== undefined) {
      return provider.useValue;
    }

    // useFactory - execute factory with resolved deps
    if (provider.useFactory) {
      const deps = provider.deps || [];
      const resolvedDeps = deps.map((dep) => this.get(dep));
      return provider.useFactory(...resolvedDeps);
    }

    // useClass or provide directly (must be a constructor)
    const Ctor = (provider.useClass || provider.provide) as new (
      ...args: any[]
    ) => T;

    // Get constructor parameter types from TypeScript metadata
    const deps: Token[] = Reflect.getMetadata("design:paramtypes", Ctor) || [];

    // Resolve all constructor dependencies
    const resolvedDeps = deps.map((dep) => this.get(dep));

    // Create instance with resolved dependencies
    return new Ctor(...resolvedDeps);
  }
}

/**
 * Decorator to mark a class as injectable with optional scope configuration
 * @param options Injectable options (scope, etc)
 */
export function Injectable(options?: InjectableOptions) {
  return function <T extends new (...args: any[]) => any>(target: T) {
    // Store scope metadata on the class
    const scope = options?.scope ?? InjectionScope.SINGLETON;
    Reflect.defineMetadata(SCOPE_METADATA, scope, target);
    return target;
  };
}

/**
 * Helper to get the injection scope of a token
 * @param token The token to check
 * @returns The injection scope (defaults to SINGLETON)
 */
function getScope(token: Token): InjectionScope {
  if (typeof token === "function") {
    const metadata = Reflect.getMetadata(SCOPE_METADATA, token);
    return metadata ?? InjectionScope.SINGLETON;
  }
  return InjectionScope.SINGLETON;
}

/**
 * Property decorator to inject a dependency
 * Creates a lazy getter that resolves the dependency when accessed
 * Passes component context for BY_COMPONENT scoped dependencies
 */
export function Inject<T>(token: Token<T>) {
  return function (target: any, propertyKey: string) {
    // Create lazy getter
    Object.defineProperty(target, propertyKey, {
      get(this: any) {
        // Try multiple ways to get injector for compatibility
        let injector: Injector | undefined =
          this[INJECTOR_TOKEN] || this.__mini_injector || this.injector;

        if (!injector) {
          // Try getting parent injector
          if (this[GET_PARENT_INJECTOR]) {
            injector = this[GET_PARENT_INJECTOR]();
          } else if (this.__getParentInjector) {
            injector = this.__getParentInjector();
          }
        }

        if (!injector) {
          const className = this.constructor.name;
          throw new Error(
            `No injector found for ${className}.${propertyKey}. ` +
              `Make sure the component is wrapped with @Provide or <Provider>.`
          );
        }

        // Pass component context for BY_COMPONENT scope support
        return injector.get(token, this);
      },
      enumerable: true,
      configurable: true,
    });
  };
}

/**
 * Class decorator to provide dependencies to a component and its children
 * Creates a new Injector scope for the decorated component
 */
export function Provide(providers: ProviderShorthand[]) {
  return function <T extends new (...args: any[]) => any>(Ctor: T) {
    // Create wrapper class that sets up injector
    const WrappedComponent = class extends Ctor {
      constructor(...args: any[]) {
        super(...args);

        // Get parent injector (if exists)
        const parentInjector: Injector | undefined = (this as any)[
          GET_PARENT_INJECTOR
        ]?.();

        // Create new child injector with the provided dependencies
        // Pass this component as ownerComponent for BY_COMPONENT scope support
        (this as any)[INJECTOR_TOKEN] = new Injector(
          providers,
          parentInjector,
          this
        );
      }
    } as T;

    // Preserve original class name
    Object.defineProperty(WrappedComponent, "name", {
      value: Ctor.name,
      writable: false,
    });

    return WrappedComponent;
  };
}

// Re-export types for convenience
export { normalizeProvider };
export type { Provider as MiniProvider, Token as MiniToken };

// Export constants
export {
  INJECTOR_TOKEN,
  GET_PARENT_INJECTOR,
  SCOPE_METADATA,
} from "./constants";

// Export types and enums
export { InjectionScope } from "./types";
export type { InjectableOptions } from "./types";

// Export helper functions
export { getScope };
