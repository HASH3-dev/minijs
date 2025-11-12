import { lifecycleManager } from "./LifecycleManager";
import { StatefulRenderPlugin } from "./StatefulRenderPlugin";
import { GuardDecoratorPlugin } from "../resources/Guard/GuardPlugin";
import { ResolverDecoratorPlugin } from "../resources/Resolver/ResolverPlugin";
import { MountDecoratorPlugin } from "../resources/Mount/MountPlugin";
import { WatchDecoratorPlugin } from "../resources/Watch/WatchPlugin";
import { UseProvidersPlugin } from "../resources/Provider/UseProvidersPlugin";

/**
 * Register all default framework plugins
 * This is called automatically when the core module is imported
 */
export function registerDefaultPlugins() {
  // Register @UseProviders plugin (priority 1 - runs FIRST at Created phase to setup DI)
  lifecycleManager.registerHook(new UseProvidersPlugin());

  // Register @UseGuards plugin (priority 3 - runs at Created phase)
  lifecycleManager.registerHook(new GuardDecoratorPlugin());

  // Register StatefulRender plugin (priority 5 - enables state-based rendering)
  lifecycleManager.registerHook(new StatefulRenderPlugin());

  // Register @UseResolvers plugin (priority 20 - runs at Created phase after Guards)
  lifecycleManager.registerHook(new ResolverDecoratorPlugin());

  // Register @Watch plugin (priority 50 - runs at AfterMount)
  lifecycleManager.registerHook(new WatchDecoratorPlugin());

  // Register @Mount plugin (priority 100 - runs at AfterMount after @Watch)
  lifecycleManager.registerHook(new MountDecoratorPlugin());
}

// Auto-register plugins when module is imported
registerDefaultPlugins();
