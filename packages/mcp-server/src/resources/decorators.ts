import { Resource } from "../types";

export const decoratorsResources: Resource[] = [
  {
    uri: "minijs://decorators/all",
    name: "Decorators Reference",
    description: "Referência completa de todos os decorators do MiniJS",
    mimeType: "text/markdown",
    content: `# Decorators Reference

## @Mount() - Lifecycle Hook
Executa quando componente monta. Pode retornar cleanup.

\`\`\`typescript
@Mount()
setupWebSocket() {
  const ws = new WebSocket('ws://...');
  ws.onmessage = (e) => this.data.next(e.data);
  return () => ws.close(); // cleanup
}
\`\`\`

## @Watch(property, options?) - Observar Mudanças
Auto-subscribe em observables. Suporta dot notation e pipes RxJS.

\`\`\`typescript
@Watch('counter')
onCounterChange(value: number) {
  console.log('Changed:', value);
}

@Watch('counter', { skipInitialValue: false })
onCounterInit(value: number) {
  console.log('Initial:', value);
}

@Watch('search', {
  pipes: [debounceTime(300), distinctUntilChanged()]
})
onSearchDebounced(value: string) {
  this.performSearch(value);
}

@Watch('user.profile.name')
onNameChange(name: string) {
  console.log(name);
}
\`\`\`

## @LoadData(options?) - Async Loading
Gerencia estados de loading automático.

\`\`\`typescript
@LoadData({ label: 'Users', isEmpty: (data) => data.length === 0 })
loadUsers() {
  return this.api.fetchUsers();
}
\`\`\`

## @Route(path) - Definir Rota
\`\`\`typescript
@Route('/products/:id')
export class ProductDetail extends Component {}
\`\`\`

## @UseProviders(providers[]) - DI
\`\`\`typescript
@UseProviders([
  ApiService,
  { provide: API_URL, useValue: 'https://api.com' }
])
\`\`\`

## @UseGuards(guards[]) - Proteção
\`\`\`typescript
@UseGuards([AuthGuard, new RoleGuard('admin')])
\`\`\`

## @UseResolvers(resolvers[]) - Pré-carregamento
\`\`\`typescript
@UseResolvers([UserResolver, SettingsResolver])
export class Profile extends Component {
  @Inject(UserResolver) user!: Signal<User>;
}
\`\`\`

## @Injectable() - DI
\`\`\`typescript
@Injectable()
class MyService {}
\`\`\`

## @Inject(token) - Injetar Dependência
\`\`\`typescript
@Inject(ApiService) api!: ApiService;
@Inject(UserResolver) user!: Signal<User>;
\`\`\`

## @PersistentState(adapter) - Estado Persistente
\`\`\`typescript
@PersistentState(new UseURLStorage())
filters = signal({ region: 'all' });
\`\`\`

## @Child(slotName?) - Slots
\`\`\`typescript
@Child('header') header!: any;
@Child() content!: any; // default slot
\`\`\`
`,
  },
];
