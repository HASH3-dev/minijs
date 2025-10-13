---
title: Mini — Conceito de Framework Frontend Orientado a Objetos Reativo
version: 0.1.0
status: draft
authors:
  - you
updated: 2025-10-09
---

# 🧩 Mini — Conceito de Framework Frontend Orientado a Objetos Reativo

- **Stack**: TS, Decorators, RxJS, JSX runtime próprio
- **Ideias‑chave**: Classes puras (`render()`), decorators reativos (`@State/@Prop/@Memo/@Mount`), DI hierárquica, "ilhas" reativas no JSX (renderização parcial).

## 📚 Visão Geral

**Mini** é uma proposta de biblioteca frontend inspirada em **Stencil** e **Angular**, porém com a **simplicidade do React** e a **clareza da OOP**.

Foco:
- **Classes puras** — o componente implementa `render()`
- **Decorators** para reatividade, DI e derivação
- **Reatividade RxJS** (Observables/Subjects)
- **Render granular** — trechos do JSX se atualizam sozinhos
- **DI** opcional e hierárquica
- **Ciclo de vida mínimo** — `@Mount` opcional
- **Herança real**

## ⚙️ Estrutura Básica (resumo)

```ts
abstract class Component<P = {}> {
  props!: Readonly<P>;
  $: { unmount$: Subject<void>; mounted$: Subject<void> };
  abstract render(): Node;
}
```

## 🧠 Decorators

| Decorator  | Função |
|-----------|--------|
| `@State()` | Cria estado mutável e observável (gera `field$`). |
| `@Prop()`  | Cria propriedade somente leitura (gera `field$`). |
| `@Memo()`  | Getter memoizado/derivado. |
| `@Mount()` | Executa no mount; retorno opcional de cleanup. |

Cada `@State/@Prop` expõe:
- `this.field` — valor direto
- `this.field$` — `Observable<T>`

## 💉 DI (hierárquica)

`@Service`, `@Inject(Token)`, `@Provide(providers)` — com `useClass | useValue | useFactory`.

## 🧩 JSX Runtime (ilhas reativas)

Sem plugin: qualquer `Observable` em `{ ... }` vira nó reativo.  
Com plugin (futuro): tracking fino via thunks `__expr(() => ...)`.

## 💡 Vantagens

- Classe limpa: só `render()`
- Zero `setState`/hooks
- Reatividade granular por Observable
- DI leve e herança nativa

## 🔮 Roadmap (MVP)

1. `@State/@Prop/@Memo/@Mount`
2. JSX runtime com nós reativos (text/attrs/eventos)
3. DI integrada por subárvore
4. (Opcional) Plugin de tracking fino
