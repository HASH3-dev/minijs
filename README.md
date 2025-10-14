# Mini Framework 🚀

Um framework web moderno e reativo com suporte a JSX, Dependency Injection hierárquica, sistema de slots e gestão automática de memória.

## 📋 Índice

- [Características](#-características)
- [Instalação](#-instalação)
- [Conceitos Principais](#-conceitos-principais)
- [Guia Rápido](#-guia-rápido)
- [Componentes](#-componentes)
- [Two-Phase Rendering](#-two-phase-rendering)
- [Dependency Injection](#-dependency-injection)
- [Slots System](#-slots-system)
- [Lifecycle Hooks](#-lifecycle-hooks)
- [Programação Reativa](#-programação-reativa)
- [Renderização Condicional](#-renderização-condicional)
- [Memory Management](#-memory-management)
- [API Reference](#-api-reference)

## ✨ Características

- 🎯 **Two-Phase Rendering**: Arquitetura bottom-up que garante funcionamento correto do DI
- 💉 **Dependency Injection Hierárquica**: Sistema de DI robusto com `@Provide` e `@Inject`
- 🎪 **Slots System**: Named slots para composição avançada de componentes
- 📡 **Reactive Programming**: Integração nativa com RxJS Observables
- 🔄 **Lifecycle Hooks**: `@Mount` decorator com suporte a múltiplos métodos
- 🧹 **Memory Management**: Limpeza automática de subscriptions e componentes
- ⚡ **Vite Compatible**: Otimizado para desenvolvimento moderno
- 🎨 **Tailwind CSS**: Suporte completo para utility-first CSS
- 🔀 **Conditional Rendering**: Componentes dinâmicos com Observables
- 📍 **Fragment Support**: JSX fragments com `<></>`

## 📦 Instalação

```bash
npm install @mini/core @mini/jsx @mini/di
```

### Configuração TypeScript

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@mini/jsx",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

### Configuração Vite

```typescript
// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  esbuild: {
    jsxImportSource: '@mini/jsx',
  },
});
```

## 🎓 Conceitos Principais

### Components

Componentes são classes que estendem `Component` e implementam o método `render()`:

```typescript
import { Component } from '@mini/core';

export class MyComponent extends Component {
  render() {
    return <div>Hello World!</div>;
  }
}
```

### JSX

O framework suporta JSX nativo com TypeScript:

```typescript
render() {
  return (
    <div class="container">
      <h1>Title</h1>
      <p>Content</p>
    </div>
  );
}
```

### Reactive Programming

Valores reativos são criados com `signal()` e automaticamente atualizados no DOM:

```typescript
import { Component, signal, unwrap } from '@mini/core';

export class Counter extends Component {
  count = signal(0);

  increment() {
    const current = unwrap(this.count);
    this.count.next(current + 1);
  }

  render() {
    return (
      <div>
        <p>Count: {this.count}</p>
        <button onClick={() => this.increment()}>
          Increment
        </button>
      </div>
    );
  }
}
```

## 🚀 Guia Rápido

### 1. Criar um Componente

```typescript
import { Component, Mount, signal } from '@mini/core';

export class App extends Component {
  name = signal('World');

  @Mount()
  onMount() {
    console.log('Component mounted!');
  }

  render() {
    return (
      <div>
        <h1>Hello {this.name}!</h1>
        <input
          value={this.name}
          onInput={(e) => this.name.next(e.target.value)}
        />
      </div>
    );
  }
}
```

### 2. Montar a Aplicação

```typescript
import { Application } from '@mini/core';
import { App } from './App';

const app = new Application(<App />);
app.mount('#root');
```

## 🎯 Componentes

### Props

Componentes recebem props através de um generic type:

```typescript
interface UserProps {
  name: string;
  age: number;
}

export class User extends Component<UserProps> {
  render() {
    return (
      <div>
        <p>Name: {this.props.name}</p>
        <p>Age: {this.props.age}</p>
      </div>
    );
  }
}

// Uso
<User name="John" age={25} />
```

### Props Reativas

Props podem ser Observables para valores dinâmicos:

```typescript
export class User extends Component<{ name: Observable<string> }> {
  render() {
    return <p>Name: {this.props.name}</p>;
  }
}

// Uso com Observable
<User name={this.userName} />
```

### Children

Componentes podem receber children através do decorator `@Child`:

```typescript
import { Component, Child } from '@mini/core';

export class Container extends Component {
  @Child() content!: any;

  render() {
    return (
      <div class="container">
        {this.content}
      </div>
    );
  }
}

// Uso
<Container>
  <p>This is the content</p>
</Container>
```

## 🏗️ Two-Phase Rendering

O framework utiliza uma arquitetura de renderização em duas fases que garante o funcionamento correto do Dependency Injection:

### Fase 1: Build Tree (Top-Down)

1. Instancia todos os componentes de cima para baixo
2. Processa props e children
3. Configura hierarquia de parent-child

### Fase 2: Render Tree (Bottom-Up)

1. Renderiza children primeiro (recursivo)
2. Renderiza parent depois
3. Executa lifecycle hooks
4. Anexa ao DOM

```typescript
// Ordem de renderização:
// 1. GrandChild.render() → DOM
// 2. Child.render() → DOM (com GrandChild já renderizado)
// 3. Parent.render() → DOM (com Child já renderizado)

<Parent>
  <Child>
    <GrandChild />
  </Child>
</Parent>
```

### Vantagens

- ✅ **DI sempre funciona**: Parents fornecem contexto antes de children renderizarem
- ✅ **Lifecycle correto**: Children montam antes de parents
- ✅ **Slots funcionam**: Children processados antes de parent.render()

## 💉 Dependency Injection

Sistema de DI hierárquico com suporte a providers e injeção de dependências.

### @Provide Decorator

Fornece dependências para o componente e seus filhos:

```typescript
import { Component } from '@mini/core';
import { Provide, Inject } from '@mini/di';

// Define um token
const THEME_TOKEN = Symbol('theme');

@Provide([
  { provide: THEME_TOKEN, useValue: 'dark' }
])
export class App extends Component {
  render() {
    return <ChildComponent />;
  }
}
```

### @Inject Decorator

Injeta dependências no componente:

```typescript
export class ChildComponent extends Component {
  @Inject(THEME_TOKEN)
  theme!: string;

  @Mount()
  onMount() {
    console.log(this.theme); // 'dark'
  }

  render() {
    return <div class={`theme-${this.theme}`}>Content</div>;
  }
}
```

### Provider Types

#### useValue

Fornece um valor direto:

```typescript
@Provide([
  { provide: CONFIG_TOKEN, useValue: { apiUrl: 'https://api.example.com' } }
])
```

#### useClass

Fornece uma instância de classe:

```typescript
@Provide([
  { provide: UserService, useClass: UserServiceImpl }
])
```

#### useFactory

Fornece valor através de factory function:

```typescript
@Provide([
  {
    provide: API_CLIENT,
    useFactory: (config: Config) => new ApiClient(config.apiUrl),
    deps: [CONFIG_TOKEN]
  }
])
```

### Provider Component

Para casos onde decorators não são possíveis:

```typescript
import { ProviderComponent } from '@mini/core';

export class App extends Component {
  render() {
    return (
      <ProviderComponent
        providers={[
          { provide: THEME_TOKEN, useValue: 'dark' }
        ]}
      >
        {(injector) => <ChildComponent />}
      </ProviderComponent>
    );
  }
}
```

### Hierarquia de DI

```typescript
@Provide([{ provide: TOKEN, useValue: 'parent' }])
class Parent extends Component {
  render() {
    return (
      <Provider providers={[{ provide: TOKEN, useValue: 'child' }]}>
        {() => <Child />}
      </Provider>
    );
  }
}

class Child extends Component {
  @Inject(TOKEN) value!: string; // 'child' (sobrescreve parent)
}
```

## 🎪 Slots System

Sistema de slots nomeados para composição avançada de componentes.

### Definindo Slots

Use o decorator `@Child` com nome do slot:

```typescript
export class Modal extends Component {
  @Child('header') header!: any;
  @Child('footer') footer!: any;
  @Child() content!: any; // Default slot

  render() {
    return (
      <div class="modal">
        <div class="modal-header">{this.header}</div>
        <div class="modal-body">{this.content}</div>
        <div class="modal-footer">{this.footer}</div>
      </div>
    );
  }
}
```

### Usando Slots

Use o atributo `slot` para direcionar content:

```typescript
<Modal>
  <Header slot="header" />
  <Footer slot="footer" />
  <p>Este conteúdo vai para o slot default</p>
</Modal>
```

### DI em Slots

Slotted children herdam o DI context do parent:

```typescript
@Provide([{ provide: MODAL_TOKEN, useValue: true }])
export class Modal extends Component {
  @Child('header') header!: Header;

  render() {
    return <div>{this.header}</div>;
  }
}

export class Header extends Component {
  @Inject(MODAL_TOKEN) isModal!: boolean; // ✅ Funciona!

  render() {
    return <h1>Header - {this.isModal ? 'In Modal' : 'Standalone'}</h1>;
  }
}
```

## 🔄 Lifecycle Hooks

### @Mount Decorator

Executa código quando o componente é montado no DOM:

```typescript
export class MyComponent extends Component {
  @Mount()
  onMount() {
    console.log('Component mounted!');

    // Retorne uma função para cleanup
    return () => {
      console.log('Component unmounted!');
    };
  }

  render() {
    return <div>Content</div>;
  }
}
```

### Múltiplos @Mount

Você pode ter múltiplos métodos @Mount na mesma classe:

```typescript
export class App extends Component {
  @Mount()
  setupSubscriptions() {
    const sub = interval(1000).subscribe(...);
    return () => sub.unsubscribe();
  }

  @Mount()
  logMount() {
    console.log('App mounted!');
  }

  @Mount()
  initializeAnalytics() {
    analytics.init();
    return () => analytics.destroy();
  }
}
```

### Lifecycle Signals

Componentes expõem signals de lifecycle:

```typescript
export class MyComponent extends Component {
  @Mount()
  onMount() {
    // Emite quando componente monta
    this.$.mounted$.subscribe(() => {
      console.log('Mounted!');
    });

    // Emite quando componente desmonta
    this.$.unmount$.subscribe(() => {
      console.log('Unmounting!');
    });
  }
}
```

### takeUntil Pattern

Use `takeUntil` para limpar subscriptions automaticamente:

```typescript
export class MyComponent extends Component {
  @Mount()
  onMount() {
    interval(1000)
      .pipe(takeUntil(this.$.unmount$))
      .subscribe((value) => {
        console.log(value);
      });
    // ✅ Subscription automaticamente cancelada no unmount
  }
}
```

## 📡 Programação Reativa

Integração completa com RxJS Observables.

### Signals

Crie valores reativos com `signal()`:

```typescript
export class Counter extends Component {
  count = signal(0);

  increment() {
    const current = unwrap(this.count);
    this.count.next(current + 1);
  }

  render() {
    return (
      <div>
        <p>Count: {this.count}</p>
        <button onClick={() => this.increment()}>+</button>
      </div>
    );
  }
}
```

### Observables no Template

Observables são automaticamente subscribed e cleaned up:

```typescript
export class App extends Component {
  time = signal(new Date());

  @Mount()
  onMount() {
    interval(1000)
      .pipe(takeUntil(this.$.unmount$))
      .subscribe(() => this.time.next(new Date()));
  }

  render() {
    return (
      <div>
        Current time: {this.time.pipe(map(d => d.toLocaleTimeString()))}
      </div>
    );
  }
}
```

### Computed Values

Use operators do RxJS para valores computed:

```typescript
export class User extends Component {
  firstName = signal('John');
  lastName = signal('Doe');

  get fullName() {
    return combineLatest([this.firstName, this.lastName]).pipe(
      map(([first, last]) => `${first} ${last}`)
    );
  }

  render() {
    return <p>Full name: {this.fullName}</p>;
  }
}
```

### Arrays Reativos

```typescript
export class TodoList extends Component {
  todos = signal<string[]>([]);

  addTodo(text: string) {
    const current = unwrap(this.todos);
    this.todos.next([...current, text]);
  }

  render() {
    return (
      <ul>
        {this.todos.pipe(
          map(todos => todos.map(todo => <li>{todo}</li>))
        )}
      </ul>
    );
  }
}
```

## 🔀 Renderização Condicional

### Boolean Conditions

```typescript
export class App extends Component {
  isVisible = signal(true);

  render() {
    return (
      <div>
        {this.isVisible && <p>I'm visible!</p>}
      </div>
    );
  }
}
```

### Observable Conditions

```typescript
export class App extends Component {
  counter = signal(0);

  render() {
    return (
      <div>
        {this.counter.pipe(
          map(count => count > 5),
          map(show => show && <Alert message="Counter is high!" />)
        )}
      </div>
    );
  }
}
```

### Dynamic Components

Renderize componentes dinamicamente com Observables:

```typescript
export class App extends Component {
  counter = signal(0);

  render() {
    return (
      <div>
        {this.counter.pipe(
          map(count => count % 2 === 0),
          map(isEven => isEven ? <EvenComponent /> : <OddComponent />)
        )}
      </div>
    );
  }
}
```

### Conditional Lists

```typescript
export class UserList extends Component {
  users = signal<User[]>([]);
  searchTerm = signal('');

  get filteredUsers() {
    return combineLatest([this.users, this.searchTerm]).pipe(
      map(([users, term]) =>
        users.filter(u => u.name.includes(term))
      )
    );
  }

  render() {
    return (
      <div>
        <input
          value={this.searchTerm}
          onInput={(e) => this.searchTerm.next(e.target.value)}
        />
        {this.filteredUsers.pipe(
          map(users => users.map(user => <UserCard user={user} />))
        )}
      </div>
    );
  }
}
```

## 🧹 Memory Management

O framework gerencia memória automaticamente, mas você deve seguir boas práticas.

### Automatic Cleanup

Subscriptions em templates são automaticamente limpas:

```typescript
render() {
  return (
    <div>
      {this.observable} {/* ✅ Auto cleanup */}
      <Component prop={this.observable} /> {/* ✅ Auto cleanup */}
    </div>
  );
}
```

### Manual Subscriptions

Use `takeUntil` para subscriptions manuais:

```typescript
@Mount()
onMount() {
  this.observable
    .pipe(takeUntil(this.$.unmount$)) // ✅ Cleanup no unmount
    .subscribe(value => {
      console.log(value);
    });
}
```

### Component Destruction

Componentes são automaticamente destruídos quando removidos do DOM:

```typescript
// Observable emite false
{this.showComponent && <MyComponent />}
// ✅ MyComponent.destroy() chamado automaticamente
// ✅ $.unmount$ emitido
// ✅ Todas as subscriptions canceladas
```

### Memory Leak Prevention

**❌ Evite:**

```typescript
@Mount()
onMount() {
  // SEM takeUntil - memory leak!
  interval(1000).subscribe(...);
}
```

**✅ Correto:**

```typescript
@Mount()
onMount() {
  // COM takeUntil - cleanup automático
  interval(1000)
    .pipe(takeUntil(this.$.unmount$))
    .subscribe(...);

  // OU retorne cleanup function
  const sub = interval(1000).subscribe(...);
  return () => sub.unsubscribe();
}
```

## 📚 API Reference

### @mini/core

#### Component

```typescript
abstract class Component<P = {}> {
  props: Readonly<P>;
  children?: any;
  injector?: any; // Access to DI injector
  $: {
    mounted$: Subject<void>;
    unmount$: Subject<void>;
  };

  abstract render(): any;
  destroy(): void;
}
```

#### Application

```typescript
class Application {
  constructor(rootComponent: Component);
  mount(selector: string | HTMLElement): void;
  unmount(): void;
  render(): Node;

  static render(component: Component, props?: any): Node;
}
```

#### Decorators

```typescript
// Marca método para execução no mount
function Mount(): MethodDecorator;

// Define child slots
function Child(slotName?: string): PropertyDecorator;
```

#### Utilities

```typescript
// Cria um signal (BehaviorSubject)
function signal<T>(initialValue: T): BehaviorSubject<T>;

// Unwrap signal value
function unwrap<T>(signal: BehaviorSubject<T>): T;

// Convert to Observable
function toObservable(value: any): Observable<any> | null;
```

### @mini/di

#### Decorators

```typescript
// Fornece dependências
function Provide(providers: Provider[]): ClassDecorator;

// Injeta dependência
function Inject<T>(token: Token<T>): PropertyDecorator;

// Marca classe como injectable
function Injectable(): ClassDecorator;
```

#### Types

```typescript
type Token<T = any> =
  | (abstract new (...args: any[]) => T)
  | (new (...args: any[]) => T)
  | symbol;

interface Provider<T = any> {
  provide: Token<T>;
  useClass?: new (...args: any[]) => T;
  useValue?: T;
  useFactory?: (...args: any[]) => T;
  deps?: Token[];
}
```

#### Injector

```typescript
class Injector {
  constructor(providers: Provider[], parent?: Injector);
  get<T>(token: Token<T>): T;
  has(token: Token): boolean;
}
```

### @mini/jsx

JSX runtime - configurado automaticamente via `jsxImportSource`.

## 🎨 Exemplo Completo

```typescript
import { Component, Mount, signal, unwrap } from '@mini/core';
import { Provide, Inject } from '@mini/di';
import { interval, map, takeUntil } from 'rxjs';

// Define tokens
const THEME_TOKEN = Symbol('theme');
const API_TOKEN = Symbol('api');

// Service
class ApiService {
  fetchUsers() {
    return fetch('/api/users').then(r => r.json());
  }
}

// Root component com DI
@Provide([
  { provide: THEME_TOKEN, useValue: 'dark' },
  { provide: API_TOKEN, useClass: ApiService }
])
export class App extends Component {
  private counter = signal(0);
  private users = signal<User[]>([]);

  @Mount()
  startCounter() {
    interval(1000)
      .pipe(takeUntil(this.$.unmount$))
      .subscribe(() => {
        const current = unwrap(this.counter);
        this.counter.next(current + 1);
      });
  }

  @Mount()
  async loadUsers() {
    const api = this.injector.get(API_TOKEN);
    const users = await api.fetchUsers();
    this.users.next(users);
  }

  render() {
    return (
      <div class="app">
        <Header />

        <main>
          <Counter count={this.counter} />

          {this.counter.pipe(
            map(count => count % 2 === 0),
            map(isEven => isEven && <EvenBanner />)
          )}

          <UserList users={this.users} />
        </main>

        <Footer />
      </div>
    );
  }
}

// Child component com DI injection
class Header extends Component {
  @Inject(THEME_TOKEN) theme!: string;

  render() {
    return (
      <header class={`theme-${this.theme}`}>
        <h1>My App</h1>
      </header>
    );
  }
}

// Component com slots
class Modal extends Component {
  @Child('header') modalHeader!: any;
  @Child('footer') modalFooter!: any;
  @Child() content!: any;

  render() {
    return (
      <div class="modal">
        <div class="modal-header">{this.modalHeader}</div>
        <div class="modal-body">{this.content}</div>
        <div class="modal-footer">{this.modalFooter}</div>
      </div>
    );
  }
}

// Usage
<Modal>
  <h2 slot="header">Title</h2>
  <button slot="footer">Close</button>
  <p>Modal content goes here</p>
</Modal>

// Mount application
const app = new Application(<App />);
app.mount('#root');
```

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor, abra uma issue ou pull request.

## 📄 Licença

MIT

---

**Mini Framework** - Um framework moderno para desenvolvimento web reativo 🚀
