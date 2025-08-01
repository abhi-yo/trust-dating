# Trust Dating Assistant

A powerful Electron-based dating companion that provides AI-powered smart replies, conversation analysis, and trust verification for online dating. Built with modern web technologies and designed as a floating overlay for seamless integration with any dating platform.

## Features

### 🧠 **Smart Reply Generation**
- AI-powered response suggestions with multiple tone options (casual, fun, romantic, witty)
- Context-aware replies that match conversation flow
- Unlimited API access with intelligent caching
- Real-time clipboard monitoring for instant suggestions

### 💬 **Conversation Analysis**
- **Interest Analysis**: Extract and analyze shared interests from conversations
- **Conversation Quality**: Assess engagement levels, emotional depth, and reciprocity
- **Catfish Detection**: Advanced AI analysis to identify potential fake profiles
- Comprehensive conversation metrics and insights

### 🛡️ **Trust & Safety**
- **Trust Verification**: Analyze dating profiles and websites for authenticity
- Real-time safety alerts and red flag detection
- Profile verification with image analysis capabilities
- Safety recommendations and best practices

### 🎯 **Smart Features**
- **Activity Suggestions**: Personalized date ideas based on shared interests
- **Desktop Integration**: Screenshot capture, file monitoring, system tray
- **Multi-Provider AI**: Support for Gemini, OpenAI, Anthropic, OpenRouter, and custom endpoints
- **Overlay Mode**: Always-on-top floating window with customizable opacity

### ⚡ **Advanced Capabilities**
- Intelligent conversation learning and pattern recognition
- Personalized advice based on dating goals and preferences
- Advanced conversation metrics and success tracking
- Cross-platform desktop notifications

## Prerequisites

- **Node.js** (v18 or higher)
- **PNPM** (install globally: `npm install -g pnpm`)
- **AI API Key** (Gemini, OpenAI, Anthropic, or OpenRouter)
- **macOS or Windows** (optimized for macOS with full desktop integration)

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/abhi-yo/trust-dating.git
   cd trust-dating
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start the application**
   ```bash
   pnpm start
   ```

4. **Setup your AI provider**
   - On first run, you'll be prompted to configure your AI API key
   - Choose from Gemini, OpenAI, Anthropic, OpenRouter, or custom endpoint
   - The app will guide you through the setup process

## Development

### Running in Development Mode
```bash
# Start development server with hot reload
pnpm dev
```

### Building the Application
```bash
# Build TypeScript and renderer
pnpm build

# Build for current platform
pnpm make

# Development build with watch
pnpm build-ts      # Build TypeScript only
pnpm build-renderer # Build Next.js renderer only
```

### Available Scripts
- `pnpm start` - Start the production app
- `pnpm dev` - Development mode with hot reload
- `pnpm build` - Build all components
- `pnpm make` - Create distributable packages
- `pnpm test` - Run tests (if available)

## Usage

### Keyboard Shortcuts
- **`Cmd/Ctrl + Shift + O`** - Toggle overlay visibility
- **`Cmd/Ctrl + Shift + C`** - Manual clipboard check for smart replies

### Core Features

#### 🧠 Smart Reply Generation
1. Copy any dating message to your clipboard
2. The app automatically detects conversation content
3. Press `Cmd+Shift+C` or wait for auto-detection
4. Get AI-powered reply suggestions with explanations
5. Choose your preferred tone (casual, fun, romantic, witty)

#### 💬 Conversation Analysis
- **Interest Analyzer**: Paste conversations to extract shared interests
- **Quality Assessment**: Get detailed conversation health metrics
- **Catfish Detection**: Upload profile images or analyze profiles for authenticity

#### 🛡️ Trust Verification
- Enter dating profile URLs for comprehensive trust analysis
- Get verification scores and red flag warnings
- Receive safety recommendations and best practices

#### 🎯 Activity Suggestions
- Based on analyzed interests, get personalized date ideas
- AI-generated activity recommendations
- Tailored suggestions for your location and preferences

### Navigation
Access all features through the hamburger menu (☰) in the top-left corner:
- **Smart Reply** - Main AI reply generation
- **Interest Analysis** - Extract interests from conversations  
- **Catfish Detection** - Profile and image verification
- **Conversation Quality** - Detailed conversation metrics
- **Settings** - AI provider configuration and app preferences

## Architecture

### Application Structure
```
trust-dating/
├── main.ts                 # Electron main process
├── preload.ts             # Secure IPC bridge
├── src/
│   ├── ai/                # Universal AI client
│   ├── analysis/          # Conversation analyzers
│   ├── config/            # API key management
│   ├── database/          # Data persistence
│   └── safety/            # Trust & safety engine
└── renderer/              # Next.js frontend
    ├── components/        # React components
    ├── pages/            # Next.js pages
    └── types/            # TypeScript definitions
```

### Key Components
- **Main Process** (`main.ts`) - Core Electron application logic
- **Preload Script** (`preload.ts`) - Secure communication bridge between main and renderer
- **Universal AI** (`src/ai/`) - Multi-provider AI client supporting various APIs
- **Analysis Engine** (`src/analysis/`) - Conversation and dating intelligence
- **Safety Engine** (`src/safety/`) - Trust verification and safety analysis
- **React UI** (`renderer/`) - Modern web-based user interface

### Data Flow
1. **Input Detection** - Clipboard monitoring or manual input
2. **AI Processing** - Universal AI client handles API requests
3. **Analysis** - Multiple analysis engines process the data
4. **UI Updates** - React components display results
5. **Caching** - Intelligent response caching for performance

## Technologies

### Core Framework
- **Electron 25+** - Cross-platform desktop application framework
- **Next.js 14** - React framework with SSG and TypeScript support
- **React 18** - Modern UI library with hooks and concurrent features
- **TypeScript 5** - Type-safe development

### AI & Analysis
- **Universal AI Client** - Multi-provider AI integration
- **Gemini AI** - Google's advanced language model
- **OpenAI GPT** - ChatGPT and GPT-4 support
- **Anthropic Claude** - Advanced reasoning capabilities
- **OpenRouter** - Access to multiple AI models

### Desktop Integration
- **Clipboard Monitoring** - Real-time message detection
- **Global Shortcuts** - System-wide keyboard shortcuts
- **Notifications** - Native desktop notifications
- **File System** - Image analysis and file operations
- **System Tray** - Background operation support

### Development Tools
- **PNPM** - Fast, disk-efficient package manager
- **Electron Forge** - Build and packaging toolkit
- **ESLint & Prettier** - Code quality and formatting
- **Hot Reload** - Development productivity features

## Configuration

### Supported AI Providers
- **Google Gemini** (Recommended) - Best performance and accuracy
- **OpenAI** - GPT-3.5/GPT-4 support
- **Anthropic** - Claude models
- **OpenRouter** - Access to multiple providers
- **Custom Endpoints** - Self-hosted or other API-compatible services

### Environment Variables (Optional)
```bash
# For development/testing
GEMINI_API_KEY=your_gemini_key
OPENAI_API_KEY=your_openai_key
```

### App Settings
All settings are managed through the in-app Settings panel:
- AI provider selection and configuration
- Model selection (when supported)
- Custom endpoint configuration
- Opacity and display preferences
- Auto-launch settings

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, feature requests, or bug reports:
- Create an issue on GitHub
- Check the [Wiki](https://github.com/abhi-yo/trust-dating/wiki) for documentation
- Join our community discussions

---

**Built with ❤️ for the modern dating experience**
