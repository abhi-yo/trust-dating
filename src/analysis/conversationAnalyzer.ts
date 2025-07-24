import { GoogleGenerativeAI } from '@google/generative-ai';
import natural from 'natural';
import Sentiment from 'sentiment';
import { Conversation, DatingInsight, UserProfile } from '../database';

export interface MessageAnalysis {
  sentiment: number;
  keywords: string[];
  tone: string;
  engagement: number;
  redFlags: string[];
  greenFlags: string[];
  suggestions: string[];
  nextSteps: string[];
}

export interface ConversationMetrics {
  responseTime: number;
  messageLength: number;
  initiationRate: number;
  questionAsking: number;
  topicDiversity: number;
  emotionalDepth: number;
  interestLevel: number;
  reciprocity: number;
}

export interface DatingAdvice {
  type: 'opener' | 'response' | 'topic_change' | 'escalation' | 'safety';
  message: string;
  explanation: string;
  confidence: number;
  timing: 'immediate' | 'wait_1h' | 'wait_3h' | 'wait_1d' | 'weekend';
  context: string;
}

class ConversationAnalyzer {
  private genAI: GoogleGenerativeAI;
  private sentiment: Sentiment;
  private stemmer: any;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.sentiment = new Sentiment();
    this.stemmer = natural.PorterStemmer;
  }

  async analyzeMessage(message: string, conversationContext: Conversation): Promise<MessageAnalysis> {
    // Sentiment analysis
    const sentimentResult = this.sentiment.analyze(message);
    const sentimentScore = Math.max(-1, Math.min(1, sentimentResult.score / 10));

    // Keyword extraction
    const tokenizer = new natural.WordTokenizer();
    const tokens = tokenizer.tokenize(message.toLowerCase());
    const keywords = this.extractKeywords(tokens || []);

    // Tone analysis using Gemini
    const tonePrompt = `Analyze the tone of this dating app message and classify it into one category:
    Message: "${message}"
    
    Categories: flirty, friendly, serious, playful, romantic, anxious, distant, enthusiastic, casual, formal
    
    Respond with just the category name.`;

    const toneModel = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const toneResponse = await toneModel.generateContent(tonePrompt);
    const tone = toneResponse.response.text().trim().toLowerCase();

    // Engagement score calculation
    const engagement = this.calculateEngagement(message, keywords);

    // Red/Green flags detection
    const flags = await this.detectFlags(message, conversationContext);

    // Generate suggestions
    const suggestions = await this.generateSuggestions(message, conversationContext, tone, sentimentScore);

    return {
      sentiment: sentimentScore,
      keywords,
      tone,
      engagement,
      redFlags: flags.red,
      greenFlags: flags.green,
      suggestions: suggestions.immediate,
      nextSteps: suggestions.future
    };
  }

  async analyzeConversation(conversation: Conversation): Promise<ConversationMetrics> {
    const messages = conversation.messages;
    if (messages.length === 0) {
      return this.getDefaultMetrics();
    }

    // Calculate response times
    const responseTimes: number[] = [];
    for (let i = 1; i < messages.length; i++) {
      if (messages[i].sender !== messages[i-1].sender) {
        responseTimes.push(messages[i].timestamp - messages[i-1].timestamp);
      }
    }
    const avgResponseTime = responseTimes.length > 0 ? 
      responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : 0;

    // Message length analysis
    const userMessages = messages.filter(m => m.sender === 'user');
    const avgMessageLength = userMessages.length > 0 ? 
      userMessages.reduce((sum, m) => sum + m.text.length, 0) / userMessages.length : 0;

    // Initiation rate (how often user starts new conversation threads)
    const initiationRate = this.calculateInitiationRate(messages);

    // Question asking frequency
    const questionAsking = this.calculateQuestionFrequency(userMessages);

    // Topic diversity
    const topicDiversity = await this.calculateTopicDiversity(messages);

    // Emotional depth
    const emotionalDepth = this.calculateEmotionalDepth(messages);

    // Interest level from contact
    const interestLevel = this.calculateInterestLevel(messages);

    // Reciprocity score
    const reciprocity = this.calculateReciprocity(messages);

    return {
      responseTime: this.normalizeResponseTime(avgResponseTime),
      messageLength: this.normalizeMessageLength(avgMessageLength),
      initiationRate,
      questionAsking,
      topicDiversity,
      emotionalDepth,
      interestLevel,
      reciprocity
    };
  }

  async generateDatingAdvice(
    conversation: Conversation, 
    userProfile: UserProfile,
    analysisResult: MessageAnalysis
  ): Promise<DatingAdvice[]> {
    const lastMessage = conversation.messages[conversation.messages.length - 1];
    const context = this.buildConversationContext(conversation);
    
    const advicePrompt = `You are an expert dating coach. Based on this conversation analysis, provide specific dating advice:

    CONVERSATION CONTEXT:
    - Platform: ${conversation.platform}
    - Relationship Stage: ${conversation.relationship_stage}
    - Trust Score: ${conversation.trust_score}
    - Messages Count: ${conversation.messages.length}
    - Last Message: "${lastMessage?.text}"
    - Sender: ${lastMessage?.sender}

    ANALYSIS RESULTS:
    - Sentiment: ${analysisResult.sentiment}
    - Tone: ${analysisResult.tone}
    - Engagement: ${analysisResult.engagement}
    - Red Flags: ${analysisResult.redFlags.join(', ')}
    - Green Flags: ${analysisResult.greenFlags.join(', ')}

    USER PREFERENCES:
    - Dating Goals: ${userProfile.dating_goals.join(', ')}
    - Communication Style: ${userProfile.conversation_patterns.message_length_preference}
    - Interests: ${userProfile.preferences.interests.join(', ')}

    Please provide 3-5 specific pieces of advice in this exact JSON format:
    {
      "advice": [
        {
          "type": "response|opener|topic_change|escalation|safety",
          "message": "exact message to send",
          "explanation": "why this works",
          "confidence": 0.8,
          "timing": "immediate|wait_1h|wait_3h|wait_1d|weekend",
          "context": "brief context"
        }
      ]
    }

    Focus on actionable, specific advice that moves the conversation forward naturally.`;

    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const response = await model.generateContent(advicePrompt);
      const result = JSON.parse(response.response.text());
      return result.advice || [];
    } catch (error) {
      console.error('Error generating dating advice:', error);
      return this.getFallbackAdvice(conversation, analysisResult);
    }
  }

  async detectConversationPatterns(conversation: Conversation): Promise<DatingInsight[]> {
    const insights: DatingInsight[] = [];
    const messages = conversation.messages;

    // Pattern 1: Response time patterns
    const responseTimes = this.getResponseTimes(messages);
    if (responseTimes.length >= 3) {
      const avgTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const recentAvg = responseTimes.slice(-3).reduce((a, b) => a + b, 0) / 3;
      
      if (recentAvg > avgTime * 2) {
        insights.push({
          id: `pattern_${Date.now()}_1`,
          conversation_id: conversation.id,
          type: 'warning',
          message: 'Their response times are getting significantly slower - they might be losing interest or getting busy.',
          confidence: 0.7,
          timestamp: Date.now(),
          acted_upon: false
        });
      }
    }

    // Pattern 2: Message length changes
    const contactMessages = messages.filter(m => m.sender === 'contact');
    if (contactMessages.length >= 6) {
      const earlyLength = contactMessages.slice(0, 3).reduce((sum, m) => sum + m.text.length, 0) / 3;
      const recentLength = contactMessages.slice(-3).reduce((sum, m) => sum + m.text.length, 0) / 3;
      
      if (recentLength < earlyLength * 0.5) {
        insights.push({
          id: `pattern_${Date.now()}_2`,
          conversation_id: conversation.id,
          type: 'warning',
          message: 'Their messages are getting much shorter - consider asking an engaging question to re-energize the conversation.',
          confidence: 0.8,
          timestamp: Date.now(),
          acted_upon: false
        });
      }
    }

    // Pattern 3: Question asking patterns
    const userQuestions = messages.filter(m => m.sender === 'user' && m.text.includes('?')).length;
    const contactQuestions = messages.filter(m => m.sender === 'contact' && m.text.includes('?')).length;
    
    if (userQuestions > contactQuestions * 3 && messages.length > 10) {
      insights.push({
        id: `pattern_${Date.now()}_3`,
        conversation_id: conversation.id,
        type: 'advice',
        message: 'You\'re asking most of the questions. Try sharing more about yourself to encourage them to ask about you.',
        confidence: 0.9,
        timestamp: Date.now(),
        acted_upon: false
      });
    }

    // Pattern 4: Emotional escalation opportunity
    const recentMessages = messages.slice(-6);
    const positiveMessages = recentMessages.filter(m => {
      const sentiment = this.sentiment.analyze(m.text);
      return sentiment.score > 2;
    });

    if (positiveMessages.length >= 4 && conversation.relationship_stage === 'getting_to_know') {
      insights.push({
        id: `pattern_${Date.now()}_4`,
        conversation_id: conversation.id,
        type: 'opportunity',
        message: 'Great chemistry detected! Consider suggesting a video call or meeting in person.',
        confidence: 0.85,
        timestamp: Date.now(),
        acted_upon: false
      });
    }

    return insights;
  }

  private extractKeywords(tokens: string[]): string[] {
    const stopWords = new Set(natural.stopwords);
    const keywords = tokens
      .filter(token => token.length > 2 && !stopWords.has(token))
      .map(token => this.stemmer.stem(token))
      .reduce((acc: { [key: string]: number }, word) => {
        acc[word] = (acc[word] || 0) + 1;
        return acc;
      }, {});

    return Object.entries(keywords)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([word]) => word);
  }

  private calculateEngagement(message: string, keywords: string[]): number {
    let score = 0.5; // baseline

    // Question marks indicate engagement
    if (message.includes('?')) score += 0.2;
    
    // Exclamation points show enthusiasm
    const exclamations = (message.match(/!/g) || []).length;
    score += Math.min(exclamations * 0.1, 0.2);

    // Length indicates investment
    if (message.length > 50) score += 0.1;
    if (message.length > 100) score += 0.1;

    // Keywords diversity
    score += Math.min(keywords.length * 0.05, 0.2);

    return Math.min(score, 1.0);
  }

  private async detectFlags(message: string, conversation: Conversation): Promise<{red: string[], green: string[]}> {
    const redFlagKeywords = [
      'ex', 'drama', 'crazy', 'psycho', 'hate', 'money', 'expensive',
      'rich', 'sugar', 'daddy', 'send', 'pics', 'nudes', 'sex'
    ];
    
    const greenFlagKeywords = [
      'family', 'career', 'goals', 'travel', 'hobby', 'passion',
      'volunteer', 'education', 'future', 'dreams', 'values'
    ];

    const redFlags: string[] = [];
    const greenFlags: string[] = [];

    const lowerMessage = message.toLowerCase();
    
    redFlagKeywords.forEach(keyword => {
      if (lowerMessage.includes(keyword)) {
        redFlags.push(`Mentions ${keyword}`);
      }
    });

    greenFlagKeywords.forEach(keyword => {
      if (lowerMessage.includes(keyword)) {
        greenFlags.push(`Discusses ${keyword}`);
      }
    });

    return { red: redFlags, green: greenFlags };
  }

  private async generateSuggestions(
    message: string, 
    conversation: Conversation, 
    tone: string, 
    sentiment: number
  ): Promise<{immediate: string[], future: string[]}> {
    const immediate: string[] = [];
    const future: string[] = [];

    // Based on tone
    if (tone === 'anxious' || sentiment < -0.3) {
      immediate.push('Provide reassurance and positive energy');
      immediate.push('Ask an uplifting question about their interests');
    }

    if (tone === 'flirty' && sentiment > 0.3) {
      immediate.push('Match their energy with playful banter');
      future.push('Consider suggesting a fun activity together');
    }

    if (tone === 'distant') {
      immediate.push('Ask an engaging open-ended question');
      immediate.push('Share something personal to encourage openness');
    }

    // Based on conversation stage
    if (conversation.relationship_stage === 'initial') {
      immediate.push('Ask about their interests or hobbies');
      future.push('Transition to more personal topics gradually');
    }

    if (conversation.relationship_stage === 'interested') {
      immediate.push('Suggest a specific activity or date idea');
      future.push('Start planning actual meetup details');
    }

    return { immediate, future };
  }

  private calculateInitiationRate(messages: any[]): number {
    if (messages.length === 0) return 0;
    
    let initiations = 0;
    let lastSender = '';
    
    for (const message of messages) {
      if (message.sender === 'user' && lastSender !== 'user') {
        initiations++;
      }
      lastSender = message.sender;
    }
    
    return Math.min(initiations / (messages.length / 2), 1.0);
  }

  private calculateQuestionFrequency(userMessages: any[]): number {
    if (userMessages.length === 0) return 0;
    const questions = userMessages.filter(m => m.text.includes('?')).length;
    return Math.min(questions / userMessages.length, 1.0);
  }

  private async calculateTopicDiversity(messages: any[]): Promise<number> {
    const topics = new Set<string>();
    
    for (const message of messages) {
      const tokenizer = new natural.WordTokenizer();
      const tokens = tokenizer.tokenize(message.text.toLowerCase());
      if (tokens) {
        const keywords = this.extractKeywords(tokens);
        keywords.forEach(keyword => topics.add(keyword));
      }
    }
    
    return Math.min(topics.size / 10, 1.0);
  }

  private calculateEmotionalDepth(messages: any[]): number {
    const emotionalWords = [
      'feel', 'love', 'hate', 'excited', 'nervous', 'happy', 'sad',
      'amazing', 'wonderful', 'terrible', 'fantastic', 'awful'
    ];
    
    let emotionalMessages = 0;
    
    for (const message of messages) {
      const lowerText = message.text.toLowerCase();
      if (emotionalWords.some(word => lowerText.includes(word))) {
        emotionalMessages++;
      }
    }
    
    return Math.min(emotionalMessages / messages.length, 1.0);
  }

  private calculateInterestLevel(messages: any[]): number {
    const contactMessages = messages.filter(m => m.sender === 'contact');
    if (contactMessages.length === 0) return 0;
    
    let interestScore = 0.5;
    
    // Questions from contact indicate interest
    const questions = contactMessages.filter(m => m.text.includes('?')).length;
    interestScore += Math.min(questions * 0.1, 0.3);
    
    // Length indicates investment
    const avgLength = contactMessages.reduce((sum, m) => sum + m.text.length, 0) / contactMessages.length;
    if (avgLength > 50) interestScore += 0.1;
    if (avgLength > 100) interestScore += 0.1;
    
    return Math.min(interestScore, 1.0);
  }

  private calculateReciprocity(messages: any[]): number {
    if (messages.length < 4) return 0.5;
    
    const userMessages = messages.filter(m => m.sender === 'user').length;
    const contactMessages = messages.filter(m => m.sender === 'contact').length;
    
    const ratio = Math.min(userMessages, contactMessages) / Math.max(userMessages, contactMessages);
    return ratio;
  }

  private normalizeResponseTime(responseTime: number): number {
    // Convert to hours and normalize (assuming 24 hours = 0, 1 hour = 0.8, immediate = 1.0)
    const hours = responseTime / (1000 * 60 * 60);
    return Math.max(0, Math.min(1, 1 - (hours / 24)));
  }

  private normalizeMessageLength(length: number): number {
    // Normalize message length (assuming 100 chars = 1.0, 0 chars = 0)
    return Math.min(length / 100, 1.0);
  }

  private getDefaultMetrics(): ConversationMetrics {
    return {
      responseTime: 0.5,
      messageLength: 0.5,
      initiationRate: 0.5,
      questionAsking: 0.5,
      topicDiversity: 0.5,
      emotionalDepth: 0.5,
      interestLevel: 0.5,
      reciprocity: 0.5
    };
  }

  private buildConversationContext(conversation: Conversation): string {
    const recentMessages = conversation.messages.slice(-5);
    return recentMessages.map(m => `${m.sender}: ${m.text}`).join('\n');
  }

  private getFallbackAdvice(conversation: Conversation, analysis: MessageAnalysis): DatingAdvice[] {
    const advice: DatingAdvice[] = [];
    
    if (analysis.sentiment < -0.3) {
      advice.push({
        type: 'response',
        message: 'That sounds challenging. What\'s been the best part of your day though?',
        explanation: 'Acknowledges their feelings while steering toward positivity',
        confidence: 0.7,
        timing: 'immediate',
        context: 'Low sentiment detected'
      });
    }
    
    if (analysis.tone === 'distant') {
      advice.push({
        type: 'topic_change',
        message: 'I\'d love to hear about something you\'re passionate about lately',
        explanation: 'Engaging question to re-energize the conversation',
        confidence: 0.8,
        timing: 'immediate',
        context: 'Distant tone detected'
      });
    }
    
    return advice;
  }

  private getResponseTimes(messages: any[]): number[] {
    const times: number[] = [];
    for (let i = 1; i < messages.length; i++) {
      if (messages[i].sender !== messages[i-1].sender) {
        times.push(messages[i].timestamp - messages[i-1].timestamp);
      }
    }
    return times;
  }
}

export { ConversationAnalyzer };
