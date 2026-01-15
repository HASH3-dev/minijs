import type { Component } from "../../base/Component";

/**
 * Render target types
 * Defines which environment we're rendering to
 */
export enum RenderTarget {
  /** Client-side DOM rendering */
  DOM = "dom",
  /** Server-side rendering to HTML string */
  SSR = "ssr",
  // Future: NATIVE, CANVAS, etc
}

/**
 * Render context - metadata about current render
 * Passed to all rendering operations
 */
export interface RenderContext {
  /** Target environment */
  target: RenderTarget;

  /** Parent component (for DI hierarchy) */
  component?: Component;

  /** Additional metadata (extensible) */
  metadata?: Record<string, any>;
}

/**
 * Create a default DOM render context
 */
export function createDOMContext(component?: Component): RenderContext {
  return {
    target: RenderTarget.DOM,
    component,
  };
}

/**
 * Create a default SSR render context
 */
export function createSSRContext(component?: Component): RenderContext {
  return {
    target: RenderTarget.SSR,
    component,
  };
}
