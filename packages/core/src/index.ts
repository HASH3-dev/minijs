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

// Component - Now imports from base/index.ts which handles V1/V2 selection
export { Component, RenderStateValues } from "./base/Component";

// Decorators
export * from "./resources";

// Helpers
export * from "./helpers";

// Application
// V1 (current implementation)
export { Application } from "./Application";

// Common exports
export { RenderResult } from "./RenderResult";
export type {
  RenderOptions,
  CreateOptions,
  ComponentClass,
} from "./Application";

/**
 * NOTE: To use V2, you need to manually import ApplicationV2:
 *
 * @example
 * ```typescript
 * import { RenderingConfig, RenderingVersion, ApplicationV2 as Application } from '@minijs/core';
 *
 * // Optional: Set version for other components
 * RenderingConfig.setVersion(RenderingVersion.V2);
 *
 * const app = new Application(AppRouter);
 * app.mount('#app');
 * ```
 *
 * Or use Application (V1) by default:
 * ```typescript
 * import { Application } from '@minijs/core';
 *
 * const app = new Application(AppRouter);
 * app.mount('#app');
 * ```
 */

// Dependency Injection
export {
  Injectable,
  Inject,
  Injector,
  validateDependencyGraph,
} from "./resources/DenpendencyInjection";
export {
  InjectionScope,
  InjectionToken,
} from "./resources/DenpendencyInjection";
export type {
  Token,
  Provider as DIProvider,
  ProviderShorthand,
  InjectableOptions,
} from "./resources/DenpendencyInjection";

// JSX
export { jsx, jsxs, jsxDEV, Fragment } from "./jsx-v2";

export type * from "./types";
