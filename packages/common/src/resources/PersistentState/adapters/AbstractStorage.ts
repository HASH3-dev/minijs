import { Component, Signal } from "@mini/core";
import type { ServiceClass, ServiceInstance } from "@mini/core";

export abstract class AbstractStorage {
  abstract signal: Signal<any>;
  abstract link(
    property: string | symbol,
    instance: Component | ServiceClass<ServiceInstance>
  ): void;
  abstract sync(): void;
}
