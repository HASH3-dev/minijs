/**
 * Injection scopes
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
