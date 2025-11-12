/**
 * @LoadFragment decorator
 * Method decorator that manages loading states framents
 */

import { LOAD_DATA_METHODS } from "../constants";
import { LoadFragmentConfig } from "../types";

export function LoadFragment<T>({
  states,
  label,
  transformParams = (e: any[] = [], instance: T) => e,
}: LoadFragmentConfig<T>): MethodDecorator {
  return function (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;

    target[LOAD_DATA_METHODS] = {
      ...(target[LOAD_DATA_METHODS] || {}),
      [label]: {
        ...((target[LOAD_DATA_METHODS] || {})[label] || {}),
        ...Object.fromEntries(
          states.map((e) => [e, [originalMethod, transformParams]])
        ),
      },
    };

    return descriptor;
  };
}
