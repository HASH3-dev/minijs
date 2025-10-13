/**
 * Optional TS/Babel plugin (stub).
 * Idea: wrap each JSX expr { ... } with __expr(() => ...)
 * For now, we export a no-op to keep the package publishable.
 */

export function miniTransformPlugin() {
  return {
    name: "mini-transform",
    transform(code: string) {
      return code;
    }
  };
}
