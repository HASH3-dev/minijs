// Constants
export {
  DOM_CACHE,
  LIFECYCLE_EXECUTED,
  PARENT_COMPONENT,
  COMPONENT_INSTANCE,
  MUTATION_OBSERVER,
  COMPONENT_PLACEHOLDER,
  SUBSCRIPTIONS,
  RENDER_STATE,
  SERVICE_COMPONENT,
} from "./constants";

// Base Classes (new architecture)
export { ReactiveComponent } from "./base/ReactiveComponent";
export { LifecyclePhase } from "./base/ReactiveComponent";
export { RenderableComponent } from "./base/RenderableComponent";
export { CleanableComponent } from "./base/CleanableComponent";

// Lifecycle & Plugin System
export {
  lifecycleManager,
  LifecycleManager,
} from "./lifecycle/LifecycleManager";
export type { LifecycleHook, HookContext } from "./lifecycle/LifecycleManager";
export { DecoratorPlugin } from "./lifecycle/DecoratorPlugin";
import "./lifecycle/registerDefaultPlugins"; // Auto-register default plugins

// Component
export { Component, RenderStateValues } from "./base/Component";

// Decorators
export * from "./resources/Mount";
export * from "./resources/Watch";
export * from "./resources/Child";
export * from "./resources/Guard";
export * from "./resources/Resolver";
export * from "./resources/Provider";
export * from "./resources/LoadData";
export * from "./resources/Lazy";
export * from "./resources/PersistentState";
export * from "./resources/Signal";

// Helpers
export * from "./helpers";

// Application
export { Application } from "./Application";
export { RenderResult } from "./RenderResult";
export type {
  RenderOptions,
  CreateOptions,
  ComponentClass,
} from "./Application";

// Dependency Injection
export {
  Injectable,
  Inject,
  Injector,
  validateDependencyGraph,
} from "./resources/DenpendencyInjection";
export { InjectionScope } from "./resources/DenpendencyInjection";
export type {
  Token,
  Provider as DIProvider,
  ProviderShorthand,
  InjectableOptions,
} from "./resources/DenpendencyInjection";

// JSX
export { jsx, jsxs, jsxDEV, Fragment } from "./jsx";

export type * from "./types";
