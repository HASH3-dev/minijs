# ViewTransition - Hero Animations for MiniJS

ViewTransition is a component that provides smooth, hero-like transitions between elements across different views, similar to Flutter's Hero widget. It uses the native [View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API) for optimal performance.

## Installation

ViewTransition is part of `@mini/common`:

```bash
npm install @mini/common
```

## Basic Usage

Wrap elements that should transition smoothly with `<ViewTransition>` and give them the same `tag`:

```tsx
import { ViewTransition } from '@mini/common';

// Product List Page
export class ProductList extends Component {
  render() {
    return (
      <div>
        {this.products.map(product => (
          <ViewTransition tag={`product-${product.id}`}>
            <img src={product.image} alt={product.name} />
          </ViewTransition>
        ))}
      </div>
    );
  }
}

// Product Detail Page
export class ProductDetail extends Component {
  render() {
    return (
      <div>
        <ViewTransition tag={`product-${this.props.productId}`}>
          <img src={this.product.image} alt={this.product.name} />
        </ViewTransition>
        <h1>{this.product.name}</h1>
        <p>{this.product.description}</p>
      </div>
    );
  }
}
```

When navigating from list to detail, the image will smoothly animate from its position in the list to its position in the detail view!

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tag` | `string` | **required** | Unique identifier for this hero element. Elements with the same tag will transition smoothly. |
| `children` | `any` | - | The content to be wrapped with the transition. |
| `className` | `string` | `""` | CSS class to apply to the wrapper element. |
| `style` | `object` | `{}` | Inline styles to apply to the wrapper element. |
| `duration` | `number` | `300` | Duration of the transition in milliseconds. |
| `easing` | `string` | `"ease-in-out"` | CSS easing function for the transition. |
| `enabled` | `boolean` | `true` | Whether to enable the view transition. |

## Advanced Examples

### Custom Duration and Easing

```tsx
<ViewTransition
  tag="hero-image"
  duration={500}
  easing="cubic-bezier(0.4, 0, 0.2, 1)"
>
  <img src="large-image.jpg" />
</ViewTransition>
```

### With Router Integration

Use with MiniJS router for automatic transitions on navigation:

```tsx
import { RouterService } from '@mini/router';
import { ViewTransition, withViewTransition } from '@mini/common';

export class ProductCard extends Component {
  @Inject(RouterService) router!: RouterService;

  async navigateToDetail(productId: string) {
    // Wrap navigation in view transition
    await withViewTransition(() => {
      this.router.push(`/product/${productId}`);
    });
  }

  render() {
    return (
      <div onClick={() => this.navigateToDetail(this.props.product.id)}>
        <ViewTransition tag={`product-${this.props.product.id}`}>
          <img src={this.props.product.image} />
        </ViewTransition>
        <h3>{this.props.product.name}</h3>
      </div>
    );
  }
}
```

### Conditional Transitions

Disable transitions based on user preferences or device capabilities:

```tsx
export class Gallery extends Component {
  prefersReducedMotion = signal(
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  render() {
    return (
      <ViewTransition
        tag="gallery-image"
        enabled={!this.prefersReducedMotion.value}
      >
        <img src="photo.jpg" />
      </ViewTransition>
    );
  }
}
```

### Multiple Hero Elements

You can have multiple hero transitions on the same page:

```tsx
export class ArticlePreview extends Component {
  render() {
    return (
      <article>
        <ViewTransition tag={`article-${this.props.id}-image`}>
          <img src={this.props.coverImage} />
        </ViewTransition>

        <ViewTransition tag={`article-${this.props.id}-title`}>
          <h2>{this.props.title}</h2>
        </ViewTransition>

        <p>{this.props.excerpt}</p>
      </article>
    );
  }
}
```

## Utility Functions

### `isViewTransitionSupported()`

Check if the browser supports the View Transition API:

```tsx
import { isViewTransitionSupported } from '@mini/common';

if (isViewTransitionSupported()) {
  console.log('View transitions are supported!');
} else {
  console.log('Browser does not support view transitions');
}
```

### `withViewTransition()`

Wrap any async operation with a view transition:

```tsx
import { withViewTransition } from '@mini/common';

// Example: transition when loading new data
async loadNewData() {
  await withViewTransition(async () => {
    const data = await this.api.fetchData();
    this.data.set(data);
  });
}
```

### `startViewTransition()`

Start a view transition with a synchronous callback:

```tsx
import { startViewTransition } from '@mini/common';

updateView() {
  startViewTransition(() => {
    this.showDetails.set(true);
  });
}
```

## CSS Customization

The component applies the following CSS custom properties that you can override:

```css
/* Global styles */
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: var(--view-transition-duration, 300ms);
  animation-timing-function: var(--view-transition-easing, ease-in-out);
}

/* Per-element customization */
[data-view-transition-tag="my-hero"] {
  --view-transition-duration: 500ms;
  --view-transition-easing: cubic-bezier(0.4, 0, 0.2, 1);
}
```

You can also target specific view transitions using CSS:

```css
/* Customize the old state */
::view-transition-old(product-image) {
  animation: fade-out 0.3s ease-out;
}

/* Customize the new state */
::view-transition-new(product-image) {
  animation: fade-in 0.3s ease-in;
}

@keyframes fade-out {
  from { opacity: 1; }
  to { opacity: 0; }
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

## Browser Support

The View Transition API is supported in:
- Chrome 111+
- Edge 111+
- Opera 97+

For unsupported browsers, the component gracefully degrades - elements will still render but without the smooth transitions.

Check browser support: [Can I Use - View Transitions](https://caniuse.com/view-transitions)

## Best Practices

1. **Use unique tags**: Ensure each ViewTransition has a unique tag within the current view.

2. **Keep tags consistent**: Use the same tag for elements that should transition between views.

3. **Limit concurrent transitions**: Too many simultaneous transitions can impact performance.

4. **Test on real devices**: View transitions can be heavy on mobile devices.

5. **Respect user preferences**: Disable transitions for users with `prefers-reduced-motion`.

6. **Use with router**: Integrate with your router for seamless navigation transitions.

## Examples

See the playground for complete examples:
- Simple image gallery with transitions
- Product list to detail navigation
- Article preview to full article
- Multiple simultaneous hero transitions

## Comparison with Flutter's Hero

| Feature | Flutter Hero | MiniJS ViewTransition |
|---------|--------------|----------------------|
| **Tag-based matching** | ✅ Yes | ✅ Yes |
| **Automatic transitions** | ✅ Yes | ✅ Yes |
| **Custom durations** | ✅ Yes | ✅ Yes |
| **Custom curves** | ✅ Yes | ✅ Yes (CSS easing) |
| **Browser native** | ❌ Flutter renders | ✅ Native browser API |
| **Performance** | ✅ Excellent | ✅ Excellent |

## License

MIT
