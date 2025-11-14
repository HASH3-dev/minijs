import { Component, signal } from "@mini/core";

export class App extends Component {
  private count = signal(0);

  increment() {
    this.count.set((c) => c + 1);
  }

  decrement() {
    this.count.set((c) => c - 1);
  }

  render() {
    return (
      <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <h1 class="text-4xl font-bold text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Mini Framework
          </h1>
          <p class="text-center text-gray-600 mb-8">
            A modern reactive framework
          </p>

          <div class="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl p-8 mb-6">
            <p class="text-white text-center text-lg mb-2">Counter</p>
            <p class="text-white text-center text-6xl font-bold">
              {this.count}
            </p>
          </div>

          <div class="flex gap-4">
            <button
              onClick={() => this.decrement()}
              class="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition shadow-md hover:shadow-lg"
            >
              -
            </button>
            <button
              onClick={() => this.increment()}
              class="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition shadow-md hover:shadow-lg"
            >
              +
            </button>
          </div>

          <div class="mt-6 pt-6 border-t border-gray-200">
            <p class="text-center text-gray-600 text-sm">
              Edit{" "}
              <code class="bg-gray-100 px-2 py-1 rounded">src/App.tsx</code> to
              get started
            </p>
          </div>
        </div>
      </div>
    );
  }
}
