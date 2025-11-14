# @mini/vite-plugin

Vite plugin for Mini Framework that automatically configures JSX transformation settings.

## Installation

```bash
npm install -D @mini/vite-plugin
```

## Usage

In your `vite.config.ts`:

```ts
import { defineConfig } from "vite";
import mini from "@mini/vite-plugin";

export default defineConfig({
  plugins: [mini()],
});
```

That's it! The plugin will automatically configure:

- `esbuild.jsx` to `"transform"`
- `esbuild.jsxImportSource` to `"@mini/core"`
- `esbuild.jsxFactory` to `"this.jsx"`
- `esbuild.jsxFragment` to `"Fragment"`
- `esbuild.jsxInject` to import Fragment from @mini/core

## TypeScript Configuration

You still need to configure TypeScript in your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "jsxImportSource": "@mini/core",
    "jsxFragmentFactory": "Fragment",
    "jsxFactory": "this.jsx",
    "jsx": "preserve"
  }
}
```

## License

MIT
