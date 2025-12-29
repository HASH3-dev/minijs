import { ViewTransition, withViewTransition } from "@mini/common";
import { Component, Inject, Mount, signal } from "@mini/core";
import { Route, RouterService } from "@mini/router";
import { PRODUCTS } from "./constants";
import type { Product } from "./types";

@Route("/product/:id")
export class ProductDetailPage extends Component {
  @Inject(RouterService) router!: RouterService;

  product = signal<Product>();

  @Mount()
  onMount() {
    // Get product ID from route params
    return this.router.params$.subscribe((params) => {
      const productId = parseInt(params.id);
      const product = PRODUCTS[productId];
      if (product) {
        this.product.set(product);
        console.log("Product Detail Page mounted:", product.name);
      }
    });
  }

  async goBack() {
    await withViewTransition(() => {
      this.router.push("/products");
    });
  }

  render() {
    return (
      <div className="min-h-screen bg-gray-50">
        {this.product.map((product, index) =>
          product ? (
            <div className="max-w-7xl mx-auto px-4 py-8">
              {/* Back Button */}
              <button
                onClick={() => this.goBack()}
                className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back to Products
              </button>

              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="grid md:grid-cols-2 gap-8 p-8">
                  {/* Left Column - Hero Image */}
                  <div>
                    {/* Hero Image - Same tag as list page for smooth transition */}
                    <ViewTransition tag={`product-image-${product.id}`}>
                      <div className="aspect-video rounded-xl overflow-hidden bg-gray-100 shadow-lg">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </ViewTransition>

                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        ✨ <strong>Notice:</strong> The image smoothly animated
                        from the grid to this position using ViewTransition!
                      </p>
                    </div>
                  </div>

                  {/* Right Column - Product Details */}
                  <div className="space-y-6">
                    {/* Hero Title - Same tag for transition */}
                    <div>
                      <ViewTransition tag={`product-title-${product.id}`}>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">
                          {product.name}
                        </h1>
                      </ViewTransition>
                      <div className="flex items-center gap-3 mb-4">
                        <ViewTransition tag={`product-category-${product.id}`}>
                          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            {product.category}
                          </span>
                        </ViewTransition>
                        <ViewTransition tag={`product-price-${product.id}`}>
                          <span className="text-3xl font-bold text-green-600">
                            ${product.price}
                          </span>
                        </ViewTransition>
                      </div>
                    </div>

                    <p className="text-gray-700 leading-relaxed">
                      {product.description}
                    </p>

                    {/* Features */}
                    <div>
                      <h3 className="text-xl font-semibold mb-3">Features</h3>
                      <ul className="space-y-2">
                        {product.features.map((feature, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-2 text-gray-700"
                          >
                            <svg
                              className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Specs */}
                    <div>
                      <h3 className="text-xl font-semibold mb-3">
                        Specifications
                      </h3>
                      <div className="space-y-2">
                        {product.specs.map((spec, index) => (
                          <div
                            key={index}
                            className="flex justify-between py-2 border-b border-gray-100"
                          >
                            <span className="text-gray-600 font-medium">
                              {spec.label}
                            </span>
                            <span className="text-gray-900">{spec.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-4">
                      <button className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                        Add to Cart
                      </button>
                      <button className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Product Not Found
                </h2>
                <p className="text-gray-600 mb-4">
                  The product you're looking for doesn't exist.
                </p>
                <button
                  onClick={() => this.goBack()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Back to Products
                </button>
              </div>
            </div>
          )
        )}
      </div>
    );
  }
}
