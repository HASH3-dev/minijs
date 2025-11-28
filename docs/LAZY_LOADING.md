# Lazy Loading com Transformação em Build-Time

## Visão Geral

O Mini Framework implementa lazy loading através de uma macro `Lazy()` que é transformada em tempo de compilação pelo Vite, antes da transpilação do TypeScript.

## Uso

### Sintaxe Simples

```typescript
import { Component, Lazy } from "@mini/core";
import { RouteSwitcher } from "@mini/router";

export class AppRouter extends Component {
  render() {
    return (
      <RouteSwitcher>
        {() => [
          // Lazy loading automático
          Lazy("./features/contacts#ContactPage"),
          Lazy("./features/products#ProductListPage"),
        ]}
      </RouteSwitcher>
    );
  }
}
```

### Como Funciona

**1. Código Original:**
```typescript
Lazy("./features/contacts#ContactPage")
```

**2. Durante Build (Vite Plugin):**
- O plugin lê o arquivo `./features/contacts`
- Extrai o decorator `@Route` do componente `ContactPage`
- Transforma o código

**3. Código Transformado:**
```typescript
(() => {
  @Route("/contacts")
  class LazyContactPage extends Component {
    render() {
      return import("./features/contacts").then((m) => (
        <m.ContactPage />
      ));
    }
  }
  return LazyContactPage;
})()
```

## Características

- ✅ **Build-Time Transform**: Transforma antes do TypeScript
- ✅ **Route Automático**: Lê o `@Route` do componente original
- ✅ **Code Splitting**: Imports dinâmicos automáticos
- ✅ **Type-Safe**: Erro em tempo de execução se não transformado

## Sintaxe

```
Lazy("caminho/do/modulo#NomeDoComponente")
```

- **caminho/do/modulo**: Caminho relativo do arquivo (sem extensão)
- **#**: Separador
- **NomeDoComponente**: Nome exato da classe exportada

## Requisitos

O componente lazy-loaded **deve ter** o decorator `@Route`:

```typescript
// features/contacts/Contact.page.tsx
import { Component } from "@mini/core";
import { Route } from "@mini/router";

@Route("/contacts")
export class ContactPage extends Component {
  render() {
    return <div>Contacts</div>;
  }
}
```

## Configuração

O plugin já está integrado no `@mini/vite-plugin`:

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import mini from '@mini/vite-plugin';

export default defineConfig({
  plugins: [mini()]  // Lazy transform já incluído
});
```

## Notas Técnicas

- A transformação ocorre na fase `pre` do Vite (antes do esbuild)
- Usa `@babel/parser` e `@babel/traverse` para análise AST
- Suporta arquivos `.ts`, `.tsx`, `.js`, `.jsx`
- Resolve automaticamente `index.ts` e `index.tsx`
- Aviso no console se o `@Route` não for encontrado
