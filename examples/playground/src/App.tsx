import { Component, Mount, signal, unwrap } from "@mini/core";
import { interval, map, takeUntil } from "rxjs";
import { CounterJSX } from "./components/CounterJSX";
import { Footer } from "./components/Modal/Footer";
import { Header } from "./components/Modal/Header";
import { Modal } from "./components/Modal";
import { DIExample } from "./components/DIExample";
import { Todo } from "./components/Todo";

export class App extends Component {
  private name = signal("mini");
  private counter = signal(0);
  private list = signal([1, 2, 3]);
  private teste = signal<number[]>([]);

  get formatName() {
    return this.name.pipe(
      map((name) => name.charAt(0).toUpperCase() + name.slice(1))
    );
  }

  @Mount()
  onMount() {
    console.log("App mounted");
    const sub = interval(5000)
      .pipe(takeUntil(this.$.unmount$))
      .subscribe(() => {
        const counter = unwrap(this.counter);
        const teste = unwrap(this.teste);

        this.counter.next(counter + 1);
        this.teste.next([...teste, counter]);

        console.log(this.name);
      });

    return () => {
      console.log("App unmounted");

      sub.unsubscribe();
    };
  }

  @Mount()
  onMount2() {
    console.log("App mounted 2");
  }

  addItem() {
    const prev = unwrap(this.list);
    this.list.next([...prev, prev.length]);
  }

  render() {
    console.log("App render");
    return (
      <div class="min-h-screen p-8">
        <div class="max-w-7xl mx-auto">
          {/* Header */}
          <header class="text-center mb-12">
            <h1 class="text-5xl font-bold text-slate-800 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Mini Framework Playground
            </h1>
            <p class="text-slate-600 text-lg">
              A modern reactive framework with JSX support
            </p>
          </header>

          {/* Modal Section */}
          <div class="mb-8">
            <Modal>
              <Header slot="header" />
              <Footer slot="footer" />
              <p class="text-slate-700 mb-3">
                This is the main content of the modal!
              </p>
              <p class="text-slate-600">It goes into the default slot.</p>
            </Modal>
          </div>

          {/* Main Content Grid */}
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Interactive Demo */}
            <div class="space-y-6">
              <div class="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
                <h2 class="text-2xl font-semibold text-slate-800 mb-4">
                  Interactive Demo
                </h2>

                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">
                      Your Name:
                    </label>
                    <input
                      class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      value={this.name}
                      onInput={(e: any) => this.name.next(e.target.value)}
                      placeholder="Enter your name..."
                    />
                  </div>

                  <div class="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <p class="text-slate-700">
                      <span class="font-medium">Formatted:</span>{" "}
                      <span class="text-blue-600">{this.formatName}</span>
                    </p>
                    <p class="text-slate-700">
                      <span class="font-medium">Raw:</span>{" "}
                      <span class="text-purple-600">{this.name}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Conditional Rendering */}
              <div>
                {this.counter.pipe(
                  map((counter) => counter % 2 === 0),
                  map((bool) => bool && <CounterJSX name={this.name} />)
                )}
              </div>
            </div>

            {/* Right Column - State Monitor */}
            <div class="space-y-6">
              <div class="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
                <h2 class="text-2xl font-semibold text-slate-800 mb-4">
                  State Monitor
                </h2>

                <div class="space-y-3">
                  <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <p class="text-sm font-medium text-blue-700 mb-1">
                      Auto Counter
                    </p>
                    <p class="text-3xl font-bold text-blue-600">
                      {this.counter}
                    </p>
                  </div>

                  <div class="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <p class="text-sm font-medium text-purple-700 mb-1">
                      Static List
                    </p>
                    <p class="text-lg font-mono text-purple-600">
                      [{this.list}]
                    </p>
                  </div>

                  <div class="bg-green-50 rounded-lg p-4 border border-green-200">
                    <p class="text-sm font-medium text-green-700 mb-1">
                      Dynamic Array
                    </p>
                    <p class="text-lg font-mono text-green-600">
                      [{this.teste}]
                    </p>
                  </div>
                </div>
              </div>

              <div class="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
                <h2 class="text-2xl font-semibold text-slate-800 mb-4">
                  List Items
                </h2>
                <div class="space-y-2 mb-4">
                  {this.list.pipe(
                    map((list) =>
                      list.map((item) => (
                        <div class="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg p-3 font-medium shadow-md">
                          Item: {item}
                        </div>
                      ))
                    )
                  )}
                </div>
                <button
                  class="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition shadow-md hover:shadow-lg"
                  onClick={() => this.addItem()}
                >
                  + Add Item
                </button>
              </div>
            </div>
          </div>

          {/* Dependency Injection Example */}
          <div class="mt-12">
            <DIExample />
          </div>

          <div class="mt-12 bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
            <Todo />
          </div>
        </div>
      </div>
    );
  }
}
