#!/bin/bash
set -e

echo "🚀 Creating manual Electron package for Trust Dating App..."

# Build the app first
echo "📦 Building application..."
pnpm run build

# Create distribution directory
DIST_DIR="./dist"
APP_NAME="Smart Dating Assistant"
PLATFORM=$(uname)

echo "🗂️  Creating distribution directory..."
rm -rf "$DIST_DIR"
mkdir -p "$DIST_DIR"

if [[ "$PLATFORM" == "Darwin" ]]; then
    echo "🍎 Packaging for macOS..."
    
    # Install electron-packager if not present
    echo "📥 Installing/updating electron-packager..."
    npm install -g electron-packager
    
    echo "� Using electron-packager for macOS build..."
    
    npx electron-packager . "$APP_NAME" \
        --platform=darwin \
        --arch=arm64 \
        --out="$DIST_DIR" \
        --asar=false \
        --app-bundle-id="com.smartdating.assistant" \
        --app-category-type="public.app-category.social-networking" \
        --overwrite \
        --ignore="^/(src|renderer(?!-dist)|\.git|\.vscode|\.env)$" \
        --ignore="\.ts$" \
        --ignore="\.tsx$" \
        --ignore="manual-package\.sh$" \
        --ignore="forge\.config\.js$" \
        --prune=false

    echo "✅ macOS package created in $DIST_DIR"
    
elif [[ "$PLATFORM" == "Linux" ]]; then
    echo "🐧 Packaging for Linux..."
    
    npx electron-packager . "$APP_NAME" \
        --platform=linux \
        --arch=x64 \
        --out="$DIST_DIR" \
        --asar=true \
        --overwrite \
        --ignore="^/(src|renderer(?!-dist))$" \
        --ignore="\.ts$" \
        --ignore="\.tsx$"

    echo "✅ Linux package created in $DIST_DIR"
    
else
    echo "❌ Unsupported platform: $PLATFORM"
    exit 1
fi

echo "🎉 Packaging complete! Check the $DIST_DIR directory."
echo "📱 Your Trust Dating app is ready for distribution!"
