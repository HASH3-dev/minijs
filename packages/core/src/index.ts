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
export { Provider } from "./ProviderComponent";

// Decorators
export * from "./decorators/Mount";
export * from "./decorators/Watch";
export * from "./decorators/Child";
export * from "./decorators/Guard";
export * from "./decorators/Resolver";
export * from "./decorators/UseProviders";
export * from "./decorators/LoadData";

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
export { Injectable, Inject, Injector, validateDependencyGraph } from "./di";
export { InjectionScope } from "./di";
export type {
  Token,
  Provider as DIProvider,
  ProviderShorthand,
  InjectableOptions,
} from "./di";

// JSX
export { jsx, jsxs, jsxDEV, Fragment } from "./jsx";

export * from "./types";
