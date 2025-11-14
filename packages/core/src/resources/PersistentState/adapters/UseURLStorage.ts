import { fromEvent, skip, takeUntil } from "rxjs";
import { Component } from "../../../base/Component";
import { Signal } from "../../Signal";
import { PERSISTENT_STATE_ORIGINAL_SIGNAL } from "../constants";
import { AbstractStorage } from "./AbstractStorage";

interface URLStorageConfig {
  transformer?: {
    serialize: (propertyName: string, data: any) => any;
    deserialize: (propertyName: string, data: any) => any;
  };
}

export class UseURLStorage extends AbstractStorage {
  signal!: Signal<any>;

  private orinalSignal!: Signal<any>;
  private componentInstance!: Component;
  private propertyName!: string | symbol;

  constructor(
    private config: URLStorageConfig = {
      transformer: URLTransformers.propertyAsKeyValuesAsJSON(),
    }
  ) {
    super();
  }

  link(property: string | symbol, instance: Component): void {
    this.orinalSignal = (instance as any)[PERSISTENT_STATE_ORIGINAL_SIGNAL];
    this.componentInstance = instance;
    this.propertyName = property;
  }
  sync(): void {
    const queryObject = this.parseQueryString();

    const queryIsEmpty = (q: any) => !q || Object.keys(q).length === 0;

    const defaultValue = (q: any) =>
      queryIsEmpty(q)
        ? this.orinalSignal.value
        : this.config.transformer!.deserialize(this.propertyName as string, q);
    this.signal = new Signal(defaultValue(queryObject));

    let isPopingState = false;

    this.signal
      .pipe(takeUntil(this.componentInstance.$.unmount$), skip(1))
      .subscribe((data) => {
        const url = new URL(window.location.href);
        url.search = new URLSearchParams(
          this.config.transformer!.serialize(this.propertyName as string, data)
        ).toString();

        if (!isPopingState) {
          window.history.pushState({}, "", url);
        }
      });

    fromEvent(window, "popstate")
      .pipe(takeUntil(this.componentInstance.$.unmount$))
      .subscribe(() => {
        isPopingState = true;
        this.signal.next(defaultValue(this.parseQueryString()));
        isPopingState = false;
      });
  }

  private parseQueryString() {
    const params = this.extractUrlParam();
    return [...params.entries()].reduce((a: any, c) => {
      return {
        ...a,
        [c[0]]: a[c[0]]
          ? !Array.isArray(a[c[0]])
            ? [a[c[0]], c[1]]
            : [...a[c[0]], c[1]]
          : c[1],
      };
    }, {});
  }

  private extractUrlParam(): URLSearchParams {
    const url = new URL(window.location.href);
    return new URLSearchParams(url.searchParams);
  }
}

export class URLTransformers {
  /**
   * This transformer function will transform the data into a JSON stringand use the property name as the key
   * @returns ?propertyName={field1:value1,field2:value2}
   */
  static propertyAsKeyValuesAsJSON(): URLStorageConfig["transformer"] {
    return {
      serialize: (propertyName: string, data: any) => ({
        [propertyName]: JSON.stringify(data),
      }),
      deserialize: (propertyName: string, data: any) =>
        JSON.parse(data[propertyName]),
    };
  }

  /**
   * This transformer function will transform each property into a query param
   * @returns ?field1=value1&field2=value2
   */
  static objectKeysAsFields(): URLStorageConfig["transformer"] {
    return {
      serialize: (propertyName: string, data: any) => data,
      deserialize: (propertyName: string, data: any) => data,
    };
  }

  /**
   * This transformer function will transform each property into a query param
   * @returns ?field1=value1&field2=value2
   */
  static propertyAsKeyArrayValuesAsJSON(): URLStorageConfig["transformer"] {
    return {
      serialize: (propertyName: string, data: any) =>
        data.map((item: any) => [propertyName, JSON.stringify(item)]),
      deserialize: (propertyName: string, data: any) => {
        return [data[propertyName]]
          .flat()
          .map((item: string) => JSON.parse(item));
      },
    };
  }
}
