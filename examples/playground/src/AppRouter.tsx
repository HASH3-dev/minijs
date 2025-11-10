import { Component } from "@mini/core";
import { RouteSwitcher } from "@mini/router";
import { App } from "./App";
import { AnotherScreen } from "./AnotherScreen";

export class AppRouter extends Component {
  render() {
    return (
      <RouteSwitcher>
        <App />
        <AnotherScreen />
      </RouteSwitcher>
    );
  }
}
