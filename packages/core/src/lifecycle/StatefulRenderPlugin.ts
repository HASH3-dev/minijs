import { distinctUntilChanged, isObservable, of, switchMap, tap } from "rxjs";
import { Component } from "../base/Component";
import { LifecyclePhase } from "../base/ReactiveComponent";
import { RenderState } from "../types";
import { DecoratorPlugin } from "./DecoratorPlugin";

/**
 * Plugin that makes component render react to renderState$ changes
 * Overrides render() to return Observable that reacts to state changes
 */
export class StatefulRenderPlugin extends DecoratorPlugin {
  readonly id = "stateful-render";
  readonly phase = LifecyclePhase.Created;
  readonly priority = 5; // Execute very first (before Guards=10, Resolvers=20, LoadData=30)

  /**
   * Setup stateful render subscription
   * Overrides render() to return Observable that reacts to state changes
   */
  execute(component: Component): void {
    // Store original render method
    const originalRender = component.render.bind(component);

    // Override render to return Observable that reacts to renderState$
    component.render = () => {
      // Return Observable that maps state to appropriate render method
      // Use switchMap to flatten nested Observables (e.g., from GuardPlugin)
      return component.renderState$.pipe(
        distinctUntilChanged(),
        switchMap((state) => {
          // Determine which method to call based on state
          let result: any;

          switch (state) {
            case RenderState.LOADING:
              if (typeof (component as any).renderLoading === "function") {
                result = (component as any).renderLoading();
              } else {
                result = originalRender();
              }
              break;

            case RenderState.ERROR:
              if (typeof (component as any).renderError === "function") {
                result = (component as any).renderError();
              } else {
                result = originalRender();
              }
              break;

            case RenderState.EMPTY:
              if (typeof (component as any).renderEmpty === "function") {
                result = (component as any).renderEmpty();
              } else {
                result = originalRender();
              }
              break;

            case RenderState.IDLE:
            case RenderState.SUCCESS:
            default:
              result = originalRender();
              break;
          }

          // If result is Observable, return it directly (switchMap will flatten)
          // Otherwise, wrap in Observable
          return isObservable(result) ? result : of(result);
        })
      );
    };
  }
}
