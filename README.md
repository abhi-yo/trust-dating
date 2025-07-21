# Trust Dating Overlay

An Electron application with Next.js renderer for trust analysis and activity suggestions in dating contexts.

## Features

- **Trust Analysis**: Analyze dating profiles and websites for trust indicators
- **Chat Analysis**: Extract interests from chat conversations using NLP
- **Activity Suggestions**: Get personalized activity recommendations
- **Cross-platform**: Works on Mac and Windows
- **Overlay Mode**: Floating overlay that can be toggled with keyboard shortcuts

## Prerequisites

- Node.js (v18+)
- PNPM (install globally: `npm install -g pnpm`)
- Ollama (for local NLP processing)

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

## Development

Run the development server:
```bash
pnpm dev
```

This will start both the Next.js development server and Electron.

## Building

Build for production:
```bash
# Build for current platform
pnpm build

# Build for Mac
pnpm build-mac

# Build for Windows
pnpm build-win
```

## Usage

- **Toggle Overlay**: `Cmd/Ctrl + Shift + O`
- **Trust Check**: Enter a dating profile URL to analyze trust indicators
- **Chat Analysis**: Paste conversation text to extract interests
- **Activities**: Select interests to get activity suggestions

## Architecture

- **Main Process**: `main.ts` - Electron main process
- **Preload**: `preload.ts` - Secure communication bridge
- **Renderer**: `renderer/` - Next.js application
- **Components**: React components for UI functionality

## Technologies

- Electron 25
- Next.js 14
- React 18
- TypeScript 5
- Zustand (state management)
- Ollama (NLP processing)
- PNPM (package management)
