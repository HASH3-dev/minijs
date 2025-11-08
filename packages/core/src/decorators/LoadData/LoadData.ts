/**
 * @LoadData decorator
 * Method decorator that manages loading states and triggers re-renders
 */

import { from, Observable, of, takeUntil } from "rxjs";
import { Component } from "../../base/Component";
import { LifecyclePhase } from "../../base/ReactiveComponent";
import { RENDER_STATE } from "../../constants";
import { RenderState } from "../../types";
import { LoadDataConfig } from "./types";

/**
 * Decorator for data loading methods
 * When the method is called, component state changes and re-renders occur
 * @param isEmptyFn Optional function to determine if result is empty
 * @example
 * class MyComponent extends Component {
 *   users: User[] = [];
 *
 *   @LoadData((data) => data.length === 0)
 *   async loadUsers() {
 *     const response = await fetch('/api/users');
 *     this.users = await response.json();
 *     return this.users;
 *   }
 *
 *   render() {
 *     // Called when state is SUCCESS
 *     return <div>{this.users.map(user => <div>{user.name}</div>)}</div>;
 *   }
 *
 *   renderLoading() {
 *     // Called when state is LOADING
 *     return <div>Loading users...</div>;
 *   }
 *
 *   renderError() {
 *     // Called when state is ERROR
 *     return <div>Error loading users</div>;
 *   }
 *
 *   renderEmpty() {
 *     // Called when state is EMPTY (null/undefined result)
 *     return <div>No users found</div>;
 *   }
 *
 *   // Method can be called on button click for example
 *   @Mount()
 *   onMount() {
 *     this.loadUsers(); // Triggers loading → success cycle
 *   }
 * }
 */
export function LoadData({
  isEmpty,
  label,
  autoLoad = false,
  loadPhase = LifecyclePhase.AfterMount,
}: LoadDataConfig = {}): MethodDecorator {
  return function (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;

    descriptor.value = function (this: any, ...args: any[]) {
      // Set state to LOADING - Component will trigger re-render
      (this as Component)[RENDER_STATE] = { state: RenderState.LOADING, label };

      // Execute original method
      const result = originalMethod.apply(this, args);

      // Convert to Observable
      let result$: Observable<any>;
      if (result instanceof Observable) {
        result$ = result;
      } else if (result instanceof Promise) {
        result$ = from(result);
      } else {
        result$ = of(result);
      }

      // Subscribe and manage state
      result$.pipe(takeUntil(this.$.unmount$)).subscribe({
        next: (data) => {
          // Determine state based on data
          let newState: RenderState;

          // Check if data is empty using custom function or default logic
          if (isEmpty) {
            newState = isEmpty(data) ? RenderState.EMPTY : RenderState.SUCCESS;
          } else {
            // Default: null or undefined is empty
            newState =
              data === null || data === undefined
                ? RenderState.EMPTY
                : RenderState.SUCCESS;
          }

          // Update state - Component will trigger re-render if needed
          (this as Component)[RENDER_STATE] = { state: newState, data, label };
        },
        error: (error) => {
          // Set ERROR state - Component will trigger re-render
          (this as Component)[RENDER_STATE] = {
            state: RenderState.ERROR,
            data: error,
            label,
          };
        },
      });

      return result;
    };

    return descriptor;
  };
}
