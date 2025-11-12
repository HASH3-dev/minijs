import { GuardType } from "../types";
import { GUARDS_TOKEN } from "../constants";

/**
 * Guard decorator - controls component rendering based on guard conditions
 * Supports synchronous, Promise-based, and Observable guards
 *
 * The actual guard execution is handled by GuardDecoratorPlugin
 * which runs in the Created lifecycle phase
 *
 * @param guards Array of guard instances or classes
 */
export function UseGuards(guards: GuardType[]) {
  return function <T extends new (...args: any[]) => any>(Ctor: T) {
    // Store guards as metadata on the prototype so plugin can read it
    Ctor.prototype[GUARDS_TOKEN] = guards;
    return Ctor;
  };
}
