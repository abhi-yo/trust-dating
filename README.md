# Smart Dating Assistant

An open-source desktop application that provides AI-powered conversation assistance for online dating. The app runs entirely locally on your machine - you just need to provide your own AI API key.

## Features

### Smart Reply Generation

- AI-powered response suggestions for dating conversations
- Automatic clipboard detection when you copy messages
- Manual analysis with Cmd+Shift+C shortcut
- Recent conversation history (last 3 analyzed)
- One-click copy responses with visual feedback

### Conversation Analysis Tools

- **Interest Analyzer**: Extract shared interests and hobbies from conversations
- **Conversation Quality**: Analyze engagement levels, tone, and conversation health
- **Catfish Detection**: AI-powered analysis to identify potential fake profiles and suspicious behavior

### AI Provider Support

- **Google Gemini** (recommended)
- **OpenAI** (GPT-3.5/GPT-4)
- **Anthropic** (Claude)
- **OpenRouter** (multiple models)
- **Custom API endpoints**

### Desktop Integration

- Real-time clipboard monitoring
- System tray integration with quick access
- Global keyboard shortcuts (Cmd/Ctrl + Shift + O to toggle overlay)
- Adjustable window opacity
- Auto-launch with system startup
- Native desktop notifications

## Prerequisites

- **Node.js** (v18 or higher)
- **npm** (comes with Node.js)
- **AI API Key** from one of the supported providers
- **macOS or Windows** (cross-platform desktop app)

## Quick Start

1. **Clone the repository**

   ```bash
   git clone https://github.com/abhi-yo/trust-dating.git
   cd trust-dating
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the application**

   ```bash
   npm start
   ```

4. **Setup your AI provider**
   - On first run, you'll be prompted to configure your AI API key
   - Choose from supported providers (Gemini, OpenAI, Anthropic, OpenRouter, or custom)
   - Enter your API key and start using the app

## Development

### Running in Development Mode

```bash
# Start development server with hot reload
npm run dev
```

### Building the Application

```bash
# Build TypeScript and renderer
npm run build

# Build for current platform
npm run make

# Platform-specific builds
npm run make:mac-arm64  # macOS Apple Silicon
npm run make:mac-x64    # macOS Intel
npm run make:win-x64    # Windows 64-bit
```

### Available Scripts

- `npm start` - Start the production app
- `npm run dev` - Development mode with hot reload
- `npm run build` - Build all components
- `npm run make` - Create distributable packages for current platform

## Usage

### Keyboard Shortcuts

- **`Cmd/Ctrl + Shift + O`** - Toggle overlay visibility
- **`Cmd/Ctrl + Shift + C`** - Manual clipboard check for smart replies

### Core Features

#### Smart Reply Generation

1. Copy any dating message to your clipboard
2. The app automatically detects conversation content
3. Get AI-powered reply suggestions instantly
4. Click to copy the response you want to use
5. View recent conversation history (last 3 analyzed)

#### Conversation Analysis

- **Interest Analyzer**: Extract shared interests and conversation topics
- **Conversation Quality**: Get detailed conversation health and engagement metrics
- **Catfish Detection**: Analyze profiles and conversations for suspicious patterns

### Navigation

The app has a clean, minimal interface with these main sections:

- **Smart Reply** - Main AI reply generation feature
- **Interest Analyzer** - Extract interests from conversations
- **Catfish Detection** - Analyze suspicious profiles and conversations
- **Conversation Quality** - Detailed conversation health metrics
- **Settings** - Configure AI provider, API keys, and app preferences

## Architecture

### Application Structure

```
trust-dating/
├── main.ts                 # Electron main process
├── preload.ts             # Secure IPC bridge
├── src/
│   ├── ai/                # Universal AI client (multi-provider support)
│   ├── analysis/          # Conversation analysis engines
│   ├── config/            # API key management
│   ├── safety/            # Safety and verification tools
│   └── utils/             # Utility functions
├── backend/               # Backend services
│   └── src/
│       ├── services/      # AI and analysis services
│       └── utils/         # Logger, validation, rate limiting
└── renderer/              # Next.js frontend
    ├── components/        # React UI components
    ├── pages/            # Application pages
    └── types/            # TypeScript definitions
```

### Key Components

- **Main Process** (`main.ts`) - Core Electron application logic and desktop integration
- **Preload Script** (`preload.ts`) - Secure communication bridge between main and renderer
- **Universal AI** (`src/ai/`) - Multi-provider AI client (Gemini, OpenAI, Anthropic, etc.)
- **Analysis Engine** (`src/analysis/`) - Conversation analysis and intelligence features
- **Safety Engine** (`src/safety/`) - Profile verification and safety analysis
- **React UI** (`renderer/`) - Modern Next.js-based user interface

### How It Works

1. **Input Detection** - Monitors clipboard for dating messages or manual text input
2. **AI Processing** - Routes requests to your configured AI provider
3. **Analysis** - Processes conversations through various analysis engines
4. **Results Display** - Shows suggestions and insights in the React UI
5. **Local Storage** - Keeps recent history locally (last 3 conversations)

## Technology

### Core Framework

- **Electron 25+** - Cross-platform desktop application framework
- **Next.js 14** - React framework with static export for file:// compatibility
- **React 18** - Modern UI with hooks and Lucide React icons
- **TypeScript 5** - Type-safe development throughout

### AI Integration

- **Universal AI Client** - Single interface for multiple AI providers
- **Google Gemini** - Fast and cost-effective (recommended)
- **OpenAI** - GPT-3.5 and GPT-4 support
- **Anthropic Claude** - Advanced reasoning capabilities
- **OpenRouter** - Access to multiple models through one API
- **Custom Endpoints** - Self-hosted or other compatible APIs

### Desktop Features

- **Clipboard Monitoring** - Automatic conversation detection
- **Global Shortcuts** - System-wide keyboard shortcuts
- **System Tray** - Background operation with quick access
- **Auto-launch** - Start with operating system
- **Window Opacity** - Adjustable transparency
- **Native Notifications** - Desktop alerts and feedback

### Development & Build

- **npm** - Standard Node.js package manager
- **Electron Forge** - Build, package, and publish toolkit
- **Cross-platform** - macOS (Intel/Apple Silicon) and Windows support
- **GitHub Releases** - Automated CI/CD publishing

## Configuration

### AI Provider Setup

The app supports multiple AI providers. You'll configure this during first run:

1. **Google Gemini** (Recommended) - Best balance of cost and performance
2. **OpenAI** - Access to GPT-3.5 and GPT-4 models
3. **Anthropic** - Claude models for advanced reasoning
4. **OpenRouter** - Multiple models through a single API
5. **Custom Endpoints** - Self-hosted or other compatible APIs

### App Configuration

All settings are managed through the Settings panel in the app:

- **AI Provider** - Choose and configure your preferred provider
- **API Key** - Securely stored locally on your machine
- **Model Selection** - Choose specific models when supported
- **Window Opacity** - Adjust transparency (20-100%)
- **Auto-launch** - Start app when system boots
- **Keyboard Shortcuts** - Global hotkeys for quick access

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the GNU General Public License v3.0 (GPL-3.0). See [LICENSE](LICENSE) for details.

## Build and Release

### Local Build

1. Install dependencies: `npm install`
2. Build the app: `npm run build`
3. Create installers:
   - macOS (Apple Silicon): `npm run make:mac-arm64`
   - macOS (Intel): `npm run make:mac-x64`
   - Windows x64: `npm run make:win-x64`

Output files are created in the `out/` directory.

### GitHub Releases

Automated releases are available via GitHub Actions:

1. Create a GitHub Personal Access Token with repository write permissions
2. Add it as `GH_TOKEN` in repository secrets
3. Push a git tag (e.g., `v1.0.0`) to trigger builds for all platforms
4. The workflow creates a draft release with installers for macOS and Windows

Manual publishing (from your local machine):

```bash
export GH_TOKEN=your_github_token
npm run publish
```

## Privacy & Security

This app is designed with privacy as a core principle:

- **Fully Local Operation** - All data processing happens on your machine
- **No Telemetry** - No analytics, tracking, or data collection
- **API Keys Stored Locally** - Your AI provider keys are encrypted and stored only on your device
- **No Remote Assets** - All fonts and resources are bundled with the app
- **Minimal Network Usage** - Only connects to your chosen AI provider when actively using features
- **Recent History** - Conversation history is kept locally (last 3 items only)
- **No Cloud Sync** - Your data never leaves your machine

## Download & Install

### Pre-built Applications

Download the latest version for your platform:

- **macOS**: [Download DMG](https://github.com/abhi-yo/trust-dating/releases/latest)
- **Windows**: [Download Installer](https://github.com/abhi-yo/trust-dating/releases/latest)

### macOS Installation Note

macOS may show a security warning for unsigned apps. To install:

1. Right-click the app and select "Open"
2. Click "Open" in the security dialog
3. Alternatively, use Terminal: `xattr -d com.apple.quarantine "/Applications/Smart Dating Assistant.app"`

After the first successful launch, the app will run normally.

---

**Contributions Welcome** - Open source project accepting issues and pull requests.
