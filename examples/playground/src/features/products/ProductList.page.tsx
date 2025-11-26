import { Component, Mount, signal } from "@mini/core";
import { Inject } from "@mini/core";
import { Route, RouterService } from "@mini/router";
import { ViewTransition, withViewTransition } from "@mini/common";
import type { Product } from "./types";
import { PRODUCTS } from "./constants";

@Route("/products")
export class ProductListPage extends Component {
  @Inject(RouterService) router!: RouterService;

  products = signal<Product[]>(Object.values(PRODUCTS));

  @Mount()
  onMount() {
    console.log("Product List Page mounted!");
  }

  async navigateToProduct(productId: number) {
    // Use withViewTransition for smooth hero animation
    await withViewTransition(() => {
      this.router.push(`/product/${productId}`);
    });
  }

  render() {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Product Gallery
            </h1>
            <p className="text-gray-600">
              Click on any product to see smooth hero transitions ✨
            </p>
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 <strong>View Transition Demo:</strong> When you click a
                product, notice how the image smoothly animates from its
                position in the grid to the detail page. This is similar to
                Flutter's Hero widget!
              </p>
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {this.products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden cursor-pointer transform hover:scale-[1.02] transition-transform"
                onClick={() => this.navigateToProduct(product.id)}
              >
                {/* Hero Image - This will transition to detail page */}
                <ViewTransition tag={`product-image-${product.id}`}>
                  <div className="aspect-video overflow-hidden bg-gray-100">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </ViewTransition>

                <div className="p-5">
                  {/* Hero Title - This will also transition */}
                  <ViewTransition tag={`product-title-${product.id}`}>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      {product.name}
                    </h3>
                  </ViewTransition>

                  <div className="flex items-center justify-between mt-3">
                    <ViewTransition tag={`product-category-${product.id}`}>
                      <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {product.category}
                      </span>
                    </ViewTransition>
                    <ViewTransition tag={`product-price-${product.id}`}>
                      <span className="text-2xl font-bold text-green-600">
                        ${product.price}
                      </span>
                    </ViewTransition>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Info Footer */}
          <div className="mt-12 p-6 bg-white rounded-xl shadow-md">
            <h3 className="text-lg font-semibold mb-3">How It Works</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <strong>1.</strong> Each product has a unique{" "}
                <code className="bg-gray-100 px-2 py-1 rounded">tag</code> prop
                on the ViewTransition component
              </p>
              <p>
                <strong>2.</strong> When navigating, the same tag is used on the
                detail page
              </p>
              <p>
                <strong>3.</strong> The browser automatically creates a smooth
                animation between the two positions!
              </p>
              <p className="mt-4 text-xs text-gray-500">
                Requires Chrome 111+, Edge 111+, or Opera 97+
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
