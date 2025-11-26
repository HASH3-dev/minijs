# Mini Framework Project

Welcome to your new Mini Framework project! 🎉

## 📁 Project Structure

```
src/
├── features/          # Feature modules (pages, components, services)
│   └── counter/      # Example counter feature
│       ├── Counter.page.tsx
│       └── index.ts
├── shared/           # Shared code across features
│   ├── components/   # Reusable components
│   ├── services/     # Global services
│   └── utils/        # Utility functions
├── App.tsx           # Root component
└── main.tsx          # Entry point
```

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📚 Learn More

- [Mini Framework Documentation](https://github.com/HASH3-dev/minijs)
- [Project Structure Guide](../../PROJECT_STRUCTURE.md)

## 💡 Quick Tips

### Creating a New Feature

```bash
# Create feature structure
mkdir -p src/features/my-feature
touch src/features/my-feature/MyFeature.page.tsx
touch src/features/my-feature/index.ts
```

### Component Naming Convention

- **Pages**: `FeatureName.page.tsx` → `class FeatureName`
- **Components**: `ComponentName.component.tsx` → `class ComponentName`
- **Services**: `ServiceName.service.ts` → `class ServiceName`

### Using Signals

```typescript
import { Component, signal } from "@mini/core";

export class MyComponent extends Component {
  // Reactive state
  private count = signal(0);

  increment() {
    this.count.set((c) => c + 1);
  }

  render() {
    return <button onClick={() => this.increment()}>{this.count}</button>;
  }
}
```

## 🎨 Styling

This project uses Tailwind CSS. Edit `tailwind.config.js` to customize your design system.

## 🤖 AI Assistance

If you included the MCP Server, configure Claude Desktop:

1. Copy `mcp-config.json` content
2. Add to `~/.config/Claude/claude_desktop_config.json` (Linux)
   or `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS)
3. Restart Claude Desktop
4. Start chatting with AI about your MiniJS code!

Happy coding! ✨
