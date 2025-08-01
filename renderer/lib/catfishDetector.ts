export interface CatfishAnalysisResult {
  realnessScore: number; // 0-100, higher = more real
  riskLevel: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High';
  redFlags: string[];
  greenFlags: string[];
  breakdown: {
    responsePatterns: { score: number; details: string };
    personalDetails: { score: number; details: string };
    escalationSpeed: { score: number; details: string };
    languageConsistency: { score: number; details: string };
    profileAlignment: { score: number; details: string };
  };
  recommendations: string[];
}

export class CatfishDetector {
  private readonly RED_FLAG_KEYWORDS = [
    'honey', 'babe', 'darling', 'sweetie', 'beautiful', 'gorgeous', 'perfect',
    'love you', 'soulmate', 'destiny', 'meant to be', 'never felt this way',
    'delete this app', 'here\'s my number', 'text me', 'whatsapp', 'telegram',
    'emergency', 'help me', 'money', 'financial', 'send', 'western union',
    'gift card', 'bitcoin', 'crypto', 'investment', 'business opportunity'
  ];

  private readonly GENERIC_COMPLIMENTS = [
    'you\'re beautiful', 'you\'re cute', 'you\'re gorgeous', 'you\'re perfect',
    'you\'re amazing', 'you\'re wonderful', 'you look great', 'nice pics',
    'love your smile', 'beautiful eyes', 'stunning', 'wow', 'incredible'
  ];

  private readonly EVASIVE_PATTERNS = [
    'i\'d rather not say', 'maybe later', 'let\'s talk about you',
    'that\'s personal', 'i don\'t like talking about', 'change the subject',
    'enough about me', 'what about you', 'tell me about yourself'
  ];

  analyzeConversation(conversationText: string): CatfishAnalysisResult {
    const messages = this.parseConversation(conversationText);
    const otherPersonMessages = this.extractOtherPersonMessages(messages);
    
    const responsePatterns = this.analyzeResponsePatterns(otherPersonMessages);
    const personalDetails = this.analyzePersonalDetails(otherPersonMessages);
    const escalationSpeed = this.analyzeEscalationSpeed(otherPersonMessages, messages.length);
    const languageConsistency = this.analyzeLanguageConsistency(otherPersonMessages);
    const profileAlignment = this.analyzeProfileAlignment(otherPersonMessages);

    const breakdown = {
      responsePatterns,
      personalDetails,
      escalationSpeed,
      languageConsistency,
      profileAlignment
    };

    const realnessScore = this.calculateRealnessScore(breakdown);
    const riskLevel = this.determineRiskLevel(realnessScore);
    const redFlags = this.identifyRedFlags(otherPersonMessages);
    const greenFlags = this.identifyGreenFlags(otherPersonMessages);
    const recommendations = this.generateRecommendations(realnessScore, redFlags);

    return {
      realnessScore,
      riskLevel,
      redFlags,
      greenFlags,
      breakdown,
      recommendations
    };
  }

  private parseConversation(text: string): string[] {
    // Split by common message separators
    return text.split(/\n+/)
      .filter(line => line.trim().length > 0)
      .map(line => line.trim());
  }

  private extractOtherPersonMessages(messages: string[]): string[] {
    // Simple heuristic: assume messages without "me:", "you:", etc. are from other person
    // Or alternate messages, or use other indicators
    return messages.filter((msg, index) => {
      // Skip messages that look like they're from the user
      const lowerMsg = msg.toLowerCase();
      if (lowerMsg.startsWith('me:') || lowerMsg.startsWith('you:')) {
        return !lowerMsg.startsWith('me:');
      }
      // If no clear indicators, assume alternating messages starting with other person
      return index % 2 === 0;
    });
  }

  private analyzeResponsePatterns(messages: string[]): { score: number; details: string } {
    if (messages.length === 0) {
      return { score: 50, details: "No messages to analyze" };
    }

    let suspiciousPatterns = 0;
    let totalPatterns = 0;

    messages.forEach(msg => {
      const lowerMsg = msg.toLowerCase();
      totalPatterns++;

      // Check for extremely generic responses
      if (this.GENERIC_COMPLIMENTS.some(compliment => lowerMsg.includes(compliment))) {
        suspiciousPatterns += 0.5;
      }

      // Check for copy-paste like responses (repeated phrases)
      const wordCount = lowerMsg.split(' ').length;
      if (wordCount < 3) {
        suspiciousPatterns += 0.3;
      }

      // Check for overly formal/scripted language
      if (lowerMsg.includes('greetings') || lowerMsg.includes('salutations')) {
        suspiciousPatterns += 0.4;
      }
    });

    const suspiciousRatio = suspiciousPatterns / totalPatterns;
    const score = Math.max(0, Math.min(100, 100 - (suspiciousRatio * 100)));

    return {
      score: Math.round(score),
      details: `${Math.round(suspiciousRatio * 100)}% of messages show suspicious patterns`
    };
  }

  private analyzePersonalDetails(messages: string[]): { score: number; details: string } {
    if (messages.length === 0) {
      return { score: 50, details: "No messages to analyze" };
    }

    let personalDetailsShared = 0;
    let evasiveResponses = 0;
    let personalQuestions = 0;

    messages.forEach(msg => {
      const lowerMsg = msg.toLowerCase();

      // Count personal details
      if (lowerMsg.includes('i work') || lowerMsg.includes('my job') || 
          lowerMsg.includes('i live in') || lowerMsg.includes('i\'m from') ||
          lowerMsg.includes('my family') || lowerMsg.includes('i study')) {
        personalDetailsShared++;
      }

      // Count evasive responses
      if (this.EVASIVE_PATTERNS.some(pattern => lowerMsg.includes(pattern))) {
        evasiveResponses++;
      }

      // Count questions about personal details
      if ((lowerMsg.includes('what') || lowerMsg.includes('where') || lowerMsg.includes('how')) &&
          lowerMsg.includes('?')) {
        personalQuestions++;
      }
    });

    const detailsRatio = personalDetailsShared / Math.max(personalQuestions, 1);
    const evasiveRatio = evasiveResponses / messages.length;
    
    const score = Math.max(0, Math.min(100, (detailsRatio * 60) + (1 - evasiveRatio) * 40));

    return {
      score: Math.round(score),
      details: `${personalDetailsShared} personal details shared, ${evasiveResponses} evasive responses`
    };
  }

  private analyzeEscalationSpeed(messages: string[], totalMessages: number): { score: number; details: string } {
    if (messages.length === 0) {
      return { score: 50, details: "No messages to analyze" };
    }

    let escalationFlags = 0;
    let messageCount = 0;

    messages.forEach((msg, index) => {
      const lowerMsg = msg.toLowerCase();
      messageCount++;

      // Early romantic language
      if (this.RED_FLAG_KEYWORDS.some(keyword => lowerMsg.includes(keyword))) {
        // Weight by how early it appears
        const earlinessMultiplier = 1 - (index / messages.length);
        escalationFlags += earlinessMultiplier;
      }

      // Requesting personal contact info too early
      if ((lowerMsg.includes('number') || lowerMsg.includes('phone') || 
           lowerMsg.includes('whatsapp') || lowerMsg.includes('telegram')) && 
          index < messages.length * 0.3) {
        escalationFlags += 0.8;
      }
    });

    const escalationRatio = escalationFlags / messageCount;
    const score = Math.max(0, Math.min(100, 100 - (escalationRatio * 120)));

    return {
      score: Math.round(score),
      details: `${Math.round(escalationRatio * 100)}% escalation rate detected`
    };
  }

  private analyzeLanguageConsistency(messages: string[]): { score: number; details: string } {
    if (messages.length === 0) {
      return { score: 50, details: "No messages to analyze" };
    }

    let grammarErrors = 0;
    let polishedSections = 0;
    let totalWords = 0;

    messages.forEach(msg => {
      const words = msg.split(' ');
      totalWords += words.length;

      // Simple grammar checks
      const lowerMsg = msg.toLowerCase();
      
      // Common errors
      if (lowerMsg.includes(' i ') && !lowerMsg.includes(' I ')) grammarErrors++;
      if (lowerMsg.includes('your beautiful') || lowerMsg.includes('your amazing')) grammarErrors++;
      if (lowerMsg.includes('its ') && !lowerMsg.includes('its ')) grammarErrors++;

      // Overly polished sections (perfect grammar but maybe copy-pasted)
      if (words.length > 10 && 
          !lowerMsg.includes('umm') && !lowerMsg.includes('lol') && 
          !lowerMsg.includes('haha') && !lowerMsg.includes('yeah')) {
        polishedSections++;
      }
    });

    const errorRate = grammarErrors / Math.max(totalWords / 20, 1);
    const polishedRate = polishedSections / messages.length;

    // Moderate errors are normal, too few or too many are suspicious
    const idealErrorRate = 0.1;
    const errorScore = Math.max(0, 100 - Math.abs(errorRate - idealErrorRate) * 200);
    const polishedScore = Math.max(0, 100 - polishedRate * 60);

    const score = (errorScore + polishedScore) / 2;

    return {
      score: Math.round(score),
      details: `${grammarErrors} grammar issues, ${polishedSections} overly polished messages`
    };
  }

  private analyzeProfileAlignment(messages: string[]): { score: number; details: string } {
    // This would ideally compare against profile info, but we'll use message consistency
    if (messages.length === 0) {
      return { score: 50, details: "No messages to analyze" };
    }

    let inconsistencies = 0;
    let details: string[] = [];

    // Look for contradictory information (simplified)
    const allText = messages.join(' ').toLowerCase();
    
    // Age contradictions
    const ageMatches = allText.match(/(\d+)\s*years?\s*old/g);
    if (ageMatches && ageMatches.length > 1) {
      const ages = ageMatches.map(match => parseInt(match.match(/\d+/)?.[0] || '0'));
      if (new Set(ages).size > 1) {
        inconsistencies++;
        details.push('Age inconsistencies found');
      }
    }

    // Location contradictions
    const locationWords = ['from', 'live in', 'based in'];
    const mentionedLocations = locationWords.map(word => {
      const regex = new RegExp(`${word}\\s+([a-zA-Z\\s,]+?)(?:\\.|,|!|\\?|$)`, 'gi');
      return allText.match(regex);
    }).flat().filter(Boolean);

    if (mentionedLocations.length > 2) {
      inconsistencies++;
      details.push('Multiple location claims');
    }

    const score = Math.max(0, 100 - (inconsistencies * 30));

    return {
      score: Math.round(score),
      details: details.length > 0 ? details.join(', ') : 'No major inconsistencies detected'
    };
  }

  private calculateRealnessScore(breakdown: any): number {
    const weights = {
      responsePatterns: 0.25,
      personalDetails: 0.25,
      escalationSpeed: 0.25,
      languageConsistency: 0.15,
      profileAlignment: 0.10
    };

    return Math.round(
      breakdown.responsePatterns.score * weights.responsePatterns +
      breakdown.personalDetails.score * weights.personalDetails +
      breakdown.escalationSpeed.score * weights.escalationSpeed +
      breakdown.languageConsistency.score * weights.languageConsistency +
      breakdown.profileAlignment.score * weights.profileAlignment
    );
  }

  private determineRiskLevel(score: number): 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High' {
    if (score >= 80) return 'Very Low';
    if (score >= 65) return 'Low';
    if (score >= 45) return 'Medium';
    if (score >= 25) return 'High';
    return 'Very High';
  }

  private identifyRedFlags(messages: string[]): string[] {
    const flags: string[] = [];
    const allText = messages.join(' ').toLowerCase();

    // Early romantic language
    if (this.RED_FLAG_KEYWORDS.some(keyword => allText.includes(keyword))) {
      flags.push('Uses overly romantic language too early');
    }

    // Generic compliments
    if (this.GENERIC_COMPLIMENTS.some(compliment => allText.includes(compliment))) {
      flags.push('Relies on generic compliments');
    }

    // Avoiding personal questions
    if (this.EVASIVE_PATTERNS.some(pattern => allText.includes(pattern))) {
      flags.push('Avoids answering personal questions');
    }

    // Requesting personal info
    if (allText.includes('number') || allText.includes('whatsapp') || allText.includes('telegram')) {
      flags.push('Quickly requests personal contact information');
    }

    // Financial mentions
    if (allText.includes('money') || allText.includes('help') || allText.includes('emergency')) {
      flags.push('Mentions financial situations or emergencies');
    }

    return flags;
  }

  private identifyGreenFlags(messages: string[]): string[] {
    const flags: string[] = [];
    const allText = messages.join(' ').toLowerCase();

    // Shares personal details
    if (allText.includes('i work') || allText.includes('my job') || allText.includes('i study')) {
      flags.push('Shares specific personal/professional details');
    }

    // Asks thoughtful questions
    if ((allText.match(/\?/g) || []).length >= messages.length * 0.3) {
      flags.push('Asks engaging questions about you');
    }

    // Uses casual language
    if (allText.includes('lol') || allText.includes('haha') || allText.includes('yeah')) {
      flags.push('Uses natural, casual language');
    }

    // Mentions specific interests
    if (allText.includes('hobby') || allText.includes('favorite') || allText.includes('love watching')) {
      flags.push('Discusses specific interests and hobbies');
    }

    return flags;
  }

  private generateRecommendations(score: number, redFlags: string[]): string[] {
    const recommendations: string[] = [];

    if (score < 30) {
      recommendations.push('Exercise extreme caution - multiple red flags detected');
      recommendations.push('Consider ending this conversation');
    } else if (score < 50) {
      recommendations.push('Proceed with caution and verify their identity');
      recommendations.push('Ask for a video call before meeting');
    } else if (score < 70) {
      recommendations.push('Generally seems legitimate but stay alert');
      recommendations.push('Ask more personal questions to verify authenticity');
    } else {
      recommendations.push('Person appears to be genuine');
      recommendations.push('Continue normal conversation');
    }

    if (redFlags.includes('Quickly requests personal contact information')) {
      recommendations.push('Avoid sharing personal contact info until you\'re comfortable');
    }

    if (redFlags.includes('Mentions financial situations or emergencies')) {
      recommendations.push('Never send money or financial assistance');
    }

    return recommendations;
  }
}
