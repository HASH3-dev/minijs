import { Signal } from "@mini/core";
import { Observable } from "rxjs";

/**
 * Form trigger types - when validation should occur
 */
export enum FormTrigger {
  blur = "blur",
  input = "input",
  submit = "submit",
  change = "change",
}

/**
 * Metadata keys for storing form field information
 */
export const FORM_FIELD_METADATA = Symbol("form:field:metadata");
export const FORM_VALIDATE_ON_METADATA = Symbol("form:validate:on");
export const FORM_INPUT_LABEL_METADATA = Symbol("form:input:label");
export const FORM_INPUT_MASK_METADATA = Symbol("form:input:mask");
export const FORM_INPUT_TYPE_METADATA = Symbol("form:input:type");
export const FORM_INPUT_OPTIONS_METADATA = Symbol("form:input:options");
export const FORM_OPTIONAL_METADATA = Symbol("form:optional");

/**
 * Field metadata interface
 */
export interface FieldMetadata {
  propertyKey: string;
  validateOn?: FormTrigger;
  label?: string;
  mask?: string;
  type?: string;
  defaultValue: any;
  required?: boolean;
  options?: string[] | number[];
  designType?: any;
}

/**
 * Field state interface
 */
export interface FieldState {
  value: any;
  errors: string[];
  touched: boolean;
  dirty: boolean;
  valid: boolean;
}

/**
 * Form controller options
 */
export interface FormControllerOptions {
  trigger?: FormTrigger;
  validateOnInit?: boolean;
}

/**
 * Form bind attributes for inputs
 */
export interface FormBindAttributes {
  name?: string;
  value?: any;
  type?: string;
  required?: boolean;
  novalidate?: boolean;
  ref?: ((el: any) => void) | Signal<any>;
  onInput?: (e: Event) => void;
  onBlur?: (e: Event) => void;
  onChange?: (e: Event) => void;
  onSubmit?: (e: Event) => void;
}

/**
 * Validation adapter interface for different validation libraries
 */
export interface ValidationAdapter {
  validate(schema: any, data: any): Promise<ValidationResult>;
  validateField(schema: any, fieldName: string, value: any): Promise<string[]>;
}

/**
 * Validation result interface
 */
export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string[]>;
}
