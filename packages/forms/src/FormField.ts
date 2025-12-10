import { Component, Signal } from "@mini/core";
import {
  FieldMetadata,
  FieldState,
  FormBindAttributes,
  FormTrigger,
} from "./types";
import { IMaskAdapter } from "./adapters/IMaskAdapter";
import { MaskAdapter } from "./adapters";
import { takeUntil } from "rxjs";

// FOR FUTURE ADAPTERS
const MaskAdapterInjected = IMaskAdapter;

/**
 * Represents a single form field with its state and validation
 */
export class FormField {
  private _value$: Signal<any>;
  private _errors$: Signal<string[]>;
  private _touched$: Signal<boolean>;
  private _dirty$: Signal<boolean>;
  private _valid$: Signal<boolean>;
  private _defaultValue: any;
  private _maskAdapter?: MaskAdapter;
  private _currentElement?: HTMLInputElement;

  metadata: FieldMetadata;

  constructor(metadata: FieldMetadata, private _hostComponent: Component) {
    console.log("FIELD CONSTRUCTOR", metadata.label);
    this.metadata = metadata;
    this._defaultValue = metadata.defaultValue;
    this._value$ = new Signal(metadata.defaultValue);
    this._errors$ = new Signal<string[]>([]);
    this._touched$ = new Signal(false);
    this._dirty$ = new Signal(false);

    // Valid is derived from errors
    this._valid$ = new Signal<boolean>(true);
    this._errors$
      .pipe(takeUntil(this._hostComponent.$.unmount$))
      .subscribe((errors) => {
        this._valid$.next(errors.length === 0);
      });
  }

  /**
   * Get the current value signal
   */
  get value$(): Signal<any> {
    return this._value$;
  }

  /**
   * Get the current errors signal
   */
  get errors$(): Signal<string[]> {
    return this._errors$;
  }

  /**
   * Get the touched state
   */
  get touched$() {
    return this._touched$.asObservable();
  }

  /**
   * Get the dirty state
   */
  get dirty$() {
    return this._dirty$.asObservable();
  }

  /**
   * Get the valid state
   */
  get valid$(): Signal<boolean> {
    return this._valid$;
  }

  /**
   * Get current value
   */
  get value(): any {
    return this._value$.value;
  }

  /**
   * Set the value
   */
  setValue(value: any) {
    const currentValue = this._value$.value;
    this._value$.next(value);

    // Mark as dirty if value changed
    if (currentValue !== value && value !== this._defaultValue) {
      this._dirty$.next(true);
    }
  }

  /**
   * Set errors
   */
  setErrors(errors: string[]) {
    this._errors$.next(errors);
  }

  /**
   * Mark field as touched
   */
  setTouched(touched: boolean = true) {
    this._touched$.next(touched);
  }

  /**
   * Get current state
   */
  getState(): FieldState {
    return {
      value: this._value$.value,
      errors: this._errors$.value,
      touched: this._touched$.value,
      dirty: this._dirty$.value,
      valid: this._valid$.value,
    };
  }

  /**
   * Reset field to initial state
   */
  reset() {
    this._value$.next(this._defaultValue);
    this._errors$.next([]);
    this._touched$.next(false);
    this._dirty$.next(false);
  }

  /**
   * Create bind attributes for input element
   */
  bind(options?: { validateOn?: FormTrigger }): FormBindAttributes {
    const validateOn =
      options?.validateOn || this.metadata.validateOn || FormTrigger.blur;
    const attrs: FormBindAttributes = {
      name: this.metadata.propertyKey,
      value: this._value$.value,
      required: this.required,
    };

    // Add input type if specified
    if (this.metadata.type) {
      (attrs as any).type = this.metadata.type;
    }

    // Add ref callback to apply mask
    if (this.metadata.mask) {
      (attrs as any).ref = (el: HTMLInputElement | null) => {
        if (el && el !== this._currentElement) {
          this._currentElement = el;

          // Initialize mask adapter if not exists
          if (!this._maskAdapter) {
            this._maskAdapter = new MaskAdapterInjected();
          }

          // Apply mask to element
          this._maskAdapter.apply(el, this.metadata.mask!);

          // Update value from masked input
          const maskInstance = this._maskAdapter.getInstance(el);
          if (maskInstance) {
            maskInstance.on("accept", () => {
              this.setValue(maskInstance.unmaskedValue);
            });
          }
        }
      };
    }

    const changeValue = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const value = this._maskAdapter
        ? this._maskAdapter.getUnmaskedValue(target)
        : target.value;
      this.setValue(value);
      return value;
    };

    // Add event handlers based on validation trigger
    if (validateOn === FormTrigger.input || validateOn === FormTrigger.change) {
      if (validateOn === FormTrigger.input) {
        attrs.onInput = (e: Event) => {
          changeValue(e);
        };
      } else {
        attrs.onChange = (e: Event) => {
          changeValue(e);
        };
      }
    }

    if (validateOn === FormTrigger.blur) {
      attrs.onBlur = (e: Event) => {
        changeValue(e);
        this.setTouched(true);
      };
    } else {
      // Always mark as touched on blur
      attrs.onBlur = () => {
        this.setTouched(true);
      };
    }

    return attrs;
  }

  /**
   * Get label for this field
   */
  get label(): string {
    return this.metadata.label || this.metadata.propertyKey;
  }

  /**
   * Check if field is required
   */
  get required(): boolean {
    return this.metadata.required || false;
  }

  /**
   * Get options for this field (for select, radio, etc)
   */
  get options(): string[] | number[] | undefined {
    return this.metadata.options;
  }

  /**
   * Get input type for this field
   */
  get inputType(): string {
    return this.metadata.type || "text";
  }
}
