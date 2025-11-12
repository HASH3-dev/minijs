import { Component } from "../base/Component";
import { LifecycleHook } from "./LifecycleManager";
import { LifecyclePhase } from "../base/ReactiveComponent";

/**
 * Base class for decorator-based plugins
 * Provides helper methods for reading metadata and registering cleanup
 */
export abstract class DecoratorPlugin implements LifecycleHook {
  abstract readonly id: string;
  abstract readonly phase: LifecyclePhase;
  abstract readonly priority: number;

  /**
   * Execute plugin logic
   * Subclasses implement this to perform their work
   */
  abstract execute(component: Component): void | Promise<void>;

  /**
   * Helper to get metadata from component
   * @param component Component instance
   * @param key Metadata key (usually a Symbol)
   */
  protected getMetadata<T>(
    component: Component,
    key: symbol | string
  ): T | undefined {
    // First try reflect-metadata API (used by decorators)
    const proto = Object.getPrototypeOf(component);
    if (Reflect.hasMetadata(key, proto)) {
      return Reflect.getMetadata(key, proto);
    }

    // Check constructor
    if (Reflect.hasMetadata(key, component.constructor)) {
      return Reflect.getMetadata(key, component.constructor);
    }

    // Fallback: Check instance directly
    if ((component as any)[key]) {
      return (component as any)[key];
    }

    // Fallback: Check prototype directly
    if (proto && proto[key]) {
      return proto[key];
    }

    // Fallback: Check constructor directly
    if ((component.constructor as any)[key]) {
      return (component.constructor as any)[key];
    }

    return undefined;
  }

  /**
   * Helper to register cleanup function
   * @param component Component instance
   * @param cleanupFn Cleanup function to register
   */
  protected registerCleanup(component: Component, cleanupFn: () => void): void {
    component.registerCleanup(cleanupFn);
  }
}
