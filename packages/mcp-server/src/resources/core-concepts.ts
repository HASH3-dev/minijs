import { Resource } from "../types";

export const coreConceptsResources: Resource[] = [
  {
    uri: "minijs://core/overview",
    name: "MiniJS Framework Overview",
    description: "Visão geral do framework, por que usar e principais features",
    mimeType: "text/markdown",
    content: `# MiniJS Framework - Visão Geral

## Por Que MiniJS?

### Reatividade Granular - Como SolidJS
- Componente renderiza **UMA VEZ**
- Apenas signals/observables atualizam nós específicos no DOM
- Zero overhead de reconciliation
- Performance nativa do browser

### Classes, Não Functions
- Controle total sobre lifecycle
- Sem stale closures
- Métodos estáveis (sem useCallback)
- State natural (sem useState)
- Cleanup automático

### Dependency Injection Real
- Sistema DI hierárquico completo
- Abstrações testáveis
- Zero boilerplate
- Type-safe

### Two-Phase Rendering
- Bottom-Up rendering garante DI sempre disponível
- Slots funcionam perfeitamente
- Zero edge cases

## Principais Características

1. **Reatividade com RxJS** - Poder completo de observables
2. **JSX Nativo** - Syntax familiar e poderosa
3. **TypeScript First** - Type safety completo
4. **Classes + Decorators** - Arquitetura sólida
5. **Bundle Pequeno** - ~35KB total
6. **Zero Virtual DOM** - Updates diretos no DOM
7. **Guards & Resolvers** - Proteção de rotas e pré-carregamento
8. **Sistema de Slots** - Composição avançada

## Comparação Rápida

| Feature | Mini | React | Angular | SolidJS |
|---------|------|-------|---------|---------|
| Reatividade Granular | ✅ | ❌ | ❌ | ✅ |
| Classes | ✅ | ❌ | ✅ | ❌ |
| DI Hierárquico | ✅ | ❌ | ✅ | ❌ |
| RxJS Nativo | ✅ | ⚠️ | ✅ | ❌ |
| Bundle Size | ~30KB | ~45KB | ~150KB | ~25KB |
`,
  },
  {
    uri: "minijs://core/installation",
    name: "Instalação e Setup",
    description: "Como instalar e configurar um projeto MiniJS",
    mimeType: "text/markdown",
    content: `# Instalação e Setup do MiniJS

## Instalação

\`\`\`bash
npm install @mini/core @mini/router rxjs
\`\`\`

## tsconfig.json

\`\`\`json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "jsxImportSource": "@mini/core",
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "strict": true,
    "skipLibCheck": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "useDefineForClassFields": false
  }
}
\`\`\`

## vite.config.ts

\`\`\`typescript
import { defineConfig } from 'vite';

export default defineConfig({
  esbuild: {
    jsxImportSource: '@mini/core',
    jsx: 'automatic'
  }
});
\`\`\`

## main.tsx

\`\`\`typescript
import { Application } from '@mini/core';
import { App } from './App';

const app = new Application(App);
app.mount('#app');
\`\`\`

## Primeiro Componente

\`\`\`typescript
import { Component, signal, Mount } from '@mini/core';

export class App extends Component {
  count = signal(0);

  @Mount()
  onMount() {
    console.log('App mounted!');
  }

  render() {
    return (
      <div>
        <h1>Mini Framework</h1>
        <p>Count: {this.count}</p>
        <button onClick={() => this.count.next(this.count.value + 1)}>
          Increment
        </button>
      </div>
    );
  }
}
\`\`\`
`,
  },
  {
    uri: "minijs://core/component-basics",
    name: "Component Basics",
    description: "Fundamentos de componentes no MiniJS",
    mimeType: "text/markdown",
    content: `# Component Basics

## Estrutura de um Componente

\`\`\`typescript
import { Component, signal, Mount } from '@mini/core';

export class MyComponent extends Component {
  // 1. Properties (state)
  count = signal(0);
  message = signal('Hello');

  // 2. Lifecycle hooks
  @Mount()
  onMount() {
    console.log('Component mounted');

    // Cleanup function (opcional)
    return () => {
      console.log('Component unmounting');
    };
  }

  // 3. Methods
  increment() {
    this.count.next(this.count.value + 1);
  }

  // 4. Render method (obrigatório)
  render() {
    return (
      <div>
        <h1>{this.message}</h1>
        <p>Count: {this.count}</p>
        <button onClick={() => this.increment()}>
          Increment
        </button>
      </div>
    );
  }
}
\`\`\`

## Props

\`\`\`typescript
interface UserProps {
  name: string;
  age: number;
  onUpdate?: (name: string) => void;
}

export class User extends Component<UserProps> {
  render() {
    return (
      <div>
        <h2>{this.props.name}</h2>
        <p>Age: {this.props.age}</p>
        <button onClick={() => this.props.onUpdate?.('New Name')}>
          Update
        </button>
      </div>
    );
  }
}

// Uso
<User name="John" age={30} onUpdate={(name) => console.log(name)} />
\`\`\`

## Children

\`\`\`typescript
export class Card extends Component {
  render() {
    return (
      <div className="card">
        {this.children}
      </div>
    );
  }
}

// Uso
<Card>
  <h1>Title</h1>
  <p>Content</p>
</Card>
\`\`\`

## Component Lifecycle

\`\`\`typescript
class Component<P = {}> {
  // Props passadas pelo parent
  props: Readonly<P>;

  // Children do componente
  children?: any;

  // Injector DI hierárquico
  injector?: Injector;

  // Lifecycle observables
  $: {
    mounted$: Subject<void>;  // Emite quando monta
    unmount$: Subject<void>;  // Emite quando desmonta
  };

  // Método obrigatório
  abstract render(): any;

  // Métodos opcionais para LoadData/Resolvers
  renderLoading?(): any;
  renderError?(error: any): any;
  renderEmpty?(): any;

  // Cleanup manual
  destroy(): void;
}
\`\`\`

## Regras Importantes

1. **render() roda UMA VEZ** - Não pense em re-renders
2. **Use signals para reatividade** - Eles atualizam o DOM automaticamente
3. **@Mount para side effects** - Setup de WebSocket, timers, etc
4. **Retorne cleanup do @Mount** - Para limpar recursos
5. **Props são readonly** - Nunca modifique this.props
`,
  },
];
