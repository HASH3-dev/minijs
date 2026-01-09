import { Injector } from "../../resources/DenpendencyInjection/Injector";
import {
  INJECTOR_TOKEN,
  GET_PARENT_INJECTOR,
} from "../../resources/DenpendencyInjection";
import { PARENT_COMPONENT } from "../../constants";
import { IInjectorFacade } from "../abstractions/IInjectorFacade";

/**
 * DOM implementation of injector facade
 * Manages dependency injection for components
 */
export class DOMInjectorFacade implements IInjectorFacade {
  private component?: any;
  private injector?: Injector;

  constructor(component?: any) {
    this.component = component;
  }

  setComponent(component: any): void {
    this.component = component;
  }

  getOrCreate(): Injector {
    if (!this.component) {
      throw new Error("[DOMInjectorFacade] Component not set");
    }

    // Try own injector first
    if (this.component[INJECTOR_TOKEN]) {
      return this.component[INJECTOR_TOKEN];
    }

    // No own injector - create one lazily
    if (!this.injector) {
      this.injector = new Injector();
      this.component[INJECTOR_TOKEN] = this.injector;
    }

    return this.injector;
  }

  getParentInjector(component: any): Injector | undefined {
    const targetComponent = component || this.component;
    if (!targetComponent) {
      return undefined;
    }
    let current = targetComponent[PARENT_COMPONENT];
    while (current) {
      if (current[INJECTOR_TOKEN]) {
        return current[INJECTOR_TOKEN];
      }
      current = current[PARENT_COMPONENT];
    }
    return undefined;
  }

  setInjector(injector: Injector): void {
    this.injector = injector;
    if (this.component) {
      this.component[INJECTOR_TOKEN] = injector;
    }
  }

  hasInjector(): boolean {
    return (
      !!(this.component && this.component[INJECTOR_TOKEN]) || !!this.injector
    );
  }
}
