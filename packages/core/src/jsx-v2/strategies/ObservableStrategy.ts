import { isObservable, Observable } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { Component } from "../../base/Component";
import { OBSERVABLES, SUBSCRIPTIONS } from "../../constants";
import { PropStrategy } from "../types";
import { setAttr } from "../utils/setAttr";

/**
 * ObservableStrategy - Handles observable attributes
 * Any attribute that is an observable will be subscribed and updated reactively
 *
 * @example
 * ```tsx
 * const text$ = signal('Hello');
 * const disabled$ = signal(false);
 *
 * <input value={text$} disabled={disabled$} />
 * ```
 */
export class ObservableStrategy implements PropStrategy {
  canHandle(key: string, value: any): boolean {
    // Handle any observable (except ref, style, events which have dedicated strategies)
    return (
      isObservable(value) &&
      key !== "ref" &&
      key !== "style" &&
      !key.startsWith("on")
    );
  }

  apply(
    element: Element,
    key: string,
    value: any,
    component?: Component
  ): void {
    const observable = value as Observable<any>;

    // Use component's unmount$ for automatic cleanup
    const obs = component
      ? observable.pipe(takeUntil(component.$.unmount$))
      : observable;

    const subscription = obs.subscribe((val) => {
      setAttr(element as HTMLElement | SVGElement, key, val);
    });

    // Store subscription for cleanup
    if (component) {
      (subscription as any).label = component.constructor.name;
    }

    (element as any)[SUBSCRIPTIONS] = [
      ...((element as any)[SUBSCRIPTIONS] ?? []),
      subscription,
    ];
    (element as any)[OBSERVABLES] = [
      ...((element as any)[OBSERVABLES] ?? []),
      observable,
    ];
  }
}
