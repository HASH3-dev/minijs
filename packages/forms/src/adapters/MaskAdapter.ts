/**
 * Abstract base class for mask adapters
 * Allows different mask library implementations
 */
export abstract class MaskAdapter {
  /**
   * Apply mask to an input element
   * @param element - The input element
   * @param mask - The mask pattern
   * @returns The mask instance
   */
  abstract apply(element: HTMLInputElement, mask: string): any;

  /**
   * Remove mask from an input element
   * @param element - The input element
   */
  abstract remove(element: HTMLInputElement): void;

  /**
   * Get mask instance for an element
   * @param element - The input element
   * @returns The mask instance or undefined
   */
  abstract getInstance(element: HTMLInputElement): any;

  /**
   * Update mask pattern
   * @param element - The input element
   * @param mask - The new mask pattern
   */
  abstract updateMask(element: HTMLInputElement, mask: string): void;

  /**
   * Get unmasked value (raw value without mask)
   * @param element - The input element
   * @returns The unmasked value
   */
  abstract getUnmaskedValue(element: HTMLInputElement): string;

  /**
   * Get masked value (formatted value with mask)
   * @param element - The input element
   * @returns The masked value
   */
  abstract getMaskedValue(element: HTMLInputElement): string;

  /**
   * Clean up all masks
   */
  abstract destroy(): void;
}
