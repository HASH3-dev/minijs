# 🏗️ Mini Framework - Arquitetura

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Base Classes](#base-classes)
3. [Plugin System](#plugin-system)
4. [Lifecycle Management](#lifecycle-management)
5. [Rendering System](#rendering-system)
6. [Dependency Injection](#dependency-injection)
7. [Como Criar Plugins](#como-criar-plugins)

---

## 🎯 Visão Geral

O Mini Framework utiliza uma arquitetura modular baseada em:
- **Composition Pattern** para herança de funcionalidades
- **Plugin System** para extensibilidade
- **Observable Pattern** para reatividade
- **Dependency Injection** para gerenciamento de dependências

```
┌─────────────────────────────────────────┐
│         Application (Orquestrador)       │
├─────────────────────────────────────────┤
│  LifecycleManager (Plugin Orchestrator)  │
├─────────────────────────────────────────┤
│        Component Hierarchy               │
│  ReactiveComponent → RenderableComponent │
│         → CleanableComponent → Component │
└─────────────────────────────────────────┘
```

---

## 🧱 Base Classes

### Hierarquia de Herança

```typescript
ReactiveComponent        // Lifecycle observável
  └─ RenderableComponent // Sistema de render e cache
      └─ CleanableComponent // Cleanup registry
          └─ Component<P> // Classe final
```

### 1. ReactiveComponent

**Responsabilidade**: Gerenciar estados do lifecycle de forma reativa.

```typescript
export abstract class ReactiveComponent {
  // Observables públicos
  lifecycle$: BehaviorSubject<LifecycleState>;
  error$: Subject<Error>;

  // Getters
  get lifecycleState(): LifecycleState;

  // Métodos protegidos para subclasses
  protected _transitionTo(state: LifecycleState): void;
  protected _emitError(error: Error): void;
}
```

**Estados do Lifecycle**:
```typescript
type LifecycleState =
  | "created"      // Componente instanciado
  | "rendering"    // Em processo de render
  | "mounted"      // Montado no DOM
  | "updating"     // Atualizando
  | "unmounting"   // Em processo de unmount
  | "destroyed";   // Destruído
```

**Exemplo de Uso**:
```typescript
component.lifecycle$.subscribe(state => {
  console.log('State changed to:', state);
});

component.error$.subscribe(error => {
  console.error('Component error:', error);
});
```

### 2. RenderableComponent

**Responsabilidade**: Gerenciar rendering e cache de DOM.

```typescript
export abstract class RenderableComponent extends ReactiveComponent {
  // Métodos de cache
  protected _getCachedRender(): Node | undefined;
  protected _setCachedRender(node: Node, parent?: Component): void;
  protected _clearRenderCache(): void;

  // Método abstrato que subclasses implementam
  abstract render(): Node | any;
}
```

**Sistema de Cache**:
- Cache por instância + parent
- Invalida automaticamente se parent muda
- Evita re-renders desnecessários

### 3. CleanableComponent

**Responsabilidade**: Gerenciar cleanup de recursos.

```typescript
export abstract class CleanableComponent extends RenderableComponent {
  // API pública
  registerCleanup(cleanupFn: () => void): void;
  destroy(): void;

  // Registry interno
  private cleanupRegistry: Set<() => void>;
}
```

**Exemplo**:
```typescript
class MyComponent extends Component {
  @Mount()
  setupTimer() {
    const timer = setInterval(() => {
      // do work
    }, 1000);

    // Registra cleanup
    this.registerCleanup(() => {
      clearInterval(timer);
    });
  }
}
```

### 4. Component<P>

**Responsabilidade**: Classe final que usuários extends.

```typescript
export class Component<P = any> extends CleanableComponent {
  props: P;
  children?: any;
  $: ComponentLifecycle; // Backward compatibility

  // API pública
  emitError(error: Error): void;

  // Implementação de render (pode ser override)
  render(): Node {
    return document.createElement('div');
  }
}
```

---

## 🔌 Plugin System

### Arquitetura

```
LifecycleManager (Singleton)
    │
    ├─ registra → WatchPlugin (priority: 50)
    ├─ registra → MountPlugin (priority: 100)
    └─ registra → CustomPlugins (priority: 150+)
```

### LifecycleManager

**Responsabilidade**: Orquestrar execução de plugins por phase e priority.

```typescript
class LifecycleManager {
  // Registrar plugin
  registerHook(hook: LifecycleHook): void;

  // Executar phase
  async executePhase(
    phase: LifecyclePhase,
    component: Component,
    context?: Record<string, any>
  ): Promise<void>;
}
```

**Lifecycle Phases**:
```typescript
enum LifecyclePhase {
  BeforeRender = "beforeRender",
  AfterRender = "afterRender",
  BeforeMount = "beforeMount",
  AfterMount = "afterMount",      // @Watch e @Mount executam aqui
  BeforeUnmount = "beforeUnmount",
}
```

### DecoratorPlugin (Base Class)

```typescript
abstract class DecoratorPlugin implements LifecycleHook {
  abstract readonly id: string;
  abstract readonly priority: number;
  abstract readonly phase: LifecyclePhase;

  abstract execute(component: Component, context: HookContext): void | Promise<void>;

  // Helper methods
  protected getMetadata<T>(component: Component, key: symbol | string): T | undefined;
  protected registerCleanup(component: Component, fn: () => void): void;
}
```

### Plugins Built-in

#### WatchPlugin

```typescript
class WatchDecoratorPlugin extends DecoratorPlugin {
  readonly id = "watch-decorator";
  readonly priority = 50;  // Executa PRIMEIRO
  readonly phase = LifecyclePhase.AfterMount;

  execute(component: Component) {
    // 1. Lê metadata do decorator
    const watchConfigs = this.getMetadata(component, WATCH_PROPERTIES);

    // 2. Setup subscriptions
    for (const config of watchConfigs) {
      observable
        .pipe(takeUntil(component.$.unmount$))
        .subscribe(value => config.method.call(component, value));
    }
  }
}
```

#### MountPlugin

```typescript
class MountDecoratorPlugin extends DecoratorPlugin {
  readonly id = "mount-decorator";
  readonly priority = 100;  // Executa DEPOIS do @Watch
  readonly phase = LifecyclePhase.AfterMount;

  execute(component: Component) {
    // 1. Lê metadata do decorator
    const mountMethods = this.getMetadata(component, MOUNT_METHODS);

    // 2. Executa métodos
    for (const method of mountMethods) {
      const cleanup = method.call(component);
      if (cleanup) this.registerCleanup(component, cleanup);
    }

    // 3. Emite signal (backward compatibility)
    component.$.mounted$.next();
  }
}
```

---

## 🔄 Lifecycle Management

### Fluxo Completo

```
1. Component Instantiated
   ↓ new MyComponent()
   ↓ lifecycleState = "created"

2. Rendering Phase
   ↓ Application.renderBottomUp()
   ↓ lifecycleState = "rendering"
   ↓ component.render() called

3. DOM Created
   ↓ DOM node created
   ↓ Cache set

4. Lifecycle Execution
   ↓ Application.executeLifecycle()
   ↓ lifecycleManager.executePhase(AfterMount)
   ↓
   ├─ WatchPlugin.execute() [priority 50]
   │  └─ Setup @Watch subscriptions
   │
   └─ MountPlugin.execute() [priority 100]
      └─ Execute @Mount methods

5. Component Active
   ↓ lifecycleState = "mounted"
   ↓ Component is ready

6. Unmount
   ↓ component.destroy()
   ↓ lifecycleState = "unmounting"
   ↓ Execute cleanups
   ↓ lifecycleState = "destroyed"
```

### Execução de Plugins

```typescript
// Application.ts
private static executeLifecycle(component: Component): void {
  if (component[LIFECYCLE_EXECUTED]) return;
  component[LIFECYCLE_EXECUTED] = true;

  // Executa TODOS os plugins registrados na phase AfterMount
  lifecycleManager.executePhase(LifecyclePhase.AfterMount, component);
}
```

**Ordem de Execução**:
```
AfterMount Phase:
  1. WatchPlugin     (priority: 50)
  2. MountPlugin     (priority: 100)
  3. CustomPlugin1   (priority: 150)
  4. CustomPlugin2   (priority: 200)
```

---

## 🎨 Rendering System

### Two-Phase Rendering

```
Phase 1: Build (Top-Down)
  └─ Instanciar componentes
  └─ Configurar DI hierarchy

Phase 2: Render (Bottom-Up)
  └─ Render children primeiro
  └─ Depois render parent
  └─ Garantir DI funciona
```

### Rendering Classes

#### ObservableRenderer

**Responsabilidade**: Renderizar Observables com updates automáticos.

```typescript
class ObservableRenderer {
  render(
    observable: any,
    component: Component,
    processTree: (node: any) => Node,
    // ... helpers
  ): DocumentFragment {
    // Cria markers
    const placeholder = document.createComment("observable-start");
    const endMarker = document.createComment("observable-end");

    // Subscribe e atualiza DOM
    observable.subscribe(value => {
      const processed = processTree(value);
      // Replace between markers
    });

    return fragment;
  }
}
```

#### DOMTreeProcessor

**Responsabilidade**: Processar árvore e converter Components → DOM.

```typescript
class DOMTreeProcessor {
  process(node: any, renderComponent: (c: Component) => Node): Node {
    // Component → render
    if (node instanceof Component) {
      return renderComponent(node);
    }

    // Primitive → text node
    if (!(node instanceof Node)) {
      return document.createTextNode(String(node));
    }

    // Fragment/Element → process children recursively
    // ...
  }
}
```

---

## 💉 Dependency Injection

### Hierarquia

```
RootComponent (Provider)
  ├─ ChildA (Consumer)
  │   └─ GrandchildA (Consumer)
  └─ ChildB (Consumer)
```

### Como Funciona

1. **Parent Tracking**:
```typescript
component[PARENT_COMPONENT] = parentComponent;
```

2. **Injector Chain**:
```typescript
class Component {
  get injector() {
    // Se tem injector próprio, usa
    if (this._injector) return this._injector;

    // Senão, usa do parent
    const parent = this[PARENT_COMPONENT];
    return parent?.injector;
  }
}
```

3. **Injection**:
```typescript
@Injectable()
class MyService { }

class MyComponent extends Component {
  constructor(
    private myService: MyService  // Auto-injected!
  ) {
    super();
  }
}
```

---

## 🛠️ Como Criar Plugins

### 1. Criar Plugin Class

```typescript
import { DecoratorPlugin, LifecyclePhase, Component } from '@mini/core';

class MyCustomPlugin extends DecoratorPlugin {
  // Identificação única
  readonly id = "my-custom-plugin";

  // Menor = executa primeiro
  readonly priority = 150;

  // Quando executar
  readonly phase = LifecyclePhase.AfterMount;

  execute(component: Component, context: HookContext): void {
    // 1. Ler metadata
    const metadata = this.getMetadata(component, MY_METADATA_KEY);

    if (!metadata) return;

    // 2. Sua lógica
    console.log('Custom plugin executed!', metadata);

    // 3. Registrar cleanup se necessário
    this.registerCleanup(component, () => {
      console.log('Cleanup!');
    });
  }
}
```

### 2. Criar Decorator

```typescript
const MY_METADATA_KEY = Symbol('my-metadata');

export function MyDecorator(options?: any) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    // Salvar metadata
    if (!target[MY_METADATA_KEY]) {
      target[MY_METADATA_KEY] = [];
    }

    target[MY_METADATA_KEY].push({
      method: descriptor.value,
      options,
    });

    return descriptor;
  };
}
```

### 3. Registrar Plugin

```typescript
import { lifecycleManager } from '@mini/core';

// Registrar
lifecycleManager.registerHook(new MyCustomPlugin());
```

### 4. Usar Decorator

```typescript
class MyComponent extends Component {
  @MyDecorator({ config: 'value' })
  myMethod() {
    console.log('My method!');
  }
}
```

### Exemplo Completo: Logger Plugin

```typescript
// 1. Metadata key
const LOGGER_KEY = Symbol('logger:methods');

// 2. Decorator
export function Log(message?: string) {
  return function (target: any, key: string, descriptor: PropertyDescriptor) {
    const original = descriptor.value;

    if (!target[LOGGER_KEY]) {
      target[LOGGER_KEY] = [];
    }

    target[LOGGER_KEY].push({
      methodName: key,
      message: message || `Method ${key} called`,
    });

    return descriptor;
  };
}

// 3. Plugin
class LoggerPlugin extends DecoratorPlugin {
  readonly id = "logger-plugin";
  readonly priority = 200;
  readonly phase = LifecyclePhase.AfterMount;

  execute(component: Component) {
    const logMethods = this.getMetadata(component, LOGGER_KEY);

    if (!logMethods) return;

    for (const config of logMethods) {
      console.log(`[Logger] ${config.message}`);
    }
  }
}

// 4. Registrar
lifecycleManager.registerHook(new LoggerPlugin());

// 5. Usar
class MyComponent extends Component {
  @Log('Component initialized!')
  @Mount()
  onMount() {
    console.log('Mounted!');
  }
}
```

---

## 📊 Comparação: Antes vs Depois

### Antes (Hardcoded)

```typescript
// Application.ts - 50+ linhas
private static executeLifecycle(component: Component) {
  // @Watch hardcoded
  setupWatchers(component);

  // @Mount hardcoded
  const methods = component[MOUNT_METHODS];
  methods.forEach(fn => {
    const cleanup = fn.call(component);
    if (cleanup) {
      component.$.unmount$.subscribe({
        complete: () => cleanup()
      });
    }
  });

  component.$.mounted$.next();
}
```

### Depois (Plugin System)

```typescript
// Application.ts - 5 linhas
private static executeLifecycle(component: Component) {
  if (component[LIFECYCLE_EXECUTED]) return;
  component[LIFECYCLE_EXECUTED] = true;

  lifecycleManager.executePhase(LifecyclePhase.AfterMount, component);
}
```

**Redução: 90% menos código!**

---

## 🎯 Princípios SOLID

### Single Responsibility Principle (SRP)
- ✅ ReactiveComponent: Apenas lifecycle reativo
- ✅ RenderableComponent: Apenas rendering e cache
- ✅ CleanableComponent: Apenas cleanup
- ✅ LifecycleManager: Apenas orquestração
- ✅ Cada plugin: Apenas uma responsabilidade

### Open/Closed Principle (OCP)
- ✅ Sistema aberto para extensão (novos plugins)
- ✅ Fechado para modificação (core não muda)

### Liskov Substitution Principle (LSP)
- ✅ Hierarquia de herança bem definida
- ✅ Cada nível adiciona funcionalidade

### Interface Segregation Principle (ISP)
- ✅ LifecycleHook interface focada
- ✅ DecoratorPlugin com helpers específicos

### Dependency Inversion Principle (DIP)
- ✅ Application depende de abstrações (LifecycleManager)
- ✅ Plugins dependem de interface (LifecycleHook)

---

## 🚀 Próximos Passos

### Possíveis Melhorias

1. **Mais Lifecycle Phases**
   ```typescript
   BeforeRender  → validação de props
   AfterRender   → preparação de dados
   BeforeMount   → setup inicial
   ```

2. **Error Boundaries**
   ```typescript
   class ErrorBoundaryPlugin extends DecoratorPlugin {
     phase = LifecyclePhase.BeforeRender;
     // Catch e handle errors
   }
   ```

3. **Performance Monitoring**
   ```typescript
   class PerformancePlugin extends DecoratorPlugin {
     // Track render times
     // Report bottlenecks
   }
   ```

4. **Dev Tools Integration**
   ```typescript
   class DevToolsPlugin extends DecoratorPlugin {
     // Send component tree to devtools
     // Enable time-travel debugging
   }
   ```

---

## 📚 Recursos

- **Código Fonte**: `/packages/core/src/`
- **Exemplos**: `/examples/playground/`
- **Testes**: `/packages/core/test/`

## 🎉 Conclusão

O Mini Framework agora possui uma arquitetura moderna, extensível e mantível:

✅ **Modular**: Base classes com SRP
✅ **Extensível**: Plugin system funcional
✅ **Reativo**: Lifecycle 100% observable
✅ **Testável**: Componentes isolados
✅ **Type-Safe**: Enum para phases
✅ **Backward Compatible**: 100% compatível

**Happy Coding!** 🚀
