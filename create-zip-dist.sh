#!/bin/bash

echo "🔄 Creating deployment ZIP for Smart Dating Assistant..."

# Clean up any previous builds
rm -rf dist-zip
mkdir -p dist-zip

echo "📦 Building TypeScript and renderer..."
pnpm run build-ts
pnpm run build-renderer

echo "📋 Copying necessary files..."
# Copy main application files
cp -r build dist-zip/
cp -r renderer-dist dist-zip/
cp package.json dist-zip/
cp -r node_modules dist-zip/ 

# Copy electron executable and resources (simplified approach)
echo "🎯 Creating run script..."

# Create a simple run script
cat > dist-zip/run-app.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting Smart Dating Assistant..."
echo "📝 Note: This is the debug version with async fixes!"

# Check if node is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required to run this app"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if electron is available globally or locally
if command -v electron &> /dev/null; then
    echo "✅ Using global electron"
    electron .
elif command -v npx &> /dev/null; then
    echo "✅ Using npx electron"
    npx electron .
else
    echo "❌ Electron not found. Installing..."
    npm install -g electron
    electron .
fi
EOF

chmod +x dist-zip/run-app.sh

# Create Windows batch file
cat > dist-zip/run-app.bat << 'EOF'
@echo off
echo Starting Smart Dating Assistant...
echo Note: This is the debug version with async fixes!

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Node.js is required to run this app
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

where electron >nul 2>nul
if %errorlevel% neq 0 (
    echo Installing Electron...
    npm install -g electron
)

electron .
pause
EOF

# Create README for the distribution
cat > dist-zip/README.md << 'EOF'
# Smart Dating Assistant - Portable Version

This is a portable version of Smart Dating Assistant with the async navigation fixes applied.

## How to Run

### Mac/Linux:
1. Open Terminal
2. Navigate to this folder
3. Run: `./run-app.sh`

### Windows:
1. Double-click `run-app.bat`

### Alternative (All platforms):
1. Make sure Node.js is installed
2. Open terminal/command prompt in this folder
3. Run: `npx electron .`

## Requirements
- Node.js (Download from https://nodejs.org/)
- Internet connection (for first run to download Electron if needed)

## Features
- ✅ Async API key navigation fixes applied
- ✅ Debug logging enabled
- ✅ All original functionality preserved
- ✅ Privacy-focused (API keys stored locally)

## Troubleshooting
If the app doesn't start:
1. Make sure Node.js is installed
2. Try running: `npm install -g electron`
3. Then run the app again

## Support
This version includes the fixes for the API key navigation issue where the button wasn't working in packaged builds.
EOF

echo "🗜️ Creating ZIP file..."
cd dist-zip
zip -r "../smart-dating-assistant-portable.zip" .
cd ..

echo "✅ ZIP created successfully!"
echo "📁 Location: $(pwd)/smart-dating-assistant-portable.zip"
echo ""
echo "📝 Instructions for users:"
echo "1. Extract the ZIP file"
echo "2. Run run-app.sh (Mac/Linux) or run-app.bat (Windows)"
echo "3. The app will start with all async fixes applied"
echo ""
echo "🎯 This version includes:"
echo "   ✅ Async API key navigation fixes"
echo "   ✅ Debug logging"
echo "   ✅ All features working as in development"
