import { Component } from "../../../base/Component";
import { ServiceClass, ServiceInstance } from "../../../types";
import { Signal } from "../../Signal";

export abstract class AbstractStorage {
  abstract signal: Signal<any>;
  abstract link(
    property: string | symbol,
    instance: Component | ServiceClass<ServiceInstance>
  ): void;
  abstract sync(): void;
}
