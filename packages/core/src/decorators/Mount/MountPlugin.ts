import { DecoratorPlugin } from "../../lifecycle/DecoratorPlugin";
import { Component } from "../../base/Component";
import { MOUNT_METHODS } from "./constants";
import { LifecyclePhase } from "../../base/ReactiveComponent";
import { isObservable, takeUntil } from "rxjs";

/**
 * Plugin that executes @Mount decorated methods
 * Executed by LifecycleManager at AfterMount phase
 */
export class MountDecoratorPlugin extends DecoratorPlugin {
  readonly id = "mount-decorator";
  readonly phase = LifecyclePhase.AfterMount;
  readonly priority = 100;

  /**
   * Execute mount methods
   * Called by LifecycleManager when AfterMount phase is reached
   */
  execute(component: Component): void {
    // Get mount methods from metadata
    const mountMethods = this.getMetadata<Function[]>(component, MOUNT_METHODS);

    if (!mountMethods || mountMethods.length === 0) {
      return;
    }

    // Execute all mount methods
    for (const method of mountMethods) {
      try {
        const cleanup = method.call(component);

        if (isObservable(cleanup)) {
          cleanup.pipe(takeUntil(component.$.unmount$)).subscribe();
        } else if (typeof cleanup === "function") {
          this.registerCleanup(component, cleanup);
        }
      } catch (error) {
        console.error(
          `[MountPlugin] Error executing mount method in ${component.constructor.name}:`,
          error
        );
        component.emitError(error as Error);
      }
    }
  }
}
