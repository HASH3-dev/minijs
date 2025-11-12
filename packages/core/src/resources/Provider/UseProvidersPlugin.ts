/**
 * UseProvidersPlugin
 * Executes during Created phase to setup DI
 */
import { DecoratorPlugin } from "../../lifecycle/DecoratorPlugin";
import { LifecyclePhase } from "../../base/ReactiveComponent";
import type { Component } from "../../base/Component";
import { USE_PROVIDERS_METADATA } from "./constants";
import type { UseProvidersMetadata } from "./types";
import { PARENT_COMPONENT } from "../../constants";
import { getOrCreateInjector } from "../DenpendencyInjection";

/**
 * Plugin that processes @UseProviders decorator
 * Sets up injector and providers in Application registry
 * Executes in Created phase with priority 1 (very early, before other DI operations)
 */
export class UseProvidersPlugin extends DecoratorPlugin {
  readonly id = "use-providers-decorator";
  readonly phase = LifecyclePhase.Created;
  readonly priority = 1; // Execute very early, before resolvers/guards

  execute(component: Component): void {
    let providers: any[] = [];

    // Check for metadata first
    const metadata = this.getMetadata<UseProvidersMetadata>(
      component,
      USE_PROVIDERS_METADATA
    );

    if (metadata && metadata.providers && metadata.providers.length > 0) {
      providers = metadata.providers;
    }
    // Special case: Provider component gets providers from props
    else if (
      component.constructor.name === "Provider" &&
      (component as any).props?.values
    ) {
      providers = (component as any).props.values;
    }

    if (providers.length === 0) {
      return;
    }

    // Get parent component for hierarchy
    const parentComponent = (component as any)[PARENT_COMPONENT];

    // Create injector and setup providers in Application registry
    getOrCreateInjector(component, providers, parentComponent);
  }
}
