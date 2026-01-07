import { Component, InjectionToken, Lazy, UseProviders } from "@mini/core";
import { RouteSwitcher } from "@mini/router";
import { HTTPService, FetchHttpAdapter, type HTTPConfig } from "@mini/common";
import { PostsApiService } from "./features/posts";

// Token para injeção da configuração HTTP
const HTTPConfigToken = new InjectionToken<HTTPConfig>("HTTPConfig");

@UseProviders([
  {
    provide: HTTPConfigToken,
    useValue: { baseURL: "https://jsonplaceholder.typicode.com" },
  },
  {
    provide: HTTPService,
    useFactory: (config: HTTPConfig) =>
      new HTTPService(new FetchHttpAdapter(config)),
    deps: [HTTPConfigToken],
  },
  PostsApiService,
])
export class AppRouter extends Component {
  render() {
    return (
      <RouteSwitcher>
        {() => [
          // Lazy-loaded contact page - will be transformed at build time
          Lazy("./features/playground/Playground.page#Playground"),
          Lazy("./features/sui-orderbook#SUIOrderBook"),
          Lazy("./features/another/Another.page#AnotherScreen"),
          Lazy("./features/products/ProductList.page#ProductListPage"),
          Lazy("./features/products/ProductDetail.page#ProductDetailPage"),
          Lazy("./features/contacts#ContactPage"),
          Lazy("./features/posts#PostsListPage"),
          Lazy("./features/posts#PostEditPage"),
          Lazy("./features/posts#PostCreatePage"),
        ]}
      </RouteSwitcher>
    );
  }
}
