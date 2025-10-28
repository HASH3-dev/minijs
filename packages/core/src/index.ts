// Constants
export {
  DOM_CACHE,
  LIFECYCLE_EXECUTED,
  PARENT_COMPONENT,
  COMPONENT_INSTANCE,
  MUTATION_OBSERVER,
  COMPONENT_PLACEHOLDER,
} from "./constants";

// Component
export { Component } from "./Component";
export { Provider } from "./ProviderComponent";

// Decorators
export { Mount, MOUNT_METHODS } from "./decorators/Mount";
export type { UnmountLike } from "./decorators/Mount";

export { Watch, setupWatchers, WATCH_PROPERTIES } from "./decorators/Watch";
export type { WatchConfig } from "./decorators/Watch";

export { Child, getChildSlots, CHILD_METADATA_KEY } from "./decorators/Child";
export type { ChildType } from "./decorators/Child";

export { UseGuards, GUARDS_TOKEN } from "./decorators/Guard";
export type { GuardInterface, GuardClass, GuardType } from "./decorators/Guard";

export { UseResolvers, RESOLVERS_METADATA } from "./decorators/Resolver";
export type {
  ResolverInterface,
  ResolverClass,
  ResolverType,
  ResolvedData,
} from "./decorators/Resolver";

export {
  LoadData,
  getLoadDataState,
  RenderState,
  RENDER_STATE,
} from "./decorators/LoadData";

// Helpers
export { toObservable, signal, unwrap } from "./helpers";

// Application
export { Application } from "./Application";
export type {
  RenderOptions,
  CreateOptions,
  ComponentClass,
} from "./Application";
