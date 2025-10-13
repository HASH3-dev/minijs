import { Subject } from "rxjs";

export type UnmountLike = Subject<void>;

/**
 * Metadata key for storing child slot information
 */
export const CHILD_METADATA_KEY = Symbol("__mini_child_slots");
