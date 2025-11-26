import { applyPreset, ViewTransitionPresetName } from "../presets";

/**
 * Configuration for setting up view transitions
 */
interface ViewTransitionSetup {
  tag: string;
  duration: number;
  easing: string;
  preset?: ViewTransitionPresetName;
}

/**
 * Check if the browser supports View Transition API
 */
export function isViewTransitionSupported(): boolean {
  return (
    typeof document !== "undefined" &&
    "startViewTransition" in document &&
    typeof (document as any).startViewTransition === "function"
  );
}

/**
 * Setup view transition for an element
 * Applies CSS custom properties for transition configuration
 */
export function setupViewTransition(
  element: HTMLElement,
  config: ViewTransitionSetup
): void {
  if (!isViewTransitionSupported()) {
    console.warn(
      "View Transition API is not supported in this browser. Transitions will be skipped."
    );
    return;
  }

  // Apply CSS custom properties for this specific transition
  element.style.setProperty(
    "--view-transition-duration",
    `${config.duration}ms`
  );
  element.style.setProperty("--view-transition-easing", config.easing);

  // Apply preset CSS if specified
  if (config.preset) {
    const presetCSS = applyPreset(config.tag, config.preset);

    // Inject preset styles into document head
    const styleId = `view-transition-preset-${config.tag}`;
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    styleElement.textContent = presetCSS;
  }
}

/**
 * Start a view transition for navigation
 * This should be called before changing routes/views
 */
export function startViewTransition(callback: () => void): void {
  if (!isViewTransitionSupported()) {
    // Fallback: just execute the callback without transition
    callback();
    return;
  }

  const doc = document as any;
  doc.startViewTransition(() => {
    callback();
  });
}

/**
 * Helper to wrap navigation with view transition
 * Can be used with router navigation
 */
export async function withViewTransition(
  callback: () => void | Promise<void>
): Promise<void> {
  if (!isViewTransitionSupported()) {
    await callback();
    return;
  }

  const doc = document as any;
  const transition = doc.startViewTransition(async () => {
    await callback();
  });

  await transition.finished;
}
