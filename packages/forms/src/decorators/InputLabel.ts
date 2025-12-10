import "reflect-metadata";
import { FORM_INPUT_LABEL_METADATA } from "../types";

/**
 * Decorator to specify the label for an input field
 * @param label - The label text
 * @example
 * class SignupForm {
 *   @InputLabel('Full Name')
 *   @IsString()
 *   name = '';
 * }
 */
export function InputLabel(label: string) {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata(
      FORM_INPUT_LABEL_METADATA,
      label,
      target,
      propertyKey
    );
  };
}
