import "reflect-metadata";
import { FORM_VALIDATE_ON_METADATA, FormTrigger } from "../types";

/**
 * Decorator to specify when a field should be validated
 * @param trigger - The trigger type (blur, input, submit, change)
 * @example
 * class SignupForm {
 *   @ValidateOn(FormTrigger.input)
 *   @IsString()
 *   name = '';
 * }
 */
export function ValidateOn(trigger: FormTrigger) {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata(
      FORM_VALIDATE_ON_METADATA,
      trigger,
      target,
      propertyKey
    );
  };
}
