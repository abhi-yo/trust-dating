import { GoogleGenerativeAI } from "@google/generative-ai";

interface AIResponse {
  text: string;
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
  };
}

interface AIConfig {
  provider: string;
  apiKey: string;
  model?: string;
  endpoint?: string;
}

export class UniversalAI {
  private config: AIConfig;

  constructor(config: AIConfig) {
    this.config = config;
  }

  async generateContent(prompt: string): Promise<AIResponse> {
    switch (this.config.provider) {
      case 'gemini':
        return this.generateWithGemini(prompt);
      case 'openrouter':
        return this.generateWithOpenRouter(prompt);
      case 'openai':
        return this.generateWithOpenAI(prompt);
      case 'anthropic':
        return this.generateWithAnthropic(prompt);
      case 'custom':
        return this.generateWithCustom(prompt);
      default:
        throw new Error(`Unsupported provider: ${this.config.provider}`);
    }
  }

  private async generateWithGemini(prompt: string): Promise<AIResponse> {
    const genAI = new GoogleGenerativeAI(this.config.apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    return {
      text: response.text(),
      usage: {
        input_tokens: result.response.usageMetadata?.promptTokenCount,
        output_tokens: result.response.usageMetadata?.candidatesTokenCount
      }
    };
  }

  private async generateWithOpenRouter(prompt: string): Promise<AIResponse> {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://trustdating.app',
        'X-Title': 'Trust Dating Assistant'
      },
      body: JSON.stringify({
        model: this.config.model || 'openrouter/horizon-alpha',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0]) {
      throw new Error('Invalid response from OpenRouter API');
    }

    return {
      text: data.choices[0].message.content,
      usage: data.usage
    };
  }

  private async generateWithOpenAI(prompt: string): Promise<AIResponse> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.config.model || 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    return {
      text: data.choices[0].message.content,
      usage: data.usage
    };
  }

  private async generateWithAnthropic(prompt: string): Promise<AIResponse> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.config.model || 'claude-3-haiku-20240307',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Anthropic API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    return {
      text: data.content[0].text,
      usage: data.usage
    };
  }

  private async generateWithCustom(prompt: string): Promise<AIResponse> {
    if (!this.config.endpoint) {
      throw new Error('Custom endpoint not configured');
    }

    const response = await fetch(`${this.config.endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.config.model || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Custom API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    return {
      text: data.choices[0].message.content,
      usage: data.usage
    };
  }

  static getAvailableModels(provider: string): string[] {
    switch (provider) {
      case 'openrouter':
        return [
          'openrouter/horizon-alpha',
          'anthropic/claude-3.5-sonnet',
          'openai/gpt-4o',
          'openai/gpt-4o-mini',
          'meta-llama/llama-3.1-405b',
          'google/gemini-flash-1.5-8b',
          'mistralai/mixtral-8x7b-instruct'
        ];
      case 'openai':
        return [
          'gpt-4o',
          'gpt-4o-mini',
          'gpt-4-turbo',
          'gpt-3.5-turbo'
        ];
      case 'anthropic':
        return [
          'claude-3-5-sonnet-20241022',
          'claude-3-haiku-20240307',
          'claude-3-opus-20240229'
        ];
      case 'gemini':
        return [
          'gemini-1.5-flash',
          'gemini-1.5-pro',
          'gemini-1.0-pro'
        ];
      default:
        return [];
    }
  }
}
