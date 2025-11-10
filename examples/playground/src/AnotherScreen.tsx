import { Component, UseProviders } from "@mini/core";
import { Route, RouteSwitcher } from "@mini/router";
import { LoadingContent } from "./components/LoadingContent";
import { Footer } from "./components/Modal/Footer";
import { ApiService } from "./components/Modal/services/ApiService";
import { MODAL } from "./components/Modal/constants";

@Route({ path: "/another" })
@UseProviders([ApiService, { provide: MODAL, useValue: true }])
export class AnotherScreen extends Component {
  render() {
    return (
      <div>
        <h1>Another Screen</h1>
        <RouteSwitcher>
          <LoadingContent />
          <Footer />
        </RouteSwitcher>
      </div>
    );
  }
}
