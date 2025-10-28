/**
 * Constants used by the Dependency Injection system
 */

/** Symbol for storing injector reference on component instances */
export const INJECTOR_TOKEN = Symbol("__mini_injector");

export const GET_PARENT_INJECTOR = Symbol("__getParentInjector");

/** Symbol for storing scope metadata on injectable classes */
export const SCOPE_METADATA = Symbol("__mini_scope_metadata");
