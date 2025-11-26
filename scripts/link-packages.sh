#!/bin/bash

# Script to link all packages globally for local testing
echo "🔗 Linking Mini Framework packages globally..."

# Build all packages first
echo "📦 Building packages..."
npm run build

# Array of packages in dependency order
PACKAGES=("core" "common" "router" "vite-plugin" "cli" "mcp-server")

echo ""
# Link each package
for i in "${!PACKAGES[@]}"; do
  pkg="${PACKAGES[$i]}"
  num=$((i + 1))
  echo "${num}️⃣  Linking @mini/${pkg}..."
  cd "packages/${pkg}" && npm link && cd ../..
done

echo ""
echo "✅ All packages linked successfully!"
echo ""
echo "📝 Now you can:"
echo "   1. Run 'mini' or 'create-mini' from anywhere to create a new project"
echo "   2. The created project will use your local packages"
echo ""
echo "🧪 To test:"
echo "   cd /tmp"
echo "   mini"
echo "   # Follow the prompts to create a project"
echo ""
echo "🔓 To unlink later:"
echo "   npm run unlink"
