# @mini/common

Common utilities and components for the Mini Framework.

## Installation

```bash
npm install @mini/common
```

## Features

### ViewTransition Component

Hero-like animations between views using the native View Transition API. Similar to Flutter's Hero widget.

```tsx
import { ViewTransition } from '@mini/common';

// Wrap elements that should transition smoothly
<ViewTransition tag="product-1">
  <img src="product.jpg" />
</ViewTransition>
```

See the [ViewTransition documentation](./src/resources/ViewTransition/README.md) for complete details.

## Browser Support

- Chrome 111+
- Edge 111+
- Opera 97+

For unsupported browsers, components gracefully degrade.

## License

MIT
