import { Component } from "@mini/core";
import { RouteSwitcher } from "@mini/router";
import { AnotherScreen } from "./AnotherScreen";
import { App } from "./App";

export class AppRouter extends Component {
  render() {
    return <RouteSwitcher>{() => [App, AnotherScreen]}</RouteSwitcher>;
  }
}
