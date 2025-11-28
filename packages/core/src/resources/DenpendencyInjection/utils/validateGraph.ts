/**
 * Dependency graph validation
 * Detects circular dependencies and validates that all dependencies are registered
 */
import { Application } from "../../../Application";
import { Token } from "../types";

/**
 * Get a readable name for a token
 */
function getTokenName(token: Token): string | symbol {
  if (typeof token === "function") {
    return token.name || "AnonymousClass";
  }
  return token.toString();
}

/**
 * Detect circular dependencies using Depth First Search
 * @param token The token to check
 * @param visited Set of tokens already visited in this path
 * @param path Current dependency path (for error messages)
 * @returns Array of circular dependency paths found
 */
function detectCircularDependencies(
  token: Token,
  visited: Set<Token> = new Set(),
  path: Token[] = []
): string[] {
  const errors: string[] = [];

  // If we've seen this token in the current path, we have a cycle
  if (visited.has(token)) {
    const cycleStart = path.indexOf(token);
    const cycle = [...path.slice(cycleStart), token]
      .map(getTokenName)
      .join(" → ");
    errors.push(`Circular dependency detected: ${cycle}`);
    return errors;
  }

  // Get metadata for this token
  const metadata = (Application as any).injectables.get(token);
  if (!metadata) {
    // Token not registered - will be caught by validateAllDependencies
    return errors;
  }

  // Mark as visited in this path
  visited.add(token);
  path.push(token);

  // Check each dependency
  for (const dep of metadata.dependencies) {
    const depErrors = detectCircularDependencies(dep, new Set(visited), [
      ...path,
    ]);
    errors.push(...depErrors);
  }

  return errors;
}

/**
 * Validate that all dependencies are registered as @Injectable
 * @returns Array of error messages for unregistered dependencies
 */
function validateAllDependencies(): string[] {
  const errors: string[] = [];
  const injectables = (Application as any).injectables;

  // Iterate over all registered injectables
  injectables.forEach((metadata: any, token: Token) => {
    const tokenName = String(getTokenName(token));

    for (const dep of metadata.dependencies) {
      if (!injectables.has(dep)) {
        const depName = String(getTokenName(dep));
        errors.push(
          `${tokenName} depends on ${depName}, but ${depName} is not decorated with @Injectable()`
        );
      }
    }
  });

  return errors;
}

/**
 * Validate the entire dependency graph
 * Should be called during application bootstrap before any components are instantiated
 * Throws an error if validation fails
 */
export function validateDependencyGraph(): void {
  const errors: string[] = [];
  const injectables = (Application as any).injectables;

  // Check 1: Validate all dependencies are registered
  const missingDeps = validateAllDependencies();
  errors.push(...missingDeps);

  // Check 2: Detect circular dependencies
  const circularDeps: string[] = [];
  injectables.forEach((_metadata: any, token: Token) => {
    const tokenErrors = detectCircularDependencies(token);
    // Avoid duplicate error messages for the same cycle
    for (const error of tokenErrors) {
      if (!circularDeps.includes(error)) {
        circularDeps.push(error);
      }
    }
  });
  errors.push(...circularDeps);

  // If any errors found, throw
  if (errors.length > 0) {
    const errorMessage = [
      "❌ Dependency Injection validation failed:",
      "",
      ...errors.map((e) => `  • ${e}`),
      "",
      "Please fix these issues before running the application.",
    ].join("\n");

    throw new Error(errorMessage);
  }

  // Success - log in development
  if (process.env.NODE_ENV !== "production") {
    const count = injectables.size;
    console.log(
      `✅ DI validation passed: ${count} injectable(s) registered, no circular dependencies detected`
    );
  }
}
