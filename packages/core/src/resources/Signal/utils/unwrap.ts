import { Signal } from "../Signal";

/**
 * Get the current value from a BehaviorSubject
 */
export const unwrap = <T>(val: Signal<T>): T => val.value;
