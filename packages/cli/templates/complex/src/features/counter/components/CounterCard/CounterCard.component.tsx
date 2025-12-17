import { PersistentSate, UseURLStorage } from "@mini/common";
import { Child, Component, Mount, signal } from "@mini/core";
import { fromEvent, map, switchMap, takeUntil, tap } from "rxjs";
import { filter } from "rxjs/operators";
import { CounterActions } from "../CounterActions";
import { CounterDisplay } from "../CounterDisplay";

export class CounterCard extends Component {
  @Child("display")
  private readonly counterDisplay!: CounterDisplay;
  @Child("actions")
  private readonly counterActions!: CounterActions;

  private componentRef$ = signal<HTMLDivElement>();

  @PersistentSate(new UseURLStorage())
  componentDragPosition$ = signal<{ left: string; top: string } | null>(null);

  @Mount()
  dragElement() {
    return this.componentRef$.pipe(
      switchMap((el) =>
        fromEvent(el, "mousedown").pipe(
          switchMap((startEvent: any) => {
            startEvent.preventDefault();
            const { offsetX, offsetY } = this.getElementCenteredPosition(
              startEvent,
              el
            );

            return fromEvent(document, "mousemove").pipe(
              takeUntil(fromEvent(document, "mouseup")),
              map((moveEvent: any) => {
                moveEvent.preventDefault();
                return {
                  left: `${moveEvent.clientX - offsetX}px`,
                  top: `${moveEvent.clientY - offsetY}px`,
                };
              }),
              tap((position) => {
                this.componentDragPosition$.set(position);
              })
            );
          })
        )
      )
    );
  }

  private getElementCenteredPosition<T extends HTMLDivElement>(
    startEvent: any,
    el: T
  ) {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const startX = startEvent.clientX;
    const startY = startEvent.clientY;
    const startYWithScroll = startY - scrollTop;
    const rect = el.getBoundingClientRect();
    const offsetX = Math.round(startX - rect.left);
    const offsetY = Math.round(startYWithScroll - rect.top);
    return { offsetX, offsetY };
  }

  render() {
    return (
      <>
        <div className="absolute top-[15%] left-1/2 -translate-x-1/2 -translate-y-1/2">
          Drag It 👇 and see the state keeped in URL
        </div>
        <div
          ref={this.componentRef$}
          className={this.componentDragPosition$.map((e) =>
            [
              e === null ? "-translate-x-1/2 -translate-y-1/2" : "",
              "bg-white rounded-2xl shadow-xl p-8 max-w-md w-full absolute top-1/2 left-1/2",
            ].join(" ")
          )}
          style={this.componentDragPosition$.pipe(filter((e) => e !== null))}
        >
          <h1 className="text-4xl font-bold text-center bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Mini Framework
          </h1>
          <p className="text-center text-gray-600 mb-8">
            A modern reactive framework
          </p>

          {this.counterDisplay}
          {this.counterActions}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-gray-600 text-sm">
              Edit{" "}
              <code className="bg-gray-100 px-2 py-1 rounded">
                src/features/counter/Counter.page.tsx
              </code>{" "}
              to get started
            </p>
          </div>
        </div>
      </>
    );
  }
}
