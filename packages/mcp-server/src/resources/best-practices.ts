import { Resource } from "../types";

export const bestPracticesResources: Resource[] = [
  {
    uri: "minijs://best-practices/overview",
    name: "Best Practices",
    description: "Melhores práticas e padrões recomendados",
    mimeType: "text/markdown",
    content: `# Best Practices

## Separação de Responsabilidades

✅ **Repository**: APENAS HTTP calls
✅ **Service**: Lógica de negócio
✅ **Component**: UI e interação

## Nomenclatura Consistente

\`\`\`typescript
// ✅ BOM
Login.page.tsx → class Login
Button.component.tsx → class Button
Auth.service.ts → class AuthService
User.repository.ts → class UserRepository
\`\`\`

## Sempre Use Pastas

\`\`\`
✅ BOM:
components/
├── Button/
│   ├── Button.component.tsx
│   └── index.ts
└── index.ts

❌ EVITE:
components/
├── Button.component.tsx
└── index.ts
\`\`\`

## Index Files Estratégicos

Use index.ts onde faz sentido para exports limpos.

## Imports com Path Aliases

\`\`\`typescript
// ✅ BOM
import { UserRepository } from '@/repositories/user';
import { Button } from '@/shared';

// ❌ EVITE
import { UserRepository } from '../../../repositories/user/User.repository';
\`\`\`

## Signals vs RxJS Operators

\`\`\`typescript
// ✅ Prefer signal methods quando possível
this.user.get('name')  // ✅ Simples e direto
this.users.filter(u => u.active)  // ✅ Funcional
this.items.orElse(() => [])  // ✅ Fallback limpo

// ⚠️ Use .pipe() quando necessário operadores RxJS complexos
this.search.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap(q => this.api.search(q))
)
\`\`\`
`,
  },
];
