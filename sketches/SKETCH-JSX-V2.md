# JSX V2 - Arquitetura Orientada a Objetos

## 📋 Visão Geral

Refatoração do interpretador JSX de uma abordagem procedural/funcional para uma **arquitetura orientada a objetos** usando design patterns modernos.

## 🎯 Objetivos

1. **Separação de Responsabilidades**: Cada classe tem uma única responsabilidade (SOLID)
2. **Testabilidade**: Classes menores e focadas são mais fáceis de testar
3. **Extensibilidade**: Adicionar novos comportamentos sem modificar código existente
4. **Manutenibilidade**: Código mais organizado e fácil de entender
5. **Performance**: Singletons para infraestrutura stateless

## 🏗️ Arquitetura

### **Padrões de Design Utilizados**

- **Singleton Pattern**: Para infraestrutura stateless (factories, renderers)
- **Strategy Pattern**: Para diferentes estratégias de aplicação de props
- **Factory Pattern**: Para criação de elementos
- **Visitor Pattern**: Para renderização de diferentes tipos de children
- **Template Method**: Para componentes com diferentes estados de renderização

### **Estrutura de Diretórios**

```
packages/core/src/
├── config/
│   └── RenderingConfig.ts          ✅ FASE 0 - Feature flag
├── jsx/                             ✅ V1 - Intacto
│   ├── dom.ts
│   ├── index.ts
│   └── slots.ts
├── jsx-v2/                          🚧 TODO - Nova implementação
│   ├── interpreter/
│   │   ├── JSXInterpreter.ts       (Singleton - orquestrador)
│   │   ├── ElementFactory.ts       (Singleton - factory)
│   │   └── FragmentHandler.ts
│   ├── rendering/
│   │   ├── PropsRenderer.ts        (Singleton - aplica props)
│   │   ├── ChildrenRenderer.ts     (Singleton - children)
│   │   └── PlaceholderRenderer.ts  (Singleton - placeholders)
│   ├── strategies/
│   │   ├── PropStrategy.ts         (interface)
│   │   ├── RefStrategy.ts
│   │   ├── EventStrategy.ts
│   │   ├── StyleStrategy.ts
│   │   ├── ObservableStrategy.ts
│   │   └── AttributeStrategy.ts
│   ├── reconciliation/
│   │   ├── ListReconciler.ts       (algoritmo de keys)
│   │   └── ReconciliationStrategy.ts
│   ├── subscriptions/
│   │   └── ObservableSubscriptionManager.ts
│   └── slots/
│       └── SlotManager.ts
├── base/                            ✅ V1 - Intacto
│   ├── CleanableComponent.ts
│   ├── Component.ts
│   ├── ReactiveComponent.ts
│   └── RenderableComponent.ts
├── base-v2/                         🚧 TODO - Nova hierarquia
│   ├── ReactiveComponent.ts        (cópia da v1)
│   ├── StatefulComponent.ts        (NOVO - gerencia render states)
│   ├── DOMManageableComponent.ts   (refactor de CleanableComponent)
│   ├── RenderableComponent.ts      (ajustado)
│   └── ComponentV2.ts              (nova implementação)
├── component-support/               🚧 TODO - Classes auxiliares
│   ├── DOMNodeRegistry.ts          (per component)
│   ├── CleanupRegistry.ts          (per component)
│   ├── RenderStateManager.ts       (per component)
│   └── InjectorFacade.ts           (per component)
├── Application.ts                   ✅ V1 - Intacto
├── ApplicationV2.ts                 ✅ FASE 0 - Stub criado
└── index.ts                         ✅ FASE 0 - Exports atualizados
```

## ✅ FASE 0: Setup (COMPLETA)

### **O que foi implementado:**

1. **RenderingConfig** - Feature flag para alternar entre V1 e V2
2. **ApplicationV2** - Stub que delega para V1 (será implementado depois)
3. **Exports atualizados** - V1 e V2 disponíveis no index.ts
4. **Build testado** - Tudo compila corretamente

### **Como usar:**

#### **Opção 1: Usar V1 (padrão - nada muda)**
```typescript
import { Application } from '@minijs/core';

const app = new Application(AppRouter);
app.mount('#app');
```

#### **Opção 2: Usar V2 (explicitamente)**
```typescript
import { ApplicationV2 as Application } from '@minijs/core';

const app = new Application(AppRouter);
app.mount('#app');
```

#### **Opção 3: Com RenderingConfig (para futuros recursos)**
```typescript
import { RenderingConfig, RenderingVersion, ApplicationV2 as Application } from '@minijs/core';

// Configura versão (afetará outros componentes quando implementados)
RenderingConfig.setVersion(RenderingVersion.V2);

const app = new Application(AppRouter);
app.mount('#app');
```

## 🔄 Próximas Fases

### **FASE 1: Infrastructure Layer (JSX Core)**
- [ ] Criar interfaces base (PropStrategy, ElementCreator, etc)
- [ ] Implementar ElementFactory (Singleton)
- [ ] Implementar PropStrategies (Singleton)
- [ ] Implementar PropsRenderer (Singleton)

### **FASE 2: Rendering Pipeline**
- [ ] Implementar ObservableSubscriptionManager (Singleton)
- [ ] Implementar ChildrenRenderer (Singleton)
- [ ] Implementar PlaceholderRenderer (Singleton)
- [ ] Implementar JSXInterpreter (Singleton - coordinator)

### **FASE 3: Advanced Features**
- [ ] Implementar ListReconciler (algoritmo de reconciliação)
- [ ] Implementar SlotManager (sistema de slots)

### **FASE 4: Component Refactoring**
- [ ] Criar classes de suporte (DOMNodeRegistry, CleanupRegistry, etc)
- [ ] Implementar StatefulComponent
- [ ] Refatorar para DOMManageableComponent
- [ ] Implementar ComponentV2

### **FASE 5: Integration & Testing**
- [ ] Integrar ApplicationV2 com jsx-v2
- [ ] Testes unitários para cada classe
- [ ] Testes de integração V1 vs V2
- [ ] Performance benchmarks
- [ ] Documentação completa

## 📊 Estratégia de Instanciação

| Classe | Padrão | Justificativa |
|--------|--------|---------------|
| JSXInterpreter | Singleton | Stateless, compartilhável |
| ElementFactory | Singleton | Stateless, compartilhável |
| PropsRenderer | Singleton | Stateless, compartilhável |
| ChildrenRenderer | Singleton | Stateless, compartilhável |
| DOMNodeRegistry | Instance | Stateful, por componente |
| CleanupRegistry | Instance | Stateful, por componente |
| RenderStateManager | Instance | Stateful, por componente |
| PropStrategies | Singleton | Stateless, lógica pura |

## 🎨 Exemplo de Código (Futuro)

### **Antes (V1 - Procedural)**
```typescript
// jsx/index.ts
export function createElement(type: any, props: any, parent: any): Node {
  if (typeof type === "function") {
    // 30 linhas de lógica...
  }

  const el = SVG_TAGS.has(type)
    ? document.createElementNS("...", type)
    : document.createElement(type);

  applyProps(el, props, parent); // função global
  return el;
}
```

### **Depois (V2 - OOP)**
```typescript
// jsx-v2/interpreter/JSXInterpreter.ts
export class JSXInterpreter {
  private static instance?: JSXInterpreter;

  private constructor(
    private elementFactory = ElementFactory.getInstance(),
    private propsRenderer = PropsRenderer.getInstance(),
    private childrenRenderer = ChildrenRenderer.getInstance()
  ) {}

  static getInstance(): JSXInterpreter {
    return this.instance ??= new JSXInterpreter();
  }

  createElement(type: any, props: any, parent?: Component): Node {
    const element = this.elementFactory.create(type, props, parent);

    if (element instanceof Element && props) {
      this.propsRenderer.apply(element, props, parent);
    }

    return element;
  }
}
```

## 🔑 Decisões Arquiteturais

### **1. Por que Singleton?**
- Infraestrutura stateless não precisa de múltiplas instâncias
- Economia de memória
- Facilita testes (pode resetar singleton entre testes)
- Permite configuração global (registrar estratégias customizadas)

### **2. Por que não usar DI framework?**
- Adiciona complexidade desnecessária
- Singletons são simples e eficazes para este caso
- DI do framework continua disponível para componentes
- Separação clara: infraestrutura (Singleton) vs componentes (DI)

### **3. Por que manter V1 intacto?**
- Zero breaking changes
- Rollback instantâneo se V2 tiver problemas
- Permite desenvolvimento incremental
- Facilita testes A/B

### **4. Por que ApplicationV2 não é um Adapter?**
- Usuário escolhe explicitamente qual versão usar
- Mais transparente e fácil de entender
- Sem "magic" - controle total
- Permite usar V1 e V2 no mesmo projeto (se necessário)

## 📈 Status Atual

- ✅ **FASE 0 COMPLETA**: Setup e feature flag implementados
- ✅ V1 continua funcionando 100%
- ✅ Build compilando corretamente
- ✅ Exports configurados
- 🚧 V2 aguardando implementação (próximas fases)

## 🚀 Como Contribuir

1. Escolha uma classe da FASE 1
2. Implemente seguindo os padrões estabelecidos
3. Adicione testes unitários
4. Documente a API pública
5. Atualize este documento

---

**Data de Criação**: 2026-01-08
**Última Atualização**: 2026-01-08 (FASE 0 completa)
**Status**: 🟡 Em Desenvolvimento (FASE 0 completa, iniciando FASE 1)
