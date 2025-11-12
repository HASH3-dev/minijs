/**
 * Checks if a value is a class constructor
 * @param value Value to check
 * @returns true if value is a class constructor
 */
export function isClass(value: any): boolean {
  return (
    typeof value === "function" &&
    value.prototype &&
    value.prototype.constructor === value
  );
}
