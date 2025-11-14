import { Component, signal, Watch } from "@mini/core";
import { debounceTime } from "rxjs";

/**
 * Example component demonstrating the @Watch decorator
 *
 * The @Watch decorator is a syntax sugar that automatically:
 * - Subscribes to an observable property when the component mounts
 * - Unsubscribes automatically when the component unmounts
 * - Calls the decorated method whenever the observable emits
 */
export class WatchExample extends Component {
  // Observable properties
  private counter = signal(0);
  private message = signal("Initial message");

  // Track the last value for display
  private lastCounterValue = 0;
  private lastMessageValue = "Initial message";

  private intemInArrayIncrement = 0;

  /**
   * This method will be called automatically whenever 'counter' emits a new value
   * It's equivalent to:
   *
   * @Mount()
   * setupCounterWatch() {
   *   this.counter.pipe(
   *     takeUntil(this.$.unmount$)
   *   ).subscribe((value) => {
   *     console.log("Counter changed:", value);
   *     this.lastCounterValue = value;
   *   });
   * }
   */
  @Watch("counter")
  onCounterChange(value: number) {
    console.log("[WatchExample] Counter changed:", value);
    this.lastCounterValue = value;
  }

  /**
   * Multiple @Watch decorators can be used on the same component
   */
  @Watch("message")
  onMessageChange(value: string) {
    console.log("[WatchExample] Message changed:", value);
    this.lastMessageValue = value;
  }

  @Watch("counter", [debounceTime(1000)])
  @Watch("message")
  combinedWatch(message: string, counter: number) {
    console.log(
      "[WatchExample] Counter and Message changed:",
      message,
      counter
    );
  }

  private incrementCounter = () => {
    this.counter.set((prev) => prev + 1);
  };

  private updateMessage = () => {
    const messages = [
      "Hello World!",
      "Watch decorator is awesome!",
      "TypeScript + RxJS = ❤️",
      "Mini Framework rocks!",
    ];
    const randomIndex = this.intemInArrayIncrement++ % messages.length;
    this.message.set(messages[randomIndex]);
  };

  render() {
    return (
      <div class="p-6 bg-white rounded-lg shadow-md space-y-4">
        <h2 class="text-2xl font-bold text-gray-800">@Watch Decorator Demo</h2>

        <div class="space-y-2">
          <p class="text-gray-600">
            The @Watch decorator automatically subscribes to observables and
            handles cleanup on unmount.
          </p>
        </div>

        <div class="border-t pt-4 space-y-4">
          <div class="bg-blue-50 p-4 rounded">
            <h3 class="font-semibold text-blue-900 mb-2">Counter Watch</h3>
            <p class="text-blue-700 mb-2">
              Current: <span class="font-mono">{this.counter}</span>
            </p>
            <button
              onClick={this.incrementCounter}
              class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              Increment Counter
            </button>
          </div>

          <div class="bg-green-50 p-4 rounded">
            <h3 class="font-semibold text-green-900 mb-2">Message Watch</h3>
            <p class="text-green-700 mb-2">
              Current: <span class="font-mono">{this.message}</span>
            </p>
            <button
              onClick={this.updateMessage}
              class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
            >
              Change Message
            </button>
          </div>
        </div>

        <div class="border-t pt-4">
          <p class="text-sm text-gray-500">
            💡 Check the browser console to see the @Watch decorator in action!
          </p>
        </div>
      </div>
    );
  }
}
