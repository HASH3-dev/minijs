import { Component, Mount, signal } from "@mini/core";
import { ViewTransition, withViewTransition } from "@mini/common";

interface Product {
  id: number;
  name: string;
  image: string;
  price: number;
  description: string;
}

const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Laptop Pro",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400",
    price: 1299,
    description: "Powerful laptop for professionals",
  },
  {
    id: 2,
    name: "Wireless Mouse",
    image: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=400",
    price: 49,
    description: "Ergonomic wireless mouse",
  },
  {
    id: 3,
    name: "Mechanical Keyboard",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400",
    price: 159,
    description: "RGB mechanical keyboard",
  },
  {
    id: 4,
    name: "HD Monitor",
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400",
    price: 299,
    description: "27-inch 4K monitor",
  },
];

/**
 * Example component demonstrating ViewTransition (Hero-like animations)
 * Similar to Flutter's Hero widget
 */
export class ViewTransitionExample extends Component {
  selectedProduct = signal<Product | null>(null);

  @Mount()
  onMount() {
    console.log("ViewTransition Example mounted!");
  }

  async selectProduct(product: Product) {
    // Use withViewTransition for smooth animation
    await withViewTransition(() => {
      this.selectedProduct.set(product);
    });
  }

  async closeDetail() {
    await withViewTransition(() => {
      this.selectedProduct.set(null);
    });
  }

  render() {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">
          ViewTransition Demo - Hero Animations
        </h1>

        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-800">
            💡 Click on a product to see the smooth hero transition (like
            Flutter's Hero widget)
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Note: View Transition API requires Chrome 111+, Edge 111+, or Opera
            97+
          </p>
        </div>

        {this.selectedProduct.map((product) => {
          return product ? (
            // Detail View
            <div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => this.closeDetail()}
            >
              <div
                className="bg-white rounded-lg max-w-2xl w-full p-6"
                onClick={(e: MouseEvent) => e.stopPropagation()}
              >
                <div className="flex gap-6">
                  {/* Hero Image - same tag as in the list */}
                  <ViewTransition
                    tag={`product-${product.id}`}
                    className="flex-shrink-0"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-64 h-64 object-cover rounded-lg"
                    />
                  </ViewTransition>

                  <div className="flex-1">
                    {/* Hero Title */}
                    <ViewTransition tag={`product-title-${product.id}`}>
                      <h2 className="text-2xl font-bold mb-2">
                        {product.name}
                      </h2>
                    </ViewTransition>

                    <p className="text-3xl font-bold text-green-600 mb-4">
                      ${product.price}
                    </p>

                    <p className="text-gray-600 mb-6">{product.description}</p>

                    <div className="flex gap-3">
                      <button className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                        Add to Cart
                      </button>
                      <button
                        onClick={() => this.closeDetail()}
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Grid View
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {PRODUCTS.map((product) => (
                <div
                  key={product.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow rounded-lg overflow-hidden bg-white border border-gray-200"
                  onClick={() => this.selectProduct(product)}
                >
                  {/* Hero Image - will transition to detail view */}
                  <ViewTransition
                    tag={`product-${product.id}`}
                    duration={400}
                    easing="cubic-bezier(0.4, 0, 0.2, 1)"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                  </ViewTransition>

                  <div className="p-4">
                    {/* Hero Title */}
                    <ViewTransition tag={`product-title-${product.id}`}>
                      <h3 className="font-semibold text-lg mb-1">
                        {product.name}
                      </h3>
                    </ViewTransition>

                    <p className="text-green-600 font-bold">${product.price}</p>
                  </div>
                </div>
              ))}
            </div>
          );
        })}

        {/* Code Example */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Usage Example:</h3>
          <pre className="text-sm overflow-x-auto">
            {`import { ViewTransition } from '@mini/common';

// Wrap elements with ViewTransition
<ViewTransition tag="product-1">
  <img src="product.jpg" />
</ViewTransition>

// On another page with same tag = smooth transition!
<ViewTransition tag="product-1">
  <img src="product.jpg" />
</ViewTransition>`}
          </pre>
        </div>
      </div>
    );
  }
}
