#!/bin/bash

echo "🍎 Building Smart Dating Assistant for Apple Silicon (M1/M2/M3)..."

# Clean any previous builds
echo "🧹 Cleaning previous builds..."
rm -rf "Smart Dating Assistant-darwin-arm64"
rm -rf out/
rm -f smart-dating-assistant-mac-apple-silicon.zip

# Build TypeScript
echo "🔨 Building TypeScript..."
pnpm run build-ts

# Build Next.js renderer
echo "⚛️ Building Next.js renderer..."
pnpm run build-renderer

# Package specifically for Apple Silicon
echo "📦 Packaging for Apple Silicon (arm64)..."
npx electron-packager . "Smart Dating Assistant" \
  --platform=darwin \
  --arch=arm64 \
  --out=. \
  --overwrite \
  --asar \
  --prune=true \
  --app-bundle-id=com.smartdatingassistant.app \
  --app-version=1.0.0 \
  --executable-name="Smart Dating Assistant"

# Create ZIP for distribution
echo "🗜️ Creating ZIP file..."
zip -r smart-dating-assistant-mac-apple-silicon.zip "Smart Dating Assistant-darwin-arm64"

echo "✅ Build complete!"
echo "📱 Apple Silicon app created: Smart Dating Assistant-darwin-arm64/"
echo "📦 ZIP file: smart-dating-assistant-mac-apple-silicon.zip"
echo ""
echo "🚀 The app is now compatible with M1, M2, and M3 Macs!"
