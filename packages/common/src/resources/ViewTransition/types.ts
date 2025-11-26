import { ViewTransitionPresetName } from "./presets";

/**
 * Props for the ViewTransition component
 */
export interface ViewTransitionProps {
  /**
   * Unique tag to identify this hero element across different views
   * Elements with the same tag will transition smoothly between views
   */
  tag: string;

  /**
   * Children to be wrapped with hero transition
   */
  children?: any;

  /**
   * Optional CSS class to apply to the wrapper element
   */
  className?: string;

  /**
   * Optional inline styles to apply to the wrapper element
   */
  style?: Partial<CSSStyleDeclaration> | Record<string, string>;

  /**
   * Duration of the transition in milliseconds
   * @default 300
   */
  duration?: number;

  /**
   * Easing function for the transition
   * @default 'ease-in-out'
   */
  easing?: string;

  /**
   * Preset de transição a ser aplicado
   * @default 'hero'
   */
  preset?: ViewTransitionPresetName;

  /**
   * Whether to enable view transition
   * @default true
   */
  enabled?: boolean;
}

/**
 * View transition configuration
 */
export interface ViewTransitionConfig {
  /**
   * Duration of the transition in milliseconds
   */
  duration: number;

  /**
   * Easing function for the transition
   */
  easing: string;
}
