import { Component, Inject } from "@mini/core";
import { CounterService } from "../../services";

export class CounterDisplay extends Component {
  @Inject(CounterService)
  counterService!: CounterService;

  render() {
    return (
      <div className="bg-linear-to-r from-blue-500 to-indigo-500 rounded-xl p-8 mb-6">
        <p className="text-white text-center text-lg mb-2">
          Counter with URL state
        </p>
        <p className="text-white text-center text-6xl font-bold">
          {this.counterService.count}
        </p>
      </div>
    );
  }
}
