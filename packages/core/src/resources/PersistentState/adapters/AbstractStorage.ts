import { Subject } from "rxjs";
import { Component } from "../../../base/Component";

export abstract class AbstractStorage {
  abstract signal: Subject<any>;
  abstract link(property: string | symbol, instance: Component): void;
  abstract sync(): void;
}
