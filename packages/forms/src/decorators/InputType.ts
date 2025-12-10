import "reflect-metadata";
import { FORM_INPUT_TYPE_METADATA } from "../types";

/**
 * Decorator to specify the input type
 * @param type - The input type (e.g., 'password', 'email', 'text')
 * @example
 * class SignupForm {
 *   @InputType('password')
 *   @IsString()
 *   password = '';
 * }
 */
export function InputType(type: string) {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata(FORM_INPUT_TYPE_METADATA, type, target, propertyKey);
  };
}
