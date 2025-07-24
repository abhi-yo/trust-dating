import { GoogleGenerativeAI } from '@google/generative-ai';
import { Logger } from '../utils/logger';
import { ValidationService } from '../utils/validation';

export class AIService {
  private static instance: AIService;
  private genAI: GoogleGenerativeAI;
  private logger: Logger;
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000;

  private constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.logger = Logger.getInstance();
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  async analyzeTrust(profileData: { url?: string; imageFile?: string }): Promise<TrustAnalysisResult> {
    const endTimer = this.logger.startTimer('trust_analysis');
    
    try {
      // Validate input
      if (profileData.url) {
        const validation = ValidationService.validateUrl(profileData.url);
        if (!validation.isValid) {
          throw new Error(`Invalid URL: ${validation.error}`);
        }
      }

      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      let prompt = '';
      let analysisData: any = {};

      if (profileData.url) {
        // Fetch and analyze webpage content
        try {
          const response = await this.fetchWithTimeout(profileData.url, 10000);
          const htmlContent = await response.text();
          
          const textContent = this.extractTextFromHtml(htmlContent);
          
          prompt = this.buildTrustAnalysisPrompt(profileData.url, textContent);
        } catch (fetchError) {
          this.logger.warn('Could not fetch URL content, analyzing URL structure', { url: profileData.url, error: fetchError });
          prompt = this.buildUrlAnalysisPrompt(profileData.url);
        }
      } else if (profileData.imageFile) {
        prompt = this.buildImageAnalysisPrompt();
      }

      const result = await this.executeWithRetry(async () => {
        const response = await model.generateContent(prompt);
        return response.response.text();
      });

      const analysis = this.parseAIResponse(result);
      const validatedAnalysis = this.validateTrustAnalysis(analysis);

      endTimer();
      
      this.logger.info('Trust analysis completed', {
        url: profileData.url,
        trustScore: validatedAnalysis.trustScore,
        status: validatedAnalysis.verificationStatus
      });

      return validatedAnalysis;

    } catch (error) {
      endTimer();
      this.logger.error('Trust analysis failed', error as Error, { profileData });
      
      // Return fallback analysis
      return {
        trustScore: 50,
        verificationStatus: 'unknown',
        imageMatches: ['Analysis temporarily unavailable'],
        socialProfiles: ['Connect accounts for verification'],
        redFlags: ['Unable to complete full analysis'],
        positiveSignals: ['Manual verification recommended'],
        confidence: 0.1,
        analysisId: this.generateAnalysisId()
      };
    }
  }

  async analyzeChat(chatText: string): Promise<ChatAnalysisResult> {
    const endTimer = this.logger.startTimer('chat_analysis');
    
    try {
      const sanitizedText = ValidationService.sanitizeText(chatText);
      if (sanitizedText.length < 10) {
        throw new Error('Chat text too short for analysis');
      }

      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = this.buildChatAnalysisPrompt(sanitizedText);

      const result = await this.executeWithRetry(async () => {
        const response = await model.generateContent(prompt);
        return response.response.text();
      });

      const analysis = this.parseAIResponse(result);
      endTimer();

      this.logger.info('Chat analysis completed', {
        textLength: sanitizedText.length,
        sentiment: analysis.sentiment
      });

      return {
        sentiment: analysis.sentiment || 'neutral',
        redFlags: analysis.redFlags || [],
        positiveSignals: analysis.positiveSignals || [],
        riskScore: analysis.riskScore || 50,
        suggestions: analysis.suggestions || [],
        confidence: analysis.confidence || 0.5,
        analysisId: this.generateAnalysisId()
      };

    } catch (error) {
      endTimer();
      this.logger.error('Chat analysis failed', error as Error, { chatLength: chatText.length });
      throw error;
    }
  }

  async suggestActivities(interests: string[]): Promise<ActivitySuggestionsResult> {
    const endTimer = this.logger.startTimer('activity_suggestions');
    
    try {
      const validation = ValidationService.validateInterests(interests);
      if (!validation.isValid) {
        throw new Error(`Invalid interests: ${validation.error}`);
      }

      const sanitizedInterests = validation.sanitized!;
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = this.buildActivitySuggestionsPrompt(sanitizedInterests);

      const result = await this.executeWithRetry(async () => {
        const response = await model.generateContent(prompt);
        return response.response.text();
      });

      const analysis = this.parseAIResponse(result);
      endTimer();

      this.logger.info('Activity suggestions completed', {
        interestsCount: sanitizedInterests.length,
        suggestionsCount: analysis.activities?.length || 0
      });

      return {
        activities: analysis.activities || [],
        confidence: analysis.confidence || 0.5,
        analysisId: this.generateAnalysisId()
      };

    } catch (error) {
      endTimer();
      this.logger.error('Activity suggestions failed', error as Error, { interestsCount: interests.length });
      throw error;
    }
  }

  private async fetchWithTimeout(url: string, timeout: number): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; TrustDatingBot/1.0)'
        }
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private extractTextFromHtml(html: string): string {
    return html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 2000);
  }

  private buildTrustAnalysisPrompt(url: string, content: string): string {
    return `Analyze this dating profile for authenticity and potential red flags:

URL: ${url}
Content: ${content}

Provide analysis in this exact JSON format:
{
  "trustScore": <number 1-100>,
  "verificationStatus": "<verified|suspicious|unknown>",
  "imageMatches": ["<detailed analysis>"],
  "socialProfiles": ["<specific findings>"],
  "redFlags": ["<specific concerning patterns>"],
  "positiveSignals": ["<authentic indicators>"],
  "confidence": <number 0-1>
}`;
  }

  private buildUrlAnalysisPrompt(url: string): string {
    return `Analyze this dating profile URL structure and domain:

URL: ${url}

Return JSON analysis with trustScore, verificationStatus, imageMatches, socialProfiles, redFlags, positiveSignals, and confidence.`;
  }

  private buildImageAnalysisPrompt(): string {
    return `Analyze uploaded profile image for verification guidance:

Return JSON with:
{
  "trustScore": <75-90 for uploaded images>,
  "verificationStatus": "pending_verification",
  "imageMatches": ["Reverse image search recommended"],
  "socialProfiles": ["Cross-reference with social platforms"],
  "redFlags": ["Verify image originality"],
  "positiveSignals": ["User provided image for verification"],
  "confidence": <0-1>
}`;
  }

  private buildChatAnalysisPrompt(text: string): string {
    return `Analyze this dating conversation for potential red flags:

Text: ${text}

Return JSON with sentiment, redFlags, positiveSignals, riskScore (1-100), suggestions, and confidence.`;
  }

  private buildActivitySuggestionsPrompt(interests: string[]): string {
    return `Suggest dating activities based on these interests: ${interests.join(', ')}

Return JSON with activities array and confidence score.`;
  }

  private parseAIResponse(response: string): any {
    try {
      const cleanedText = response
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .replace(/^[^{]*/, '')
        .replace(/[^}]*$/, '')
        .trim();
      
      return JSON.parse(cleanedText);
    } catch (error) {
      this.logger.error('Failed to parse AI response', error as Error, { response });
      throw new Error('Invalid AI response format');
    }
  }

  private validateTrustAnalysis(analysis: any): TrustAnalysisResult {
    return {
      trustScore: Math.max(1, Math.min(100, analysis.trustScore || 50)),
      verificationStatus: ['verified', 'suspicious', 'unknown', 'pending_verification'].includes(analysis.verificationStatus) 
        ? analysis.verificationStatus : 'unknown',
      imageMatches: Array.isArray(analysis.imageMatches) ? analysis.imageMatches : ['Analysis pending'],
      socialProfiles: Array.isArray(analysis.socialProfiles) ? analysis.socialProfiles : ['Connect for verification'],
      redFlags: Array.isArray(analysis.redFlags) ? analysis.redFlags : [],
      positiveSignals: Array.isArray(analysis.positiveSignals) ? analysis.positiveSignals : ['Analysis completed'],
      confidence: Math.max(0, Math.min(1, analysis.confidence || 0.5)),
      analysisId: this.generateAnalysisId()
    };
  }

  private async executeWithRetry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        this.logger.warn(`AI operation attempt ${attempt} failed`, { error: lastError.message });
        
        if (attempt < this.maxRetries) {
          await this.delay(this.retryDelay * attempt);
        }
      }
    }
    
    throw lastError!;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateAnalysisId(): string {
    return `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Type definitions
interface TrustAnalysisResult {
  trustScore: number;
  verificationStatus: string;
  imageMatches: string[];
  socialProfiles: string[];
  redFlags: string[];
  positiveSignals: string[];
  confidence: number;
  analysisId: string;
}

interface ChatAnalysisResult {
  sentiment: string;
  redFlags: string[];
  positiveSignals: string[];
  riskScore: number;
  suggestions: string[];
  confidence: number;
  analysisId: string;
}

interface ActivitySuggestionsResult {
  activities: string[];
  confidence: number;
  analysisId: string;
}
