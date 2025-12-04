import { Component, UseProviders } from "@mini/core";
import { Route } from "@mini/router";
import { CounterActions, CounterCard, CounterDisplay } from "./components";
import { CounterService } from "./services";

@Route("/")
@UseProviders([CounterService])
export class CounterPage extends Component {
  render() {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <CounterCard>
          <CounterDisplay slot="display" />
          <CounterActions slot="actions" />
        </CounterCard>
      </div>
    );
  }
}
