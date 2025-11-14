# @mini/cli

CLI tool to scaffold new Mini Framework projects with an interactive setup.

## Usage

### With npx (recommended)

```bash
npx @mini/cli
```

### Global installation

```bash
npm install -g @mini/cli
mini
```

## Features

- 🎨 Beautiful interactive prompts powered by @clack/prompts
- ⚡️ Quick project scaffolding
- 🎯 Optional Tailwind CSS setup
- 🧭 Optional Router integration
- 📦 Choice of package manager (npm, yarn, pnpm)
- 🚀 Automatic dependency installation

## What's included

Every project includes:
- **Mini Framework** - Core reactive framework
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **Mini Vite Plugin** - Automatic JSX configuration

Optional additions:
- **@mini/router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework

## Project Structure

```
my-mini-app/
├── src/
│   ├── App.tsx          # Root component
│   └── main.tsx         # Entry point
├── index.html           # HTML template
├── package.json
├── tsconfig.json
├── vite.config.ts
└── (optional) tailwind.config.js
└── (optional) postcss.config.js
```

## Development

After creating a project:

```bash
cd my-mini-app
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
```

## License

MIT
