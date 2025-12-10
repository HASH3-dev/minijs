import "reflect-metadata";
import { FORM_OPTIONAL_METADATA } from "../types";

/**
 * Decorator to mark a field as optional
 * By default, all fields are considered required
 *
 * @example
 * class Form {
 *   name = '';  // required
 *
 *   @InputIsOptional()
 *   nickname = '';  // optional
 * }
 */
export function InputIsOptional() {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata(FORM_OPTIONAL_METADATA, true, target, propertyKey);
  };
}
