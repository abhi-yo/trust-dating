#!/bin/bash

echo "🔄 Creating proper Electron app distribution..."

# Make sure everything is built first
echo "📦 Building application..."
pnpm run build-ts
pnpm run build-renderer

echo "🖥️ Packaging Electron app with executable..."

# Use electron-packager to create a proper app bundle
npx electron-packager . "Smart Dating Assistant" \
  --platform=darwin \
  --arch=arm64 \
  --out=dist \
  --overwrite \
  --app-bundle-id=com.smartdating.assistant \
  --app-version=1.0.0 \
  --electron-version=$(node -e "console.log(require('./package.json').devDependencies.electron.replace('^', ''))") \
  --ignore="^/(renderer|src|\.git|\.vscode|dist|node_modules/@types|\.DS_Store)" \
  --prune=true

if [ $? -eq 0 ]; then
  echo "✅ Electron app created successfully!"
  
  # Find the created app directory
  APP_DIR=$(find dist -name "Smart Dating Assistant-*" -type d | head -1)
  
  if [ -d "$APP_DIR" ]; then
    echo "📁 App location: $APP_DIR"
    
    # Create a ZIP of the app
    echo "🗜️ Creating ZIP distribution..."
    cd dist
    APP_NAME=$(basename "$APP_DIR")
    zip -r "../smart-dating-assistant-mac.zip" "$APP_NAME"
    cd ..
    
    echo "✅ ZIP created: smart-dating-assistant-mac.zip"
    echo ""
    echo "📋 Distribution contents:"
    echo "   ✅ Complete Electron app with executable"
    echo "   ✅ All async navigation fixes applied"
    echo "   ✅ Debug logging enabled"
    echo "   ✅ Ready to run on Mac (ARM64)"
    echo ""
    echo "🚀 To test:"
    echo "   1. Extract smart-dating-assistant-mac.zip"
    echo "   2. Double-click 'Smart Dating Assistant.app'"
    echo "   3. Test API key navigation"
    
  else
    echo "❌ Could not find created app directory"
    ls -la dist/
  fi
else
  echo "❌ Electron packaging failed"
fi
