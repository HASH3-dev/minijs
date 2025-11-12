/**
 * Token type for dependency injection
 * Can be a constructor function (class), abstract class, or symbol
 */
export type Token<T = any> =
  | (abstract new (...args: any[]) => T)
  | (new (...args: any[]) => T)
  | symbol;

/**
 * Injection scope type for different lifecycle behaviors
 */
export enum InjectionScope {
  SINGLETON = "SINGLETON", // Uma instância por injector (padrão)
  BY_COMPONENT = "BY_COMPONENT", // Uma instância por componente
}

/**
 * Options for @Injectable decorator
 */
export interface InjectableOptions {
  scope?: InjectionScope;
}

/**
 * Provider configuration for DI
 */
export interface Provider<T = any> {
  provide: Token<T>;
  useClass?: new (...args: any[]) => T;
  useValue?: T;
  useFactory?: (...args: any[]) => T;
  deps?: Token[]; // Dependencies for useFactory
  multi?: boolean; // Support for multi-providers (future)
}

/**
 * Shorthand for providers - can pass Token directly instead of full Provider object
 */
export type ProviderShorthand = Token | Provider;
