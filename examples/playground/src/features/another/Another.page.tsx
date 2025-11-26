import { Component, UseProviders } from "@mini/core";
import { Route, RouteSwitcher } from "@mini/router";
import { UserRepository } from "../../repositories/user";
import { Footer, LoadingContent, MODAL } from "../../shared/components";

@Route("/another")
@UseProviders([{ provide: MODAL, useValue: true }, UserRepository])
export class AnotherScreen extends Component {
  render() {
    return (
      <div>
        <h1>Another Screen</h1>
        <RouteSwitcher>{() => [LoadingContent, Footer]}</RouteSwitcher>
      </div>
    );
  }
}
