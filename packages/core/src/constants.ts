/**
 * Core framework symbols used internally
 */

/** Symbol for storing DOM cache on component instances */
export const DOM_CACHE = Symbol("__mini_dom_cache");

/** Symbol for tracking lifecycle execution state */
export const LIFECYCLE_EXECUTED = Symbol("__mini_lifecycle_executed");

/** Symbol for storing parent component reference */
export const PARENT_COMPONENT = Symbol("__mini_parent_component");

/** Symbol for storing parent component reference */
export const CHILDREN_HIERARCHY = Symbol("__mini_children_hierarchy");

/** Symbol for storing component instance on DOM nodes */
export const COMPONENT_INSTANCE = Symbol("__mini_instance");

/** Symbol for storing MutationObserver reference on DOM nodes */
export const MUTATION_OBSERVER = Symbol("__mini_observer");

export const COMPONENT_PLACEHOLDER = Symbol("__mini_component");

/** Symbol for storing component render state (loading/error/empty/success) */
export const RENDER_STATE = Symbol("__mini_render_state");

/** Symbol for tracking last render method used */
export const LAST_RENDER_METHOD = Symbol("__mini_last_render_method");

/** Symbol for storing Injector instance on services/components */
export const INJECTABLE_INJECTOR = Symbol("__mini_injector");

/** Symbol for storing component reference on service instances */
export const SERVICE_COMPONENT = Symbol("__mini_service_component");

/** Symbol for storing subscriptions on DOM nodes */
export const SUBSCRIPTIONS = Symbol("__mini_subs");
