# Component V2 - Composition Architecture (FUTURE)

**Status**: 📝 Planned (FASE 4 - Adiada)
**Razão**: Component atual funciona com JSX V2. Refatoração é otimização, não necessidade.

## 🎯 Objetivo

Refatorar a hierarquia de Component usando **Composition over Inheritance** e **LSP** para suportar múltiplos render targets (DOM, SSR, Native, etc).

## ❌ Problemas Atuais

### Component.ts (~300 linhas)
Violação de **Single Responsibility Principle**:

```typescript
class Component {
  // ❌ Muitas responsabilidades
  - Lifecycle management (mounted$, unmount$)
  - Render state management
  - DOM caching
  - Dependency Injection
  - Cleanup logic
  - Component hierarchy
  - Props/children
}
```

### Específico de DOM
```typescript
// ❌ Browser-only
mounted$, unmount$        // Não fazem sentido em SSR
[DOM_CACHE]              // Não existe no server
registerNode(node: Node) // Node não existe no server
```

## ✅ Solução: Composition + LSP

### Arquitetura Proposta

```
packages/core/src/
├── component-support/
│   ├── abstractions/              # Interfaces (LSP)
│   │   ├── ILifecycleManager.ts
│   │   ├── INodeRegistry.ts
│   │   ├── ICleanupRegistry.ts
│   │   ├── IRenderStateManager.ts
│   │   └── IInjectorFacade.ts
│   │
│   ├── dom/                       # DOM implementations
│   │   ├── DOMLifecycleManager.ts
│   │   ├── DOMNodeRegistry.ts
│   │   ├── DOMCleanupRegistry.ts
│   │   ├── DOMRenderStateManager.ts
│   │   └── DOMInjectorFacade.ts
│   │
│   ├── ssr/                       # SSR implementations
│   │   ├── SSRLifecycleManager.ts  # No-op
│   │   ├── SSRNodeRegistry.ts      # HTML strings
│   │   ├── SSRCleanupRegistry.ts   # No-op
│   │   ├── SSRRenderStateManager.ts
│   │   └── SSRInjectorFacade.ts
│   │
│   └── ManagerFactory.ts          # Creates managers based on RenderTarget
│
└── base-v2/
    └── Component.ts               # Uses composition
```

## 📐 Exemplo de Implementação

### 1. Interface (LSP)

```typescript
// component-support/abstractions/ILifecycleManager.ts
export interface ILifecycleManager {
  getMounted$(): Observable<void>;
  getUnmount$(): Observable<void>;
  triggerMounted(): void;
  triggerUnmount(): void;
}
```

### 2. DOM Implementation

```typescript
// component-support/dom/DOMLifecycleManager.ts
export class DOMLifecycleManager implements ILifecycleManager {
  private mounted$ = new Subject<void>();
  private unmount$ = new Subject<void>();

  getMounted$() { return this.mounted$.asObservable(); }
  getUnmount$() { return this.unmount$.asObservable(); }
  triggerMounted() { this.mounted$.next(); }
  triggerUnmount() { this.unmount$.next(); }
}
```

### 3. SSR Implementation (No-op)

```typescript
// component-support/ssr/SSRLifecycleManager.ts
export class SSRLifecycleManager implements ILifecycleManager {
  getMounted$() { return EMPTY; }  // No-op observable
  getUnmount$() { return EMPTY; }
  triggerMounted() { /* noop */ }
  triggerUnmount() { /* noop */ }
}
```

### 4. Factory

```typescript
// component-support/ManagerFactory.ts
export class ManagerFactory {
  static createManagers(target?: RenderTarget) {
    const renderTarget = target ?? RendererFactory.getRenderTarget();

    if (renderTarget === RenderTarget.DOM) {
      return {
        lifecycle: new DOMLifecycleManager(),
        nodes: new DOMNodeRegistry(),
        cleanup: new DOMCleanupRegistry(),
        renderState: new DOMRenderStateManager(),
        injector: new DOMInjectorFacade(),
      };
    } else if (renderTarget === RenderTarget.SSR) {
      return {
        lifecycle: new SSRLifecycleManager(),
        nodes: new SSRNodeRegistry(),
        cleanup: new SSRCleanupRegistry(),
        renderState: new SSRRenderStateManager(),
        injector: new SSRInjectorFacade(),
      };
    }

    throw new Error(`Unknown render target: ${renderTarget}`);
  }
}
```

### 5. Component com Composition

```typescript
// base-v2/Component.ts
export class Component<P = {}> {
  props!: P;
  children?: any;

  // Composition: managers são criados baseado em RenderTarget
  private managers = ManagerFactory.createManagers();

  // API pública permanece igual (backward compatibility)
  get $() {
    return {
      mounted$: this.managers.lifecycle.getMounted$(),
      unmount$: this.managers.lifecycle.getUnmount$(),
    };
  }

  registerNode(node: any) {
    this.managers.nodes.register(node);
  }

  registerCleanup(fn: () => void) {
    this.managers.cleanup.register(fn);
  }

  get injector() {
    return this.managers.injector.getOrCreate();
  }

  // Render state
  get renderState$() {
    return this.managers.renderState.getState$();
  }

  setRenderState(state: RenderStateValues) {
    this.managers.renderState.setState(state);
  }

  destroy() {
    this.managers.lifecycle.triggerUnmount();
    this.managers.cleanup.execute();
    this.managers.nodes.clear();
  }

  abstract render(): any;
}
```

## 🎯 Benefícios

### ✅ Single Responsibility
Cada manager tem UMA responsabilidade:
- `LifecycleManager`: Só lifecycle
- `NodeRegistry`: Só nós DOM
- `CleanupRegistry`: Só cleanup
- etc.

### ✅ Liskov Substitution
DOM e SSR managers são **substituíveis**:
```typescript
const manager: ILifecycleManager =
  target === DOM ? new DOMLifecycleManager() : new SSRLifecycleManager();
```

### ✅ Open/Closed
Aberto para extensão (novos targets), fechado para modificação:
```typescript
// Adicionar Native sem mudar Component
class NativeLifecycleManager implements ILifecycleManager { ... }
```

### ✅ Testabilidade
Cada manager é testável isoladamente:
```typescript
describe('DOMLifecycleManager', () => {
  it('should emit on mounted', () => { ... });
});
```

### ✅ Zero Breaking Changes
API pública é idêntica:
```typescript
// Antes e Depois - MESMA API
class MyComponent extends Component {
  render() {
    this.$.mounted$.subscribe(...);  // Funciona igual
    return <div>...</div>;
  }
}
```

## 📊 Comparação

### ANTES (V1)
```
Component (300+ linhas)
├── Lifecycle (mounted$, unmount$)
├── DOM Cache
├── Cleanup
├── Render State
├── Dependency Injection
└── Component Hierarchy
```
❌ Tudo misturado, difícil testar, específico de DOM

### DEPOIS (V2)
```
Component (50 linhas)
├── LifecycleManager (composition)
│   ├── DOMLifecycleManager (real observables)
│   └── SSRLifecycleManager (no-op)
├── NodeRegistry (composition)
│   ├── DOMNodeRegistry (DOM nodes)
│   └── SSRNodeRegistry (HTML strings)
├── CleanupRegistry (composition)
├── RenderStateManager (composition)
└── InjectorFacade (composition)
```
✅ Separado, testável, multi-target (LSP)

## 🚀 Roadmap

### Fase 1: Abstractions
- [ ] `ILifecycleManager`
- [ ] `INodeRegistry`
- [ ] `ICleanupRegistry`
- [ ] `IRenderStateManager`
- [ ] `IInjectorFacade`

### Fase 2: DOM Implementations
- [ ] `DOMLifecycleManager`
- [ ] `DOMNodeRegistry`
- [ ] `DOMCleanupRegistry`
- [ ] `DOMRenderStateManager`
- [ ] `DOMInjectorFacade`

### Fase 3: SSR Implementations
- [ ] `SSRLifecycleManager`
- [ ] `SSRNodeRegistry`
- [ ] `SSRCleanupRegistry`
- [ ] `SSRRenderStateManager`
- [ ] `SSRInjectorFacade`

### Fase 4: Factory & Component
- [ ] `ManagerFactory`
- [ ] `Component` (base-v2)
- [ ] Migration tests
- [ ] Documentation

## 💡 Quando Implementar?

**Implementar quando:**
1. ✅ JSX V2 estiver 100% completo
2. ✅ SSR for necessário
3. ✅ Performance otimização for prioridade
4. ✅ Mais render targets forem adicionados (Native, Canvas, etc)

**Não implementar se:**
- ❌ Component atual atender necessidades
- ❌ SSR não for prioridade
- ❌ Tempo limitado

## 📝 Notas

- Component atual **FUNCIONA** com JSX V2
- SSR funcionará com Component atual (observables simplesmente não emitem)
- Esta refatoração é **otimização**, não necessidade
- Prioridade: Finalizar JSX V2 primeiro

## 🔗 Relacionado

- [SKETCH-JSX-V2.md](./SKETCH-JSX-V2.md) - JSX V2 implementado
- [RenderingConfig](../packages/core/src/config/RenderingConfig.ts) - Feature flag
- [RendererFactory](../packages/core/src/jsx-v2/RendererFactory.ts) - Render target factory
