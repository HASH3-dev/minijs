import { Resource } from "../types";

export const diResources: Resource[] = [
  {
    uri: "minijs://di/overview",
    name: "Dependency Injection",
    description: "Sistema DI hierárquico completo",
    mimeType: "text/markdown",
    content: `# Dependency Injection

## @Injectable() e @Inject()
\`\`\`typescript
@Injectable()
class ApiService {
  fetchData() { /* ... */ }
}

export class MyComponent extends Component {
  @Inject(ApiService) api!: ApiService;

  @Mount()
  async loadData() {
    const data = await this.api.fetchData();
  }
}
\`\`\`

## @UseProviders()
\`\`\`typescript
@Route('/products')
@UseProviders([
  ApiService,
  { provide: API_URL, useValue: 'https://api.com' },
  { provide: StorageService, useClass: LocalStorageService }
])
export class Products extends Component {}
\`\`\`

## Abstrações
\`\`\`typescript
abstract class PaymentService {
  abstract processPayment(amount: number): Promise<void>;
}

@Injectable()
class StripePayment extends PaymentService {
  async processPayment(amount: number) { /* ... */ }
}

@UseProviders([
  { provide: PaymentService, useClass: StripePayment }
])
\`\`\`
`,
  },
];
