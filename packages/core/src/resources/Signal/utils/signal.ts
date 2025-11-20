import { Signal } from "../Signal";

/**
 * Create a new BehaviorSubject (signal)
 */
export const signal = <T>(val?: T): Signal<T> => new Signal(val) as any;
