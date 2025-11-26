import { Component } from "@mini/core";
import type { ViewTransitionProps } from "./types";
import { setupViewTransition } from "./utils/setupViewTransition";
import { applyPreset } from "./presets";

/**
 * ViewTransition component - Similar to Flutter's Hero widget
 *
 * Wraps elements that should smoothly transition between different views/routes.
 * Elements with the same tag will animate smoothly when navigating.
 *
 * @example
 * ```tsx
 * // On list page
 * <ViewTransition tag="product-123">
 *   <img src="product.jpg" />
 * </ViewTransition>
 *
 * // On detail page (same tag = smooth transition!)
 * <ViewTransition tag="product-123">
 *   <img src="product.jpg" />
 * </ViewTransition>
 * ```
 */
export class ViewTransition extends Component<ViewTransitionProps> {
  private element?: HTMLElement;

  render() {
    const {
      tag,
      className = "",
      style = {},
      duration = 300,
      easing = "ease-in-out",
      preset = "hero",
      enabled = true,
    } = this.props;

    // Apply view transition name as CSS property
    const viewTransitionStyle = enabled
      ? {
          ...style,
          viewTransitionName: tag,
        }
      : style;

    return (
      <div
        ref={(el: HTMLElement) => {
          this.element = el;
          if (el && enabled) {
            setupViewTransition(el, {
              tag,
              duration,
              easing,
              preset,
            });
          }
        }}
        className={className}
        style={viewTransitionStyle}
        data-view-transition-tag={tag}
      >
        {this.children}
      </div>
    );
  }
}
