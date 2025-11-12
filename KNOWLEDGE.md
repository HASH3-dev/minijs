# KNOWLEDGE BASE - Mini Framework

Documento condensado com todo o conhecimento essencial do projeto para retomar contexto rapidamente em novas sessões.

## 📌 Visão Geral do Projeto

**Nome:** Mini Framework
**Tipo:** Framework front-end reativo baseado em componentes
**Linguagem:** TypeScript
**Paradigma:** OOP + Reatividade (RxJS)
**Estrutura:** Monorepo (packages)

### Packages

```
packages/
├── core/          # Sistema de componentes, lifecycle, plugins
├── di/            # Dependency Injection
├── jsx/           # JSX runtime e DOM manipulation
├── router/        # Sistema de rotas
└── plugin/        # Base para plugins externos
```

## 🏗️ Arquitetura

### Princípios Fundamentais

1. **OOP + Reatividade**: Classes base + RxJS Observables
2. **Plugin-based Lifecycle**: Decorators implementados como plugins
3. **Hierarquia de Components**: Parent/child relationships via JSX
4. **Dependency Injection**: Hierarchical DI com scopes
5. **Reactive Rendering**: Render pode retornar Observable

### Component Hierarchy

```typescript
// Base inheritance chain
Component
└── CleanableComponent (cleanup functions)
    └── RenderableComponent (render cache, lifecycle states)
        └── ReactiveComponent (lifecycle phases, error handling)
```

**Key Features:**
- Lifecycle phases: Created → Mounted → Updated → Destroyed
- Cleanup functions (addCleanup)
- Error boundaries (error$, onError)
- Reactive state (renderState$)

## 🔌 Plugin System

### DecoratorPlugin Base Class

```typescript
export abstract class DecoratorPlugin {
  abstract readonly id: string;
  abstract readonly phase: LifecyclePhase;
  abstract readonly priority: number;  // Lower = earlier execution
  abstract execute(component: Component): void | Promise<void>;
}
```

### Lifecycle Phases & Priorities

**LifecyclePhase.Created:**
- Priority 5: StatefulRenderPlugin (overrides render to return Observable)
- Priority 10: GuardPlugin (route guards)
- Priority 20: ResolverPlugin (data fetching)
- Priority 30: LoadDataPlugin (alternative data fetching)

**LifecyclePhase.Mounted:**
- Priority 10: MountPlugin (@Mount decorator)

**LifecyclePhase.Updated:**
- Priority 10: WatchPlugin (@Watch decorator)

### Plugin Registration

```typescript
// packages/core/src/lifecycle/registerDefaultPlugins.ts
export function registerDefaultPlugins() {
  LifecycleManager.registerPlugin(new StatefulRenderPlugin());
  LifecycleManager.registerPlugin(new GuardPlugin());
  LifecycleManager.registerPlugin(new ResolverPlugin());
  LifecycleManager.registerPlugin(new MountPlugin());
  LifecycleManager.registerPlugin(new WatchPlugin());
}
```

## 🎨 Decorators

### Current Decorators

| Decorator | Package | Purpose | Plugin |
|-----------|---------|---------|--------|
| `@Mount` | core | Lifecycle hook após montagem | MountPlugin |
| `@Watch` | core | Observar mudanças em propriedades | WatchPlugin |
| `@UseGuards` | core | Route guards | GuardPlugin |
| `@UseResolvers` | core | Data fetching antes do render | ResolverPlugin |
| `@LoadData` | core | Alternative data fetching | LoadDataPlugin |
| `@Child` | core | Referência a child component | - |
| `@Inject` | di | Dependency injection | - |
| `@Provide` | di | Provide dependencies (será @UseProviders) | - |
| `@Injectable` | di | Mark class as injectable | - |
| `@Route` | router | Define route | - |

### Render State System

Components têm `renderState$: BehaviorSubject<RenderState>` que pode ter:

```typescript
enum RenderState {
  IDLE = "IDLE",           // Estado inicial
  LOADING = "LOADING",     // Carregando dados
  SUCCESS = "SUCCESS",     // Dados carregados
  ERROR = "ERROR",         // Erro ao carregar
  EMPTY = "EMPTY"          // Dados vazios
}
```

**Render methods opcionais:**
- `render()` - Obrigatório, chamado em SUCCESS
- `renderLoading()` - Opcional, chamado em LOADING
- `renderError()` - Opcional, chamado em ERROR
- `renderEmpty()` - Opcional, chamado em EMPTY

Se não implementados, fallback para `render()`.

## 💉 Dependency Injection (Estado Atual)

### Problemas Conhecidos

⚠️ **Sistema DI atual tem problemas arquiteturais que precisam ser refatorados:**

1. Injector não é reativo (imperativo)
2. Múltiplas formas de criar injectors (@Provide, Provider, @UseResolvers)
3. State pode ser perdido no clearCache()
4. Sem validação de dependências circulares
5. Debug difícil (logs espalhados)

### Como Funciona Hoje

```typescript
// Hierarchical lookup
Component
├── [INJECTOR_TOKEN] (own injector, se tiver)
└── [GET_PARENT_INJECTOR]() -> busca no parent recursivo

// Decorators
@Provide([Service1, Service2])  // Cria injector no component
class MyComponent {
  @Inject(Service1) service!: Service1;
}

// JSX Component
<Provider values={[Service1]}>
  <Child />
</Provider>
```

### Scopes

```typescript
enum InjectionScope {
  SINGLETON = "SINGLETON",        // Uma instância por injector
  BY_COMPONENT = "BY_COMPONENT"   // Uma instância por component que injeta
}

@Injectable({ scope: InjectionScope.BY_COMPONENT })
class MyService {}
```

## 🔄 Sistema de Rendering

### Observable Rendering

```typescript
// StatefulRenderPlugin sobrescreve render() para retornar Observable
component.render = () => {
  return component.renderState$.pipe(
    map(state => {
      switch(state) {
        case RenderState.LOADING: return renderLoading();
        case RenderState.ERROR: return renderError();
        case RenderState.EMPTY: return renderEmpty();
        default: return render();
      }
    })
  );
};
```

### DOM Processing

**ObservableRenderer** subscreve em Observables retornados por render():
- Quando Observable emite novo valor, re-renderiza
- Usa DOMTreeProcessor para diff e update
- Suporta nested Observables

## 🚧 Refatoração em Andamento

### Phase 10: Resolvers - **BLOQUEADO**

**Problema:** ResolverPlugin não consegue registrar dados resolvidos de forma persistente através de re-renders.

**Causa Raiz:** Arquitetura do DI permite que injectors sejam recriados/perdidos.

**Tentativas de Fix:**
1. ✅ Implementado renderState$ e StatefulRenderPlugin
2. ✅ Adicionado Injector.addProvider()
3. ❌ @UseResolvers com injector próprio (WeakMap) - ainda falha
4. ❌ Provider component re-cria injector em cada render

### Phase 10.1: Refatoração DI - **PLANEJADO**

Ver `TODO-DI-REFACTOR.md` para plano completo.

**Mudanças Principais:**
- @Injectable obrigatório para todos providers
- InjectorManager centralizado (singleton)
- ReactiveInjector com Observables
- InjectableRegistry para dependency graph
- Validação de circular dependencies no bootstrap
- @Provide → @UseProviders
- Provider → Provide component

## 📁 Estrutura de Arquivos Importante

### Core Package

```
packages/core/src/
├── base/
│   ├── CleanableComponent.ts      # Cleanup functions
│   ├── RenderableComponent.ts     # Render cache
│   └── ReactiveComponent.ts       # Lifecycle phases
├── lifecycle/
│   ├── DecoratorPlugin.ts         # Base class
│   ├── LifecycleManager.ts        # Plugin orchestration
│   ├── StatefulRenderPlugin.ts    # Observable render
│   └── registerDefaultPlugins.ts
├── decorators/
│   ├── Mount/
│   ├── Watch/
│   ├── Guard/
│   ├── Resolver/
│   ├── LoadData/
│   └── Child/
├── rendering/
│   ├── ObservableRenderer.ts
│   └── DOMTreeProcessor.ts
├── Component.ts                    # Main Component class
├── Application.ts                  # Bootstrap
└── types.ts                        # Shared types
```

### DI Package

```
packages/di/src/
├── index.ts           # Main exports
├── types.ts           # Types and enums
└── constants.ts       # Symbols
```

## 🎯 Padrões e Convenções

### Naming Conventions

**Decorators:**
- Class decorators: `@UseX` (UseProviders, UseResolvers, UseGuards)
- Property decorators: `@Inject`, `@Child`
- Method decorators: `@Mount`, `@Watch`

**Components:**
- JSX wrappers: `<X>` (Provide, Router, etc)
- Regular components: PascalCase

### Metadata Storage

```typescript
// Usar Reflect.defineMetadata
const METADATA_KEY = Symbol("my-metadata");
Reflect.defineMetadata(METADATA_KEY, value, target);

// Plugins leem via:
const metadata = Reflect.getMetadata(METADATA_KEY, component);
```

### Error Handling

```typescript
// Components têm error boundary built-in
component.error$.subscribe(error => {
  console.error('Component error:', error);
});

// Plugins devem emitir erros:
component.emitError(new Error('Plugin failed'));
```

## 🐛 Problemas Conhecidos

### 1. DI System (Crítico - Em Refatoração)
- **Sintoma:** Providers não persistem em re-renders
- **Causa:** Arquitetura imperativa + múltiplas fontes de injectors
- **Status:** Refatoração completa planejada (TODO-DI-REFACTOR.md)

### 2. Observable Memory Leaks (Resolvido)
- **Sintoma:** Subscriptions não eram limpas
- **Fix:** CleanableComponent.addCleanup() + auto-cleanup no destroy

### 3. Router Integration (Parcial)
- **Status:** Router existe mas integração com Guards precisa validação
- **TODO:** Testar Guards com navegação real

## 📚 Documentos de Referência

- **README.md**: Overview e quick start
- **ARCHITECTURE.md**: Arquitetura detalhada
- **PLUGIN_GUIDE.md**: Como criar plugins
- **TODO-REFACTORING.md**: Refatoração geral (phases 1-12)
- **TODO-DI-REFACTOR.md**: Refatoração específica do DI
- **SKETCH.md**: Sketches e experimentos

## 🔧 Como Trabalhar com o Projeto

### Setup

```bash
npm install
cd examples/playground
npm run dev
```

### Criar um Plugin

```typescript
// 1. Extend DecoratorPlugin
export class MyPlugin extends DecoratorPlugin {
  readonly id = "my-plugin";
  readonly phase = LifecyclePhase.Created;
  readonly priority = 15;

  execute(component: Component): void {
    // Plugin logic
  }
}

// 2. Register
LifecycleManager.registerPlugin(new MyPlugin());

// 3. Create decorator
export function MyDecorator(config: any) {
  return function(target: any) {
    Reflect.defineMetadata(MY_METADATA, config, target.prototype);
    return target;
  };
}
```

### Criar um Component

```typescript
export class MyComponent extends Component {
  @Inject(MyService) service!: MyService;

  @Mount()
  onMount() {
    console.log('Mounted!');
  }

  @Watch('props.count')
  onCountChange(newValue: number) {
    console.log('Count changed:', newValue);
  }

  render() {
    return <div>Hello {this.props.name}</div>;
  }
}
```

### Testar no Playground

```typescript
// examples/playground/src/App.tsx
import { MyComponent } from './components/MyComponent';

export class App extends Component {
  render() {
    return (
      <div>
        <MyComponent count={42} name="World" />
      </div>
    );
  }
}
```

## 🎓 Conceitos Importantes

### 1. Lifecycle Flow

```
Constructor
  ↓
[INJECTOR_TOKEN] setup (if @Provide/@UseProviders)
  ↓
Plugin execution (Created phase, sorted by priority)
  ↓
render() called → returns DOM/Observable
  ↓
DOM mounted
  ↓
Plugin execution (Mounted phase)
  ↓
... component lifetime ...
  ↓
destroy() called
  ↓
Plugin execution (Destroyed phase)
  ↓
Cleanup functions executed
```

### 2. Parent-Child Communication

```typescript
// Via props
<Child data={this.state} />

// Via @Child decorator
@Child('myChild') childRef!: ChildComponent;

// Via DI (shared service)
@Inject(SharedState) state!: SharedState;
```

### 3. Reactive Patterns

```typescript
// BehaviorSubject para state
private count$ = new BehaviorSubject(0);

// Observable rendering
render() {
  return this.count$.pipe(
    map(count => <div>Count: {count}</div>)
  );
}

// Cleanup automático
this.addCleanup(
  this.count$.subscribe(v => console.log(v))
);
```

## 🚀 Próximos Passos

1. **Completar Refatoração DI** (TODO-DI-REFACTOR.md)
   - Criar base classes reativas
   - Implementar InjectorManager
   - Migrar para @UseProviders
   - Validação de dependency graph

2. **Retomar Resolvers** (Phase 10.2)
   - Usar nova arquitetura DI
   - Testar persistência de dados
   - Integrar com StatefulRenderPlugin

3. **LoadData** (Phase 11)
   - Similar a Resolvers
   - Alternativa mais simples

4. **Final** (Phase 12)
   - Testes completos
   - Documentação
   - Performance optimization

## 💡 Dicas para Novas Sessões

1. **Ler este documento primeiro** para contexto geral
2. **Consultar TODO-DI-REFACTOR.md** para trabalho em DI
3. **Verificar ARCHITECTURE.md** para detalhes técnicos
4. **Ver examples/playground** para exemplos práticos
5. **Seguir ordem de implementação** no TODO (phases)

## 🔍 Debug Tips

```typescript
// Component inspection
console.log('[INJECTOR_TOKEN]:', component[INJECTOR_TOKEN]);
console.log('Parent:', component[PARENT_COMPONENT]);
console.log('Lifecycle state:', component._lifecycleState);

// Plugin execution
console.log('Registered plugins:', LifecycleManager['plugins']);

// Observable rendering
component.renderState$.subscribe(state => {
  console.log('Render state:', state);
});
```

## 📊 Estado Atual do Projeto

- ✅ Sistema de Components base completo
- ✅ Plugin system funcional
- ✅ Lifecycle management robusto
- ✅ Observable rendering implementado
- ✅ Guards funcionando
- ⚠️ DI system precisa refatoração completa
- ❌ Resolvers bloqueados (depende de DI)
- ❌ LoadData não implementado
- ⚠️ Router parcialmente integrado

**Progress:** ~60% completo (considerando refatoração DI como blocker)
