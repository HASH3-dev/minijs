/**
 * Checks if a value is a Promise
 */
export function isPromise(value: any): value is Promise<any> {
  return value && typeof value === "object" && typeof value.then === "function";
}

/**
 * Recursively resolves all promises in nested objects and arrays by collecting
 * all promises first and resolving them with Promise.all at the top level
 */
export async function deepPromiseAll<T>(value: T): Promise<T> {
  const promises: Promise<any>[] = [];
  const paths: Array<(string | number)[]> = [];

  // Recursively collect all promises and their paths
  function collect(obj: any, path: (string | number)[] = []): void {
    if (isPromise(obj)) {
      promises.push(obj);
      paths.push(path);
      return;
    }

    if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        collect(item, [...path, index]);
      });
      return;
    }

    if (obj && typeof obj === "object") {
      Object.entries(obj).forEach(([key, val]) => {
        collect(val, [...path, key]);
      });
      return;
    }
  }

  // Collect all promises
  collect(value);

  // If no promises found, return the value as-is
  if (promises.length === 0) {
    return value;
  }

  // Resolve all promises at once
  const resolvedValues = await Promise.all(promises);

  // Create a deep clone and set resolved values
  function deepClone(obj: any): any {
    if (isPromise(obj)) {
      return obj; // Will be replaced later
    }
    if (Array.isArray(obj)) {
      return obj.map(deepClone);
    }
    if (obj && typeof obj === "object") {
      return Object.fromEntries(
        Object.entries(obj).map(([key, val]) => [key, deepClone(val)])
      );
    }
    return obj;
  }

  const result = deepClone(value);

  // Set resolved values at their paths
  paths.forEach((path, index) => {
    let current: any = result;
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    const lastKey = path[path.length - 1];
    current[lastKey] = resolvedValues[index];
  });

  return result as T;
}
