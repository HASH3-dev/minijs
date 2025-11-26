# 📁 Guia de Estrutura de Projeto MiniJS

> **Organização escalável, intuitiva e type-safe para aplicações MiniJS**

Este guia define a estrutura de pastas e convenções de nomenclatura recomendadas para aplicações MiniJS, combinando o melhor dos padrões Domain-Driven Design com file-based routing inspirado no Next.js.

---

## 📋 Índice

1. [Visão Geral](#-visão-geral)
2. [Estrutura Completa](#-estrutura-completa)
3. [Convenções de Nomenclatura](#-convenções-de-nomenclatura)
4. [Repositories](#-repositories)
5. [Features](#-features)
6. [Route Groups](#-route-groups)
7. [Sub-rotas Recursivas](#-sub-rotas-recursivas)
8. [Rotas Dinâmicas](#-rotas-dinâmicas)
9. [Shared Resources](#-shared-resources)
10. [Index Files](#-index-files)
11. [Exemplos Práticos](#-exemplos-práticos)
12. [Boas Práticas](#-boas-práticas)

---

## 🎯 Visão Geral

A estrutura proposta divide a aplicação em duas camadas principais:

1. **`repositories/`** - Camada de dados (Repository Pattern para HTTP)
2. **`features/`** - Camada de apresentação (Features organizadas por domínio)

Além disso, suporta:
- ✅ **Route Groups** - Agrupamento lógico sem afetar URLs
- ✅ **Sub-rotas Recursivas** - Aninhamento infinito de rotas
- ✅ **Rotas Dinâmicas** - Parâmetros de URL
- ✅ **Shared Resources** - Recursos compartilhados globalmente ou por grupo
- ✅ **Index Exports** - Exports organizados com index.ts

---

## 🏗️ Estrutura Completa

```
src/
├── repositories/              # 🗄️ Repository Pattern (HTTP calls)
│   ├── user/                  # Pasta para User repository
│   │   ├── User.repository.ts
│   │   ├── constants.ts
│   │   ├── types.ts
│   │   ├── utils.ts
│   │   └── index.ts           # ← Export tudo
│   │
│   ├── product/
│   │   ├── Product.repository.ts
│   │   ├── constants.ts
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   └── auth/
│       ├── Auth.repository.ts
│       ├── constants.ts
│       ├── types.ts
│       └── index.ts
│
├── features/                  # 🎨 Features/Módulos da aplicação
│   │
│   ├── (landing)/            # 🏷️ Route Group: Landing pages
│   │   ├── home/             # Rota: /home
│   │   │   ├── Home.page.tsx
│   │   │   │
│   │   │   ├── components/
│   │   │   │   ├── Hero/
│   │   │   │   │   ├── Hero.component.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   └── index.ts      # ← Export da feature
│   │   │
│   │   ├── about/            # Rota: /about
│   │   │   ├── About.page.tsx
│   │   │   ├── components/
│   │   │   └── index.ts
│   │   │
│   │   ├── shared/           # Compartilhado no grupo landing
│   │   │   ├── components/
│   │   │   │   ├── Footer/
│   │   │   │   │   ├── Footer.component.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   ├── services/
│   │   │   └── index.ts
│   │   │
│   │   └── index.ts          # ← Export do grupo
│   │
│   ├── (auth)/               # 🏷️ Route Group: Autenticação
│   │   ├── login/            # Rota: /login
│   │   │   ├── Login.page.tsx
│   │   │   │
│   │   │   ├── components/
│   │   │   │   ├── LoginForm/
│   │   │   │   │   ├── LoginForm.component.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   └── index.ts
│   │   │
│   │   ├── register/         # Rota: /register
│   │   │   ├── Register.page.tsx
│   │   │   ├── components/
│   │   │   └── index.ts
│   │   │
│   │   ├── shared/
│   │   │   ├── guards/
│   │   │   │   ├── Guest/
│   │   │   │   │   ├── Guest.guard.ts
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── services/
│   │   │   │   ├── Auth/
│   │   │   │   │   ├── Auth.service.ts
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   └── index.ts
│   │   │
│   │   └── index.ts
│   │
│   ├── (loggedArea)/         # 🏷️ Route Group: Área logada
│   │   ├── dashboard/        # Rota: /dashboard
│   │   │   ├── Dashboard.page.tsx
│   │   │   │
│   │   │   ├── components/
│   │   │   │   ├── StatsCard/
│   │   │   │   │   ├── StatsCard.component.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── analytics/    # Rota: /dashboard/analytics
│   │   │   │   ├── Analytics.page.tsx
│   │   │   │   │
│   │   │   │   ├── components/
│   │   │   │   │   ├── Chart/
│   │   │   │   │   │   ├── Chart.component.tsx
│   │   │   │   │   │   └── index.ts
│   │   │   │   │   └── index.ts
│   │   │   │   │
│   │   │   │   ├── services/
│   │   │   │   │   ├── Analytics/
│   │   │   │   │   │   ├── Analytics.service.ts
│   │   │   │   │   │   └── index.ts
│   │   │   │   │   └── index.ts
│   │   │   │   │
│   │   │   │   ├── reports/  # Rota: /dashboard/analytics/reports
│   │   │   │   │   ├── Reports.page.tsx
│   │   │   │   │   ├── components/
│   │   │   │   │   └── index.ts
│   │   │   │   │
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── settings/     # Rota: /dashboard/settings
│   │   │   │   ├── Settings.page.tsx
│   │   │   │   ├── components/
│   │   │   │   │
│   │   │   │   ├── profile/  # Rota: /dashboard/settings/profile
│   │   │   │   │   ├── Profile.page.tsx
│   │   │   │   │   ├── components/
│   │   │   │   │   └── index.ts
│   │   │   │   │
│   │   │   │   ├── security/ # Rota: /dashboard/settings/security
│   │   │   │   │   ├── Security.page.tsx
│   │   │   │   │   ├── components/
│   │   │   │   │   └── index.ts
│   │   │   │   │
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   └── index.ts
│   │   │
│   │   ├── products/         # Rota: /products
│   │   │   ├── Products.page.tsx
│   │   │   │
│   │   │   ├── components/
│   │   │   │   ├── ProductCard/
│   │   │   │   │   ├── ProductCard.component.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── ProductFilter/
│   │   │   │   │   ├── ProductFilter.component.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── services/
│   │   │   │   ├── Product/
│   │   │   │   │   ├── Product.service.ts
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── resolvers/
│   │   │   │   ├── ProductList/
│   │   │   │   │   ├── ProductList.resolver.ts
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── types.ts
│   │   │   │
│   │   │   ├── [id]/         # Rota: /products/:id (dinâmica)
│   │   │   │   ├── ProductDetail.page.tsx
│   │   │   │   ├── components/
│   │   │   │   │   └── index.ts
│   │   │   │   ├── resolvers/
│   │   │   │   │   └── index.ts
│   │   │   │   │
│   │   │   │   ├── edit/     # Rota: /products/:id/edit
│   │   │   │   │   ├── ProductEdit.page.tsx
│   │   │   │   │   ├── components/
│   │   │   │   │   └── index.ts
│   │   │   │   │
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   └── index.ts
│   │   │
│   │   ├── shared/           # Compartilhado na área logada
│   │   │   ├── components/
│   │   │   │   ├── Sidebar/
│   │   │   │   │   ├── Sidebar.component.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── Header/
│   │   │   │   │   ├── Header.component.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── guards/
│   │   │   │   ├── Auth/
│   │   │   │   │   ├── Auth.guard.ts
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── services/
│   │   │   └── index.ts
│   │   │
│   │   └── index.ts
│   │
│   └── (admin)/              # 🏷️ Route Group: Admin
│       ├── users/            # Rota: /users
│       │   ├── Users.page.tsx
│       │   ├── components/
│       │   │   └── index.ts
│       │   │
│       │   ├── [id]/         # Rota: /users/:id
│       │   │   ├── UserDetail.page.tsx
│       │   │   ├── components/
│       │   │   └── index.ts
│       │   │
│       │   └── index.ts
│       │
│       ├── shared/
│       │   ├── guards/
│       │   │   ├── Admin/
│       │   │   │   ├── Admin.guard.ts
│       │   │   │   └── index.ts
│       │   │   └── index.ts
│       │   │
│       │   ├── components/
│       │   └── index.ts
│       │
│       └── index.ts
│
├── shared/                   # 🌍 Recursos compartilhados globalmente
│   ├── components/           # Componentes reutilizáveis
│   │   ├── Button/
│   │   │   ├── Button.component.tsx
│   │   │   └── index.ts
│   │   ├── Modal/
│   │   │   ├── Modal.component.tsx
│   │   │   └── index.ts
│   │   ├── Loading/
│   │   │   ├── Loading.component.tsx
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── services/             # Services globais
│   │   ├── Theme/
│   │   │   ├── Theme.service.ts
│   │   │   └── index.ts
│   │   ├── Storage/
│   │   │   ├── Storage.service.ts
│   │   │   └── index.ts
│   │   ├── Notification/
│   │   │   ├── Notification.service.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── guards/               # Guards globais
│   │   ├── Role/
│   │   │   ├── Role.guard.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── types/                # Types globais
│   │   ├── api.types.ts
│   │   ├── models.types.ts
│   │   └── index.ts
│   │
│   ├── utils/                # Utilitários
│   │   ├── formatDate.ts
│   │   ├── validateEmail.ts
│   │   ├── parseQuery.ts
│   │   └── index.ts
│   │
│   └── index.ts
│
├── assets/                   # Assets estáticos
│   ├── images/
│   │   ├── logo.svg
│   │   └── banner.jpg
│   └── icons/
│       └── check.svg
│
├── styles/                   # Estilos globais
│   ├── globals.css
│   └── variables.css
│
├── AppRouter.tsx             # Router principal
└── main.tsx                  # Entry point
```

---

## 📐 Convenções de Nomenclatura

### Arquivos e Classes

| Tipo | Formato do Arquivo | Nome da Classe | Exemplo |
|------|-------------------|----------------|---------|
| **Página** | `PascalCase.page.tsx` | `PascalCase` | `Login.page.tsx` → `class Login` |
| **Componente** | `PascalCase.component.tsx` | `PascalCase` | `Button.component.tsx` → `class Button` |
| **Service** | `PascalCase.service.ts` | `PascalCase` | `Auth.service.ts` → `class AuthService` |
| **Repository** | `PascalCase.repository.ts` | `PascalCase` | `User.repository.ts` → `class UserRepository` |
| **Guard** | `PascalCase.guard.ts` | `PascalCase` | `Auth.guard.ts` → `class AuthGuard` |
| **Resolver** | `PascalCase.resolver.ts` | `PascalCase` | `User.resolver.ts` → `class UserResolver` |
| **Provider** | `PascalCase.provider.ts` | - | `Auth.provider.ts` |
| **Types** | `camelCase.ts` | - | `api.types.ts` ou `types.ts` |
| **Utils** | `camelCase.ts` | - | `formatDate.ts` |
| **Constants** | `camelCase.ts` | - | `constants.ts` |
| **Index** | `index.ts` | - | `index.ts` (exports) |

### Pastas

| Tipo | Formato | Descrição | Exemplo |
|------|---------|-----------|---------|
| **Repository** | `kebab-case` | Nome do domínio | `user/`, `product/` |
| **Feature/Rota** | `kebab-case` | Nome da rota | `user-profile/` → `/user-profile` |
| **Route Group** | `(camelCase)` | Não vira URL | `(loggedArea)/` → não aparece na URL |
| **Rota Dinâmica** | `[param]` | Parâmetro de URL | `[id]/` → `/:id` |
| **Pasta de Recursos** | `camelCase` | components, services, etc. | `components/`, `services/` |

---

## 🗄️ Repositories

### O Que São

Repositories seguem o **Repository Pattern** e são responsáveis **exclusivamente** por chamadas HTTP à API. Cada repository é uma **pasta** que pode conter múltiplos arquivos relacionados.

### Estrutura de um Repository

```
repositories/
└── user/
    ├── User.repository.ts    # Classe principal
    ├── constants.ts          # Constantes (endpoints, etc)
    ├── types.ts              # Types específicos
    ├── utils.ts              # Utilitários (opcional)
    └── index.ts              # Exports
```

### Exemplo Completo

#### 📄 `User.repository.ts`

```typescript
// repositories/user/User.repository.ts
import { Injectable } from '@mini/core';
import { API_ENDPOINTS } from './constants';
import { User, CreateUserDto, UpdateUserDto } from './types';
import { transformUserResponse } from './utils';

@Injectable()
export class UserRepository {
  async findAll(): Promise<User[]> {
    const response = await fetch(API_ENDPOINTS.USERS);
    const data = await response.json();
    return data.map(transformUserResponse);
  }

  async findById(id: string): Promise<User> {
    const response = await fetch(`${API_ENDPOINTS.USERS}/${id}`);
    const data = await response.json();
    return transformUserResponse(data);
  }

  async create(dto: CreateUserDto): Promise<User> {
    const response = await fetch(API_ENDPOINTS.USERS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });
    const data = await response.json();
    return transformUserResponse(data);
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const response = await fetch(`${API_ENDPOINTS.USERS}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });
    const data = await response.json();
    return transformUserResponse(data);
  }

  async delete(id: string): Promise<void> {
    await fetch(`${API_ENDPOINTS.USERS}/${id}`, {
      method: 'DELETE',
    });
  }
}
```

#### 📄 `constants.ts`

```typescript
// repositories/user/constants.ts
const BASE_URL = '/api/v1';

export const API_ENDPOINTS = {
  USERS: `${BASE_URL}/users`,
  USER_PROFILE: `${BASE_URL}/users/profile`,
  USER_AVATAR: `${BASE_URL}/users/avatar`,
} as const;

export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  GUEST: 'guest',
} as const;

export const MAX_USERNAME_LENGTH = 50;
export const MIN_PASSWORD_LENGTH = 8;
```

#### 📄 `types.ts`

```typescript
// repositories/user/types.ts
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'user' | 'guest';
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  avatar?: string;
}

export interface UserApiResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  created_at: string;
  updated_at: string;
}
```

#### 📄 `utils.ts`

```typescript
// repositories/user/utils.ts
import { User, UserApiResponse } from './types';

export function transformUserResponse(data: UserApiResponse): User {
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    role: data.role as User['role'],
    avatar: data.avatar || undefined,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
```

#### 📄 `index.ts`

```typescript
// repositories/user/index.ts

// Repository
export { UserRepository } from './User.repository';

// Types
export type {
  User,
  CreateUserDto,
  UpdateUserDto,
  UserApiResponse,
} from './types';

// Constants
export {
  API_ENDPOINTS,
  USER_ROLES,
  MAX_USERNAME_LENGTH,
  MIN_PASSWORD_LENGTH,
} from './constants';

// Utils
export {
  transformUserResponse,
  validateEmail,
} from './utils';
```

### Uso do Repository

```typescript
// Em qualquer lugar da aplicação
import { UserRepository, User, API_ENDPOINTS } from '@/repositories/user';

// Tudo está disponível através do index.ts
```

---

## 🎨 Features

### O Que São

Features são **módulos de domínio** que organizam toda a lógica relacionada a uma funcionalidade específica. Cada feature deve ter um **`index.ts`** para exports organizados.

### Estrutura de Uma Feature

```
features/
└── products/
    ├── Products.page.tsx         # Página principal
    │
    ├── components/               # Componentes (sempre pastas)
    │   ├── ProductCard/
    │   │   ├── ProductCard.component.tsx
    │   │   ├── types.ts          # (opcional)
    │   │   ├── utils.ts          # (opcional)
    │   │   ├── constants.ts      # (opcional)
    │   │   └── index.ts
    │   │
    │   ├── ProductFilter/
    │   │   ├── ProductFilter.component.tsx
    │   │   ├── types.ts          # (opcional)
    │   │   └── index.ts
    │   │
    │   └── index.ts              # ← Export dos componentes
    │
    ├── services/                 # Services (sempre pastas)
    │   ├── Product/
    │   │   ├── Product.service.ts
    │   │   ├── types.ts          # (opcional)
    │   │   ├── utils.ts          # (opcional)
    │   │   └── index.ts
    │   │
    │   └── index.ts
    │
    ├── guards/                   # Guards (sempre pastas)
    │   ├── ProductOwner/
    │   │   ├── ProductOwner.guard.ts
    │   │   ├── types.ts          # (opcional)
    │   │   └── index.ts
    │   │
    │   └── index.ts
    │
    ├── resolvers/                # Resolvers (sempre pastas)
    │   ├── ProductList/
    │   │   ├── ProductList.resolver.ts
    │   │   ├── types.ts          # (opcional)
    │   │   └── index.ts
    │   │
    │   └── index.ts
    │
    ├── types.ts                  # Types da feature
    └── index.ts                  # ← Export principal da feature
```

**Regra Importante:**
- ✅ **SEMPRE** organize componentes, services, guards, resolvers, etc. em **pastas**
- ✅ Cada pasta deve ter seu `index.ts` exportando a entidade principal
- ✅ Arquivos auxiliares (`types.ts`, `utils.ts`, `constants.ts`) são opcionais
- ✅ Isso garante escalabilidade - sempre há espaço para crescer sem refatorar

### Exemplo: Index de Feature

#### 📄 `components/index.ts`

```typescript
// features/(loggedArea)/products/components/index.ts

export { ProductCard } from './ProductCard.component';
export { ProductFilter } from './ProductFilter.component';
export { ProductGrid } from './ProductGrid.component';
```

#### 📄 `services/index.ts`

```typescript
// features/(loggedArea)/products/services/index.ts

export { ProductService } from './Product.service';
```

#### 📄 `index.ts` (Feature Principal)

```typescript
// features/(loggedArea)/products/index.ts

// Página
export { Products } from './Products.page';

// Components
export * from './components';

// Services
export * from './services';

// Guards
export * from './guards';

// Resolvers
export * from './resolvers';

// Types
export type * from './types';
```

### Uso da Feature

```typescript
// Em outro lugar
import {
  Products,
  ProductCard,
  ProductFilter,
  ProductService,
} from '@/features/(loggedArea)/products';

// Tudo organizado e disponível!
```

---

## 🏷️ Route Groups

### O Que São

Route Groups são **pastas entre parênteses** `(nome)` que servem para **organização lógica** sem afetar a estrutura de URLs.

### Estrutura com Index

```
features/
├── (landing)/
│   ├── home/
│   │   └── index.ts
│   ├── about/
│   │   └── index.ts
│   ├── shared/
│   │   └── index.ts
│   └── index.ts          # ← Export do grupo inteiro
│
├── (auth)/
│   ├── login/
│   │   └── index.ts
│   ├── register/
│   │   └── index.ts
│   ├── shared/
│   │   └── index.ts
│   └── index.ts
│
└── (loggedArea)/
    ├── dashboard/
    │   └── index.ts
    ├── products/
    │   └── index.ts
    ├── shared/
    │   └── index.ts
    └── index.ts
```

### Exemplo: Index de Route Group

#### 📄 `(loggedArea)/index.ts`

```typescript
// features/(loggedArea)/index.ts

// Pages
export * from './dashboard';
export * from './products';
export * from './orders';

// Shared
export * from './shared';
```

#### 📄 `(loggedArea)/shared/index.ts`

```typescript
// features/(loggedArea)/shared/index.ts

// Components
export { Sidebar } from './components/Sidebar.component';
export { Header } from './components/Header.component';

// Guards
export { AuthGuard } from './guards/Auth.guard';

// Services
export { SessionService } from './services/Session.service';
```

---

## 🔄 Sub-rotas Recursivas

### Estrutura com Índices Recursivos

```
features/
└── (loggedArea)/
    └── dashboard/
        ├── Dashboard.page.tsx
        ├── components/
        │   └── index.ts
        │
        ├── analytics/
        │   ├── Analytics.page.tsx
        │   ├── components/
        │   │   └── index.ts
        │   │
        │   ├── reports/
        │   │   ├── Reports.page.tsx
        │   │   ├── components/
        │   │   │   └── index.ts
        │   │   │
        │   │   └── monthly/
        │   │       ├── Monthly.page.tsx
        │   │       ├── components/
        │   │       │   └── index.ts
        │   │       └── index.ts    # ← Export monthly
        │   │   │
        │   │   └── index.ts        # ← Export reports
        │   │
        │   └── index.ts            # ← Export analytics
        │
        └── index.ts                # ← Export dashboard
```

### Exemplo: Índices em Cadeia

#### 📄 `dashboard/analytics/reports/monthly/index.ts`

```typescript
// features/(loggedArea)/dashboard/analytics/reports/monthly/index.ts

export { Monthly } from './Monthly.page';
export * from './components';
```

#### 📄 `dashboard/analytics/reports/index.ts`

```typescript
// features/(loggedArea)/dashboard/analytics/reports/index.ts

export { Reports } from './Reports.page';
export * from './components';
export * from './monthly';  // ← Inclui sub-rota
```

#### 📄 `dashboard/analytics/index.ts`

```typescript
// features/(loggedArea)/dashboard/analytics/index.ts

export { Analytics } from './Analytics.page';
export * from './components';
export * from './reports';  // ← Inclui sub-rota
```

---

## 🎯 Rotas Dinâmicas

### Estrutura com Index

```
features/
└── products/
    ├── Products.page.tsx
    ├── components/
    │   └── index.ts
    │
    ├── [id]/                     # /products/:id
    │   ├── ProductDetail.page.tsx
    │   ├── components/
    │   │   └── index.ts
    │   ├── resolvers/
    │   │   └── index.ts
    │   │
    │   ├── edit/                 # /products/:id/edit
    │   │   ├── ProductEdit.page.tsx
    │   │   ├── components/
    │   │   │   └── index.ts
    │   │   └── index.ts
    │   │
    │   └── index.ts
    │
    └── index.ts
```

### Exemplo: Index de Rota Dinâmica

#### 📄 `products/[id]/index.ts`

```typescript
// features/(loggedArea)/products/[id]/index.ts

export { ProductDetail } from './ProductDetail.page';
export * from './components';
export * from './resolvers';
export * from './edit';  // Inclui sub-rota edit
```

---

## 🌍 Shared Resources

### Estrutura com Índices

```
src/shared/
├── components/               # Componentes (sempre pastas)
│   ├── Button/
│   │   ├── Button.component.tsx
│   │   └── index.ts
│   ├── Modal/
│   │   ├── Modal.component.tsx
│   │   └── index.ts
│   ├── Loading/
│   │   ├── Loading.component.tsx
│   │   └── index.ts
│   └── index.ts              # ← Export todos os components
│
├── services/                 # Services (sempre pastas)
│   ├── Theme/
│   │   ├── Theme.service.ts
│   │   └── index.ts
│   ├── Storage/
│   │   ├── Storage.service.ts
│   │   └── index.ts
│   ├── Notification/
│   │   ├── Notification.service.ts
│   │   └── index.ts
│   └── index.ts
│
├── guards/                   # Guards (sempre pastas)
│   ├── Role/
│   │   ├── Role.guard.ts
│   │   └── index.ts
│   └── index.ts
│
├── types/                    # Types globais
│   ├── api.types.ts
│   ├── models.types.ts
│   └── index.ts
│
├── utils/                    # Utilitários
│   ├── formatDate.ts
│   ├── validateEmail.ts
│   └── index.ts
│
└── index.ts                  # ← Export tudo do shared
```

### Exemplo: Index do Shared Global

#### 📄 `shared/components/Button/index.ts`

```typescript
// src/shared/components/Button/index.ts

export { Button } from './Button.component';
```

#### 📄 `shared/components/index.ts`

```typescript
// src/shared/components/index.ts

export { Button } from './Button';
export { Modal } from './Modal';
export { Loading } from './Loading';
export { Input } from './Input';
export { Card } from './Card';
```

#### 📄 `shared/services/Theme/index.ts`

```typescript
// src/shared/services/Theme/index.ts

export { ThemeService } from './Theme.service';
```

#### 📄 `shared/services/index.ts`

```typescript
// src/shared/services/index.ts

export { ThemeService } from './Theme';
export { StorageService } from './Storage';
export { NotificationService } from './Notification';
```

#### 📄 `shared/index.ts` (Principal)

```typescript
// src/shared/index.ts

// Components
export * from './components';

// Services
export * from './services';

// Guards
export * from './guards';

// Types
export * from './types';

// Utils
export * from './utils';
```

### Uso do Shared

```typescript
// De qualquer lugar da aplicação
import {
  Button,
  Modal,
  Loading,
  ThemeService,
  StorageService,
  RoleGuard,
} from '@/shared';

// Tudo disponível em um único import!
```

---

## 📦 Index Files

### Por Que Usar Index.ts?

1. **Imports Limpos**: Um único ponto de entrada
2. **Encapsulamento**: Controle sobre o que é exportado
3. **Refactoring Fácil**: Mudanças internas não afetam imports externos
4. **Organização**: Estrutura clara de exports
5. **Tree-shaking**: Bundlers conseguem otimizar melhor

### Padrões de Index

#### Pattern 1: Export Simples

```typescript
// features/products/components/index.ts

export { ProductCard } from './ProductCard.component';
export { ProductFilter } from './ProductFilter.component';
export { ProductGrid } from './ProductGrid.component';
```

#### Pattern 2: Re-export com Renomeação

```typescript
// features/products/components/index.ts

export { ProductCard } from './ProductCard.component';
export { ProductFilter } from './ProductFilter.component';

// Renomear se necessário
export { ProductGrid as Grid } from './ProductGrid.component';
```

#### Pattern 3: Export de Types

```typescript
// repositories/user/index.ts

// Exports nomeados
export { UserRepository } from './User.repository';

// Types
export type {
  User,
  CreateUserDto,
  UpdateUserDto,
} from './types';

// Constants
export { API_ENDPOINTS, USER_ROLES } from './constants';
```

#### Pattern 4: Re-export Tudo

```typescript
// features/(loggedArea)/index.ts

// Re-exporta tudo de cada feature
export * from './dashboard';
export * from './products';
export * from './orders';
export * from './shared';
```

#### Pattern 5: Export Condicional

```typescript
// features/products/index.ts

// Exporta apenas o que é público
export { Products } from './Products.page';
export { ProductCard, ProductFilter } from './components';
export { ProductService } from './services';

// NÃO exporta internos
// ProductHelper não é exportado (uso interno)
```

### Quando Usar Index?

✅ **Use index.ts em:**
- Repositories (sempre)
- Features principais
- Route Groups
- Pastas shared
- Pastas com múltiplos arquivos que serão importados juntos

❌ **Não precisa de index.ts em:**
- Pastas de components com poucos arquivos
- Sub-pastas muito específicas
- Quando houver apenas 1-2 arquivos

---

## 📚 Exemplos Práticos

### Exemplo 1: Feature Completa de E-commerce

```
features/
└── (shop)/
    ├── products/
    │   ├── Products.page.tsx
    │   │
    │   ├── components/
    │   │   ├── ProductCard/
    │   │   │   ├── ProductCard.component.tsx
    │   │   │   └── index.ts
    │   │   ├── ProductFilter/
    │   │   │   ├── ProductFilter.component.tsx
    │   │   │   └── index.ts
    │   │   ├── ProductSort/
    │   │   │   ├── ProductSort.component.tsx
    │   │   │   └── index.ts
    │   │   └── index.ts
    │   │
    │   ├── services/
    │   │   ├── Product/
    │   │   │   ├── Product.service.ts
    │   │   │   └── index.ts
    │   │   └── index.ts
    │   │
    │   ├── [id]/
    │   │   ├── ProductDetail.page.tsx
    │   │   │
    │   │   ├── components/
    │   │   │   ├── ProductGallery/
    │   │   │   │   ├── ProductGallery.component.tsx
    │   │   │   │   └── index.ts
    │   │   │   ├── ProductInfo/
    │   │   │   │   ├── ProductInfo.component.tsx
    │   │   │   │   └── index.ts
    │   │   │   ├── AddToCart/
    │   │   │   │   ├── AddToCart.component.tsx
    │   │   │   │   └── index.ts
    │   │   │   └── index.ts
    │   │   │
    │   │   ├── resolvers/
    │   │   │   ├── ProductDetail/
    │   │   │   │   ├── ProductDetail.resolver.ts
    │   │   │   │   └── index.ts
    │   │   │   └── index.ts
    │   │   │
    │   │   └── index.ts
    │   │
    │   ├── types.ts
    │   └── index.ts
    │
    ├── cart/
    │   ├── Cart.page.tsx
    │   │
    │   ├── components/
    │   │   ├── CartItem/
    │   │   │   ├── CartItem.component.tsx
    │   │   │   └── index.ts
    │   │   ├── CartSummary/
    │   │   │   ├── CartSummary.component.tsx
    │   │   │   └── index.ts
    │   │   └── index.ts
    │   │
    │   ├── services/
    │   │   ├── Cart/
    │   │   │   ├── Cart.service.ts
    │   │   │   └── index.ts
    │   │   └── index.ts
    │   │
    │   └── index.ts
    │
    ├── checkout/
    │   ├── Checkout.page.tsx
    │   │
    │   ├── components/
    │   │   ├── ShippingForm/
    │   │   │   ├── ShippingForm.component.tsx
    │   │   │   └── index.ts
    │   │   ├── PaymentForm/
    │   │   │   ├── PaymentForm.component.tsx
    │   │   │   └── index.ts
    │   │   ├── OrderSummary/
    │   │   │   ├── OrderSummary.component.tsx
    │   │   │   └── index.ts
    │   │   └── index.ts
    │   │
    │   ├── services/
    │   │   ├── Checkout/
    │   │   │   ├── Checkout.service.ts
    │   │   │   └── index.ts
    │   │   └── index.ts
    │   │
    │   ├── guards/
    │   │   ├── HasItemsInCart/
    │   │   │   ├── HasItemsInCart.guard.ts
    │   │   │   └── index.ts
    │   │   └── index.ts
    │   │
    │   └── index.ts
    │
    └── shared/
        ├── components/
        │   ├── PriceTag/
        │   │   ├── PriceTag.component.tsx
        │   │   └── index.ts
        │   ├── StockBadge/
        │   │   ├── StockBadge.component.tsx
        │   │   └── index.ts
        │   └── index.ts
        └── index.ts
```

#### Código de Exemplo

**Repository:**

```typescript
// repositories/product/Product.repository.ts
import { Injectable } from '@mini/core';
import { API_ENDPOINTS } from './constants';
import { Product, ProductFilters } from './types';

@Injectable()
export class ProductRepository {
  async findAll(filters?: ProductFilters): Promise<Product[]> {
    const params = new URLSearchParams(filters as any);
    const response = await fetch(`${API_ENDPOINTS.PRODUCTS}?${params}`);
    return response.json();
  }

  async findById(id: string): Promise<Product> {
    const response = await fetch(`${API_ENDPOINTS.PRODUCTS}/${id}`);
    return response.json();
  }

  async findByCategory(categoryId: string): Promise<Product[]> {
    const response = await fetch(
      `${API_ENDPOINTS.PRODUCTS}/category/${categoryId}`
    );
    return response.json();
  }
}
```

**Service:**

```typescript
// features/(shop)/products/services/Product.service.ts
import { Injectable, Inject } from '@mini/core';
import { ProductRepository } from '@/repositories/product';
import { Product, ProductFilters } from '@/repositories/product';

@Injectable()
export class ProductService {
  @Inject(ProductRepository) private repository!: ProductRepository;

  async getProducts(filters?: ProductFilters): Promise<Product[]> {
    const products = await this.repository.findAll(filters);
    return this.applyBusinessRules(products);
  }

  async getFeaturedProducts(): Promise<Product[]> {
    const products = await this.repository.findAll();
    return products.filter(p => p.featured).slice(0, 10);
  }

  private applyBusinessRules(products: Product[]): Product[] {
    // Lógica de negócio: aplicar descontos, verificar estoque, etc
    return products.map(product => ({
      ...product,
      discountedPrice: this.calculateDiscount(product),
      inStock: product.stock > 0,
    }));
  }

  private calculateDiscount(product: Product): number {
    if (product.discount) {
      return product.price * (1 - product.discount / 100);
    }
    return product.price;
  }
}
```

**Página:**

```typescript
// features/(shop)/products/Products.page.tsx
import { Component, Route, UseProviders, UseResolvers, signal } from '@mini/core';
import { ProductService } from './services';
import { ProductCard } from './components/ProductCard.component';
import { ProductFilter } from './components/ProductFilter.component';

@Route('/products')
@UseProviders([ProductService])
export class Products extends Component {
  @Inject(ProductService) productService!: ProductService;

  products = signal<Product[]>([]);
  filters = signal<ProductFilters>({});
  loading = signal(false);

  @Mount()
  async loadProducts() {
    this.loading.set(true);
    const products = await this.productService.getProducts();
    this.products.set(products);
    this.loading.set(false);
  }

  @Watch('filters')
  async onFiltersChange(filters: ProductFilters) {
    this.loading.set(true);
    const products = await this.productService.getProducts(filters);
    this.products.set(products);
    this.loading.set(false);
  }

  render() {
    return (
      <div className="products-page">
        <h1>Produtos</h1>

        <ProductFilter
          filters={this.filters}
          onChange={(f) => this.filters.set(f)}
        />

        {this.loading.map(loading =>
          loading ? (
            <div>Carregando...</div>
          ) : (
            <div className="products-grid">
              {this.products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )
        )}
      </div>
    );
  }
}
```

### Exemplo 2: Dashboard com Sub-rotas Complexas

```
features/
└── (loggedArea)/
    └── dashboard/
        ├── Dashboard.page.tsx
        │
        ├── components/
        │   ├── StatsCard/
        │   │   ├── StatsCard.component.tsx
        │   │   └── index.ts
        │   └── index.ts
        │
        ├── analytics/
        │   ├── Analytics.page.tsx
        │   │
        │   ├── components/
        │   │   ├── Chart/
        │   │   │   ├── Chart.component.tsx
        │   │   │   └── index.ts
        │   │   ├── MetricCard/
        │   │   │   ├── MetricCard.component.tsx
        │   │   │   └── index.ts
        │   │   └── index.ts
        │   │
        │   ├── services/
        │   │   ├── Analytics/
        │   │   │   ├── Analytics.service.ts
        │   │   │   └── index.ts
        │   │   └── index.ts
        │   │
        │   ├── reports/
        │   │   ├── Reports.page.tsx
        │   │   │
        │   │   ├── components/
        │   │   │   ├── ReportTable/
        │   │   │   │   ├── ReportTable.component.tsx
        │   │   │   │   └── index.ts
        │   │   │   ├── ExportButton/
        │   │   │   │   ├── ExportButton.component.tsx
        │   │   │   │   └── index.ts
        │   │   │   └── index.ts
        │   │   │
        │   │   ├── services/
        │   │   │   ├── Report/
        │   │   │   │   ├── Report.service.ts
        │   │   │   │   └── index.ts
        │   │   │   └── index.ts
        │   │   │
        │   │   ├── daily/
        │   │   │   ├── Daily.page.tsx
        │   │   │   └── index.ts
        │   │   │
        │   │   ├── weekly/
        │   │   │   ├── Weekly.page.tsx
        │   │   │   └── index.ts
        │   │   │
        │   │   └── index.ts
        │   │
        │   └── index.ts
        │
        └── index.ts
```

**URLs Geradas:**
- `/dashboard` - Dashboard principal
- `/dashboard/analytics` - Analytics
- `/dashboard/analytics/reports` - Relatórios
- `/dashboard/analytics/reports/daily` - Relatório diário
- `/dashboard/analytics/reports/weekly` - Relatório semanal

---

## ✨ Boas Práticas

### 1. Organização de Repositories

✅ **Faça:**

```typescript
// ✅ BOM: Repository com múltiplos arquivos organizados
repositories/
└── user/
    ├── User.repository.ts      # Apenas HTTP calls
    ├── constants.ts            # Endpoints e constantes
    ├── types.ts                # Interfaces e types
    ├── utils.ts                # Transformações
    └── index.ts                # Exports limpos
```

❌ **Evite:**

```typescript
// ❌ RUIM: Lógica de negócio no repository
class UserRepository {
  async getUserWithPermissions(id: string) {
    const user = await fetch(`/users/${id}`);
    // ❌ Lógica de negócio aqui!
    if (user.role === 'admin') {
      user.permissions = ['all'];
    }
    return user;
  }
}
```

### 2. Separação de Responsabilidades

✅ **Faça:**

```typescript
// Repository: Apenas HTTP
class UserRepository {
  async findById(id: string): Promise<User> {
    const response = await fetch(`/users/${id}`);
    return response.json();
  }
}

// Service: Lógica de negócio
class UserService {
  @Inject(UserRepository) repository!: UserRepository;

  async getUserWithPermissions(id: string) {
    const user = await this.repository.findById(id);
    // ✅ Lógica de negócio no service!
    return this.addPermissions(user);
  }
}
```

### 3. Index Files Estratégicos

✅ **Faça:**

```typescript
// ✅ BOM: Index apenas onde faz sentido
features/
└── products/
    ├── Products.page.tsx
    ├── components/              # Sem index (poucos arquivos)
    │   ├── ProductCard.component.tsx
    │   └── ProductFilter.component.tsx
    ├── services/
    │   ├── Product.service.ts
    │   └── index.ts            # ✅ Index aqui (será importado junto)
    └── index.ts                # ✅ Index na feature principal
```

### 4. Nomenclatura Consistente

✅ **Faça:**

```typescript
// ✅ BOM: Nomenclatura consistente
Login.page.tsx           → class Login extends Component
Button.component.tsx     → class Button extends Component
Auth.service.ts          → class AuthService
User.repository.ts       → class UserRepository
Auth.guard.ts            → class AuthGuard
```

❌ **Evite:**

```typescript
// ❌ RUIM: Nomenclatura inconsistente
loginPage.tsx            → class LoginPage
btn.tsx                  → class MyButton
authSvc.ts               → class Auth
users-repo.ts            → class UsersRepository
```

### 5. Route Groups para Contextos Diferentes

✅ **Faça:**

```typescript
// ✅ BOM: Route Groups separando contextos
features/
├── (landing)/          # Landing pages públicas
│   ├── home/
│   └── about/
│
├── (auth)/             # Autenticação
│   ├── login/
│   └── register/
│
├── (app)/              # App principal (logado)
│   ├── dashboard/
│   └── profile/
│
└── (admin)/            # Área administrativa
    ├── users/
    └── settings/
```

### 6. Shared Resources Hierárquico

✅ **Faça:**

```typescript
// ✅ BOM: Shared em 3 níveis
src/shared/                    # Global
features/(loggedArea)/shared/  # Grupo
features/(loggedArea)/dashboard/shared/  # Feature

// Use cada nível apropriadamente:
// - Global: Button, Modal, Theme
// - Grupo: Sidebar, Header (área logada)
// - Feature: Componentes muito específicos da feature
```

### 7. Types Organizados

✅ **Faça:**

```typescript
// ✅ BOM: Types separados por contexto
repositories/user/types.ts      # Types do repository
features/products/types.ts      # Types da feature
shared/types/api.types.ts       # Types globais de API
shared/types/models.types.ts    # Models globais
```

### 8. Imports Limpos com Path Aliases

Configure no `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/repositories/*": ["src/repositories/*"],
      "@/features/*": ["src/features/*"],
      "@/shared/*": ["src/shared/*"]
    }
  }
}
```

Uso:

```typescript
// ✅ BOM: Imports limpos
import { UserRepository } from '@/repositories/user';
import { Button, Modal } from '@/shared';
import { ProductService } from '@/features/(shop)/products';

// ❌ RUIM: Imports relativos complexos
import { UserRepository } from '../../../repositories/user/User.repository';
```

### 9. Lazy Loading de Features

```typescript
// AppRouter.tsx
import { Component } from '@mini/core';
import { RouteSwitcher } from '@mini/router';
import { Lazy } from '@mini/core';

export class AppRouter extends Component {
  render() {
    return (
      <RouteSwitcher>
        {() => [
          // Landing pages (carregadas normalmente)
          HomePage,
          AboutPage,

          // Features pesadas (lazy loaded)
          Lazy(() => import('@/features/(shop)/products')),
          Lazy(() => import('@/features/(loggedArea)/dashboard')),
        ]}
      </RouteSwitcher>
    );
  }
}
```

### 10. Documentação de Estrutura

Adicione um README em cada Route Group:

```markdown
<!-- features/(loggedArea)/README.md -->

# Área Logada

Todas as features neste grupo requerem autenticação.

## Guards Aplicados
- `AuthGuard` - Verifica se usuário está autenticado

## Shared Resources
- `Sidebar` - Barra lateral comum
- `Header` - Cabeçalho comum
- `SessionService` - Gerenciamento de sessão

## Features
- `dashboard/` - Dashboard principal
- `products/` - Gerenciamento de produtos
- `orders/` - Gerenciamento de pedidos
```

---

## 🎯 Checklist de Organização

Ao criar uma nova feature, verifique:

- [ ] Repository criado em `repositories/[nome]/`
- [ ] Repository tem `index.ts` exportando tudo
- [ ] Feature criada no Route Group apropriado
- [ ] Página principal na raiz da feature
- [ ] Componentes em `components/`
- [ ] Services em `services/` (se necessário)
- [ ] Guards em `guards/` (se necessário)
- [ ] Resolvers em `resolvers/` (se necessário)
- [ ] Types em `types.ts`
- [ ] `index.ts` na feature exportando o essencial
- [ ] Imports usando path aliases
- [ ] Nomenclatura seguindo convenções

---

## 📖 Resumo

Esta estrutura de projeto oferece:

✅ **Escalabilidade** - Cresce com seu projeto sem virar bagunça
✅ **Manutenibilidade** - Fácil de encontrar e modificar código
✅ **Reusabilidade** - Componentes e services bem organizados
✅ **Testabilidade** - Separação clara de responsabilidades
✅ **DX** - Imports limpos e estrutura intuitiva
✅ **Performance** - Lazy loading e tree-shaking funcionam bem

**Comece simples e evolua conforme necessário!**

---

## 🤝 Contribuindo

Encontrou uma forma melhor de organizar algo? Abra uma issue ou PR!

**Feito com ❤️ para a comunidade MiniJS**
