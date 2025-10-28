/**
 * Metadata key for storing child slot information
 */

/**
 * Enum for component render states
 * Used by Resolvers, LoadData, and other async operations
 */
export enum RenderState {
  IDLE = "idle",
  LOADING = "loading",
  SUCCESS = "success",
  ERROR = "error",
  EMPTY = "empty",
}
