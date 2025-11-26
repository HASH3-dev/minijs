import { Component } from "@mini/core";
import { RouteSwitcher } from "@mini/router";
import { AnotherScreen } from "./features/another/Another.page";
import { Playground } from "./features/playground/Playground.page";
import { ProductListPage } from "./features/products/ProductList.page";
import { ProductDetailPage } from "./features/products/ProductDetail.page";
import { ContactPage } from "./features/contacts";

export class AppRouter extends Component {
  render() {
    return (
      <RouteSwitcher>
        {() => [
          Playground,
          AnotherScreen,
          ProductListPage,
          ProductDetailPage,
          ContactPage,
        ]}
      </RouteSwitcher>
    );
  }
}
