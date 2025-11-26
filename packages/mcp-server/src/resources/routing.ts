import { Resource } from "../types";

export const routingResources: Resource[] = [
  {
    uri: "minijs://routing/overview",
    name: "Routing System",
    description: "Sistema de rotas com Guards e Resolvers",
    mimeType: "text/markdown",
    content: `# Routing System

## Definir Rotas
\`\`\`typescript
@Route('/products/:id')
export class ProductDetail extends Component {
  @Inject(RouterService) router!: RouterService;

  @Mount()
  onMount() {
    this.router.params$.subscribe(params => {
      this.loadProduct(params.id);
    });
  }
}
\`\`\`

## Guards
\`\`\`typescript
@Injectable()
class AuthGuard implements Guard {
  canActivate() {
    return localStorage.getItem('token') !== null;
  }

  fallback() {
    return <Redirect to="/login" />;
  }
}

@Route('/dashboard')
@UseGuards([AuthGuard])
export class Dashboard extends Component {}
\`\`\`

## Resolvers
\`\`\`typescript
@Injectable()
class UserResolver implements Resolver<User> {
  async resolve(): Promise<User> {
    return fetch('/api/user').then(r => r.json());
  }
}

@Route('/profile')
@UseResolvers([UserResolver])
export class Profile extends Component {
  @Inject(UserResolver) user!: Signal<User>;

  render() {
    return <h1>Welcome {this.user.get('name')}</h1>;
  }
}
\`\`\`
`,
  },
];
