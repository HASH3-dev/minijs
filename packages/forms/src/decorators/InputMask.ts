import "reflect-metadata";
import { FORM_INPUT_MASK_METADATA } from "../types";

/**
 * Decorator to specify an input mask
 * @param mask - The mask pattern (e.g., '999.999.999-99' for CPF)
 * @example
 * class SignupForm {
 *   @InputMask('999.999.999-99')
 *   @IsString()
 *   cpf = '';
 * }
 */
export function InputMask(mask: string) {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata(FORM_INPUT_MASK_METADATA, mask, target, propertyKey);
  };
}
