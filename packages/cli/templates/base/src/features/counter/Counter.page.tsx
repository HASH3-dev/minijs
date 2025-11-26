import { Component, signal } from "@mini/core";
import { Route } from "@mini/router";

@Route("/")
export class Counter extends Component {
  private count = signal(0);

  increment() {
    this.count.set((c) => c + 1);
  }

  decrement() {
    this.count.set((c) => c - 1);
  }

  render() {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <h1 className="text-4xl font-bold text-center bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Mini Framework
          </h1>
          <p className="text-center text-gray-600 mb-8">
            A modern reactive framework
          </p>

          <div className="bg-linear-to-r from-blue-500 to-indigo-500 rounded-xl p-8 mb-6">
            <p className="text-white text-center text-lg mb-2">Counter</p>
            <p className="text-white text-center text-6xl font-bold">
              {this.count}
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => this.decrement()}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition shadow-md hover:shadow-lg"
            >
              -
            </button>
            <button
              onClick={() => this.increment()}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition shadow-md hover:shadow-lg"
            >
              +
            </button>
          </div>

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
      </div>
    );
  }
}
