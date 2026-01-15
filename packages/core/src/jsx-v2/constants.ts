/**
 * SVG elements that need special namespace handling
 * These elements must be created with document.createElementNS()
 */
export const SVG_TAGS = new Set([
  "svg",
  "path",
  "circle",
  "rect",
  "line",
  "polyline",
  "polygon",
  "ellipse",
  "g",
  "text",
  "tspan",
  "defs",
  "use",
  "symbol",
  "marker",
  "clipPath",
  "mask",
  "pattern",
  "linearGradient",
  "radialGradient",
  "stop",
  "image",
  "foreignObject",
  "animate",
  "animateTransform",
  "animateMotion",
  "set",
  "feBlend",
  "feColorMatrix",
  "feComponentTransfer",
  "feComposite",
  "feConvolveMatrix",
  "feDiffuseLighting",
  "feDisplacementMap",
  "feFlood",
  "feGaussianBlur",
  "feImage",
  "feMerge",
  "feMorphology",
  "feOffset",
  "feSpecularLighting",
  "feTile",
  "feTurbulence",
  "filter",
  "title",
  "desc",
  "metadata",
]);

/**
 * SVG namespace URI
 */
export const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
