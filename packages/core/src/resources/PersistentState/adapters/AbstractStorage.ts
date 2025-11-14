import { Component } from "../../../base/Component";
import { Signal } from "../../Signal";

export abstract class AbstractStorage {
  abstract signal: Signal<any>;
  abstract link(property: string | symbol, instance: Component): void;
  abstract sync(): void;
}
