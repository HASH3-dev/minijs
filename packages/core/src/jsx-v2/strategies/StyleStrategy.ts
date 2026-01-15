import { isObservable, Observable } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { Component } from "../../base/Component";
import { OBSERVABLES, SUBSCRIPTIONS } from "../../constants";
import { PropStrategy } from "../types";

/**
 * StyleStrategy - Handles 'style' prop
 * Supports static styles and reactive styles (observables)
 *
 * @example
 * ```tsx
 * // Static styles
 * <div style={{ color: 'red', fontSize: '16px' }}>Text</div>
 *
 * // Reactive styles
 * const color$ = signal('red');
 * <div style={{ color: color$ }}>Text</div>
 *
 * // Or whole style object as observable
 * const styles$ = signal({ color: 'red' });
 * <div style={styles$}>Text</div>
 * ```
 */
export class StyleStrategy implements PropStrategy {
  canHandle(key: string, value: any): boolean {
    return key === "style";
  }

  apply(
    element: Element,
    key: string,
    value: any,
    component?: Component
  ): void {
    const htmlElement = element as HTMLElement;

    // Case 1: Whole style object is observable
    if (isObservable(value)) {
      this.applyObservableStyleObject(
        htmlElement,
        value as Observable<Record<string, any>>,
        component
      );
      return;
    }

    // Case 2: Style object with potentially observable properties
    if (typeof value === "object" && value !== null) {
      this.applyStyleObject(htmlElement, value, component);
      return;
    }
  }

  /**
   * Apply style object where individual properties might be observables
   */
  private applyStyleObject(
    element: HTMLElement,
    styleObj: Record<string, any>,
    component?: Component
  ): void {
    for (const [styleKey, styleValue] of Object.entries(styleObj)) {
      if (isObservable(styleValue)) {
        // Observable style property
        this.applyObservableStyleProperty(
          element,
          styleKey,
          styleValue,
          component
        );
      } else {
        // Static style property
        (element.style as any)[styleKey] = styleValue;
      }
    }
  }

  /**
   * Apply observable for a single style property
   */
  private applyObservableStyleProperty(
    element: HTMLElement,
    styleKey: string,
    observable: Observable<any>,
    component?: Component
  ): void {
    // Use component's unmount$ for automatic cleanup
    const obs = component
      ? observable.pipe(takeUntil(component.$.unmount$))
      : observable;

    const subscription = obs.subscribe((value) => {
      (element.style as any)[styleKey] = value;
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

  /**
   * Apply observable that emits whole style objects
   */
  private applyObservableStyleObject(
    element: HTMLElement,
    observable: Observable<Record<string, any>>,
    component?: Component
  ): void {
    // Use component's unmount$ for automatic cleanup
    const obs = component
      ? observable.pipe(takeUntil(component.$.unmount$))
      : observable;

    const subscription = obs.subscribe((styleObj) => {
      if (typeof styleObj === "object" && styleObj !== null) {
        Object.entries(styleObj).forEach(([styleKey, styleValue]) => {
          (element.style as any)[styleKey] = styleValue;
        });
      }
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
