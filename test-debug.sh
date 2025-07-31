#!/bin/bash

# Script to test the API key navigation debug version
echo "🔄 Building the debug version..."

# Build TypeScript and renderer
pnpm run build-ts
pnpm run build-renderer

echo "✅ Build complete!"
echo "🚀 Starting Electron app with debug logging..."
echo ""
echo "📝 Instructions:"
echo "1. The app will open with debug logging enabled"
echo "2. Enter your API key in the setup screen"
echo "3. Click the save button"
echo "4. Watch the console output in your terminal for debug logs"
echo "5. Check if navigation to main screen works"
echo ""
echo "🔍 Debug logs will show:"
echo "   - API key save process"
echo "   - electronAPI availability"
echo "   - Navigation trigger attempts"
echo ""

# Start the app
pnpm start
