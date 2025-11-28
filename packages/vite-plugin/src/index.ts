import type { Plugin, UserConfig } from "vite";
import inject from "@rollup/plugin-inject";
import { lazyTransformPlugin } from "./lazyTransform";

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
export default function miniPlugin(): Plugin[] {
  const jsxImportSource = "@mini/core";
  const jsxFactory = "this.jsx";
  const jsxFragment = "Fragment";
  const jsxInject = `import { ${jsxFragment} } from "${jsxImportSource}";`;

  return [
    // Lazy transform plugin (must run first, before esbuild)
    lazyTransformPlugin(),

    // Main Mini Framework plugin
    {
      name: "vite-plugin-mini",
      config(): UserConfig {
        return {
          esbuild: {
            jsx: "transform",
            jsxImportSource,
            jsxFactory,
            jsxFragment,
            jsxInject,
            minifyWhitespace: true,
            minifyIdentifiers: true,
            minifySyntax: true,
            keepNames: true,
          },
          build: {
            minify: "esbuild",
            cssMinify: true,
            rollupOptions: {
              treeshake: true,
              jsx: {
                mode: "classic",
                factory: jsxFactory,
                fragment: jsxFragment,
                importSource: jsxImportSource,
              },
              plugins: [
                inject({
                  Fragment: ["@mini/core", "Fragment"],
                }),
              ],
            },
          },
        };
      },
    },
  ];
}

// Named export for convenience
export { miniPlugin };
