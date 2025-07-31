// @ts-ignore
const Sentiment = require('sentiment');

export interface ConversationTurn {
  speaker: 'user' | 'other';
  message: string;
  timestamp?: Date;
}

export interface InterestAnalysisResult {
  overallScore: number; // 0-100
  level: 'High Interest 🔥' | 'Mixed Signals 🤔' | 'Low Interest ❄️';
  breakdown: {
    responseTime: {
      score: number;
      averageMinutes: number;
      details: string;
    };
    messageLength: {
      score: number;
      averageLength: number;
      details: string;
    };
    engagement: {
      score: number;
      questionRate: number;
      details: string;
    };
    sentiment: {
      score: number;
      averageSentiment: number;
      details: string;
    };
    enthusiasm: {
      score: number;
      emojiRate: number;
      details: string;
    };
  };
  recommendations: string[];
  insights: string[];
}

export class InterestDetector {
  private sentiment: any;

  constructor() {
    this.sentiment = new Sentiment();
  }

  analyzeInterest(conversation: string): InterestAnalysisResult {
    const turns = this.parseConversation(conversation);
    const userMessages = turns.filter(turn => turn.speaker === 'user');
    const otherMessages = turns.filter(turn => turn.speaker === 'other');

    if (otherMessages.length === 0) {
      return this.getDefaultResult("No messages from the other person found. Make sure to clearly separate your messages from theirs.");
    }

    // Calculate individual metrics
    const responseTimeScore = this.analyzeResponseTime(turns);
    const messageLengthScore = this.analyzeMessageLength(userMessages, otherMessages);
    const engagementScore = this.analyzeEngagement(otherMessages);
    const sentimentScore = this.analyzeSentiment(otherMessages);
    const enthusiasmScore = this.analyzeEnthusiasm(otherMessages);

    // Weighted overall score
    const weights = {
      responseTime: 0.15,
      messageLength: 0.25,
      engagement: 0.25,
      sentiment: 0.20,
      enthusiasm: 0.15
    };

    const overallScore = Math.round(
      responseTimeScore.score * weights.responseTime +
      messageLengthScore.score * weights.messageLength +
      engagementScore.score * weights.engagement +
      sentimentScore.score * weights.sentiment +
      enthusiasmScore.score * weights.enthusiasm
    );

    // Determine interest level
    let level: 'High Interest 🔥' | 'Mixed Signals 🤔' | 'Low Interest ❄️';
    if (overallScore >= 70) {
      level = 'High Interest 🔥';
    } else if (overallScore >= 40) {
      level = 'Mixed Signals 🤔';
    } else {
      level = 'Low Interest ❄️';
    }

    // Generate recommendations and insights
    const recommendations = this.generateRecommendations(overallScore, {
      responseTime: responseTimeScore,
      messageLength: messageLengthScore,
      engagement: engagementScore,
      sentiment: sentimentScore,
      enthusiasm: enthusiasmScore
    });

    const insights = this.generateInsights(overallScore, otherMessages.length);

    return {
      overallScore,
      level,
      breakdown: {
        responseTime: responseTimeScore,
        messageLength: messageLengthScore,
        engagement: engagementScore,
        sentiment: sentimentScore,
        enthusiasm: enthusiasmScore
      },
      recommendations,
      insights
    };
  }

  private parseConversation(conversation: string): ConversationTurn[] {
    const lines = conversation.split('\n').filter(line => line.trim());
    const turns: ConversationTurn[] = [];
    let currentSpeaker: 'user' | 'other' | null = null;
    let currentMessage = '';

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Check for speaker indicators
      if (trimmedLine.toLowerCase().startsWith('me:') || 
          trimmedLine.toLowerCase().startsWith('you:') ||
          trimmedLine.toLowerCase().startsWith('user:')) {
        if (currentSpeaker && currentMessage) {
          turns.push({ speaker: currentSpeaker, message: currentMessage.trim() });
        }
        currentSpeaker = 'user';
        currentMessage = trimmedLine.substring(trimmedLine.indexOf(':') + 1).trim();
      } else if (trimmedLine.toLowerCase().startsWith('them:') || 
                 trimmedLine.toLowerCase().startsWith('other:') ||
                 trimmedLine.toLowerCase().includes(':')) {
        if (currentSpeaker && currentMessage) {
          turns.push({ speaker: currentSpeaker, message: currentMessage.trim() });
        }
        currentSpeaker = 'other';
        currentMessage = trimmedLine.substring(trimmedLine.indexOf(':') + 1).trim();
      } else if (currentSpeaker) {
        // Continue current message
        currentMessage += ' ' + trimmedLine;
      } else {
        // No speaker identified, try to guess based on alternating pattern
        const speakerGuess = turns.length % 2 === 0 ? 'user' : 'other';
        turns.push({ speaker: speakerGuess, message: trimmedLine });
      }
    }

    // Add the last message if there is one
    if (currentSpeaker && currentMessage) {
      turns.push({ speaker: currentSpeaker, message: currentMessage.trim() });
    }

    return turns;
  }

  private analyzeResponseTime(turns: ConversationTurn[]): { score: number; averageMinutes: number; details: string } {
    // For now, we can't analyze actual response times without timestamps
    // This is a placeholder that could be enhanced with timestamp parsing
    const score = 60; // neutral score
    const averageMinutes = 30; // placeholder
    const details = "Response time analysis requires timestamps. Consider this a neutral indicator.";
    
    return { score, averageMinutes, details };
  }

  private analyzeMessageLength(userMessages: ConversationTurn[], otherMessages: ConversationTurn[]): { score: number; averageLength: number; details: string } {
    const avgUserLength = userMessages.reduce((sum, msg) => sum + msg.message.length, 0) / userMessages.length;
    const avgOtherLength = otherMessages.reduce((sum, msg) => sum + msg.message.length, 0) / otherMessages.length;
    
    // Higher score if their messages are longer or comparable to yours
    const ratio = avgOtherLength / avgUserLength;
    let score = 0;
    
    if (ratio >= 1.2) {
      score = 90; // They write much longer messages
    } else if (ratio >= 0.8) {
      score = 70; // Similar length messages
    } else if (ratio >= 0.5) {
      score = 50; // Somewhat shorter messages
    } else {
      score = 20; // Very short messages
    }

    const details = `Their messages average ${Math.round(avgOtherLength)} characters vs your ${Math.round(avgUserLength)} characters.`;
    
    return { score, averageLength: avgOtherLength, details };
  }

  private analyzeEngagement(otherMessages: ConversationTurn[]): { score: number; questionRate: number; details: string } {
    const totalMessages = otherMessages.length;
    const questionsAsked = otherMessages.filter(msg => msg.message.includes('?')).length;
    const questionRate = questionsAsked / totalMessages;
    
    let score = 0;
    if (questionRate >= 0.4) {
      score = 90; // Asks lots of questions
    } else if (questionRate >= 0.2) {
      score = 70; // Moderate questions
    } else if (questionRate >= 0.1) {
      score = 50; // Some questions
    } else {
      score = 20; // Few or no questions
    }

    const details = `Asks questions in ${Math.round(questionRate * 100)}% of messages (${questionsAsked}/${totalMessages})`;
    
    return { score, questionRate: questionRate * 100, details };
  }

  private analyzeSentiment(otherMessages: ConversationTurn[]): { score: number; averageSentiment: number; details: string } {
    const sentiments = otherMessages.map(msg => this.sentiment.analyze(msg.message));
    const avgSentiment = sentiments.reduce((sum, s) => sum + s.score, 0) / sentiments.length;
    
    // Convert sentiment score to 0-100 scale
    let score = 0;
    if (avgSentiment >= 2) {
      score = 90; // Very positive
    } else if (avgSentiment >= 1) {
      score = 75; // Positive
    } else if (avgSentiment >= 0) {
      score = 60; // Neutral to slightly positive
    } else if (avgSentiment >= -1) {
      score = 40; // Slightly negative
    } else {
      score = 20; // Negative
    }

    const sentimentLabel = avgSentiment > 1 ? 'positive' : avgSentiment > 0 ? 'neutral-positive' : avgSentiment > -1 ? 'neutral-negative' : 'negative';
    const details = `Overall ${sentimentLabel} tone with sentiment score of ${avgSentiment.toFixed(2)}`;
    
    return { score, averageSentiment: avgSentiment, details };
  }

  private analyzeEnthusiasm(otherMessages: ConversationTurn[]): { score: number; emojiRate: number; details: string } {
    // Simple emoji detection using basic patterns
    const emojiRegex = /[\u2600-\u27BF]|[\uD83C][\uDF00-\uDFFF]|[\uD83D][\uDC00-\uDE4F]|[\uD83D][\uDE80-\uDEFF]/g;
    
    const messagesWithEmojis = otherMessages.filter(msg => emojiRegex.test(msg.message)).length;
    const emojiRatio = messagesWithEmojis / otherMessages.length;

    // Count flirty words and patterns (simplified)
    const flirtyPatterns = /heart|love|kiss|cute|beautiful|gorgeous|sexy|babe|honey|darling|sweetie/gi;
    const flirtyCount = otherMessages.reduce((count, msg) => {
      const matches = msg.message.match(flirtyPatterns);
      return count + (matches ? matches.length : 0);
    }, 0);

    // Calculate enthusiasm score
    let score = 0;
    if (emojiRatio >= 0.6 || flirtyCount >= 3) {
      score = 90; // Very enthusiastic
    } else if (emojiRatio >= 0.3 || flirtyCount >= 1) {
      score = 70; // Moderately enthusiastic
    } else if (emojiRatio >= 0.1) {
      score = 50; // Some enthusiasm
    } else {
      score = 30; // Low enthusiasm
    }

    const details = `Uses emojis in ${Math.round(emojiRatio * 100)}% of messages, ${flirtyCount} flirty expressions`;
    
    return { score, emojiRate: emojiRatio * 100, details };
  }

  private generateRecommendations(overallScore: number, breakdown: any): string[] {
    const recommendations: string[] = [];

    if (overallScore >= 70) {
      recommendations.push("🎉 Great signs! They seem genuinely interested.");
      recommendations.push("💡 Keep the conversation engaging and suggest meeting up soon.");
    } else if (overallScore >= 40) {
      recommendations.push("🤔 Mixed signals detected. Try to gauge their interest more directly.");
      recommendations.push("💡 Ask more engaging questions to spark deeper conversation.");
    } else {
      recommendations.push("❄️ Low interest indicators. Consider backing off a bit.");
      recommendations.push("💡 Focus on being interesting rather than pursuing aggressively.");
    }

    // Specific recommendations based on breakdown
    if (breakdown.engagement.score < 50) {
      recommendations.push("📝 They're not asking many questions. Try to be more interesting or consider if they're just not that into you.");
    }

    if (breakdown.messageLength.score < 40) {
      recommendations.push("💬 Their messages are quite short. They might be busy or not very engaged.");
    }

    if (breakdown.sentiment.score < 40) {
      recommendations.push("😟 Their tone seems neutral or negative. Something might be wrong or they're losing interest.");
    }

    if (breakdown.enthusiasm.score < 40) {
      recommendations.push("⚡ Low enthusiasm detected. Try injecting more fun and energy into the conversation.");
    }

    return recommendations;
  }

  private generateInsights(overallScore: number, messageCount: number): string[] {
    const insights: string[] = [];

    insights.push(`📊 Analysis based on ${messageCount} messages from them`);
    
    if (overallScore >= 70) {
      insights.push("🔥 Strong interest indicators suggest they're into you!");
      insights.push("🎯 This is a good time to escalate the conversation or suggest meeting");
    } else if (overallScore >= 40) {
      insights.push("⚖️ Interest level is moderate - they might need more time or engagement");
      insights.push("🎨 Try being more creative with your conversation topics");
    } else {
      insights.push("📉 Low interest signals suggest they might not be that interested");
      insights.push("🤷 Sometimes it's just not a match - don't take it personally");
    }

    return insights;
  }

  private getDefaultResult(message: string): InterestAnalysisResult {
    return {
      overallScore: 0,
      level: 'Mixed Signals 🤔',
      breakdown: {
        responseTime: { score: 0, averageMinutes: 0, details: "Not analyzed" },
        messageLength: { score: 0, averageLength: 0, details: "Not analyzed" },
        engagement: { score: 0, questionRate: 0, details: "Not analyzed" },
        sentiment: { score: 0, averageSentiment: 0, details: "Not analyzed" },
        enthusiasm: { score: 0, emojiRate: 0, details: "Not analyzed" }
      },
      recommendations: [message],
      insights: ["Please provide a conversation to analyze"]
    };
  }
}
