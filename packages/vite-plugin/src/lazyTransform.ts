import type { Plugin } from "vite";
import { parse } from "@babel/parser";
import traverseModule from "@babel/traverse";
import generateModule from "@babel/generator";
import * as t from "@babel/types";
import * as fs from "fs";
import * as path from "path";

// Handle ESM/CJS interop for Babel modules
const traverse = (traverseModule as any).default || traverseModule;
const generate = (generateModule as any).default || generateModule;

interface LazyCallInfo {
  path: string;
  component: string;
  route: string | t.ObjectExpression | null;
  loadingFn?:
    | t.ArrowFunctionExpression
    | t.FunctionExpression
    | t.ObjectMethod
    | null;
  errorFn?:
    | t.ArrowFunctionExpression
    | t.FunctionExpression
    | t.ObjectMethod
    | null;
}

/**
 * Parse Lazy call arguments to extract path and component
 * @example "./features/contacts#ContactPage" -> { path: "./features/contacts", component: "ContactPage" }
 */
function parseLazyCall(
  arg: string
): { path: string; component: string } | null {
  const match = arg.match(/^(.+?)#([^#]+)$/);
  if (!match) return null;

  const [, modulePath, component] = match;

  return {
    path: modulePath,
    component,
  };
}

/**
 * Follow re-exports to find the actual component file
 */
function followReExport(
  filePath: string,
  componentName: string
): string | null {
  try {
    const code = fs.readFileSync(filePath, "utf-8");
    const ast = parse(code, {
      sourceType: "module",
      plugins: ["typescript", "jsx", "decorators-legacy"],
    });

    let reExportPath: string | null = null;

    traverse(ast, {
      // Handle: export { ComponentName } from "./path"
      ExportNamedDeclaration(path: any) {
        if (path.node.source && path.node.specifiers) {
          for (const specifier of path.node.specifiers) {
            if (
              t.isExportSpecifier(specifier) &&
              t.isIdentifier(specifier.exported) &&
              specifier.exported.name === componentName
            ) {
              reExportPath = path.node.source.value;
              break;
            }
          }
        }
      },
      // Handle: export * from "./path"
      ExportAllDeclaration(path: any) {
        if (path.node.source && !reExportPath) {
          reExportPath = path.node.source.value;
        }
      },
    });

    if (reExportPath) {
      const fileDir = path.dirname(filePath);
      return resolveModulePath(reExportPath, fileDir);
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Extract @Route decorator value from a component class
 */
function extractRouteFromFile(
  filePath: string,
  componentName: string
): string | t.ObjectExpression | null {
  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }

    const code = fs.readFileSync(filePath, "utf-8");
    const ast = parse(code, {
      sourceType: "module",
      plugins: ["typescript", "jsx", "decorators-legacy"],
    });

    let route: string | t.ObjectExpression | null = null;
    let hasClass = false;

    traverse(ast, {
      ClassDeclaration(path: any) {
        // Check if this is the target component
        if (path.node.id && path.node.id.name === componentName) {
          hasClass = true;
          if (path.node.decorators) {
            // Look for @Route decorator
            for (const decorator of path.node.decorators) {
              if (
                t.isCallExpression(decorator.expression) &&
                t.isIdentifier(decorator.expression.callee) &&
                decorator.expression.callee.name === "Route"
              ) {
                const args = decorator.expression.arguments;
                if (args.length > 0 && t.isStringLiteral(args[0])) {
                  route = args[0].value;
                  break;
                }
                if (args.length > 0 && t.isObjectExpression(args[0])) {
                  // Keep the AST node directly
                  route = args[0];
                  break;
                }
              }
            }
          }
        }
      },
    });

    // If no class found, might be a re-export file
    if (!hasClass) {
      const reExportedFile = followReExport(filePath, componentName);
      if (reExportedFile) {
        return extractRouteFromFile(reExportedFile, componentName);
      }
    }

    return route;
  } catch (error) {
    console.error(`Error reading route from ${filePath}:`, error);
    return null;
  }
}

/**
 * Resolve module path to actual file path
 */
function resolveModulePath(
  importPath: string,
  currentFileDir: string
): string | null {
  // Handle relative imports
  if (importPath.startsWith(".")) {
    const basePath = path.resolve(currentFileDir, importPath);

    // Try common extensions
    const extensions = [".tsx", ".ts", "/index.tsx", "/index.ts"];
    for (const ext of extensions) {
      const fullPath = basePath + ext;
      if (fs.existsSync(fullPath)) {
        return fullPath;
      }
    }
  }

  return null;
}

/**
 * Generate lazy component class code
 */
function generateLazyComponent(info: LazyCallInfo): string {
  const className = `Lazy${info.component}`;

  let routeDecorator = "";
  if (info.route) {
    if (typeof info.route === "string") {
      routeDecorator = `@Route("${info.route}")`;
    } else {
      // Use babel generator to convert the AST node back to code
      const routeCode = generate(info.route).code;
      routeDecorator = `@Route(${routeCode})`;
    }
  }

  // Generate renderLoading method
  let renderLoadingMethod = "renderLoading() { return <div>Loading...</div>; }";
  if (info.loadingFn) {
    const body = info.loadingFn.body;
    let bodyCode: string;

    // Check if body is a BlockStatement (has {}) or an expression
    if (t.isBlockStatement(body)) {
      bodyCode = generate(body).code;
    } else {
      // Arrow function without braces: () => <div/>
      bodyCode = `{ return ${generate(body).code}; }`;
    }

    renderLoadingMethod = `renderLoading() ${bodyCode}`;
  }

  // Generate renderError method
  let renderErrorMethod =
    "renderError(error: any) { return <div>Error loading component: {error.message}</div>; }";
  if (info.errorFn) {
    const errorParams = info.errorFn.params
      .map((param: any) => generate(param).code)
      .join(", ");

    const body = info.errorFn.body;
    let bodyCode: string;

    // Check if body is a BlockStatement (has {}) or an expression
    if (t.isBlockStatement(body)) {
      bodyCode = generate(body).code;
    } else {
      // Arrow function without braces: (error) => <div/>
      bodyCode = `{ return ${generate(body).code}; }`;
    }

    renderErrorMethod = `renderError(${errorParams}) ${bodyCode}`;
  }

  return `(() => {
  ${routeDecorator}
  class ${className} extends Component {
    loadedComponent: any = null;
    ${renderLoadingMethod}
    ${renderErrorMethod}
    render() {
      if (this.loadedComponent) {
        return <this.loadedComponent />;
      } else {
        return import("${info.path}").then((m) => {
          Route("/")(m.${info.component});
          this.loadedComponent = m.${info.component};
          return <m.${info.component} />
        });
      }
    }
  }
  return ${className};
})()`;
}

/**
 * Vite plugin to transform Lazy() calls at build time
 */
export function lazyTransformPlugin(): Plugin {
  return {
    name: "vite-plugin-mini-lazy-transform",
    enforce: "pre", // Run before other plugins, including esbuild

    transform(code: string, id: string) {
      // Only transform TypeScript/TSX files
      if (!id.endsWith(".ts") && !id.endsWith(".tsx")) {
        return null;
      }

      // Quick check if Lazy is used
      if (!code.includes("Lazy(")) {
        return null;
      }

      const currentFileDir = path.dirname(id);

      try {
        // Parse the code into AST
        const ast = parse(code, {
          sourceType: "module",
          plugins: ["typescript", "jsx", "decorators-legacy"],
        });

        let hasTransformations = false;
        let needsRouteImport = false;
        let hasRouteImport = false;

        // Check if Route is already imported
        traverse(ast, {
          ImportDeclaration(path: any) {
            if (path.node.source.value === "@mini/router") {
              for (const specifier of path.node.specifiers) {
                if (
                  t.isImportSpecifier(specifier) &&
                  t.isIdentifier(specifier.imported) &&
                  specifier.imported.name === "Route"
                ) {
                  hasRouteImport = true;
                  break;
                }
              }
            }
          },
        });

        // Traverse and transform Lazy calls
        traverse(ast, {
          CallExpression(path: any) {
            // Check if this is a Lazy() call
            if (
              t.isIdentifier(path.node.callee) &&
              path.node.callee.name === "Lazy"
            ) {
              const args = path.node.arguments;

              // First argument must be a string
              if (args.length < 1 || !t.isStringLiteral(args[0])) {
                return;
              }

              const lazyArg = args[0].value;
              const parsed = parseLazyCall(lazyArg);

              if (!parsed) {
                console.warn(
                  `Invalid Lazy syntax: ${lazyArg}. Expected format: "path#Component"`
                );
                return;
              }

              // Extract options if present (second argument)
              let loadingFn:
                | t.ArrowFunctionExpression
                | t.FunctionExpression
                | null = null;
              let errorFn:
                | t.ArrowFunctionExpression
                | t.FunctionExpression
                | null = null;

              if (args.length >= 2 && t.isObjectExpression(args[1])) {
                const optionsObj = args[1];

                for (const prop of optionsObj.properties) {
                  // Handle ObjectProperty: loading: () => {}
                  if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
                    if (prop.key.name === "loading") {
                      if (
                        t.isArrowFunctionExpression(prop.value) ||
                        t.isFunctionExpression(prop.value)
                      ) {
                        loadingFn = prop.value as any;
                      }
                    } else if (prop.key.name === "error") {
                      if (
                        t.isArrowFunctionExpression(prop.value) ||
                        t.isFunctionExpression(prop.value)
                      ) {
                        errorFn = prop.value as any;
                      }
                    }
                  }
                  // Handle ObjectMethod: loading() {}
                  else if (t.isObjectMethod(prop) && t.isIdentifier(prop.key)) {
                    if (prop.key.name === "loading") {
                      loadingFn = prop as any;
                    } else if (prop.key.name === "error") {
                      errorFn = prop as any;
                    }
                  }
                }
              }

              // Resolve the actual file path
              const resolvedPath = resolveModulePath(
                parsed.path,
                currentFileDir
              );

              let route: string | t.ObjectExpression | null = null;

              if (resolvedPath) {
                // Extract @Route from the component file
                route = extractRouteFromFile(resolvedPath, parsed.component);

                if (!route) {
                  console.warn(
                    `No @Route decorator found for ${parsed.component} in ${resolvedPath}`
                  );
                }
              } else {
                console.warn(
                  `Could not resolve module path: ${parsed.path} from ${id}`
                );
              }

              const info: LazyCallInfo = {
                ...parsed,
                route,
                loadingFn,
                errorFn,
              };

              // Mark that we need Route import if there's a route
              if (route) {
                needsRouteImport = true;
              }

              // Generate the replacement code
              const replacementCode = generateLazyComponent(info);

              // Parse the replacement code into AST
              const replacementAst = parse(replacementCode, {
                sourceType: "module",
                plugins: ["typescript", "jsx", "decorators-legacy"],
              });

              // Extract the IIFE expression
              const replacementExpression = (
                replacementAst.program.body[0] as any
              ).expression;

              // Replace the Lazy call with the IIFE
              path.replaceWith(replacementExpression);
              hasTransformations = true;
            }
          },
        });

        // Only regenerate if there were transformations
        if (!hasTransformations) {
          return null;
        }

        // Add Route import if needed and not present
        if (needsRouteImport && !hasRouteImport) {
          // Find existing @mini/router import to add Route to it
          let routerImportFound = false;

          traverse(ast, {
            ImportDeclaration(path: any) {
              if (
                path.node.source.value === "@mini/router" &&
                !routerImportFound
              ) {
                // Add Route to existing import
                const routeSpecifier = t.importSpecifier(
                  t.identifier("Route"),
                  t.identifier("Route")
                );
                path.node.specifiers.push(routeSpecifier);
                routerImportFound = true;
              }
            },
          });

          // If no @mini/router import exists, we can't add it safely
          // The decorator will fail at runtime, but that's expected
          if (!routerImportFound) {
            console.warn(
              `Route decorator needed but no @mini/router import found in ${id}`
            );
          }
        }

        // Generate transformed code
        const output = generate(ast, {
          decoratorsBeforeExport: true,
        });

        return {
          code: output.code,
          map: output.map,
        };
      } catch (error) {
        console.error(`Error transforming ${id}:`, error);
        return null;
      }
    },
  };
}
