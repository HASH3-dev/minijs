import { Component } from "@mini/core";
import { RouteSwitcher } from "@mini/router";
import { Counter } from "./features/counter";

export class AppRouter extends Component {
  render() {
    return <RouteSwitcher>{() => [Counter]}</RouteSwitcher>;
  }
}
