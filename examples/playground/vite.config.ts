import { defineConfig } from "vite";

export default defineConfig({
  esbuild: {
    jsx: "transform",
    jsxImportSource: "@mini/core",
    jsxFactory: "this.jsx",
    jsxFragment: "Fragment",
    jsxInject: `import { Fragment } from "@mini/core";`,
  },
});
