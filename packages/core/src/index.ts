// Constants
export {
  DOM_CACHE,
  LIFECYCLE_EXECUTED,
  PARENT_COMPONENT,
  COMPONENT_INSTANCE,
  MUTATION_OBSERVER,
  COMPONENT_PLACEHOLDER,
  SUBSCRIPTIONS,
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
export { Component } from "./base/Component";
export { Provider } from "./ProviderComponent";

// Decorators
export { Mount, MOUNT_METHODS } from "./decorators/Mount";
export type { UnmountLike } from "./decorators/Mount";

export { Watch, setupWatchers, WATCH_PROPERTIES } from "./decorators/Watch";
export type { WatchConfig } from "./decorators/Watch";

export { Child, getChildSlots, CHILD_METADATA_KEY } from "./decorators/Child";
export type { ChildType } from "./decorators/Child";

export { UseGuards, GUARDS_TOKEN } from "./decorators/Guard";
export type { Guard, GuardClass, GuardType } from "./decorators/Guard";

export { UseResolvers, RESOLVERS_METADATA } from "./decorators/Resolver";
export type {
  Resolver,
  ResolverClass,
  ResolverType,
  ResolvedData,
} from "./decorators/Resolver";

export { UseProviders } from "./decorators/UseProviders";

export {
  LoadData,
  getLoadDataState,
  RenderState,
  RENDER_STATE,
} from "./decorators/LoadData";

// Helpers
export {
  toObservable,
  signal,
  unwrap,
  isPrimitive,
  updateTextNode,
  logComponentHierarchy,
} from "./helpers";

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
