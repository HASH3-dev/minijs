/**
 * Hierarchical DI container with automatic dependency resolution
 * Supports Liskov Substitution Principle and circular dependency detection
 */
import "reflect-metadata";

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

  constructor(providers: ProviderShorthand[] = [], parent?: Injector) {
    this.providers = providers.map(normalizeProvider);
    this.parent = parent;
  }

  /**
   * Get instance of a token, creating it if necessary
   * Throws if token is not provided in this injector or any parent
   */
  get<T>(token: Token<T>): T {
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
        return this.parent.get(token);
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
 * Decorator to mark a class as injectable
 * Not strictly required but helps with documentation
 */
export function Injectable() {
  return function <T extends new (...args: any[]) => any>(target: T) {
    return target;
  };
}

/**
 * Property decorator to inject a dependency
 * Creates a lazy getter that resolves the dependency when accessed
 */
export function Inject<T>(token: Token<T>) {
  return function (target: any, propertyKey: string) {
    // Create lazy getter
    Object.defineProperty(target, propertyKey, {
      get(this: any) {
        // First try direct injector, then traverse up the hierarchy
        let injector: Injector | undefined = this.__mini_injector;

        if (!injector && this.__getParentInjector) {
          injector = this.__getParentInjector();
        }

        if (!injector) {
          const className = this.constructor.name;
          throw new Error(
            `No injector found for ${className}.${propertyKey}. ` +
              `Make sure the component is wrapped with @Provide or <Provider>.`
          );
        }
        return injector.get(token);
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
        const parentInjector: Injector | undefined = (
          this as any
        ).__getParentInjector?.();

        // Create new child injector with the provided dependencies
        (this as any).__mini_injector = new Injector(providers, parentInjector);
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
