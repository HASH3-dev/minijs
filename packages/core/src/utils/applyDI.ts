import { INJECTOR_TOKEN } from "@mini/di";
import { Component } from "../Component";

export const applyDI = (_this: any, guardInstance: any) =>
  Object.assign(guardInstance, {
    injector: (_this as unknown as Component).injector,
    [INJECTOR_TOKEN]: (_this as any)[INJECTOR_TOKEN],
  });
