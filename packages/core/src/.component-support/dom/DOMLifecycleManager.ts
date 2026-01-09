import { ILifecycleManager } from "../abstractions/ILifecycleManager";
import { Signal } from "../../resources";

/**
 * DOM implementation of lifecycle management
 * Manages mounted$ and unmount$ observables for DOM components
 */
export class DOMLifecycleManager implements ILifecycleManager {
  private mounted$ = new Signal<void>();
  private unmount$ = new Signal<void>();

  getMounted$() {
    return this.mounted$.asObservable();
  }

  getUnmount$() {
    return this.unmount$.asObservable();
  }

  triggerMounted() {
    this.mounted$.next();
  }

  triggerUnmount() {
    this.unmount$.next();
    this.complete();
  }

  complete() {
    this.mounted$.complete();
    this.unmount$.complete();
  }
}
