# Mini Monorepo

This is a scaffolded monorepo for the **Mini** frontend framework (OOP + RxJS + granular JSX islands).  
It contains separate packages for **core**, **JSX runtime**, **DI**, and an optional **TS plugin**, plus a **playground**.

## Packages
- `@mini/core` — base `Component`, decorators (`@State`, `@Prop`, `@Memo`, `@Mount`), CellRef primitives
- `@mini/jsx` — minimal JSX runtime helpers (reactive nodes / islands)
- `@mini/di` — hierarchical dependency injection (Service/Inject/Provide)
- `@mini/plugin` — optional TypeScript transformer (no-op stub here)
- `playground` — Vite app using the framework minimally

## Quick Start

```bash
# 1) Install dependencies (workspace)
npm install

# 2) Build all packages
npm run build

# 3) Run playground
npm run dev
```

## Publishing
Each package is configured for ESM + CJS via `tsup`. Adjust fields before publishing to npm.

## Notes
- Decorators require `experimentalDecorators` and `emitDecoratorMetadata` disabled (we do not rely on runtime metadata).
- The JSX runtime here is **minimal** and focuses on text/attribute updates to demonstrate the concept. You can expand it to a full reconciler.
