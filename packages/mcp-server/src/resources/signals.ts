import { Resource } from "../types";

export const signalsResources: Resource[] = [
  {
    uri: "minijs://signals/overview",
    name: "Signals API Complete",
    description:
      "API completa de Signals incluindo métodos funcionais e promise-like",
    mimeType: "text/markdown",
    content: `# Signals - API Completa

## Criação de Signals

\`\`\`typescript
// Signal com valor inicial
const count = signal(0);

// Signal sem valor inicial
const user = signal<User>();

// Verificar se tem valor
if (user.isInitialized()) {
  console.log(user.value);
}
\`\`\`

## Promise-Like (Awaitable)

\`\`\`typescript
// Signal é awaitable
const user = signal<User>();

// Aguarda o primeiro valor
const userData = await user;

// Encadeamento
signal(1)
  .then(value => value * 2)
  .then(value => console.log(value)) // 2
  .catch(err => console.error(err))
  .finally(() => console.log('Done'));

// Em @Mount
@Mount()
async loadData() {
  const user = await this.userResolver; // Aguarda resolver
  const data = await this.api.fetchData(user.id);
  this.data.next(data);
}
\`\`\`

## API Funcional

### map() - Transformação

\`\`\`typescript
// Valores simples
const count = signal(1);
const doubled = count.map(n => n * 2);

// Arrays
const numbers = signal([1, 2, 3]);
const doubled = numbers.map(n => n * 2); // [2, 4, 6]

// Sets, Maps - qualquer iterável
const tags = signal(new Set([1, 2, 3]));
const doubled = tags.map(n => n * 2); // [2, 4, 6]

// No render
render() {
  return (
    <ul>
      {this.users.map(user => (
        <li>{user.name}</li>
      ))}
    </ul>
  );
}
\`\`\`

### filter() - Filtrar

\`\`\`typescript
const numbers = signal([1, 2, 3, 4, 5]);
const evens = numbers.filter(n => n % 2 === 0); // [2, 4]

// No render
render() {
  return (
    <ul>
      {this.users
        .filter(user => user.active)
        .map(user => <li>{user.name}</li>)
      }
    </ul>
  );
}
\`\`\`

### reduce() - Redução

\`\`\`typescript
const numbers = signal([1, 2, 3, 4, 5]);
const sum = numbers.reduce((acc, n) => acc + n, 0); // 15

// No render
render() {
  return (
    <div>
      Total: \${this.cartItems.reduce((acc, item) => acc + item.price, 0)}
    </div>
  );
}
\`\`\`

### orElse() - Fallback

\`\`\`typescript
// IMPORTANTE: orElse recebe uma FUNÇÃO
const items = signal([]);
const display = items.orElse(() => [{ name: 'Nenhum item' }]);

const data = signal<User>();
const safeData = data.orElse(() => ({ name: 'Loading...' }));

// No render
render() {
  return (
    <ul>
      {this.users
        .orElse(() => [{ name: 'No users found' }])
        .map(user => <li>{user.name}</li>)
      }
    </ul>
  );
}
\`\`\`

### get() - Deep Property Access

\`\`\`typescript
const user = signal({
  name: 'John',
  address: {
    city: 'NYC',
    location: {
      lat: 40.7128,
      lng: -74.0060
    }
  }
});

// Acesso profundo type-safe
const city = user.get('address.city');
const lat = user.get('address.location.lat');

city.subscribe(v => console.log(v)); // 'NYC'
\`\`\`

### Chaining - Combinando Métodos

\`\`\`typescript
const users = signal([
  { name: 'John', age: 25, active: true },
  { name: 'Jane', age: 30, active: false },
  { name: 'Bob', age: 35, active: true },
]);

// Encadeamento poderoso
const activeUserNames = users
  .filter(user => user.active)
  .map(user => user.name.toUpperCase())
  .orElse(() => ['No active users']);

// No template
render() {
  return (
    <div>
      <ul>
        {this.users
          .filter(u => u.active)
          .map(u => <li key={u.id}>{u.name}</li>)
          .orElse(() => <li>No active users</li>)
        }
      </ul>

      <p>
        Total: {this.users
          .filter(u => u.active)
          .reduce((acc) => acc + 1, 0)
        }
      </p>
    </div>
  );
}
\`\`\`

## Tabela Resumo

| Método | Retorna | Uso |
|--------|---------|-----|
| \`map()\` | \`Signal<U>\` | Transform cada item |
| \`filter()\` | \`Signal<T>\` | Filtra por condição |
| \`reduce()\` | \`Signal<U>\` | Reduz a único valor |
| \`orElse()\` | \`Signal<T\\|U>\` | Fallback se vazio/undefined |
| \`get()\` | \`Signal<U>\` | Deep property access |
| \`then()\` | \`Promise<U>\` | Async/await |
| \`catch()\` | \`Promise<U>\` | Error handling |
| \`finally()\` | \`Promise<U>\` | Cleanup |
| \`isInitialized()\` | \`boolean\` | Check se tem valor |

## Exemplo Completo

\`\`\`typescript
export class SmartSearch extends Component {
  query = signal('');
  results = signal<Result[]>([]);
  loading = signal(false);

  @Watch('query', {
    skipInitialValue: true,
    pipes: [debounceTime(300), distinctUntilChanged(), filter(q => q.length > 2)]
  })
  async onSearch(query: string) {
    this.loading.next(true);
    try {
      const results = await this.api.search(query);
      this.results.next(results);
    } finally {
      this.loading.next(false);
    }
  }

  render() {
    return (
      <div>
        <input
          value={this.query}
          onInput={(e) => this.query.next(e.target.value)}
        />

        {this.loading.pipe(map(loading =>
          loading ? <Spinner /> : null
        ))}

        <ul>
          {this.results
            .filter(r => r.score > 0.5)
            .map(r => <li key={r.id}>{r.title}</li>)
            .orElse(() => <li>No results</li>)
          }
        </ul>
      </div>
    );
  }
}
\`\`\`
`,
  },
];
