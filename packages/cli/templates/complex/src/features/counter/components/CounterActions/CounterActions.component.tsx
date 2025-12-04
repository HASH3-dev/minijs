import { Component, Inject } from "@mini/core";
import { CounterService } from "../../services";

export class CounterActions extends Component {
  @Inject(CounterService)
  counterService!: CounterService;

  render() {
    return (
      <div className="flex gap-4">
        <button
          onClick={() => this.counterService.decrement()}
          className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition shadow-md hover:shadow-lg"
        >
          -
        </button>
        <button
          onClick={() => this.counterService.increment()}
          className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition shadow-md hover:shadow-lg"
        >
          +
        </button>
      </div>
    );
  }
}
