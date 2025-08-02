#!/bin/bash

# Smart Dating Assistant - Development Script

echo "🔧 Smart Dating Assistant Development Helper"
echo "==========================================="

# Auto-detect architecture
ARCH=$(uname -m)
if [ "$ARCH" = "arm64" ]; then
    ELECTRON_ARCH="arm64"
    DIST_NAME="ARM64"
elif [ "$ARCH" = "x86_64" ]; then
    ELECTRON_ARCH="x64"
    DIST_NAME="Intel"
else
    ELECTRON_ARCH="arm64"  # Default to ARM64 for Apple Silicon
    DIST_NAME="ARM64"
fi

case "$1" in
  "dev")
    echo "🚀 Starting development mode..."
    pnpm dev
    ;;
  "build")
    echo "🏗️  Building application..."
    echo "Step 1: Compiling TypeScript..."
    pnpm run build-ts
    echo "Step 2: Building React renderer..."
    pnpm run build-renderer
    echo "✅ Build complete!"
    ;;
  "package")
    echo "📦 Packaging application for $DIST_NAME ($ELECTRON_ARCH)..."
    echo "Step 1: Building application..."
    pnpm run build
    echo "Step 2: Packaging with electron-packager..."
    npx electron-packager . --platform=darwin --arch=$ELECTRON_ARCH --out=dist --no-asar --overwrite
    echo "✅ Packaging complete!"
    ;;
  "zip")
    echo "🗜️  Creating distribution zip..."
    if [ -d "dist" ]; then
      cd dist
      if [ -d "Smart Dating Assistant-darwin-$ELECTRON_ARCH" ]; then
        zip -r "Smart-Dating-Assistant-macOS-$DIST_NAME.zip" "Smart Dating Assistant-darwin-$ELECTRON_ARCH/"
        echo "✅ Created: Smart-Dating-Assistant-macOS-$DIST_NAME.zip"
      else
        echo "❌ No packaged app found. Run './dev.sh package' first."
      fi
      cd ..
    else
      echo "❌ No dist directory found. Run './dev.sh package' first."
    fi
    ;;
  "make")
    echo "🎁 Creating distributable..."
    echo "Step 1: Building application..."
    pnpm run build
    echo "Step 2: Packaging..."
    npx electron-packager . --platform=darwin --arch=$ELECTRON_ARCH --out=dist --no-asar --overwrite
    echo "Step 3: Creating zip..."
    cd dist && zip -r "Smart-Dating-Assistant-macOS-$DIST_NAME.zip" "Smart Dating Assistant-darwin-$ELECTRON_ARCH/" && cd ..
    echo "✅ Distributable created: dist/Smart-Dating-Assistant-macOS-$DIST_NAME.zip"
    ;;
  "clean")
    echo "🧹 Cleaning build artifacts..."
    rm -rf build/
    rm -rf renderer-dist/
    rm -rf dist/
    rm -rf renderer/.next/
    echo "✅ Clean complete!"
    ;;
  *)
    echo "Usage: ./dev.sh [command]"
    echo ""
    echo "Commands:"
    echo "  dev      - Start development server"
    echo "  build    - Build the application"
    echo "  package  - Package the application for $DIST_NAME ($ELECTRON_ARCH)"
    echo "  zip      - Create zip from existing package"
    echo "  make     - Build, package, and create distributable zip"
    echo "  clean    - Clean build artifacts"
    echo ""
    echo "Current system: $ARCH → Will package for $DIST_NAME ($ELECTRON_ARCH)"
    ;;
esac
