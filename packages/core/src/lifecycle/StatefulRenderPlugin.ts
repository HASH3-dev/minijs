import { catchError, from, map, mergeMap, NEVER, startWith } from "rxjs";
import { Component } from "../base/Component";
import { LifecyclePhase } from "../base/ReactiveComponent";
import { toObservable } from "../helpers";
import {
  LOAD_DATA_METHODS,
  LOAD_DATA_STATE,
} from "../resources/LoadData/constants";
import { signal } from "../resources/Signal";
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
    (component as any)[LOAD_DATA_STATE] ??= signal({});
    // Store original render method
    let renderResult: any;
    const originalRender = component.render.bind(component);

    // Override render to return Observable that reacts to renderState$
    component.render = () => {
      // Return Observable that maps state to appropriate render method
      // Use switchMap to flatten nested Observables (e.g., from GuardPlugin)
      return component.renderState$.pipe(
        mergeMap(({ state, data, label }) => {
          // Determine which method to call based on state

          let result: any;
          if (label) {
            result = renderResult ??= originalRender.bind(component)();

            const [renderMethod, transformFn = (e: any = []) => e] =
              this.getRenderMethod(component, state, label) ?? [];

            (component as any)[LOAD_DATA_STATE].next({
              ...(component as any)[LOAD_DATA_STATE].value,
              [label]:
                renderMethod?.apply(
                  component,
                  transformFn([data].flat(), component)
                ) ?? data,
            });

            if (renderResult) {
              return NEVER;
            }
          } else {
            const renderMethod =
              this.getRenderMethod(component, state) ??
              (() => {
                if (renderResult) {
                  return renderResult;
                }
                return (renderResult = originalRender.apply(component));
              });

            result = renderMethod.apply(component, [data].flat());
            if (result instanceof Promise) {
              const loadrendersymbol = Symbol();
              result = from(result).pipe(
                startWith(loadrendersymbol),
                map((val) => {
                  if (val === loadrendersymbol) {
                    const renderMethod = this.getRenderMethod(
                      component,
                      RenderState.LOADING
                    );
                    return (
                      renderMethod?.apply(component, [data].flat()) ?? null
                    );
                  }

                  return val;
                }),
                catchError((e) => {
                  const renderMethod = this.getRenderMethod(
                    component,
                    RenderState.ERROR
                  );
                  return (
                    renderMethod?.apply(component, [e, data].flat()) ?? null
                  );
                })
              );
            }
          }

          // If result is Observable, return it directly (switchMap will flatten)
          // Otherwise, wrap in Observable

          return toObservable(result);
        }, Infinity)
      );
    };
  }

  getRenderMethod(component: Component<{}>, state: RenderState): Function;
  getRenderMethod(
    component: Component<{}>,
    state: RenderState,
    label: string | symbol
  ): [Function, Function];
  getRenderMethod(
    component: Component<{}>,
    state: RenderState,
    label?: string | symbol
  ): Function | [Function, Function] | undefined {
    if (label) {
      return (component as any)[LOAD_DATA_METHODS]?.[label!]?.[state];
    } else {
      switch (state) {
        case RenderState.LOADING:
          return (component as any).renderLoading;
        case RenderState.ERROR:
          return (component as any).renderError;
        case RenderState.EMPTY:
          return (component as any).renderEmpty;
        case RenderState.IDLE:
        case RenderState.SUCCESS:
        default:
          return;
      }
    }
  }
}
