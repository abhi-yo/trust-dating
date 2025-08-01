import { app } from 'electron';
import { promises as fs } from 'fs';
import * as path from 'path';

interface AppConfig {
  geminiApiKey?: string;
  openaiApiKey?: string;
  anthropicApiKey?: string;
  openrouterApiKey?: string;
  customApiKey?: string;
  selectedProvider?: 'gemini' | 'openai' | 'anthropic' | 'openrouter' | 'custom';
  openrouterModel?: string;
  customEndpoint?: string;
  customModel?: string;
  firstRun?: boolean;
}

class ApiKeyManager {
  private configPath: string;
  private config: AppConfig = {};
  private initialized: boolean = false;

  constructor() {
    this.configPath = path.join(app.getPath('userData'), 'config.json');
    this.initialize();
  }

  private async initialize(): Promise<void> {
    await this.loadConfig();
    this.initialized = true;
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  async loadConfig(): Promise<void> {
    try {
      const configData = await fs.readFile(this.configPath, 'utf8');
      this.config = JSON.parse(configData);
    } catch (error) {
      // Config file doesn't exist, use defaults
      this.config = {
        firstRun: true,
        selectedProvider: 'gemini'
      };
      await this.saveConfig();
    }
  }

  async saveConfig(): Promise<void> {
    try {
      await fs.writeFile(this.configPath, JSON.stringify(this.config, null, 2));
    } catch (error) {
      console.error('Failed to save config:', error);
    }
  }

  async setApiKey(provider: 'gemini' | 'openai' | 'anthropic' | 'openrouter' | 'custom', apiKey: string, options?: {
    model?: string;
    endpoint?: string;
  }): Promise<void> {
    await this.ensureInitialized();
    switch (provider) {
      case 'gemini':
        this.config.geminiApiKey = apiKey;
        break;
      case 'openai':
        this.config.openaiApiKey = apiKey;
        break;
      case 'anthropic':
        this.config.anthropicApiKey = apiKey;
        break;
      case 'openrouter':
        this.config.openrouterApiKey = apiKey;
        this.config.openrouterModel = options?.model || 'openrouter/horizon-alpha';
        break;
      case 'custom':
        this.config.customApiKey = apiKey;
        this.config.customEndpoint = options?.endpoint;
        this.config.customModel = options?.model;
        break;
    }
    this.config.selectedProvider = provider;
    this.config.firstRun = false;
    await this.saveConfig();
  }

  async getApiKey(provider?: 'gemini' | 'openai' | 'anthropic' | 'openrouter' | 'custom'): Promise<string | undefined> {
    await this.ensureInitialized();
    const selectedProvider = provider || this.config.selectedProvider || 'gemini';
    switch (selectedProvider) {
      case 'gemini':
        return this.config.geminiApiKey;
      case 'openai':
        return this.config.openaiApiKey;
      case 'anthropic':
        return this.config.anthropicApiKey;
      case 'openrouter':
        return this.config.openrouterApiKey;
      case 'custom':
        return this.config.customApiKey;
      default:
        return undefined;
    }
  }

  async getProviderConfig(): Promise<{
    provider: string;
    model?: string;
    endpoint?: string;
  }> {
    await this.ensureInitialized();
    const provider = this.config.selectedProvider || 'gemini';
    
    switch (provider) {
      case 'openrouter':
        return {
          provider,
          model: this.config.openrouterModel || 'openrouter/horizon-alpha',
          endpoint: 'https://openrouter.ai/api/v1'
        };
      case 'custom':
        return {
          provider,
          model: this.config.customModel,
          endpoint: this.config.customEndpoint
        };
      default:
        return { provider };
    }
  }

  async getCurrentProvider(): Promise<string> {
    await this.ensureInitialized();
    return this.config.selectedProvider || 'gemini';
  }

  async isFirstRun(): Promise<boolean> {
    await this.ensureInitialized();
    return this.config.firstRun !== false;
  }

  async hasValidApiKey(): Promise<boolean> {
    await this.ensureInitialized();
    const apiKey = await this.getApiKey();
    return !!(apiKey && apiKey.length > 10);
  }

  async getConfig(): Promise<AppConfig> {
    await this.ensureInitialized();
    return { ...this.config };
  }

  async clearApiKeys(): Promise<void> {
    await this.ensureInitialized();
    this.config.geminiApiKey = undefined;
    this.config.openaiApiKey = undefined;
    this.config.anthropicApiKey = undefined;
    this.config.openrouterApiKey = undefined;
    this.config.customApiKey = undefined;
    this.config.openrouterModel = undefined;
    this.config.customEndpoint = undefined;
    this.config.customModel = undefined;
    await this.saveConfig();
  }
}

export const apiKeyManager = new ApiKeyManager();
export type { AppConfig };
