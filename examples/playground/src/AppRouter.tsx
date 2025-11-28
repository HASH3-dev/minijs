import { Component, Lazy } from "@mini/core";
import { RouteSwitcher } from "@mini/router";

export class AppRouter extends Component {
  render() {
    return (
      <RouteSwitcher>
        {() => [
          // Lazy-loaded contact page - will be transformed at build time
          Lazy("./features/playground/Playground.page#Playground"),
          Lazy("./features/another/Another.page#AnotherScreen"),
          Lazy("./features/products/ProductList.page#ProductListPage"),
          Lazy("./features/products/ProductDetail.page#ProductDetailPage"),
          Lazy("./features/contacts#ContactPage"),
        ]}
      </RouteSwitcher>
    );
  }
}
