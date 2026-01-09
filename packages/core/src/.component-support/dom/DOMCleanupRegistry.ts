import { ICleanupRegistry } from "../abstractions/ICleanupRegistry";

/**
 * DOM implementation of cleanup registry
 * Manages cleanup functions that should be executed when component is destroyed
 */
export class DOMCleanupRegistry implements ICleanupRegistry {
  private cleanups: Array<() => void> = [];

  register(fn: () => void): void {
    this.cleanups.push(fn);
  }

  execute(): void {
    this.cleanups.forEach((fn) => {
      try {
        fn();
      } catch (error) {
        console.error("[DOMCleanupRegistry] Error executing cleanup:", error);
      }
    });
    this.clear();
  }

  clear(): void {
    this.cleanups = [];
  }

  getCount(): number {
    return this.cleanups.length;
  }
}
