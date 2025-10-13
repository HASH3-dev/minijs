/** A Counter component using @mini/jsx reactive islands */
import { Component, Mount, signal, unwrap } from "@mini/core";
import { Observable } from "rxjs";

/**
 * This component returns JSX built with the @mini/jsx runtime.
 * The text node that shows the count uses {this.count}, which is automatically
 * detected as a Cell by the JSX handler, so it updates automatically when the value changes.
 */
export class CounterJSX extends Component<{ name: Observable<string> }> {
  count = signal(0);

  @Mount()
  onMount() {
    return () => {
      console.log("unmount");
    };
  }

  render() {
    const inc = () => this.count.next(unwrap(this.count) + 1);
    const dec = () => this.count.next(unwrap(this.count) - 1);

    console.log("render", this.props.name);

    return (
      <section class="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
        <h2 class="text-2xl font-semibold text-slate-800 mb-4">
          Counter (JSX Reactive)
        </h2>

        <div class="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 mb-4 text-center">
          <p class="text-white text-sm font-medium mb-2">Current Value</p>
          <p class="text-white text-5xl font-bold">{this.count}</p>
        </div>

        <div class="flex gap-3 mb-4">
          <button
            class="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition shadow-md hover:shadow-lg active:scale-95"
            onClick={dec}
          >
            -1
          </button>
          <button
            class="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition shadow-md hover:shadow-lg active:scale-95"
            onClick={inc}
          >
            +1
          </button>
        </div>

        <div class="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <p class="text-sm text-slate-600 mb-2">
            Este texto é reativo automaticamente - o JSX detecta que{" "}
            <code class="bg-slate-200 px-2 py-1 rounded text-xs font-mono text-slate-800">
              count
            </code>{" "}
            é um Cell.
          </p>
          <p class="text-sm font-medium text-slate-700">
            User: <span class="text-indigo-600">{this.props.name}</span>
          </p>
        </div>
      </section>
    );
  }
}
