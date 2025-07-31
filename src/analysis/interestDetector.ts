const Sentiment = require('sentiment');

export interface ConversationTurn {
  speaker: 'user' | 'other';
  message: string;
  timestamp?: Date;
}

export interface InterestMetrics {
  replyLength: number;
  questionFrequency: number;
  sentimentScore: number;
  emojiUsage: number;
  engagementLevel: number;
}

export interface InterestAnalysis {
  overallScore: number;
  level: 'high' | 'medium' | 'low';
  emoji: string;
  label: string;
  metrics: InterestMetrics;
  breakdown: {
    replyLength: { score: number; description: string };
    questionFrequency: { score: number; description: string };
    sentiment: { score: number; description: string };
    emojiUsage: { score: number; description: string };
    engagement: { score: number; description: string };
  };
}

export class InterestDetector {
  private sentiment: any;

  constructor() {
    // Initialize sentiment analyzer
    this.sentiment = new Sentiment();
  }

  /**
   * Parse conversation text into turns
   */
  parseConversation(conversationText: string): ConversationTurn[] {
    const lines = conversationText.split('\n').filter(line => line.trim());
    const turns: ConversationTurn[] = [];
    let currentSpeaker: 'user' | 'other' = 'user';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Simple heuristic: assume alternating speakers
      // Could be enhanced with name detection or timestamps
      turns.push({
        speaker: currentSpeaker,
        message: trimmed,
      });

      // Alternate speaker for next message
      currentSpeaker = currentSpeaker === 'user' ? 'other' : 'user';
    }

    return turns;
  }

  /**
   * Analyze reply length patterns
   */
  private analyzeReplyLength(otherMessages: string[]): { score: number; description: string } {
    if (otherMessages.length === 0) {
      return { score: 0, description: "No messages to analyze" };
    }

    const avgWordCount = otherMessages.reduce((sum, msg) => {
      return sum + msg.split(/\s+/).length;
    }, 0) / otherMessages.length;

    let score = 0;
    let description = "";

    if (avgWordCount >= 15) {
      score = 100;
      description = "Long, detailed responses show high engagement";
    } else if (avgWordCount >= 8) {
      score = 75;
      description = "Good response length indicates interest";
    } else if (avgWordCount >= 4) {
      score = 50;
      description = "Average response length, moderate engagement";
    } else if (avgWordCount >= 2) {
      score = 25;
      description = "Short responses may indicate low interest";
    } else {
      score = 10;
      description = "Very short responses suggest disinterest";
    }

    return { score, description };
  }

  /**
   * Analyze question frequency (engagement)
   */
  private analyzeQuestionFrequency(otherMessages: string[]): { score: number; description: string } {
    if (otherMessages.length === 0) {
      return { score: 0, description: "No messages to analyze" };
    }

    const questionCount = otherMessages.filter(msg => 
      msg.includes('?') || 
      msg.toLowerCase().match(/^(what|how|when|where|why|who|do you|are you|have you|will you|would you)/i)
    ).length;

    const questionRatio = questionCount / otherMessages.length;
    let score = 0;
    let description = "";

    if (questionRatio >= 0.6) {
      score = 100;
      description = "Asking lots of questions - very engaged!";
    } else if (questionRatio >= 0.4) {
      score = 80;
      description = "Good question frequency shows interest";
    } else if (questionRatio >= 0.2) {
      score = 60;
      description = "Some questions asked, moderate engagement";
    } else if (questionRatio >= 0.1) {
      score = 30;
      description = "Few questions, limited engagement";
    } else {
      score = 10;
      description = "No questions asked, may be disinterested";
    }

    return { score, description };
  }

  /**
   * Analyze sentiment of messages
   */
  private analyzeSentiment(otherMessages: string[]): { score: number; description: string } {
    if (otherMessages.length === 0) {
      return { score: 0, description: "No messages to analyze" };
    }

    const sentimentScores = otherMessages.map(msg => {
      const result = this.sentiment.analyze(msg);
      return result.score;
    });

    const avgSentiment = sentimentScores.reduce((sum, score) => sum + score, 0) / sentimentScores.length;
    
    let score = 0;
    let description = "";

    if (avgSentiment >= 2) {
      score = 100;
      description = "Very positive tone - great signs!";
    } else if (avgSentiment >= 1) {
      score = 80;
      description = "Positive sentiment indicates interest";
    } else if (avgSentiment >= 0) {
      score = 60;
      description = "Neutral tone, hard to read";
    } else if (avgSentiment >= -1) {
      score = 30;
      description = "Slightly negative tone";
    } else {
      score = 10;
      description = "Negative sentiment - not good signs";
    }

    return { score, description };
  }

  /**
   * Analyze emoji usage
   */
  private analyzeEmojiUsage(otherMessages: string[]): { score: number; description: string } {
    if (otherMessages.length === 0) {
      return { score: 0, description: "No messages to analyze" };
    }

    // Simple emoji detection using basic patterns
    const emojiRegex = /[\u2600-\u27BF]|[\uD83C][\uDF00-\uDFFF]|[\uD83D][\uDC00-\uDE4F]|[\uD83D][\uDE80-\uDEFF]/g;
    
    const messagesWithEmojis = otherMessages.filter(msg => emojiRegex.test(msg)).length;
    const emojiRatio = messagesWithEmojis / otherMessages.length;

    // Count flirty words and patterns (simplified)
    const flirtyPatterns = /heart|love|kiss|cute|beautiful|gorgeous|sexy|babe|honey|darling|sweetie/gi;
    const flirtyCount = otherMessages.reduce((count, msg) => {
      const matches = msg.match(flirtyPatterns);
      return count + (matches ? matches.length : 0);
    }, 0);

    let score = 0;
    let description = "";

    if (flirtyCount > 0 && emojiRatio >= 0.3) {
      score = 100;
      description = "Flirty emojis and frequent use - very interested!";
    } else if (emojiRatio >= 0.4) {
      score = 85;
      description = "Frequent emoji use shows playfulness";
    } else if (emojiRatio >= 0.2) {
      score = 70;
      description = "Some emoji use, positive signs";
    } else if (emojiRatio >= 0.1) {
      score = 50;
      description = "Occasional emojis, neutral";
    } else {
      score = 30;
      description = "No emojis, formal communication";
    }

    return { score, description };
  }

  /**
   * Calculate overall engagement level
   */
  private calculateEngagement(turns: ConversationTurn[]): { score: number; description: string } {
    const otherTurns = turns.filter(turn => turn.speaker === 'other');
    const userTurns = turns.filter(turn => turn.speaker === 'user');

    if (otherTurns.length === 0 || userTurns.length === 0) {
      return { score: 0, description: "Insufficient conversation data" };
    }

    // Response ratio
    const responseRatio = otherTurns.length / userTurns.length;
    
    // Conversation initiation (if they start topics)
    const initiationCount = otherTurns.filter((turn, index) => {
      const prevTurn = turns[turns.indexOf(turn) - 1];
      return !prevTurn || prevTurn.speaker === 'other';
    }).length;

    let score = 0;
    let description = "";

    if (responseRatio >= 0.9 && initiationCount >= 2) {
      score = 100;
      description = "Highly engaged - responds and initiates";
    } else if (responseRatio >= 0.8) {
      score = 80;
      description = "Good engagement - consistent responses";
    } else if (responseRatio >= 0.6) {
      score = 60;
      description = "Moderate engagement";
    } else if (responseRatio >= 0.4) {
      score = 40;
      description = "Low engagement - sporadic responses";
    } else {
      score = 20;
      description = "Very low engagement";
    }

    return { score, description };
  }

  /**
   * Main analysis function
   */
  analyzeInterest(conversationText: string): InterestAnalysis {
    const turns = this.parseConversation(conversationText);
    const otherMessages = turns
      .filter(turn => turn.speaker === 'other')
      .map(turn => turn.message);

    // Calculate individual metrics
    const replyLength = this.analyzeReplyLength(otherMessages);
    const questionFrequency = this.analyzeQuestionFrequency(otherMessages);
    const sentiment = this.analyzeSentiment(otherMessages);
    const emojiUsage = this.analyzeEmojiUsage(otherMessages);
    const engagement = this.calculateEngagement(turns);

    // Weighted overall score
    const weights = {
      replyLength: 0.2,
      questionFrequency: 0.25,
      sentiment: 0.25,
      emojiUsage: 0.15,
      engagement: 0.15
    };

    const overallScore = Math.round(
      replyLength.score * weights.replyLength +
      questionFrequency.score * weights.questionFrequency +
      sentiment.score * weights.sentiment +
      emojiUsage.score * weights.emojiUsage +
      engagement.score * weights.engagement
    );

    // Determine interest level
    let level: 'high' | 'medium' | 'low';
    let emoji: string;
    let label: string;

    if (overallScore >= 75) {
      level = 'high';
      emoji = '🔥';
      label = 'High Interest';
    } else if (overallScore >= 45) {
      level = 'medium';
      emoji = '🤔';
      label = 'Mixed Signals';
    } else {
      level = 'low';
      emoji = '❄️';
      label = 'Low Interest';
    }

    return {
      overallScore,
      level,
      emoji,
      label,
      metrics: {
        replyLength: replyLength.score,
        questionFrequency: questionFrequency.score,
        sentimentScore: sentiment.score,
        emojiUsage: emojiUsage.score,
        engagementLevel: engagement.score
      },
      breakdown: {
        replyLength,
        questionFrequency,
        sentiment,
        emojiUsage,
        engagement
      }
    };
  }
}
