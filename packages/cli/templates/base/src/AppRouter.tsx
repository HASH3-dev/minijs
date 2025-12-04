import { Component } from "@mini/core";
import { RouteSwitcher } from "@mini/router";
import { CounterPage } from "./features/counter";

export class AppRouter extends Component {
  render() {
    return <RouteSwitcher>{() => [CounterPage]}</RouteSwitcher>;
  }
}
