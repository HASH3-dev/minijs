import { Component, Mount, signal } from "@mini/core";

export class RefExample extends Component {
  private inputRef: HTMLInputElement | null = null;
  private divRef: HTMLDivElement | null = null;
  private message = signal("");

  focusInput() {
    this.inputRef?.focus();
  }

  changeDivColor() {
    if (this.divRef) {
      const colors = [
        "bg-red-100",
        "bg-blue-100",
        "bg-green-100",
        "bg-yellow-100",
        "bg-purple-100",
      ];
      const currentColor = this.divRef.className
        .split(" ")
        .find((c) => c.startsWith("bg-"));
      const newColor = colors[Math.floor(Math.random() * colors.length)];

      if (currentColor) {
        this.divRef.classList.remove(currentColor);
      }
      this.divRef.classList.add(newColor);

      this.message.set(`Changed color to ${newColor}!`);
    }
  }

  measureDiv() {
    if (this.divRef) {
      const rect = this.divRef.getBoundingClientRect();
      this.message.set(
        `Div dimensions: ${Math.round(rect.width)}x${Math.round(rect.height)}px`
      );
    }
  }

  render() {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
        <h2 className="text-2xl font-semibold text-slate-800 mb-4">
          Ref Example 🎯
        </h2>

        <p className="text-slate-600 mb-6">
          The <code className="bg-slate-100 px-2 py-1 rounded">ref</code> prop
          allows you to get direct access to DOM elements!
        </p>

        {/* Example 1: Input with ref */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">1. Input Reference</h3>
          <div className="space-y-2">
            <input
              ref={(el: HTMLInputElement) => (this.inputRef = el)}
              type="text"
              placeholder="Type something..."
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => this.focusInput()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Focus Input
            </button>
          </div>
          <p className="text-sm text-slate-500 mt-2">
            Click the button to programmatically focus the input using its ref
          </p>
        </div>

        {/* Example 2: Div with ref */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">2. Div Manipulation</h3>
          <div
            ref={(el: HTMLDivElement) => (this.divRef = el)}
            className="bg-blue-100 p-6 rounded-lg mb-3 transition-colors duration-300"
          >
            <p className="text-slate-700 font-medium">
              This div can be manipulated via its ref!
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => this.changeDivColor()}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Change Color
            </button>
            <button
              onClick={() => this.measureDiv()}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Measure Size
            </button>
          </div>
        </div>

        {/* Message display */}
        {this.message.map((msg) =>
          msg ? (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm">✅ {msg}</p>
            </div>
          ) : null
        )}

        {/* Code example */}
        <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <h4 className="text-sm font-semibold mb-2">Usage Example:</h4>
          <pre className="text-xs text-slate-700 overflow-x-auto">
            {`private inputRef: HTMLInputElement | null = null;

render() {
  return (
    <input
      ref={(el) => this.inputRef = el}
      type="text"
    />
  );
}`}
          </pre>
        </div>
      </div>
    );
  }
}
