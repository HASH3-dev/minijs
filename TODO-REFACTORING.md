# 🏗️ Mini Framework - Architectural Refactoring Plan

> **Status**: Planning Phase
> **Version**: 1.0
> **Last Updated**: October 28, 2025
> **Author**: Mini Framework Core Team

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current Problems](#current-problems)
3. [Proposed Architecture](#proposed-architecture)
4. [Implementation Phases](#implementation-phases)
5. [Plugin System Design](#plugin-system-design)
6. [Style Guide for Extensibility](#style-guide-for-extensibility)
7. [Migration Strategy](#migration-strategy)
8. [Testing Strategy](#testing-strategy)
9. [Breaking Changes](#breaking-changes)
10. [Timeline & Effort Estimation](#timeline--effort-estimation)

---

## 1. Executive Summary

### 🎯 Goals

This refactoring aims to transform Mini Framework into a truly extensible, maintainable, and reactive framework by:

1. **Separating Concerns**: Break down monolithic classes into single-responsibility components
2. **Plugin Architecture**: Enable developers to extend framework behavior without modifying core
3. **Reactive by Default**: Make lifecycle and state changes fully observable
4. **Type-Safe**: Improve type safety and developer experience
5. **Testable**: Enable unit testing of individual components

### 🚀 Key Benefits

- **For Core Developers**: Easier maintenance, clearer code organization
- **For Plugin Developers**: Clear extension points and documented APIs
- **For Framework Users**: More predictable behavior, better debugging
- **For the Ecosystem**: Enable community-driven decorator/plugin ecosystem

### ⚠️ Impact

- **Breaking Changes**: Yes, but with clear migration path
- **Performance**: Neutral to slightly improved (better caching)
- **Bundle Size**: Slight increase (~5-10%) due to plugin system overhead
- **Migration Effort**: Medium (2-3 days for typical app)

---

## 2. Current Problems

### 2.1 Monolithic Application Class (500+ lines)

**File**: `packages/core/src/Application.ts`

**Issues**:
```typescript
class Application {
  // Handles component rendering
  private static renderBottomUp() { /* 100+ lines */ }

  // Handles DOM tree processing
  private static processRenderedTree() { /* 80+ lines */ }

  // Handles parent setting
  private static setParentForTree() { /* 40+ lines */ }

  // Handles lifecycle
  private static executeLifecycle() { /* 30+ lines */ }

  // Handles children rendering
  private static renderChildren() { /* 50+ lines */ }

  // ... and more
}
```

**Problems**:
- ❌ Single Responsibility Principle violated
- ❌ Hard to test individual concerns
- ❌ No clear extension points
- ❌ Tightly coupled to all decorator implementations

### 2.2 Decorator Knowledge Hardcoded

**Current**:
```typescript
// Application.ts
import { setupWatchers } from "./decorators/Watch";
import { MOUNT_METHODS } from "./decorators/Mount/constants";

private static executeLifecycle(component: Component) {
  setupWatchers(component);  // Hardcoded @Watch knowledge

  const mountMethods = component[MOUNT_METHODS];  // Hardcoded @Mount knowledge
  mountMethods.forEach(fn => fn.call(component));

  // How do we add @BeforeMount, @AfterMount, @LoadData, etc.?
  // We have to modify this function every time!
}
```

**Problems**:
- ❌ Can't add new lifecycle hooks without modifying core
- ❌ No guaranteed execution order
- ❌ Decorators can't coordinate with each other

### 2.3 Observable Handling Scattered

**Files**: `jsx/dom.ts`, `Application.ts`

```typescript
// jsx/dom.ts - handles Observable in children
if (obs) {
  obs.subscribe((val) => {
    // 100+ lines of complex logic
  });
}

// Application.ts - handles Observable from render()
const obs = toObservable(domResult);
if (obs) {
  obs.subscribe((value) => {
    // Different implementation!
  });
}
```

**Problems**:
- ❌ Two different Observable handling implementations
- ❌ Hard to maintain consistency
- ❌ Cleanup logic duplicated

### 2.4 Implicit Lifecycle States

```typescript
class Component {
  // Lifecycle is implicit via internal flags
  private __lifecycle_signals = {
    unmount$: new Subject<void>(),
    mounted$: new Subject<void>()
  };

  // Where's beforeMount? afterRender? rendering?
  // How do we know the current state?
}
```

**Problems**:
- ❌ No explicit state machine
- ❌ Can't observe full lifecycle
- ❌ Hard to debug when things go wrong

### 2.5 Testing Difficulties

```typescript
// How do you test this?
private static renderBottomUp(component: Component): Node {
  // Depends on:
  // - Static state (currentRenderingInstance)
  // - DOM APIs
  // - Component lifecycle
  // - All decorators
  // - Cache mechanism
  // - Parent/child relationships

  // Good luck mocking all of this!
}
```

---

## 3. Proposed Architecture

### 3.1 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Application                           │
│                    (Orchestration only)                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ├──── ComponentRenderer
                       │     └── RenderContext
                       │
                       ├──── LifecycleManager
                       │     └── LifecycleHook[] (plugins)
                       │
                       ├──── ObservableRenderer
                       │     └── ObservableContainer
                       │
                       └──── DOMTreeProcessor
                             └── NodeVisitor pattern

┌─────────────────────────────────────────────────────────────┐
│                      Component Base                          │
│                   (Composition Pattern)                      │
├─────────────────────────────────────────────────────────────┤
│  ReactiveComponent (lifecycle$, state$)                     │
│      │                                                        │
│      └─ RenderableComponent (render(), cache)               │
│             │                                                 │
│             └─ CleanableComponent (cleanup registry)        │
│                    │                                          │
│                    └─ Component<P> (props, children)        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Decorator Plugins                         │
│              (LifecycleHook implementations)                 │
├─────────────────────────────────────────────────────────────┤
│  @Mount   → MountDecoratorPlugin                            │
│  @Watch   → WatchDecoratorPlugin                            │
│  @Guard   → GuardDecoratorPlugin                            │
│  @LoadData → LoadDataDecoratorPlugin                        │
│  ...       → CustomDecoratorPlugin (user-defined)           │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Component Base Classes (Composition)

**File**: `packages/core/src/base/ReactiveComponent.ts`

```typescript
import { BehaviorSubject, Observable, Subject } from 'rxjs';

export type LifecycleState =
  | 'created'
  | 'beforeRender'
  | 'rendering'
  | 'rendered'
  | 'beforeMount'
  | 'mounted'
  | 'beforeUnmount'
  | 'unmounted'
  | 'destroyed';

/**
 * Base class providing reactive lifecycle management
 * All lifecycle transitions are observable
 */
export abstract class ReactiveComponent {
  private _lifecycle$ = new BehaviorSubject<LifecycleState>('created');
  private _error$ = new Subject<Error>();

  /**
   * Observable of current lifecycle state
   * Emits whenever component transitions between states
   */
  get lifecycle$(): Observable<LifecycleState> {
    return this._lifecycle$.asObservable();
  }

  /**
   * Observable of component errors
   */
  get error$(): Observable<Error> {
    return this._error$.asObservable();
  }

  /**
   * Get current lifecycle state
   */
  get lifecycleState(): LifecycleState {
    return this._lifecycle$.value;
  }

  /**
   * Transition to a new lifecycle state
   * @internal - Should only be called by framework
   */
  protected transitionTo(state: LifecycleState): void {
    const current = this._lifecycle$.value;
    console.log(`[Lifecycle] ${this.constructor.name}: ${current} → ${state}`);
    this._lifecycle$.next(state);
  }

  /**
   * Emit an error
   * @internal
   */
  protected emitError(error: Error): void {
    this._error$.next(error);
  }
}
```

**File**: `packages/core/src/base/RenderableComponent.ts`

```typescript
import { ReactiveComponent } from './ReactiveComponent';

/**
 * Adds rendering capabilities and caching
 */
export abstract class RenderableComponent extends ReactiveComponent {
  private _renderCache?: Node;
  private _cachedParent?: any;

  /**
   * Main render method - must be implemented
   */
  abstract render(): any;

  /**
   * Get cached render result
   * @internal
   */
  getCachedRender(): Node | undefined {
    return this._renderCache;
  }

  /**
   * Set render cache
   * @internal
   */
  setCachedRender(node: Node, parent: any): void {
    this._renderCache = node;
    this._cachedParent = parent;
  }

  /**
   * Clear render cache
   * @internal
   */
  clearRenderCache(): void {
    this._renderCache = undefined;
    this._cachedParent = undefined;
  }

  /**
   * Check if cache is valid
   * @internal
   */
  isCacheValid(currentParent: any): boolean {
    return this._renderCache !== undefined &&
           this._cachedParent === currentParent;
  }
}
```

**File**: `packages/core/src/base/CleanableComponent.ts`

```typescript
import { RenderableComponent } from './RenderableComponent';

/**
 * Adds cleanup capability
 */
export abstract class CleanableComponent extends RenderableComponent {
  private _cleanupFns: Array<() => void> = [];

  /**
   * Register a cleanup function
   * Will be called when component is destroyed
   */
  registerCleanup(fn: () => void): void {
    this._cleanupFns.push(fn);
  }

  /**
   * Destroy component and run all cleanups
   */
  destroy(): void {
    this.transitionTo('beforeUnmount');

    // Run all cleanup functions
    this._cleanupFns.forEach(fn => {
      try {
        fn();
      } catch (error) {
        console.error(`Cleanup error in ${this.constructor.name}:`, error);
      }
    });

    this._cleanupFns = [];
    this.transitionTo('unmounted');
    this.clearRenderCache();
    this.transitionTo('destroyed');
  }
}
```

**File**: `packages/core/src/Component.ts`

```typescript
import { CleanableComponent } from './base/CleanableComponent';
import { PARENT_COMPONENT } from './constants';

/**
 * Final Component class that users extend
 */
export abstract class Component<P extends Record<string, any> = {}>
  extends CleanableComponent {

  props!: Readonly<P & { slot?: string }>;
  children?: any;

  [PARENT_COMPONENT]?: Component;

  constructor() {
    super();
  }

  /**
   * Convenience API for common lifecycle events
   * Provides easy access to mounted$ and unmount$ observables
   */
  get $() {
    return {
      unmount$: this.lifecycle$.pipe(
        filter(state => state === 'unmounted')
      ),
      mounted$: this.lifecycle$.pipe(
        filter(state => state === 'mounted')
      )
    };
  }
}
```

### 3.3 ComponentRenderer (Single Responsibility)

**File**: `packages/core/src/rendering/ComponentRenderer.ts`

```typescript
import { Component } from '../Component';
import { DOMTreeProcessor } from './DOMTreeProcessor';
import { ObservableRenderer } from './ObservableRenderer';

/**
 * Handles component rendering with proper context management
 */
export class ComponentRenderer {
  private renderingStack: Component[] = [];
  private domProcessor: DOMTreeProcessor;
  private observableRenderer: ObservableRenderer;

  constructor() {
    this.domProcessor = new DOMTreeProcessor();
    this.observableRenderer = new ObservableRenderer();
  }

  /**
   * Get current rendering component
   */
  getCurrentRenderingInstance(): Component | undefined {
    return this.renderingStack[this.renderingStack.length - 1];
  }

  /**
   * Render a component to DOM
   */
  render(component: Component): Node {
    // Check cache
    const parent = component[PARENT_COMPONENT];
    if (component.isCacheValid(parent)) {
      return component.getCachedRender()!;
    }

    // Setup rendering context
    this.renderingStack.push(component);
    component.transitionTo('beforeRender');

    try {
      component.transitionTo('rendering');

      // Execute render method
      let result = component.render();

      // Check if result is Observable
      if (this.isObservable(result)) {
        result = this.observableRenderer.render(result, component);
      }

      // Process the tree
      const domNode = this.domProcessor.process(result, component);

      // Cache result
      component.setCachedRender(domNode, parent);
      component.transitionTo('rendered');

      return domNode;

    } catch (error) {
      component.emitError(error as Error);
      throw error;
    } finally {
      this.renderingStack.pop();
    }
  }

  private isObservable(value: any): boolean {
    return value && typeof value.subscribe === 'function';
  }
}
```

### 3.4 LifecycleManager (Plugin System)

**File**: `packages/core/src/lifecycle/LifecycleManager.ts`

```typescript
import { Component } from '../Component';

export type LifecyclePhase =
  | 'beforeRender'
  | 'afterRender'
  | 'beforeMount'
  | 'afterMount'
  | 'beforeUnmount';

export interface HookContext {
  phase: LifecyclePhase;
  component: Component;
  [key: string]: any;
}

/**
 * Interface that all lifecycle hooks must implement
 */
export interface LifecycleHook {
  /**
   * Priority determines execution order (0-1000)
   * Lower numbers execute first
   */
  readonly priority: number;

  /**
   * Which lifecycle phase this hook runs in
   */
  readonly phase: LifecyclePhase;

  /**
   * Unique identifier for this hook
   */
  readonly id: string;

  /**
   * Execute the hook
   * Can be async - framework will wait
   */
  execute(component: Component, context: HookContext): void | Promise<void>;
}

/**
 * Manages lifecycle hooks and their execution
 */
export class LifecycleManager {
  private hooks = new Map<LifecyclePhase, LifecycleHook[]>();

  /**
   * Register a lifecycle hook
   */
  registerHook(hook: LifecycleHook): void {
    const phaseHooks = this.hooks.get(hook.phase) || [];

    // Check for duplicate IDs
    if (phaseHooks.some(h => h.id === hook.id)) {
      throw new Error(`Hook with id "${hook.id}" already registered`);
    }

    phaseHooks.push(hook);

    // Sort by priority
    phaseHooks.sort((a, b) => a.priority - b.priority);

    this.hooks.set(hook.phase, phaseHooks);

    console.log(`[LifecycleManager] Registered hook: ${hook.id} (priority: ${hook.priority})`);
  }

  /**
   * Unregister a hook by ID
   */
  unregisterHook(id: string): void {
    for (const [phase, hooks] of this.hooks.entries()) {
      const filtered = hooks.filter(h => h.id !== id);
      this.hooks.set(phase, filtered);
    }
  }

  /**
   * Execute all hooks for a phase
   */
  async executePhase(
    phase: LifecyclePhase,
    component: Component,
    additionalContext?: Record<string, any>
  ): Promise<void> {
    const hooks = this.hooks.get(phase) || [];

    if (hooks.length === 0) return;

    const context: HookContext = {
      phase,
      component,
      ...additionalContext
    };

    for (const hook of hooks) {
      try {
        await hook.execute(component, context);
      } catch (error) {
        console.error(`[LifecycleManager] Error in hook ${hook.id}:`, error);
        component.emitError(error as Error);
        // Don't stop execution - let other hooks run
      }
    }
  }

  /**
   * Get all registered hooks for debugging
   */
  getHooks(): Map<LifecyclePhase, LifecycleHook[]> {
    return new Map(this.hooks);
  }
}

// Global instance
export const lifecycleManager = new LifecycleManager();
```

### 3.5 Decorator Plugin Base

**File**: `packages/core/src/lifecycle/DecoratorPlugin.ts`

```typescript
import { LifecycleHook, LifecyclePhase, HookContext } from './LifecycleManager';
import { Component } from '../Component';

/**
 * Base class for decorator-based lifecycle hooks
 * Makes it easy to create new decorators
 */
export abstract class DecoratorPlugin implements LifecycleHook {
  abstract readonly priority: number;
  abstract readonly phase: LifecyclePhase;
  abstract readonly id: string;

  /**
   * Execute the decorator logic
   * Subclasses should implement this
   */
  abstract execute(component: Component, context: HookContext): void | Promise<void>;

  /**
   * Helper to get metadata from component
   */
  protected getMetadata<T>(component: Component, key: string): T | undefined {
    return (component.constructor.prototype as any)[key];
  }

  /**
   * Helper to register cleanup
   */
  protected registerCleanup(component: Component, fn: () => void): void {
    component.registerCleanup(fn);
  }
}
```

---

## 4. Implementation Phases

### Phase 1: Base Classes & Lifecycle System (Week 1)

#### Goals
- Create reactive base classes
- Implement LifecycleManager
- Set up plugin infrastructure

#### Tasks

**1.1 Create Base Classes**
- [ ] Create `packages/core/src/base/` directory
- [ ] Implement `ReactiveComponent.ts`
- [ ] Implement `RenderableComponent.ts`
- [ ] Implement `CleanableComponent.ts`
- [ ] Update `Component.ts` to extend `CleanableComponent`
- [ ] Add backward compatibility layer for `$` property

**1.2 Implement LifecycleManager**
- [ ] Create `packages/core/src/lifecycle/` directory
- [ ] Implement `LifecycleManager.ts`
- [ ] Implement `DecoratorPlugin.ts`
- [ ] Add tests for `LifecycleManager`
- [ ] Add documentation

**1.3 Update Application**
- [ ] Create global `lifecycleManager` instance
- [ ] Update `Application.executeLifecycle()` to use `lifecycleManager`
- [ ] Add lifecycle transitions in render process

**Success Criteria**
- ✅ All tests pass
- ✅ Lifecycle states are observable
- ✅ Plugin registration works
- ✅ Backward compatibility maintained

---

### Phase 2: Migrate @Mount & @Watch to Plugins (Week 2)

#### Goals
- Migrate existing decorators to plugin system
- Prove the plugin architecture works
- Establish patterns for other decorators

#### Tasks

**2.1 Migrate @Mount**
- [ ] Create `packages/core/src/decorators/Mount/MountPlugin.ts`
- [ ] Implement `MountDecoratorPlugin extends DecoratorPlugin`
- [ ] Register plugin in `lifecycleManager`
- [ ] Update tests
- [ ] Document migration pattern

**2.2 Migrate @Watch**
- [ ] Create `packages/core/src/decorators/Watch/WatchPlugin.ts`
- [ ] Implement `WatchDecoratorPlugin extends DecoratorPlugin`
- [ ] Ensure it runs before @Mount (lower priority)
- [ ] Register plugin
- [ ] Update tests

**2.3 Remove Hardcoded Logic**
- [ ] Remove `setupWatchers()` call from `Application`
- [ ] Remove `MOUNT_METHODS` handling from `Application`
- [ ] Verify all tests still pass

**Success Criteria**
- ✅ @Mount and @Watch work via plugins
- ✅ No hardcoded decorator logic in Application
- ✅ Plugin execution order is correct
- ✅ All existing functionality preserved

---

### Phase 3: Renderer Refactoring (Week 3)

#### Goals
- Extract rendering concerns into dedicated classes
- Simplify Application class
- Improve testability

#### Tasks

**3.1 Create ComponentRenderer**
- [ ] Create `packages/core/src/rendering/` directory
- [ ] Implement `ComponentRenderer.ts`
- [ ] Extract `renderBottomUp` logic
- [ ] Handle rendering context stack
- [ ] Add tests

**3.2 Create DOMTreeProcessor**
- [ ] Implement `DOMTreeProcessor.ts`
- [ ] Extract `processRenderedTree` logic
- [ ] Implement visitor pattern for nodes
- [ ] Add tests

**3.3 Create ObservableRenderer**
- [ ] Implement `ObservableRenderer.ts`
- [ ] Extract Observable handling from `jsx/dom.ts`
- [ ] Unify Observable rendering logic
- [ ] Add tests

**3.4 Refactor Application**
- [ ] Use `ComponentRenderer` instead of static methods
- [ ] Remove `renderBottomUp`, `processRenderedTree`, etc.
- [ ] Keep only orchestration logic
- [ ] Update all references

**Success Criteria**
- ✅ Application.ts < 200 lines
- ✅ Each renderer class has single responsibility
- ✅ All rendering tests pass
- ✅ No duplicate Observable handling

---

### Phase 4: JSX Simplification (Week 4)

#### Goals
- Simplify JSX runtime
- Remove business logic from JSX layer
- Improve maintainability

#### Tasks

**4.1 Simplify jsx/index.ts**
- [ ] Remove rendering logic
- [ ] Focus only on component instantiation
- [ ] Use `ComponentRenderer.getCurrentRenderingInstance()`
- [ ] Remove duplicate parent tracking

**4.2 Simplify jsx/dom.ts**
- [ ] Move Observable handling to `ObservableRenderer`
- [ ] Keep only DOM manipulation
- [ ] Remove component lifecycle concerns
- [ ] Update tests

**4.3 Clean Up**
- [ ] Remove unused code
- [ ] Update imports
- [ ] Add documentation
- [ ] Verify bundle size

**Success Criteria**
- ✅ jsx/ package has clear responsibilities
- ✅ No business logic in JSX layer
- ✅ Easier to understand and maintain

---

### Phase 5: Documentation & Style Guide (Week 5)

#### Goals
- Document new architecture
- Create developer guides
- Enable community extensions

#### Tasks

**5.1 Architecture Documentation**
- [ ] Document base class hierarchy
- [ ] Document plugin system
- [ ] Document lifecycle phases
- [ ] Create architecture diagrams

**5.2 Plugin Developer Guide**
- [ ] How to create custom decorators
- [ ] How to register plugins
- [ ] Hook execution order
- [ ] Best practices
- [ ] Example custom plugin

**5.3 Migration Guide**
- [ ] Breaking changes list
- [ ] Migration steps
- [ ] Before/after examples
- [ ] Common pitfalls

**5.4 API Reference**
- [ ] Document all public APIs
- [ ] Add TSDoc comments
- [ ] Generate API docs
- [ ] Publish to docs site

**Success Criteria**
- ✅ Complete documentation
- ✅ Community can create plugins
- ✅ Clear migration path

---

## 5. Plugin System Design

### 5.1 How to Create a Plugin

```typescript
import { DecoratorPlugin, LifecyclePhase, HookContext } from '@mini/core';

/**
 * Example: @BeforeMount decorator plugin
 */
export class BeforeMountPlugin extends DecoratorPlugin {
  readonly id = 'before-mount';
  readonly priority = 90;  // Run just before @Mount (priority 100)
  readonly phase: LifecyclePhase = 'beforeMount';

  execute(component: Component, context: HookContext): void {
    // Get metadata stored by decorator
    const beforeMountMethods = this.getMetadata<Function[]>(
      component,
      '__beforeMountMethods'
    );

    if (!beforeMountMethods) return;

    // Execute all methods
    beforeMountMethods.forEach(method => {
      try {
        const cleanup = method.call(component);

        // If method returns cleanup function, register it
        if (typeof cleanup === 'function') {
          this.registerCleanup(component, cleanup);
        }
      } catch (error) {
        console.error(`Error in @BeforeMount:`, error);
        component.emitError(error as Error);
      }
    });
  }
}
```

### 5.2 Decorator Implementation

```typescript
import { BeforeMountPlugin, lifecycleManager } from '@mini/core';

// Register plugin globally
lifecycleManager.registerHook(new BeforeMountPlugin());

/**
 * @BeforeMount decorator
 */
export function BeforeMount() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    // Store method in metadata
    if (!target.__beforeMountMethods) {
      target.__beforeMountMethods = [];
    }
    target.__beforeMountMethods.push(originalMethod);

    return descriptor;
  };
}
```

### 5.3 Priority System

```typescript
// Execution order (lower priority = earlier execution)
const PRIORITIES = {
  // Before rendering
  GUARDS: 10,           // Check if component should render
  RESOLVERS: 20,        // Resolve data dependencies
  LOAD_DATA: 30,        // Load async data

  // After rendering
  WATCH: 50,            // Set up reactive watchers
  BEFORE_MOUNT: 90,     // Pre-mount setup
  MOUNT: 100,           // Main mount logic
  AFTER_MOUNT: 110,     // Post-mount work

  // User plugins
  CUSTOM_EARLY: 5,      // User plugin - early
  CUSTOM_LATE: 200,     // User plugin - late
};
```

### 5.4 Plugin Registration

```typescript
// In your app's entry point
import { lifecycleManager } from '@mini/core';
import { MyCustomPlugin } from './plugins/MyCustomPlugin';

// Register custom plugin
lifecycleManager.registerHook(new MyCustomPlugin());

// Start app
const app = new Application(rootComponent);
app.mount('#root');
```

---

## 6. Style Guide for Extensibility

### 6.1 Creating Custom Decorators

#### ✅ DO:

```typescript
// 1. Create a plugin class
export class MyPlugin extends DecoratorPlugin {
  readonly id = 'my-plugin';  // Unique ID
  readonly priority = 150;     // Choose wisely
  readonly phase = 'afterMount';

  execute(component: Component) {
    // Your logic here
  }
}

// 2. Register it
lifecycleManager.registerHook(new MyPlugin());

// 3. Create decorator
export function MyDecorator(options?: any) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    // Store metadata
    if (!target.__myPluginData) {
      target.__myPluginData = [];
    }
    target.__myPluginData.push({
      method: descriptor.value,
      options
    });

    return descriptor;
  };
}
```

#### ❌ DON'T:

```typescript
// Don't modify Application directly
class Application {
  private static executeLifecycle() {
    // DON'T ADD YOUR LOGIC HERE!
  }
}

// Don't use hardcoded metadata keys
const METADATA_KEY = 'myData';  // ❌ Could conflict

// Use symbols instead
const METADATA_KEY = Symbol('myData');  // ✅
```

### 6.2 Priority Guidelines

| Range | Purpose | Examples |
|-------|---------|----------|
| 0-50 | Pre-rendering hooks | Guards, Resolvers, LoadData |
| 50-100 | Setup hooks | Watch, DI setup |
| 100-150 | Mount hooks | BeforeMount, Mount, AfterMount |
| 150-200 | Post-mount hooks | Analytics, tracking |
| 200+ | Custom late hooks | User-defined |

### 6.3 Hook Execution Guarantees

✅ **Guaranteed**:
- Hooks execute in priority order
- Async hooks are awaited
- Errors in one hook don't stop others
- Cleanup functions are called on unmount

❌ **Not Guaranteed**:
- Execution time (hooks should be fast)
- Re-execution (idempotency is your responsibility)
- Order between same-priority hooks

### 6.4 Testing Plugins

```typescript
import { Component, lifecycleManager } from '@mini/core';
import { MyPlugin } from './MyPlugin';

describe('MyPlugin', () => {
  it('executes in correct phase', async () => {
    const plugin = new MyPlugin();
    lifecycleManager.registerHook(plugin);

    class TestComponent extends Component {
      render() { return <div>test</div>; }
    }

    const component = new TestComponent();

    // Mock the execute method
    const executeSpy = jest.spyOn(plugin, 'execute');

    // Trigger lifecycle
    await lifecycleManager.executePhase('afterMount', component);

    expect(executeSpy).toHaveBeenCalledWith(component, expect.any(Object));
  });
});
```

---

## 7. Migration Strategy

### 7.1 Migration Phases

#### Phase 1: Update Dependencies
```bash
npm install @mini/core@next @mini/jsx@next
```

#### Phase 2: Update Component Base
```typescript
// Before
class MyComponent extends Component {
  onMount() {
    this.$.unmount$.subscribe(() => cleanup());
  }
}

// After - Still works the same way!
class MyComponent extends Component {
  onMount() {
    // component.$ is still the recommended way for mount/unmount
    this.$.unmount$.subscribe(() => cleanup());

    // Or use lifecycle$ for more granular control
    this.lifecycle$.pipe(
      filter(state => state === 'unmounted')
    ).subscribe(() => cleanup());
  }
}
```

#### Phase 3: Optional - Use New APIs
```typescript
// New: Register cleanup directly
class MyComponent extends Component {
  @Mount()
  onMount() {
    const interval = setInterval(() => {}, 1000);

    // Old way (still works)
    this.$.unmount$.subscribe(() => clearInterval(interval));

    // New way (recommended)
    return () => clearInterval(interval);
  }
}
```

### 7.2 Breaking Changes Checklist

- [ ] Direct access to `__lifecycle_signals` will throw
- [ ] Custom lifecycle modification is now via plugins only
- [ ] `Application.renderBottomUp` is now private (use `Application.render`)

---

## 8. Testing Strategy

### 8.1 Unit Tests

**Base Classes**:
```typescript
describe('ReactiveComponent', () => {
  it('emits lifecycle transitions', (done) => {
    const component = new TestComponent();
    const states: LifecycleState[] = [];

    component.lifecycle$.subscribe(state => states.push(state));

    component.transitionTo('rendering');
    component.transitionTo('rendered');

    expect(states).toEqual(['created', 'rendering', 'rendered']);
    done();
  });
});
```

**LifecycleManager**:
```typescript
describe('LifecycleManager', () => {
  it('executes hooks in priority order', async () => {
    const manager = new LifecycleManager();
    const executed: string[] = [];

    manager.registerHook({
      id: 'second',
      priority: 200,
      phase: 'afterMount',
      execute: () => executed.push('second')
    });

    manager.registerHook({
      id: 'first',
      priority: 100,
      phase: 'afterMount',
      execute: () => executed.push('first')
    });

    await manager.executePhase('afterMount', mockComponent);

    expect(executed).toEqual(['first', 'second']);
  });
});
```

### 8.2 Integration Tests

```typescript
describe('Component Lifecycle Integration', () => {
  it('full lifecycle works with plugins', async () => {
    const states: LifecycleState[] = [];

    class TestComponent extends Component {
      constructor() {
        super();
        this.lifecycle$.subscribe(state => states.push(state));
      }

      @Mount()
      onMount() {
        states.push('mount-hook-called' as any);
      }

      render() {
        return <div>test</div>;
      }
    }

    const app = new Application(<TestComponent />);
    app.mount(document.body);

    expect(states).toContain('created');
    expect(states).toContain('rendering');
    expect(states).toContain('rendered');
    expect(states).toContain('mounted');
    expect(states).toContain('mount-hook-called' as any);
  });
});
```

### 8.3 E2E Tests

```typescript
describe('Real World Scenarios', () => {
  it('complex app with multiple plugins', async () => {
    // Test full app with:
    // - Guards
    // - Resolvers
    // - LoadData
    // - Mount hooks
    // - Watch decorators
    // - Custom plugins
  });
});
```

---

## 9. Breaking Changes

### 9.1 API Changes

| Old API | New API | Migration |
|---------|---------|-----------|
| `Application.renderBottomUp()` | `componentRenderer.render()` | Internal - use `Application.render()` |
| Direct decorator registration | Plugin system | Follow plugin guide |
| Hardcoded lifecycle order | Priority-based | Use priority system |

**Note**: `component.$` remains as a convenience API and is **not deprecated**. It provides easy access to `mounted$` and `unmount$` observables. For fine-grained lifecycle control, use `component.lifecycle$` directly.

### 9.2 Behavior Changes

**Before**: Decorators executed in undefined order
**After**: Decorators execute by priority

**Migration**: If you depend on execution order, set explicit priorities

**Before**: `destroy()` only cleaned subscriptions
**After**: `destroy()` runs all registered cleanup functions

**Migration**: Use `registerCleanup()` instead of manual cleanup

### 9.3 Internal Changes (Non-Breaking)

- Rendering is now done by `ComponentRenderer`
- Observable handling unified in `ObservableRenderer`
- Cache management moved to `RenderableComponent`
- Lifecycle is now state machine based

---

## 10. Timeline & Effort Estimation

### 10.1 Development Timeline

| Phase | Duration | Effort | Dependencies |
|-------|----------|--------|--------------|
| Phase 1: Base Classes | 1 week | 40 hours | None |
| Phase 2: Plugin System | 1 week | 40 hours | Phase 1 |
| Phase 3: Renderer Refactor | 1 week | 40 hours | Phase 1, 2 |
| Phase 4: JSX Simplification | 1 week | 40 hours | Phase 3 |
| Phase 5: Documentation | 1 week | 40 hours | All phases |
| **Total** | **5 weeks** | **200 hours** | - |

### 10.2 Resource Requirements

- **Core Developer**: 1 full-time (5 weeks)
- **Code Reviewer**: 0.5 part-time (ongoing)
- **Tech Writer**: 0.5 part-time (week 5)
- **QA Engineer**: 0.5 part-time (ongoing)

### 10.3 Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Breaking existing apps | Medium | High | Thorough testing + backward compatibility |
| Performance regression | Low | High | Benchmark suite + profiling |
| Community resistance | Medium | Medium | Clear migration guide + gradual rollout |
| Scope creep | Medium | Medium | Stick to plan + defer nice-to-haves |
| Plugin API changes | Low | High | Version lock + deprecation policy |

### 10.4 Success Metrics

**Code Quality**:
- [ ] Application.ts < 200 lines (currently 500+)
- [ ] Test coverage > 80% (currently ~60%)
- [ ] No circular dependencies
- [ ] All linter warnings resolved

**Performance**:
- [ ] Rendering speed ± 5% of current
- [ ] Bundle size increase < 10%
- [ ] Memory usage ± 5% of current
- [ ] No performance regressions in benchmarks

**Developer Experience**:
- [ ] 5+ community plugins created within 3 months
- [ ] Migration guide rated > 4/5 by users
- [ ] API documentation > 90% complete
- [ ] < 10 breaking change issues opened

### 10.5 Rollout Plan

**Week 1-3**: Internal development
**Week 4**: Alpha release (select contributors)
**Week 5**: Beta release (community preview)
**Week 6**: RC release (production testing)
**Week 7**: Stable release (v2.0.0)

---

## 11. Appendix

### 11.1 Related Documents

- [Current Architecture](./SKETCH.md)
- [API Specification](./mini-framework-spec.md)
- [Contribution Guidelines](./CONTRIBUTING.md)

### 11.2 References

- [React Fiber Architecture](https://github.com/acdlite/react-fiber-architecture)
- [Vue.js Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [Angular Dependency Injection](https://angular.io/guide/dependency-injection)
- [RxJS Best Practices](https://rxjs.dev/guide/overview)

### 11.3 Glossary

- **Plugin**: A LifecycleHook implementation that extends framework behavior
- **Lifecycle Phase**: A specific point in component lifecycle (beforeMount, etc.)
- **Priority**: Numeric value determining hook execution order
- **Decorator Plugin**: A plugin that implements decorator functionality
- **Hook Context**: Data passed to hooks during execution

### 11.4 FAQ

**Q: Will this break my existing app?**
A: No - we maintain backward compatibility. Update when ready.

**Q: Why not use existing framework?**
A: Mini Framework is designed for specific use cases and learning.

**Q: Can I contribute plugins?**
A: Yes! Follow the plugin developer guide in section 6.

**Q: When will this be stable?**
A: Target: 7 weeks from start (see timeline section 10.5)

---

## 12. Conclusion

This refactoring represents a significant architectural improvement that will:

1. **Improve Maintainability**: Clear separation of concerns
2. **Enable Extensibility**: Plugin system for community contributions
3. **Enhance Debuggability**: Observable lifecycle and better errors
4. **Increase Testability**: Mockable components with single responsibilities
5. **Future-Proof**: Easy to add new features without core changes

The migration path is clear, the timeline is realistic, and the benefits are substantial. This positions Mini Framework as a production-ready, extensible, and maintainable solution.

**Next Steps**:
1. Review and approve this plan
2. Create GitHub issues for each phase
3. Set up project board
4. Begin Phase 1 implementation

---

**Document Status**: ✅ Complete and ready for review
**Last Updated**: October 28, 2025
**Review By**: Core Team
**Approval Needed**: Yes

---

*For questions or clarifications, please open a GitHub Discussion or contact the core team.*
