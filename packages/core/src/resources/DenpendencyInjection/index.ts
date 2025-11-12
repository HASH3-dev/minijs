/**
 * Dependency Injection module
 * Unified DI system using Application's static registry
 */
export { Injector } from "./Injector";
export { Injectable } from "./decorators/Injectable";
export { Inject } from "./decorators/Inject";
export {
  normalizeProvider,
  getOrCreateInjector,
  registerResolvedData,
  validateDependencyGraph,
} from "./utils";
export type {
  Token,
  Provider,
  ProviderShorthand,
  InjectableOptions,
} from "./types";
export { InjectionScope } from "./types";
export { INJECTOR_TOKEN, GET_PARENT_INJECTOR } from "./constants";
