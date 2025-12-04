import { Component } from "../../../base/Component";
import { SERVICE_COMPONENT } from "../../../constants";
import { Signal } from "../../Signal";

export interface ServiceInstance {
  [SERVICE_COMPONENT]: Component;
}

export type ServiceClass<T extends ServiceInstance> = new (...args: any[]) => T;

export abstract class AbstractStorage {
  abstract signal: Signal<any>;
  abstract link(
    property: string | symbol,
    instance: Component | ServiceClass<ServiceInstance>
  ): void;
  abstract sync(): void;
}
