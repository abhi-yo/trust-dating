export interface ConversationQualityResult {
  overallScore: number; // 0-100, higher = better engagement
  engagementLevel: 'Excellent' | 'Good' | 'Average' | 'Poor' | 'Very Poor';
  userMessageCount: number;
  analysis: {
    questionAsking: { score: number; count: number; details: string };
    messageLength: { score: number; avgLength: number; details: string };
    openEndedness: { score: number; openCount: number; details: string };
    responseQuality: { score: number; dryCount: number; details: string };
    conversationFlow: { score: number; details: string };
  };
  strengths: string[];
  improvements: string[];
  specificTips: string[];
  exampleBetterReplies?: { original: string; improved: string }[];
}

export class ConversationQualityChecker {
  private readonly DRY_RESPONSES = [
    'yes', 'no', 'ok', 'okay', 'cool', 'nice', 'yeah', 'nah', 'sure', 'maybe',
    'lol', 'haha', 'wow', 'oh', 'ah', 'hmm', 'yep', 'nope', 'k', 'kk'
  ];

  private readonly ENGAGEMENT_WORDS = [
    'what', 'how', 'why', 'when', 'where', 'which', 'tell me', 'share',
    'describe', 'explain', 'think', 'feel', 'opinion', 'favorite', 'prefer',
    'experience', 'story', 'interesting', 'curious', 'wonder'
  ];

  private readonly QUESTION_INDICATORS = ['?', 'what', 'how', 'why', 'when', 'where', 'which', 'do you', 'are you', 'have you'];

  analyzeConversation(conversationText: string): ConversationQualityResult {
    const messages = this.parseConversation(conversationText);
    const userMessages = this.extractUserMessages(messages);
    
    if (userMessages.length === 0) {
      return this.createEmptyResult();
    }

    const questionAsking = this.analyzeQuestionAsking(userMessages);
    const messageLength = this.analyzeMessageLength(userMessages);
    const openEndedness = this.analyzeOpenEndedness(userMessages);
    const responseQuality = this.analyzeResponseQuality(userMessages);
    const conversationFlow = this.analyzeConversationFlow(userMessages, messages);

    const analysis = {
      questionAsking,
      messageLength,
      openEndedness,
      responseQuality,
      conversationFlow
    };

    const overallScore = this.calculateOverallScore(analysis);
    const engagementLevel = this.determineEngagementLevel(overallScore);
    const strengths = this.identifyStrengths(analysis);
    const improvements = this.identifyImprovements(analysis);
    const specificTips = this.generateSpecificTips(analysis, userMessages);
    const exampleBetterReplies = this.generateExampleReplies(userMessages);

    return {
      overallScore,
      engagementLevel,
      userMessageCount: userMessages.length,
      analysis,
      strengths,
      improvements,
      specificTips,
      exampleBetterReplies
    };
  }

  private parseConversation(text: string): string[] {
    return text.split(/\n+/)
      .filter(line => line.trim().length > 0)
      .map(line => line.trim());
  }

  private extractUserMessages(messages: string[]): string[] {
    // Assume user messages are those that start with "me:" or odd-indexed messages
    return messages.filter((msg, index) => {
      const lowerMsg = msg.toLowerCase();
      if (lowerMsg.startsWith('me:') || lowerMsg.startsWith('you:')) {
        return lowerMsg.startsWith('me:');
      }
      // If no clear indicators, assume alternating messages starting with user (odd indices)
      return index % 2 === 1;
    }).map(msg => msg.replace(/^me:\s*/i, '').trim());
  }

  private analyzeQuestionAsking(userMessages: string[]): { score: number; count: number; details: string } {
    let questionCount = 0;
    
    userMessages.forEach(msg => {
      const lowerMsg = msg.toLowerCase();
      if (this.QUESTION_INDICATORS.some(indicator => lowerMsg.includes(indicator))) {
        questionCount++;
      }
    });

    const questionRatio = questionCount / userMessages.length;
    const idealRatio = 0.4; // 40% of messages should contain questions
    const score = Math.min(100, (questionRatio / idealRatio) * 100);

    return {
      score: Math.round(score),
      count: questionCount,
      details: `${questionCount} questions in ${userMessages.length} messages (${Math.round(questionRatio * 100)}%)`
    };
  }

  private analyzeMessageLength(userMessages: string[]): { score: number; avgLength: number; details: string } {
    const totalWords = userMessages.reduce((sum, msg) => sum + msg.split(' ').length, 0);
    const avgLength = totalWords / userMessages.length;

    // Ideal range: 8-20 words per message
    let score = 100;
    if (avgLength < 3) score = 20;
    else if (avgLength < 5) score = 40;
    else if (avgLength < 8) score = 70;
    else if (avgLength <= 20) score = 100;
    else if (avgLength <= 30) score = 85;
    else score = 60; // Too verbose

    return {
      score: Math.round(score),
      avgLength: Math.round(avgLength * 10) / 10,
      details: `Average ${Math.round(avgLength)} words per message`
    };
  }

  private analyzeOpenEndedness(userMessages: string[]): { score: number; openCount: number; details: string } {
    let openEndedCount = 0;

    userMessages.forEach(msg => {
      const lowerMsg = msg.toLowerCase();
      
      // Check for open-ended question words
      if (this.ENGAGEMENT_WORDS.some(word => lowerMsg.includes(word))) {
        openEndedCount++;
      }

      // Avoid yes/no questions
      if (lowerMsg.includes('do you') || lowerMsg.includes('are you') || 
          lowerMsg.includes('have you') || lowerMsg.includes('did you')) {
        // These can be closed-ended, so don't count them as open
      } else if (lowerMsg.includes('?')) {
        // Other questions might be more open-ended
        openEndedCount += 0.5;
      }
    });

    const openRatio = openEndedCount / userMessages.length;
    const score = Math.min(100, openRatio * 200); // Scale appropriately

    return {
      score: Math.round(score),
      openCount: Math.round(openEndedCount),
      details: `${Math.round(openEndedCount)} open-ended messages out of ${userMessages.length}`
    };
  }

  private analyzeResponseQuality(userMessages: string[]): { score: number; dryCount: number; details: string } {
    let dryCount = 0;

    userMessages.forEach(msg => {
      const cleanMsg = msg.toLowerCase().trim();
      
      // Check for single-word or very short responses
      if (this.DRY_RESPONSES.includes(cleanMsg) || msg.split(' ').length <= 2) {
        dryCount++;
      }

      // Check for lack of substance
      if (cleanMsg.length < 10 && !cleanMsg.includes('?')) {
        dryCount += 0.5;
      }
    });

    const dryRatio = dryCount / userMessages.length;
    const score = Math.max(0, 100 - (dryRatio * 120));

    return {
      score: Math.round(score),
      dryCount: Math.round(dryCount),
      details: `${Math.round(dryCount)} dry/short responses detected`
    };
  }

  private analyzeConversationFlow(userMessages: string[], allMessages: string[]): { score: number; details: string } {
    let flowScore = 100;
    let issues: string[] = [];

    // Check for conversation building
    const buildsOnPrevious = userMessages.filter(msg => {
      const lowerMsg = msg.toLowerCase();
      return lowerMsg.includes('that') || lowerMsg.includes('really') || 
             lowerMsg.includes('interesting') || lowerMsg.includes('tell me more');
    }).length;

    const buildRatio = buildsOnPrevious / Math.max(userMessages.length - 1, 1);
    if (buildRatio < 0.2) {
      flowScore -= 20;
      issues.push('rarely builds on previous topics');
    }

    // Check for topic switching appropriateness
    const questionCount = userMessages.filter(msg => msg.includes('?')).length;
    if (questionCount > userMessages.length * 0.8) {
      flowScore -= 15;
      issues.push('too many questions without sharing');
    }

    // Check for balance between asking and sharing
    const sharingMessages = userMessages.filter(msg => {
      const lowerMsg = msg.toLowerCase();
      return lowerMsg.includes('i ') || lowerMsg.includes('my ') || 
             lowerMsg.includes('me ') || lowerMsg.includes('i\'m');
    }).length;

    const shareRatio = sharingMessages / userMessages.length;
    if (shareRatio < 0.3) {
      flowScore -= 15;
      issues.push('not sharing enough about yourself');
    }

    return {
      score: Math.max(0, Math.round(flowScore)),
      details: issues.length > 0 ? issues.join(', ') : 'Good conversation flow'
    };
  }

  private calculateOverallScore(analysis: any): number {
    const weights = {
      questionAsking: 0.25,
      messageLength: 0.20,
      openEndedness: 0.25,
      responseQuality: 0.20,
      conversationFlow: 0.10
    };

    return Math.round(
      analysis.questionAsking.score * weights.questionAsking +
      analysis.messageLength.score * weights.messageLength +
      analysis.openEndedness.score * weights.openEndedness +
      analysis.responseQuality.score * weights.responseQuality +
      analysis.conversationFlow.score * weights.conversationFlow
    );
  }

  private determineEngagementLevel(score: number): 'Excellent' | 'Good' | 'Average' | 'Poor' | 'Very Poor' {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 55) return 'Average';
    if (score >= 35) return 'Poor';
    return 'Very Poor';
  }

  private identifyStrengths(analysis: any): string[] {
    const strengths: string[] = [];

    if (analysis.questionAsking.score >= 75) {
      strengths.push('Asks engaging questions frequently');
    }
    
    if (analysis.messageLength.score >= 80) {
      strengths.push('Messages are well-detailed and substantive');
    }
    
    if (analysis.openEndedness.score >= 70) {
      strengths.push('Uses open-ended questions effectively');
    }
    
    if (analysis.responseQuality.score >= 80) {
      strengths.push('Avoids dry, single-word responses');
    }
    
    if (analysis.conversationFlow.score >= 75) {
      strengths.push('Maintains good conversation flow');
    }

    if (strengths.length === 0) {
      strengths.push('Room for improvement in all areas - great opportunity to level up!');
    }

    return strengths;
  }

  private identifyImprovements(analysis: any): string[] {
    const improvements: string[] = [];

    if (analysis.questionAsking.score < 60) {
      improvements.push('Ask more questions to show interest');
    }
    
    if (analysis.messageLength.score < 60) {
      if (analysis.messageLength.avgLength < 5) {
        improvements.push('Write longer, more detailed messages');
      } else {
        improvements.push('Keep messages more concise and focused');
      }
    }
    
    if (analysis.openEndedness.score < 60) {
      improvements.push('Use more open-ended questions instead of yes/no questions');
    }
    
    if (analysis.responseQuality.score < 60) {
      improvements.push('Avoid single-word replies and add more substance');
    }
    
    if (analysis.conversationFlow.score < 60) {
      improvements.push('Build on previous topics and share more about yourself');
    }

    return improvements;
  }

  private generateSpecificTips(analysis: any, userMessages: string[]): string[] {
    const tips: string[] = [];

    // Question-asking tips
    if (analysis.questionAsking.score < 70) {
      tips.push('Try asking "What\'s your favorite..." or "How did you get into..." questions');
      tips.push('Follow up on things they mention with "Tell me more about that"');
    }

    // Message length tips
    if (analysis.messageLength.avgLength < 5) {
      tips.push('Add context to your responses - explain why you think that way');
      tips.push('Share a brief personal experience related to what they\'re saying');
    }

    // Open-endedness tips
    if (analysis.openEndedness.score < 60) {
      tips.push('Replace "Do you like X?" with "What do you think about X?"');
      tips.push('Ask about experiences: "What was that like?" or "How did that make you feel?"');
    }

    // Response quality tips
    if (analysis.responseQuality.score < 70) {
      tips.push('Instead of "cool" try "That sounds really interesting, I\'ve always wanted to try that"');
      tips.push('Add your own perspective: "I love that too because..."');
    }

    // Flow tips
    if (analysis.conversationFlow.score < 70) {
      tips.push('Reference earlier parts of the conversation: "Earlier you mentioned..."');
      tips.push('Balance asking questions with sharing your own experiences');
    }

    // General engagement tips
    tips.push('Use their name occasionally to make it more personal');
    tips.push('React to what they say with genuine enthusiasm or curiosity');

    return tips.slice(0, 6); // Limit to 6 most relevant tips
  }

  private generateExampleReplies(userMessages: string[]): { original: string; improved: string }[] {
    const examples: { original: string; improved: string }[] = [];

    userMessages.forEach(msg => {
      const lowerMsg = msg.toLowerCase().trim();
      
      // Find dry responses and suggest improvements
      if (this.DRY_RESPONSES.includes(lowerMsg)) {
        switch (lowerMsg) {
          case 'cool':
            examples.push({
              original: msg,
              improved: 'That sounds really cool! I\'ve always been curious about that. What got you started with it?'
            });
            break;
          case 'nice':
            examples.push({
              original: msg,
              improved: 'That\'s awesome! I love hearing about experiences like that. What was your favorite part?'
            });
            break;
          case 'yeah':
            examples.push({
              original: msg,
              improved: 'Absolutely! I feel the same way. Have you noticed that too, or is there something specific that made you realize that?'
            });
            break;
          case 'lol':
            examples.push({
              original: msg,
              improved: 'Haha that\'s hilarious! You have a great sense of humor. Do you always find the funny side of things like that?'
            });
            break;
        }
      }

      // Find short messages and suggest expansions
      if (msg.split(' ').length <= 3 && !msg.includes('?') && examples.length < 3) {
        examples.push({
          original: msg,
          improved: `${msg} That\'s really interesting! I\'d love to hear more about your experience with that. What\'s been the most surprising thing about it?`
        });
      }
    });

    return examples.slice(0, 3); // Limit to 3 examples
  }

  private createEmptyResult(): ConversationQualityResult {
    return {
      overallScore: 0,
      engagementLevel: 'Very Poor',
      userMessageCount: 0,
      analysis: {
        questionAsking: { score: 0, count: 0, details: 'No messages to analyze' },
        messageLength: { score: 0, avgLength: 0, details: 'No messages to analyze' },
        openEndedness: { score: 0, openCount: 0, details: 'No messages to analyze' },
        responseQuality: { score: 0, dryCount: 0, details: 'No messages to analyze' },
        conversationFlow: { score: 0, details: 'No messages to analyze' }
      },
      strengths: [],
      improvements: ['Start by sending a thoughtful, engaging message'],
      specificTips: ['Ask open-ended questions', 'Share something about yourself', 'Show genuine interest'],
      exampleBetterReplies: []
    };
  }
}
