import "reflect-metadata";
import { FORM_INPUT_OPTIONS_METADATA } from "../types";

/**
 * Decorator to specify options for a field (for select, radio, etc)
 * @param options - Array of possible values
 * @example
 * class Form {
 *   @InputOptions(['option1', 'option2', 'option3'])
 *   @IsString()
 *   choice = '';
 * }
 */
export function InputOptions(options: string[] | number[]) {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata(
      FORM_INPUT_OPTIONS_METADATA,
      options,
      target,
      propertyKey
    );
  };
}
