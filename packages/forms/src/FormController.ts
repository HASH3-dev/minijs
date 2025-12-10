import { Signal, Component, signal } from "@mini/core";
import { combineLatest, map, takeUntil } from "rxjs";
import { FormField } from "./FormField";
import { getFieldsMetadata } from "./utils";
import {
  FormControllerOptions,
  FormTrigger,
  FormBindAttributes,
  ValidationAdapter,
} from "./types";
import { ClassValidatorAdapter } from "./adapters";

/**
 * Form Controller - manages form state, validation, and field binding
 */
export class FormController<T = any> {
  private _fields: Map<string, FormField>;
  private _schemaClass: any;
  private _validator?: ValidationAdapter;
  private _options: FormControllerOptions;
  private _submitsAttempts$: Signal<number>;
  private _serverErrors$: Signal<Map<string, string[]>>;
  private _hostComponent: Component;
  private _formRef = signal<HTMLFormElement>();
  private _values$ = signal<Record<string, any>>();
  private _requiredFields!: FormController;

  constructor(
    schemaClass: new () => T,
    options: FormControllerOptions = {},
    hostComponent: Component
  ) {
    console.log("FORM CONSTRUCTOR");
    this._schemaClass = schemaClass;
    this._hostComponent = hostComponent;
    this._options = {
      trigger: options.trigger || FormTrigger.blur,
      validateOnInit: options.validateOnInit || false,
    };
    this._fields = new Map();
    this._submitsAttempts$ = new Signal(0);
    this._serverErrors$ = new Signal<Map<string, string[]>>(new Map());

    // Initialize validator if available
    try {
      this._validator = new ClassValidatorAdapter();
    } catch (error) {
      // Validator not available, will work without validation
      console.warn("Form validation disabled:", error);
    }

    // Initialize fields from schema
    this._initializeFields();

    // Subscribe to value changes for validation
    this._setupValidation();
  }

  /**
   * Initialize fields from schema metadata
   */
  private _initializeFields() {
    const fieldsMetadata = getFieldsMetadata(this._schemaClass);
    console.log("INICIALIZANDO FORM");
    for (const [fieldName, metadata] of fieldsMetadata) {
      const field = new FormField(metadata, this._hostComponent);
      this._fields.set(fieldName, field);

      // Setup validation on value changes based on trigger
      const trigger = metadata.validateOn || this._options.trigger;

      if (trigger === FormTrigger.input || trigger === FormTrigger.change) {
        field.value$
          .pipe(takeUntil(this._hostComponent.$.unmount$))
          .subscribe(() => {
            if (field.getState().dirty) {
              this._validateField(fieldName);
            }
          });
      }
    }
  }

  /**
   * Setup validation subscriptions
   */
  private _setupValidation() {
    // Validate on blur for fields with blur trigger
    for (const [fieldName, field] of this._fields) {
      field.touched$
        .pipe(takeUntil(this._hostComponent.$.unmount$))
        .subscribe((touched) => {
          if (touched) {
            const trigger = field.metadata.validateOn || this._options.trigger;
            if (trigger === FormTrigger.blur) {
              this._validateField(fieldName);
            }
          }
        });
    }
  }

  /**
   * Validate a single field
   */
  private async _validateField(fieldName: string) {
    if (!this._validator) return;

    const field = this._fields.get(fieldName);
    if (!field) return;

    // Skip validation for optional fields that are not dirty
    if (!field.required && !field.getState().dirty) {
      field.setErrors([]);
      return;
    }

    try {
      const errors = await this._validator.validateField(
        this._schemaClass,
        fieldName,
        field.value
      );
      field.setErrors(errors);
    } catch (error) {
      console.error(`Validation error for field ${fieldName}:`, error);
    }
  }

  /**
   * Validate all fields
   */
  private async _validateAll() {
    if (!this._validator) return;

    const values = this.getValues();

    try {
      const result = await this._validator.validate(this._schemaClass, values);

      // Update each field with errors
      for (const [fieldName, field] of this._fields) {
        // Skip validation for optional fields that are not dirty
        if (!field.required && !field.getState().dirty) {
          field.setErrors([]);
          continue;
        }

        const errors = result.errors[fieldName] || [];
        field.setErrors(errors);
      }
    } catch (error) {
      console.error("Form validation error:", error);
    }
  }

  /**
   * Get all form values as object
   */
  getValues(): Record<string, any> {
    const values: Record<string, any> = {};
    for (const [fieldName, field] of this._fields) {
      values[fieldName] = field.value;
    }
    return values;
  }

  /**
   * Get values as signal
   */
  get values$(): Signal<Record<string, any>> {
    if (this._values$.isInitialized()) return this._values$;

    const values = Array.from(this._fields.values());
    const keys = Array.from(this._fields.keys());

    // Update signal when any field changes
    combineLatest(values.map((e) => e.value$))
      .pipe(
        map((values) => {
          return Object.fromEntries(
            keys.map((key, index) => {
              return [key, values[index]];
            })
          );
        }),
        takeUntil(this._hostComponent.$.unmount$)
      )
      .subscribe(this._values$);

    return this._values$;
  }

  /**
   * Check if form is valid
   */
  get isValid$(): Signal<boolean> {
    const validSignals = Array.from(this._fields.values()).map((f) => f.valid$);
    const signal = new Signal<boolean>(true);

    combineLatest(validSignals)
      .pipe(
        map((validStates) => validStates.every((v) => v)),
        takeUntil(this._hostComponent.$.unmount$)
      )
      .subscribe(signal);

    return signal;
  }

  /**
   * Check if form is dirty (any field changed)
   */
  get isDirty$(): Signal<boolean> {
    const dirtySignals = Array.from(this._fields.values()).map((f) => f.dirty$);
    const signal = new Signal<boolean>(false);

    combineLatest(dirtySignals)
      .pipe(
        map((dirtyStates) => dirtyStates.some((d) => d)),
        takeUntil(this._hostComponent.$.unmount$)
      )
      .subscribe(signal);

    return signal;
  }

  /**
   * Check if form is touched (any field touched)
   */
  get isTouched$(): Signal<boolean> {
    const touchedSignals = Array.from(this._fields.values()).map(
      (f) => f.touched$
    );
    const signal = new Signal<boolean>(false);

    combineLatest(touchedSignals)
      .pipe(
        map((touchedStates) => touchedStates.some((t) => t)),
        takeUntil(this._hostComponent.$.unmount$)
      )
      .subscribe(signal);

    return signal;
  }

  /**
   * Get all form errors
   */
  get errors$(): Signal<Map<string, string[]>> {
    const signal = new Signal<Map<string, string[]>>(new Map());

    // Update signal when any field errors change
    for (const [fieldName, field] of this._fields) {
      field.errors$
        .map(() => {
          const errors: Map<string, string[]> = new Map();
          for (const [name, f] of this._fields) {
            if (f.errors$.value.length > 0) {
              errors.set(name, f.errors$.value);
            }
          }
          signal.next(errors);
        })
        .pipe(takeUntil(this._hostComponent.$.unmount$));
    }

    return signal;
  }

  /**
   * Get server errors
   */
  get serverErrors$(): Signal<Map<string, string[]>> {
    return this._serverErrors$;
  }

  /**
   * Set server errors
   */
  setServerErrors(errors: Record<string, string[]>) {
    const mapErrors = new Map(Object.entries(errors));
    this._serverErrors$.next(mapErrors);

    // Also set errors on individual fields
    for (const [fieldName, fieldErrors] of mapErrors) {
      const field = this._fields.get(fieldName);
      if (field) {
        field.setErrors(fieldErrors);
      }
    }
  }

  /**
   * Get submit attempts count
   */
  get submitsAttempts$(): Signal<number> {
    return this._submitsAttempts$;
  }

  /**
   * Get fields as signal for iteration
   */
  get fields$(): Signal<Map<string, FormField>> {
    return new Signal(this._fields);
  }

  /**
   * Get a subset of the form with only required fields
   * Returns a new FormController instance
   */
  get requiredFields(): FormController<T> {
    if (this._requiredFields) return this._requiredFields;
    // Create a new controller with the same schema but filtered fields
    const controller = new FormController(
      this._schemaClass,
      this._options,
      this._hostComponent
    );

    // Copy only required fields (this is a simplified version)
    // In a real implementation, you'd check validation decorators
    controller._fields = new Map(
      Array.from(this._fields).filter(([_, f]) => f.required)
    );

    return (this._requiredFields = controller);
  }

  /**
   * Bind form element
   */
  bind(submitFn: (e: Event) => any): FormBindAttributes {
    return {
      onSubmit: async (e: Event) => {
        e.preventDefault();
        this._submitsAttempts$.next(this._submitsAttempts$.value + 1);
        await this._validateAll();
        submitFn(e);
      },
      novalidate: true,
      ref: this._formRef,
    };
  }

  /**
   * Bind a specific field or get field for binding
   */
  bindField(
    fieldName: string,
    options?: { validateOn?: FormTrigger }
  ): FormBindAttributes {
    const field = this._fields.get(fieldName);
    if (!field) {
      throw new Error(`Field "${fieldName}" not found in form schema`);
    }

    return field.bind(options);
  }

  /**
   * Get a specific field
   */
  getField(fieldName: string): FormField | undefined {
    return this._fields.get(fieldName);
  }

  /**
   * Reset form to initial state
   */
  reset() {
    for (const field of this._fields.values()) {
      field.reset();
    }
    this._submitsAttempts$.next(0);
    this._serverErrors$.next(new Map());
    this._formRef.value.reset();
  }

  /**
   * Set form values
   */
  setValues(values: Partial<Record<keyof T, any>>) {
    for (const [fieldName, value] of Object.entries(values)) {
      const field = this._fields.get(fieldName);
      if (field) {
        field.setValue(value);
      }
    }
  }
}
