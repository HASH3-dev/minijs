import { Resource } from "../types";

export const projectStructureResources: Resource[] = [
  {
    uri: "minijs://structure/overview",
    name: "Project Structure Overview",
    description: "Visão geral da estrutura de projeto recomendada",
    mimeType: "text/markdown",
    content: `# Estrutura de Projeto MiniJS

## Estrutura Base

\`\`\`
src/
├── repositories/          # Repository Pattern (HTTP calls)
├── features/             # Features/Módulos organizados por domínio
├── shared/               # Recursos compartilhados globalmente
├── assets/               # Assets estáticos
├── styles/               # Estilos globais
├── AppRouter.tsx         # Router principal
└── main.tsx              # Entry point
\`\`\`

## Repositories
Pastas que seguem Repository Pattern, responsáveis APENAS por HTTP calls.

\`\`\`
repositories/
└── user/
    ├── User.repository.ts    # Classe principal
    ├── constants.ts          # Endpoints, constantes
    ├── types.ts              # Types específicos
    ├── utils.ts              # Transformações (opcional)
    └── index.ts              # Exports
\`\`\`

## Features
Módulos de domínio com estrutura completa.

\`\`\`
features/
├── (landing)/            # Route Group (não aparece na URL)
├── (auth)/               # Route Group
├── (loggedArea)/         # Route Group
└── (admin)/              # Route Group
\`\`\`

## Route Groups
Pastas entre parênteses para organização lógica sem afetar URLs.

\`\`\`
features/(loggedArea)/
├── dashboard/            # Rota: /dashboard
├── products/             # Rota: /products
└── shared/               # Compartilhado neste grupo
\`\`\`
`,
  },
  {
    uri: "minijs://structure/naming",
    name: "Naming Conventions",
    description: "Convenções de nomenclatura de arquivos e classes",
    mimeType: "text/markdown",
    content: `# Convenções de Nomenclatura

## Arquivos e Classes

| Tipo | Formato Arquivo | Nome Classe | Exemplo |
|------|----------------|-------------|---------|
| Página | \`PascalCase.page.tsx\` | \`PascalCase\` | \`Login.page.tsx\` → \`class Login\` |
| Componente | \`PascalCase.component.tsx\` | \`PascalCase\` | \`Button.component.tsx\` → \`class Button\` |
| Service | \`PascalCase.service.ts\` | \`PascalCaseService\` | \`Auth.service.ts\` → \`class AuthService\` |
| Repository | \`PascalCase.repository.ts\` | \`PascalCaseRepository\` | \`User.repository.ts\` → \`class UserRepository\` |
| Guard | \`PascalCase.guard.ts\` | \`PascalCaseGuard\` | \`Auth.guard.ts\` → \`class AuthGuard\` |
| Resolver | \`PascalCase.resolver.ts\` | \`PascalCaseResolver\` | \`User.resolver.ts\` → \`class UserResolver\` |
| Types | \`camelCase.ts\` | - | \`types.ts\`, \`api.types.ts\` |
| Utils | \`camelCase.ts\` | - | \`formatDate.ts\` |
| Constants | \`constants.ts\` | - | \`constants.ts\` |
| Index | \`index.ts\` | - | \`index.ts\` (exports) |

## Pastas

| Tipo | Formato | Exemplo |
|------|---------|---------|
| Repository | \`kebab-case\` | \`user/\`, \`product/\` |
| Feature/Rota | \`kebab-case\` | \`user-profile/\` |
| Route Group | \`(camelCase)\` | \`(loggedArea)/\` |
| Rota Dinâmica | \`[param]\` | \`[id]/\` |
| Recursos | \`camelCase\` | \`components/\`, \`services/\` |

## Exemplos

✅ **Correto:**
- \`Login.page.tsx\` → \`export class Login extends Component\`
- \`Button.component.tsx\` → \`export class Button extends Component\`
- \`Auth.service.ts\` → \`export class AuthService\`
- \`User.repository.ts\` → \`export class UserRepository\`

❌ **Incorreto:**
- \`loginPage.tsx\` → \`class LoginPage\`
- \`btn.tsx\` → \`class MyButton\`
- \`authSvc.ts\` → \`class Auth\`
`,
  },
  {
    uri: "minijs://structure/repository",
    name: "Repository Pattern",
    description: "Como criar e organizar repositories",
    mimeType: "text/markdown",
    content: `# Repository Pattern

## Estrutura

\`\`\`
repositories/user/
├── User.repository.ts    # APENAS HTTP calls
├── constants.ts          # Endpoints
├── types.ts              # Interfaces
├── utils.ts              # Transformações
└── index.ts              # Exports
\`\`\`

## User.repository.ts

\`\`\`typescript
@Injectable()
export class UserRepository {
  async findAll(): Promise<User[]> {
    const response = await fetch(API_ENDPOINTS.USERS);
    return response.json();
  }

  async findById(id: string): Promise<User> {
    const response = await fetch(\`\${API_ENDPOINTS.USERS}/\${id}\`);
    return response.json();
  }

  async create(dto: CreateUserDto): Promise<User> {
    const response = await fetch(API_ENDPOINTS.USERS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });
    return response.json();
  }
}
\`\`\`

## constants.ts

\`\`\`typescript
const BASE_URL = '/api/v1';

export const API_ENDPOINTS = {
  USERS: \`\${BASE_URL}/users\`,
  USER_PROFILE: \`\${BASE_URL}/users/profile\`,
} as const;
\`\`\`

## types.ts

\`\`\`typescript
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
}
\`\`\`

## index.ts

\`\`\`typescript
export { UserRepository } from './User.repository';
export type { User, CreateUserDto } from './types';
export { API_ENDPOINTS } from './constants';
\`\`\`

## ⚠️ IMPORTANTE

❌ **NÃO coloque lógica de negócio no repository:**
\`\`\`typescript
// ❌ ERRADO
async getUserWithPermissions(id: string) {
  const user = await fetch(\`/users/\${id}\`);
  if (user.role === 'admin') {  // ❌ Lógica de negócio!
    user.permissions = ['all'];
  }
  return user;
}
\`\`\`

✅ **Coloque lógica de negócio no Service:**
\`\`\`typescript
// Repository: só HTTP
class UserRepository {
  async findById(id: string) {
    return fetch(\`/users/\${id}\`).then(r => r.json());
  }
}

// Service: lógica de negócio
class UserService {
  @Inject(UserRepository) repo!: UserRepository;

  async getUserWithPermissions(id: string) {
    const user = await this.repo.findById(id);
    return this.addPermissions(user);  // ✅ Lógica aqui
  }
}
\`\`\`
`,
  },
  {
    uri: "minijs://structure/feature",
    name: "Feature Structure",
    description: "Como organizar uma feature completa",
    mimeType: "text/markdown",
    content: `# Estrutura de Feature

## Feature Completa

\`\`\`
features/(loggedArea)/products/
├── Products.page.tsx         # Página principal
├── components/               # SEMPRE pastas
│   ├── ProductCard/
│   │   ├── ProductCard.component.tsx
│   │   ├── types.ts          # (opcional)
│   │   └── index.ts
│   └── index.ts
├── services/
│   ├── Product/
│   │   ├── Product.service.ts
│   │   └── index.ts
│   └── index.ts
├── guards/                   # (opcional)
├── resolvers/                # (opcional)
├── types.ts                  # Types da feature
└── index.ts                  # Export principal
\`\`\`

## Products.page.tsx

\`\`\`typescript
@Route('/products')
@UseProviders([ProductService])
export class Products extends Component {
  @Inject(ProductService) productService!: ProductService;

  products = signal<Product[]>([]);

  @Mount()
  async loadProducts() {
    const products = await this.productService.getProducts();
    this.products.next(products);
  }

  render() {
    return (
      <div>
        <h1>Produtos</h1>
        {this.products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    );
  }
}
\`\`\`

## services/Product.service.ts

\`\`\`typescript
@Injectable()
export class ProductService {
  @Inject(ProductRepository) repository!: ProductRepository;

  async getProducts(): Promise<Product[]> {
    const products = await this.repository.findAll();
    return this.applyBusinessLogic(products);
  }

  private applyBusinessLogic(products: Product[]): Product[] {
    return products.map(product => ({
      ...product,
      discountedPrice: this.calculateDiscount(product),
    }));
  }
}
\`\`\`

## index.ts (Feature)

\`\`\`typescript
// Página
export { Products } from './Products.page';

// Components
export * from './components';

// Services
export * from './services';

// Types
export type * from './types';
\`\`\`

## Regra: SEMPRE Use Pastas

✅ **Correto:**
\`\`\`
components/
├── ProductCard/
│   ├── ProductCard.component.tsx
│   └── index.ts
└── index.ts
\`\`\`

❌ **Evite:**
\`\`\`
components/
├── ProductCard.component.tsx  # ❌ Sem pasta
└── index.ts
\`\`\`

**Por quê?** Sempre há espaço para crescer (types, utils, etc.) sem refatorar.
`,
  },
  {
    uri: "minijs://structure/routing",
    name: "Routing Structure",
    description: "Rotas, Route Groups e rotas dinâmicas",
    mimeType: "text/markdown",
    content: `# Estrutura de Rotas

## Route Groups

Pastas com \`(parênteses)\` agrupam logicamente sem afetar URL.

\`\`\`
features/
├── (landing)/      # Landing pages
│   ├── home/       # Rota: /home
│   └── about/      # Rota: /about
├── (auth)/         # Autenticação
│   ├── login/      # Rota: /login
│   └── register/   # Rota: /register
└── (loggedArea)/   # Área logada
    ├── dashboard/  # Rota: /dashboard
    └── profile/    # Rota: /profile
\`\`\`

## Sub-rotas Aninhadas

\`\`\`
dashboard/
├── Dashboard.page.tsx        # /dashboard
├── analytics/
│   ├── Analytics.page.tsx    # /dashboard/analytics
│   └── reports/
│       └── Reports.page.tsx  # /dashboard/analytics/reports
\`\`\`

## Rotas Dinâmicas

Use \`[param]\` para parâmetros:

\`\`\`
products/
├── Products.page.tsx     # /products
└── [id]/
    ├── ProductDetail.page.tsx  # /products/:id
    └── edit/
        └── Edit.page.tsx       # /products/:id/edit
\`\`\`

## Acessar Parâmetros

\`\`\`typescript
@Route('/products/:id')
export class ProductDetail extends Component {
  @Inject(RouterService) router!: RouterService;

  @Mount()
  onMount() {
    this.router.params$.subscribe(params => {
      console.log('Product ID:', params.id);
      this.loadProduct(params.id);
    });
  }

  render() {
    return (
      <div>
        <h1>Product {this.router.params$.pipe(map(p => p.id))}</h1>
      </div>
    );
  }
}
\`\`\`

## Shared Resources por Grupo

Cada Route Group pode ter \`shared/\`:

\`\`\`
(loggedArea)/
├── dashboard/
├── products/
└── shared/              # Compartilhado na área logada
    ├── components/
    │   ├── Sidebar.component.tsx
    │   └── Header.component.tsx
    ├── guards/
    │   └── Auth.guard.ts
    └── index.ts
\`\`\`
`,
  },
];
