import type { Plugin, UserConfig } from "vite";

/**
 * Vite plugin for Mini Framework
 *
 * Automatically configures Vite to work with Mini Framework's JSX transform
 *
 * @example
 * ```ts
 * import { defineConfig } from 'vite';
 * import mini from '@mini/vite-plugin';
 *
 * export default defineConfig({
 *   plugins: [mini()]
 * });
 * ```
 */
export default function miniPlugin(): Plugin {
  const jsxImportSource = "@mini/core";
  const jsxFactory = "this.jsx";
  const jsxFragment = "Fragment";
  const jsxInject = `import { ${jsxFragment} } from "${jsxImportSource}";`;

  return {
    name: "vite-plugin-mini",
    config(): UserConfig {
      return {
        esbuild: {
          jsx: "transform",
          jsxImportSource,
          jsxFactory,
          jsxFragment,
          jsxInject,
        },
      };
    },
  };
}

// Named export for convenience
export { miniPlugin };
