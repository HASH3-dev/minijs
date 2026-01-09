/**
 * JSX V2 Abstractions
 * Core interfaces for render target abstraction (Liskov Substitution)
 */

export {
  RenderTarget,
  type RenderContext,
  createDOMContext,
  createSSRContext,
} from "./RenderContext";

export { IElementFactory } from "./IElementFactory";
export { IPropsApplicator } from "./IPropsApplicator";
export { IChildrenRenderer } from "./IChildrenRenderer";
