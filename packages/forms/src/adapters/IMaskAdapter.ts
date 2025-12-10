import IMask from "imask";
import { MaskAdapter } from "./MaskAdapter";

/**
 * Adapter for IMask library
 * Handles input masking for form fields
 */
export class IMaskAdapter extends MaskAdapter {
  private maskInstances: Map<HTMLInputElement, any> = new Map();

  /**
   * Apply mask to an input element
   */
  apply(element: HTMLInputElement, mask: string): any {
    // Remove existing mask if any
    this.remove(element);

    // Create new mask instance with lazy: false to show placeholder
    const maskInstance = IMask(element, {
      mask: mask,
      lazy: false, // Show mask placeholder while typing
    });

    // Add CSS class for styling placeholder
    element.classList.add("imask-input");

    // Apply opacity when showing placeholder (empty unmasked value)
    const updateOpacity = () => {
      if (maskInstance.unmaskedValue === "") {
        element.style.color =
          "color-mix(in srgb, currentColor 30%,  transparent 70%)";
      } else {
        element.style.color = "currentColor";
      }
    };

    // Initial opacity check
    updateOpacity();

    // Update opacity on input change
    maskInstance.on("accept", updateOpacity);

    this.maskInstances.set(element, maskInstance);
    return maskInstance;
  }

  /**
   * Remove mask from an input element
   */
  remove(element: HTMLInputElement): void {
    const existing = this.maskInstances.get(element);
    if (existing) {
      existing.destroy();
      this.maskInstances.delete(element);
    }
  }

  /**
   * Get mask instance for an element
   */
  getInstance(element: HTMLInputElement): any {
    return this.maskInstances.get(element);
  }

  /**
   * Update mask pattern
   */
  updateMask(element: HTMLInputElement, mask: string): void {
    const instance = this.maskInstances.get(element);
    if (instance) {
      instance.updateOptions({ mask });
    } else {
      this.apply(element, mask);
    }
  }

  /**
   * Get unmasked value
   */
  getUnmaskedValue(element: HTMLInputElement): string {
    const instance = this.maskInstances.get(element);
    return instance ? instance.unmaskedValue : element.value;
  }

  /**
   * Get masked value
   */
  getMaskedValue(element: HTMLInputElement): string {
    const instance = this.maskInstances.get(element);
    return instance ? instance.value : element.value;
  }

  /**
   * Clean up all masks
   */
  destroy(): void {
    for (const [, instance] of this.maskInstances) {
      instance.destroy();
    }
    this.maskInstances.clear();
  }
}
