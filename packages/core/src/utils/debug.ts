/**
 * Debug logger utility
 * Centralizes debug logging for the framework
 *
 * IMPORTANT: Uses process.env.NODE_ENV for dead code elimination
 * In production builds, ALL debug code is removed automatically (tree-shaking)
 */

/**
 * Check if debug mode is enabled
 * - DEV mode: checks __MINIJS_DEBUG__ flag
 * - PROD mode: always false (code eliminated by bundler)
 */
function isDebugEnabled(): boolean {
  // @ts-ignore - process.env.NODE_ENV is replaced by bundler
  if (process.env.NODE_ENV !== "production") {
    return typeof window !== "undefined" && (window as any).__MINIJS_DEBUG__;
  }
  return false;
}

/**
 * Log a debug message with [MiniJS] prefix
 * Only logs in DEV mode when __MINIJS_DEBUG__ is enabled
 * Automatically removed in production builds
 *
 * @param message - Message to log
 * @param args - Additional arguments to log
 *
 * @example
 * ```typescript
 * debugLog('Rendering version set to:', version);
 * // In production: this entire function call is removed
 * ```
 */
export function debugLog(message: string, ...args: any[]): void {
  // @ts-ignore - process.env.NODE_ENV is replaced by bundler
  if (process.env.NODE_ENV !== "production" && isDebugEnabled()) {
    console.log(`[MiniJS] ${message}`, ...args);
  }
}

/**
 * Log a debug warning with [MiniJS] prefix
 * Automatically removed in production builds
 */
export function debugWarn(message: string, ...args: any[]): void {
  // @ts-ignore - process.env.NODE_ENV is replaced by bundler
  if (process.env.NODE_ENV !== "production" && isDebugEnabled()) {
    console.warn(`[MiniJS] ${message}`, ...args);
  }
}

/**
 * Log a debug error with [MiniJS] prefix
 * Automatically removed in production builds
 */
export function debugError(message: string, ...args: any[]): void {
  // @ts-ignore - process.env.NODE_ENV is replaced by bundler
  if (process.env.NODE_ENV !== "production" && isDebugEnabled()) {
    console.error(`[MiniJS] ${message}`, ...args);
  }
}

/**
 * Enable debug mode programmatically
 * Only works in DEV mode
 */
export function enableDebug(): void {
  // @ts-ignore - process.env.NODE_ENV is replaced by bundler
  if (process.env.NODE_ENV !== "production" && typeof window !== "undefined") {
    (window as any).__MINIJS_DEBUG__ = true;
  }
}

/**
 * Disable debug mode programmatically
 * Only works in DEV mode
 */
export function disableDebug(): void {
  // @ts-ignore - process.env.NODE_ENV is replaced by bundler
  if (process.env.NODE_ENV !== "production" && typeof window !== "undefined") {
    (window as any).__MINIJS_DEBUG__ = false;
  }
}
