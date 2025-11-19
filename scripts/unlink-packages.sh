#!/bin/bash

# Script to unlink all packages from global
echo "🔓 Unlinking Mini Framework packages..."

# Array of packages
PACKAGES=("core" "router" "http-service" "vite-plugin" "cli")

echo ""
# Unlink each package
for i in "${!PACKAGES[@]}"; do
  pkg="${PACKAGES[$i]}"
  num=$((i + 1))
  echo "${num}️⃣  Unlinking @mini/${pkg}..."
  cd "packages/${pkg}" && npm unlink -g && cd ../..
done

echo ""
echo "✅ All packages unlinked successfully!"
