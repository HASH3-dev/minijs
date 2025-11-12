# TODO: Refatoração Completa do Sistema de DI

## 🎯 Objetivo

Refatorar o sistema de Dependency Injection para seguir a arquitetura OOP + Reatividade, resolvendo problemas de:
- Falta de reatividade no Injector
- Múltiplas fontes de criação de injectors
- State management frágil (perdido no clearCache)
- Dificuldade de debugging
- Falta de validação de dependências

## 📋 Status Atual

**Problema Bloqueador:** ResolverPlugin não consegue registrar dados resolvidos de forma que persistam através de re-renders do component.

**Causa Raiz:** Injector é imperativo e pode ser recriado/perdido durante lifecycle do component.

## 🏗️ Nova Arquitetura

### Princípios

1. **@Injectable Obrigatório**: Todas as classes usadas como providers devem ser decoradas
2. **Dependency Graph Validado**: Validação no bootstrap detecta dependências circulares
3. **Reatividade Built-in**: Injector usa Observables para mudanças
4. **Centralização**: InjectorManager gerencia todos os injectors
5. **Scopes Explícitos**: SINGLETON, BY_COMPONENT, TRANSIENT

### Estrutura de Arquivos

```
packages/di/src/
├── base/
│   ├── ReactiveInjector.ts        # Injector com Observables
│   └── InjectorNode.ts            # Nó na árvore hierárquica
├── registry/
│   ├── InjectableRegistry.ts      # Registro global de @Injectable
│   ├── ProviderRegistry.ts        # Armazena providers reativamente
│   └── InjectorManager.ts         # Singleton que gerencia tudo
├── helpers/
│   ├── createInjector.ts          # Factory centralizada
│   ├── registerProvider.ts        # API para plugins
│   ├── lookupInjector.ts          # Busca hierárquica
│   └── validateGraph.ts           # Validação de dependências
├── decorators/
│   ├── Injectable.ts              # Refatorado com registry
│   ├── Inject.ts                  # Refatorado para usar manager
│   └── UseProviders.ts            # Renomeado de @Provide
├── types.ts
├── constants.ts
└── index.ts
```

## 📝 Tarefas Detalhadas

### Phase 1: Base Classes e Registry ✅ COMPLETO

#### 1.1 Criar InjectableRegistry ✅
```typescript
// packages/di/src/registry/InjectableRegistry.ts

interface InjectableMetadata {
  token: Token;
  scope: InjectionScope;
  dependencies: Token[];
  factory?: () => any;
}

export class InjectableRegistry {
  private static registry = new Map<Token, InjectableMetadata>();

  static register(metadata: InjectableMetadata): void;
  static get(token: Token): InjectableMetadata | undefined;
  static getAll(): IterableIterator<[Token, InjectableMetadata]>;
  static has(token: Token): boolean;
}
```

**Tasks:**
- [x] Criar arquivo `InjectableRegistry.ts`
- [x] Implementar Map global de metadados
- [x] API para register/get/has
- [ ] Testes unitários

#### 1.2 Criar validateGraph ✅
```typescript
// packages/di/src/helpers/validateGraph.ts

export function validateDependencyGraph(): void {
  // Detectar dependências circulares
  // Verificar se todas as deps são @Injectable
  // Log de warnings para deps não registradas
}
```

**Tasks:**
- [x] Criar arquivo `validateGraph.ts`
- [x] Implementar detecção de ciclos (DFS)
- [x] Validar deps existem no registry
- [x] Mensagens de erro claras
- [ ] Testes com grafos válidos/inválidos

#### 1.3 Criar ReactiveInjector ✅
```typescript
// packages/di/src/base/ReactiveInjector.ts

export class ReactiveInjector {
  // Observables
  readonly providers$ = new BehaviorSubject<Map<Token, Provider>>(new Map());
  readonly instances$ = new BehaviorSubject<Map<Token, any>>(new Map());

  // Hierarchy
  protected parent?: ReactiveInjector;
  protected children = new Set<ReactiveInjector>();

  // Methods
  register(provider: Provider): void;
  get<T>(token: Token<T>): T;
  has(token: Token): boolean;
  invalidateCache(token: Token): void;
}
```

**Tasks:**
- [x] Criar arquivo `ReactiveInjector.ts`
- [x] Implementar Observables de state
- [x] Método register() reativo
- [x] Método get() com parent fallback
- [x] Cache invalidation
- [ ] Testes unitários

### Phase 2: InjectorManager ✅ COMPLETO

#### 2.1 Criar InjectorManager (Singleton) ✅
```typescript
// packages/di/src/registry/InjectorManager.ts

export class InjectorManager {
  private static instance: InjectorManager;

  // Singleton instances
  private singletons = new Map<Token, any>();

  // Component injectors (BY_COMPONENT)
  private componentInjectors = new WeakMap<any, ReactiveInjector>();

  // API
  static getInstance(): InjectorManager;
  getOrCreate(component: any, providers?: Provider[]): ReactiveInjector;
  resolve<T>(token: Token<T>, component?: any): T;
  registerProvider(component: any, provider: Provider): void;
}
```

**Tasks:**
- [x] Criar arquivo `InjectorManager.ts`
- [x] Implementar singleton pattern
- [x] WeakMap para components
- [x] Métodos de resolução por scope
- [x] API para plugins (registerProvider)
- [ ] Testes unitários

### Phase 3: Helpers ✅ COMPLETO

#### 3.1 Criar registerProvider helper ✅
```typescript
// packages/di/src/helpers/index.ts

export function registerProvider(component: any, provider: Provider): void;
export function registerResolvedData<T>(component: any, token: Token<T>, data: T): void;
export function getComponentInjector(component: any): ReactiveInjector;
```

**Tasks:**
- [x] Criar arquivo `helpers/index.ts`
- [x] Helper registerProvider
- [x] Helper registerResolvedData (para Resolvers)
- [x] Helper getComponentInjector
- [x] Re-export validateDependencyGraph
- [ ] Testes

### Phase 4: Refatorar Decorators ✅ COMPLETO

#### 4.1 Refatorar @Injectable ✅
```typescript
// packages/di/src/index.ts (refatorado)

export function Injectable(options?: InjectableOptions) {
  return function <T extends new (...args: any[]) => any>(Ctor: T) {
    // Registrar no InjectableRegistry
    // Extrair dependencies de design:paramtypes
    // Criar wrapper que adiciona injector (se BY_COMPONENT)
    // Preservar nome da classe
  };
}
```

**Tasks:**
- [x] Refatorar decorator
- [x] Integrar com InjectableRegistry
- [x] Extrair dependencies automaticamente
- [ ] Wrapper class para BY_COMPONENT (não necessário com nova arquitetura)
- [ ] Atualizar testes

#### 4.2 Criar @UseProviders ✅
```typescript
// packages/core/src/decorators/UseProviders/
// Implementado usando plugin architecture (correto!)

export function UseProviders(providers: ProviderShorthand[]) {
  return function <T extends new (...args: any[]) => any>(Ctor: T) {
    // Armazena metadata para UseProvidersPlugin processar
  };
}
```

**Tasks:**
- [x] Criar estrutura UseProviders/ com constants, types, index, Plugin
- [x] Implementar usando plugin architecture (não wrapper class)
- [x] UseProvidersPlugin com priority 1 (executa primeiro)
- [x] Registrar plugin em registerDefaultPlugins
- [x] Exportar de @mini/core
- [ ] Deprecar @Provide antigo do @mini/di
- [ ] Atualizar exemplos

#### 4.3 Refatorar @Inject (Opcional - Futuro)
```typescript
// packages/di/src/index.ts
// Inject já funciona bem com o novo sistema
// Possível simplificação futura para usar InjectorManager diretamente
```

**Tasks:**
- [ ] Avaliar se vale a pena refatorar (funciona bem como está)
- [ ] Se refatorar: usar InjectorManager diretamente
- [ ] Simplificar lógica de fallback
- [ ] Remover logs de debug

### Phase 5: Components

#### 5.1 Refatorar ProviderComponent → Provide
```typescript
// packages/core/src/Provide.ts (renomear)

export class Provide extends Component<{ values: ProviderShorthand[] }> {
  // Usar InjectorManager internamente
  // Delegar criação de injector
}
```

**Tasks:**
- [ ] Renomear arquivo ProviderComponent.ts → Provide.ts
- [ ] Refatorar para usar InjectorManager
- [ ] Atualizar imports em todo projeto
- [ ] Atualizar exemplos

### Phase 6: Integração com Application

#### 6.1 Adicionar validação no bootstrap
```typescript
// packages/core/src/Application.ts

export class Application {
  mount(selector: string): void {
    // Validar grafo ANTES de montar
    validateDependencyGraph();

    // Continuar montagem...
  }
}
```

**Tasks:**
- [ ] Importar validateDependencyGraph
- [ ] Chamar antes de mount
- [ ] Error handling com mensagens claras
- [ ] Log de sucesso em dev mode

### Phase 7: Atualizar Services Existentes

#### 7.1 Adicionar @Injectable nos services
```typescript
// Exemplos:
@Injectable()
export class AlertService {}

@Injectable()
export class ThemeService {}

@Injectable()
export class ApiService {
  @Inject(HttpClient) http!: HttpClient;
}
```

**Tasks:**
- [ ] Atualizar AlertService
- [ ] Atualizar ThemeService (Abstract + implementações)
- [ ] Atualizar RouterService
- [ ] Verificar todos os services em examples/

### Phase 8: Atualizar Plugins

#### 8.1 ResolverPlugin usar novos helpers
```typescript
// packages/core/src/decorators/Resolver/ResolverPlugin.ts

import { registerResolvedData } from '@mini/di';

execute(component: Component): void {
  // ...resolver logic...

  // Usar helper em vez de component.injector.addProvider
  registerResolvedData(component, resolverToken, data);
}
```

**Tasks:**
- [ ] Refatorar ResolverPlugin
- [ ] Usar registerResolvedData helper
- [ ] Remover logs de debug
- [ ] Testes

### Phase 9: Limpeza e Documentação

#### 9.1 Remover código antigo
**Tasks:**
- [ ] Remover logs de debug de produção
- [ ] Deprecar APIs antigas
- [ ] Remover código dead/duplicado
- [ ] Limpar imports não usados

#### 9.2 Atualizar documentação
**Tasks:**
- [ ] Atualizar README.md
- [ ] Atualizar ARCHITECTURE.md
- [ ] Criar guia de migração
- [ ] Atualizar exemplos em playground
- [ ] JSDoc completo nas APIs públicas

### Phase 10: Testes

#### 10.1 Testes unitários
**Tasks:**
- [ ] InjectableRegistry
- [ ] ReactiveInjector
- [ ] InjectorManager
- [ ] validateDependencyGraph
- [ ] Cada decorator individualmente

#### 10.2 Testes de integração
**Tasks:**
- [ ] Hierarchy de injectors
- [ ] Scopes (SINGLETON, BY_COMPONENT)
- [ ] Dependency resolution
- [ ] Circular dependency detection
- [ ] ResolverPlugin com novo sistema

#### 10.3 Testes end-to-end
**Tasks:**
- [ ] App completo em playground
- [ ] Múltiplos components com DI
- [ ] Re-renders preservam state
- [ ] Guards + Resolvers funcionam

## 🔄 Ordem de Implementação Recomendada

1. **Phase 1**: Base classes e registry (fundação)
2. **Phase 2**: InjectorManager (centralização)
3. **Phase 3**: Helpers (APIs simples)
4. **Phase 4**: Decorators (interfaces públicas)
5. **Phase 6**: Validação no Application
6. **Phase 5**: Components (dependem de decorators)
7. **Phase 7**: Services (aplicar @Injectable)
8. **Phase 8**: Plugins (usar novos helpers)
9. **Phase 9**: Limpeza
10. **Phase 10**: Testes

## 📊 Métricas de Sucesso

- [ ] Zero logs de debug em produção
- [ ] ResolverPlugin funciona corretamente
- [ ] Providers persistem através de re-renders
- [ ] Detecção de circular dependencies
- [ ] Mensagens de erro claras
- [ ] 100% dos services com @Injectable
- [ ] Cobertura de testes > 80%
- [ ] Documentação completa e atualizada

## 🐛 Problemas Conhecidos a Resolver

1. **Resolver data não persiste**: ✅ Resolvido com InjectorManager + WeakMap
2. **Múltiplos injectors criados**: ✅ Resolvido com centralização
3. **clearCache() perde state**: ✅ Resolvido com WeakMap
4. **Sem validação de deps**: ✅ Resolvido com validateDependencyGraph
5. **Debug difícil**: ✅ Resolvido com manager centralizado

## 📚 Referências

- **ARCHITECTURE.md**: Arquitetura geral do framework
- **PLUGIN_GUIDE.md**: Como criar plugins
- **KNOWLEDGE.md**: Knowledge base completa do projeto

## ✅ Checklist Final

Antes de considerar a refatoração completa:

- [ ] Todas as tasks das 10 phases completadas
- [ ] Testes passando (unit + integration + e2e)
- [ ] Documentação atualizada
- [ ] Exemplos funcionando
- [ ] Zero logs de debug
- [ ] Performance validada (sem regressões)
- [ ] Code review realizado
- [ ] Migration guide criado
