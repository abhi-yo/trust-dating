import * as fs from 'fs';
import * as path from 'path';

export interface BehavioralPattern {
  pattern_type: 'scammer' | 'catfish' | 'player' | 'genuine' | 'bot' | 'time_waster';
  confidence: number; // 0-100
  indicators: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface ConversationAnalysis {
  message_patterns: {
    response_time_analysis: {
      average_response_time: number; // in minutes
      consistency_score: number; // 0-100
      timezone_indicators: string[];
      suspicious_timing: boolean;
    };
    language_analysis: {
      grammar_consistency: number; // 0-100
      vocabulary_sophistication: number; // 0-100
      native_speaker_probability: number; // 0-100
      copy_paste_likelihood: number; // 0-100
      script_following_probability: number; // 0-100
    };
    emotional_patterns: {
      emotional_progression_natural: boolean;
      love_bombing_detected: boolean;
      emotional_manipulation_score: number; // 0-100
      sympathy_seeking_frequency: number;
      crisis_fabrication_likelihood: number; // 0-100
    };
  };
  behavioral_red_flags: BehavioralPattern[];
  authenticity_score: number; // 0-100 (100 = definitely authentic)
  risk_assessment: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
}

export interface RequestPattern {
  request_type: 'money' | 'personal_info' | 'photos' | 'meeting' | 'gift_cards' | 'crypto' | 'investment';
  progression_stage: number; // How many messages before first request
  pressure_tactics: string[];
  urgency_indicators: string[];
  emotional_manipulation: string[];
}

export interface ScammerProfile {
  scammer_type: 'romance_scammer' | 'catfish' | 'sextortion' | 'investment_scammer' | 'sugar_daddy_scammer';
  confidence_level: number; // 0-100
  typical_patterns: string[];
  next_likely_moves: string[];
  countermeasures: string[];
}

class BehavioralAnalysisEngine {
  private scammerPatterns: Map<string, RegExp[]> = new Map();
  private timingPatterns: Map<string, number[]> = new Map();
  private languagePatterns: Map<string, string[]> = new Map();

  constructor() {
    this.loadScammerPatterns();
    this.loadLanguagePatterns();
  }

  private loadScammerPatterns(): void {
    // Romance Scammer Patterns
    this.scammerPatterns.set('romance_scammer', [
      /\b(deployed|overseas|military|oil rig|engineer abroad|UN peacekeeping|doctor abroad)\b/i,
      /\b(deceased (wife|husband)|widowed|lost my (wife|husband))\b/i,
      /\b(trust fund|inheritance|gold|diamonds|contract|business trip)\b/i,
      /\b(customs|clearance|fees|taxes|legal documents|lawyer)\b/i,
      /\b(God brought us together|destiny|fate|meant to be|soul mate)\b/i,
      /\b(Western Union|MoneyGram|gift cards|iTunes|Steam|crypto|bitcoin)\b/i,
      /\b(emergency|urgent|hospital|sick|accident|stranded)\b/i,
      /\b(flight ticket|visa|money transfer|bank transfer)\b/i
    ]);

    // Investment Scammer Patterns
    this.scammerPatterns.set('investment_scammer', [
      /\b(guaranteed profit|risk-free|insider information|limited time)\b/i,
      /\b(cryptocurrency|forex|binary options|stock tips)\b/i,
      /\b(minimum investment|deposit|funding|trading account)\b/i,
      /\b(withdraw|profits|earnings|returns|commission)\b/i
    ]);

    // Sextortion Patterns
    this.scammerPatterns.set('sextortion', [
      /\b(video call|cam|webcam|Skype|WhatsApp video)\b/i,
      /\b(naked|nude|intimate|private|sexy|recording)\b/i,
      /\b(blackmail|expose|share|send to friends|social media)\b/i,
      /\b(pay|money|silence|delete)\b/i
    ]);

    // Catfish Patterns
    this.scammerPatterns.set('catfish', [
      /\b(can't meet|always busy|traveling|work commitments)\b/i,
      /\b(camera broken|phone broken|no video|bad connection)\b/i,
      /\b(shy|nervous|not ready|give me time)\b/i,
      /\b(trust issues|bad relationship|need to know you better)\b/i
    ]);
  }

  private loadLanguagePatterns(): void {
    // Common non-native English patterns
    this.languagePatterns.set('non_native_indicators', [
      'how are you doing today',
      'i am very much interested',
      'i will like to',
      'i will love to',
      'what is your profession',
      'where are you originally from',
      'my dear',
      'my love',
      'honey',
      'sweetheart'
    ]);

    // Copy-paste script indicators
    this.languagePatterns.set('script_indicators', [
      'i am a simple and honest person',
      'i believe in true love',
      'age is just a number',
      'distance doesn\'t matter',
      'i am looking for a serious relationship',
      'i don\'t like playing games',
      'i want to spend the rest of my life',
      'i have been hurt before'
    ]);

    // Emotional manipulation phrases
    this.languagePatterns.set('manipulation_phrases', [
      'if you really love me',
      'prove you care',
      'don\'t you trust me',
      'i thought you were different',
      'i have no one else',
      'you are my only hope',
      'god will bless you',
      'i will pay you back'
    ]);
  }

  async analyzeConversation(messages: Array<{
    sender: 'user' | 'match';
    content: string;
    timestamp: Date;
    read_receipt?: boolean;
  }>): Promise<ConversationAnalysis> {
    
    const analysis: ConversationAnalysis = {
      message_patterns: {
        response_time_analysis: {
          average_response_time: 0,
          consistency_score: 0,
          timezone_indicators: [],
          suspicious_timing: false
        },
        language_analysis: {
          grammar_consistency: 0,
          vocabulary_sophistication: 0,
          native_speaker_probability: 0,
          copy_paste_likelihood: 0,
          script_following_probability: 0
        },
        emotional_patterns: {
          emotional_progression_natural: true,
          love_bombing_detected: false,
          emotional_manipulation_score: 0,
          sympathy_seeking_frequency: 0,
          crisis_fabrication_likelihood: 0
        }
      },
      behavioral_red_flags: [],
      authenticity_score: 50,
      risk_assessment: 'medium'
    };

    // Analyze response timing patterns
    await this.analyzeResponseTiming(messages, analysis);

    // Analyze language patterns
    await this.analyzeLanguagePatterns(messages, analysis);

    // Analyze emotional progression
    await this.analyzeEmotionalProgression(messages, analysis);

    // Detect scammer patterns
    await this.detectScammerPatterns(messages, analysis);

    // Calculate overall scores
    analysis.authenticity_score = this.calculateAuthenticityScore(analysis);
    analysis.risk_assessment = this.assessRiskLevel(analysis);

    return analysis;
  }

  private async analyzeResponseTiming(
    messages: Array<{sender: 'user' | 'match'; timestamp: Date}>,
    analysis: ConversationAnalysis
  ): Promise<void> {
    const matchMessages = messages.filter(m => m.sender === 'match');
    const userMessages = messages.filter(m => m.sender === 'user');

    if (matchMessages.length < 2 || userMessages.length < 2) return;

    const responseTimes: number[] = [];
    const hours: number[] = [];

    for (let i = 1; i < messages.length; i++) {
      const prevMsg = messages[i - 1];
      const currentMsg = messages[i];

      if (prevMsg.sender === 'user' && currentMsg.sender === 'match') {
        const responseTime = (currentMsg.timestamp.getTime() - prevMsg.timestamp.getTime()) / (1000 * 60);
        responseTimes.push(responseTime);
        hours.push(currentMsg.timestamp.getHours());
      }
    }

    // Calculate average response time
    if (responseTimes.length > 0) {
      analysis.message_patterns.response_time_analysis.average_response_time = 
        responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
    }

    // Analyze timing consistency
    const timeVariance = this.calculateVariance(responseTimes);
    analysis.message_patterns.response_time_analysis.consistency_score = 
      Math.max(0, 100 - (timeVariance / 60)); // Lower variance = higher consistency

    // Timezone analysis
    const hourCounts = new Map<number, number>();
    hours.forEach(hour => {
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    });

    // Detect suspicious patterns
    const nightHours = hours.filter(h => h >= 22 || h <= 6).length;
    const workHours = hours.filter(h => h >= 9 && h <= 17).length;

    if (nightHours > workHours * 1.5) {
      analysis.message_patterns.response_time_analysis.suspicious_timing = true;
      analysis.message_patterns.response_time_analysis.timezone_indicators.push('Primarily active during night hours - possible different timezone');
    }

    // Detect bot-like timing (too consistent)
    if (timeVariance < 5 && responseTimes.length > 10) {
      analysis.message_patterns.response_time_analysis.suspicious_timing = true;
      analysis.message_patterns.response_time_analysis.timezone_indicators.push('Unnaturally consistent response times - possible automation');
    }
  }

  private async analyzeLanguagePatterns(
    messages: Array<{sender: 'user' | 'match'; content: string}>,
    analysis: ConversationAnalysis
  ): Promise<void> {
    const matchMessages = messages
      .filter(m => m.sender === 'match')
      .map(m => m.content.toLowerCase());

    if (matchMessages.length === 0) return;

    const allText = matchMessages.join(' ');

    // Analyze grammar and vocabulary
    analysis.message_patterns.language_analysis.grammar_consistency = 
      this.analyzeGrammarConsistency(matchMessages);
    
    analysis.message_patterns.language_analysis.vocabulary_sophistication = 
      this.analyzeVocabularySophistication(allText);

    // Detect non-native speaker patterns
    const nonNativeScore = this.detectNonNativePatterns(allText);
    analysis.message_patterns.language_analysis.native_speaker_probability = 100 - nonNativeScore;

    // Detect copy-paste likelihood
    analysis.message_patterns.language_analysis.copy_paste_likelihood = 
      this.detectCopyPastePatterns(matchMessages);

    // Detect script following
    analysis.message_patterns.language_analysis.script_following_probability = 
      this.detectScriptFollowing(allText);
  }

  private async analyzeEmotionalProgression(
    messages: Array<{sender: 'user' | 'match'; content: string; timestamp: Date}>,
    analysis: ConversationAnalysis
  ): Promise<void> {
    const matchMessages = messages.filter(m => m.sender === 'match');
    
    if (matchMessages.length < 5) return;

    // Detect love bombing (premature intense emotional language)
    const earlyMessages = matchMessages.slice(0, Math.min(10, matchMessages.length));
    const loveWords = ['love', 'soulmate', 'destiny', 'forever', 'marry', 'perfect', 'dream'];
    
    let earlyLoveCount = 0;
    earlyMessages.forEach(msg => {
      loveWords.forEach(word => {
        if (msg.content.toLowerCase().includes(word)) earlyLoveCount++;
      });
    });

    if (earlyLoveCount > 3) {
      analysis.message_patterns.emotional_patterns.love_bombing_detected = true;
      analysis.behavioral_red_flags.push({
        pattern_type: 'scammer',
        confidence: 80,
        indicators: ['Love bombing detected - premature intense emotional language'],
        severity: 'high'
      });
    }

    // Detect emotional manipulation
    const matchContent = matchMessages.map(m => m.content);
    const manipulationScore = this.detectEmotionalManipulation(matchContent);
    analysis.message_patterns.emotional_patterns.emotional_manipulation_score = manipulationScore;

    // Detect sympathy seeking
    const sympathyCount = this.detectSympathySeeking(matchContent);
    analysis.message_patterns.emotional_patterns.sympathy_seeking_frequency = sympathyCount;

    // Detect crisis fabrication
    analysis.message_patterns.emotional_patterns.crisis_fabrication_likelihood = 
      this.detectCrisisFabrication(matchContent);
  }

  private async detectScammerPatterns(
    messages: Array<{sender: 'user' | 'match'; content: string}>,
    analysis: ConversationAnalysis
  ): Promise<void> {
    const matchMessages = messages
      .filter(m => m.sender === 'match')
      .map(m => m.content);

    const allText = matchMessages.join(' ').toLowerCase();

    // Check each scammer pattern type
    for (const [scammerType, patterns] of this.scammerPatterns.entries()) {
      let matchCount = 0;
      const detectedPatterns: string[] = [];

      for (const pattern of patterns) {
        if (pattern.test(allText)) {
          matchCount++;
          detectedPatterns.push(pattern.source);
        }
      }

      if (matchCount > 0) {
        const confidence = Math.min(95, (matchCount / patterns.length) * 100 + 20);
        
        analysis.behavioral_red_flags.push({
          pattern_type: scammerType as any,
          confidence,
          indicators: detectedPatterns,
          severity: confidence > 70 ? 'critical' : confidence > 50 ? 'high' : 'medium'
        });
      }
    }

    // Detect money requests
    const moneyRequests = this.detectMoneyRequests(matchMessages);
    if (moneyRequests.length > 0) {
      analysis.behavioral_red_flags.push({
        pattern_type: 'scammer',
        confidence: 90,
        indicators: moneyRequests,
        severity: 'critical'
      });
    }

    // Detect information harvesting
    const infoHarvesting = this.detectInformationHarvesting(matchMessages);
    if (infoHarvesting.length > 0) {
      analysis.behavioral_red_flags.push({
        pattern_type: 'scammer',
        confidence: 70,
        indicators: infoHarvesting,
        severity: 'high'
      });
    }
  }

  private analyzeGrammarConsistency(messages: string[]): number {
    // Simplified grammar analysis
    let consistencyScore = 100;
    let totalSentences = 0;
    let grammaticalErrors = 0;

    messages.forEach(message => {
      const sentences = message.split(/[.!?]+/).filter(s => s.trim().length > 0);
      totalSentences += sentences.length;

      sentences.forEach(sentence => {
        // Check for common grammar errors
        if (!/^[A-Z]/.test(sentence.trim())) grammaticalErrors++; // No capital letter
        if (/\bi am\b/g.test(sentence.toLowerCase()) && !/\bI am\b/g.test(sentence)) grammaticalErrors++; // Incorrect "i am"
        if (/\byour\b.*\byour\b/i.test(sentence)) grammaticalErrors++; // Repetitive words
      });
    });

    if (totalSentences > 0) {
      const errorRate = grammaticalErrors / totalSentences;
      consistencyScore = Math.max(0, 100 - (errorRate * 100));
    }

    return consistencyScore;
  }

  private analyzeVocabularySophistication(text: string): number {
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const uniqueWords = new Set(words.map(w => w.toLowerCase()));
    
    const sophisticatedWords = [
      'sophisticated', 'intellectual', 'philosophical', 'contemplative',
      'introspective', 'articulate', 'eloquent', 'profound', 'nuanced'
    ];

    let sophisticatedCount = 0;
    sophisticatedWords.forEach(word => {
      if (text.toLowerCase().includes(word)) sophisticatedCount++;
    });

    const vocabularyDiversity = uniqueWords.size / words.length;
    const sophisticationScore = (sophisticatedCount / sophisticatedWords.length) * 50 + 
                              vocabularyDiversity * 50;

    return Math.min(100, sophisticationScore);
  }

  private detectNonNativePatterns(text: string): number {
    const indicators = this.languagePatterns.get('non_native_indicators') || [];
    let score = 0;

    indicators.forEach(indicator => {
      if (text.includes(indicator)) {
        score += 15;
      }
    });

    // Additional non-native patterns
    if (/\bhow are you doing today\b/i.test(text)) score += 20;
    if (/\bwhat is your profession\b/i.test(text)) score += 15;
    if (/\bwhere are you originally from\b/i.test(text)) score += 15;

    return Math.min(100, score);
  }

  private detectCopyPastePatterns(messages: string[]): number {
    if (messages.length < 3) return 0;

    let copyPasteScore = 0;

    // Check for duplicate or very similar messages
    for (let i = 0; i < messages.length - 1; i++) {
      for (let j = i + 1; j < messages.length; j++) {
        const similarity = this.calculateStringSimilarity(messages[i], messages[j]);
        if (similarity > 0.8) copyPasteScore += 20;
      }
    }

    // Check for script indicators
    const scriptIndicators = this.languagePatterns.get('script_indicators') || [];
    scriptIndicators.forEach(indicator => {
      messages.forEach(message => {
        if (message.toLowerCase().includes(indicator)) copyPasteScore += 10;
      });
    });

    return Math.min(100, copyPasteScore);
  }

  private detectScriptFollowing(text: string): number {
    const scriptPhrases = this.languagePatterns.get('script_indicators') || [];
    let scriptScore = 0;

    scriptPhrases.forEach(phrase => {
      if (text.includes(phrase)) {
        scriptScore += 12;
      }
    });

    return Math.min(100, scriptScore);
  }

  private detectEmotionalManipulation(messages: string[]): number {
    const manipulationPhrases = this.languagePatterns.get('manipulation_phrases') || [];
    let manipulationScore = 0;

    messages.forEach(message => {
      manipulationPhrases.forEach(phrase => {
        if (message.toLowerCase().includes(phrase)) {
          manipulationScore += 15;
        }
      });
    });

    return Math.min(100, manipulationScore);
  }

  private detectSympathySeeking(messages: string[]): number {
    const sympathyKeywords = [
      'sick', 'hospital', 'emergency', 'accident', 'died', 'funeral',
      'alone', 'lonely', 'depressed', 'sad', 'crying', 'help me'
    ];

    let sympathyCount = 0;

    messages.forEach(message => {
      sympathyKeywords.forEach(keyword => {
        if (message.toLowerCase().includes(keyword)) {
          sympathyCount++;
        }
      });
    });

    return sympathyCount;
  }

  private detectCrisisFabrication(messages: string[]): number {
    const crisisPatterns = [
      /\b(urgent|emergency|immediately|asap|right now)\b/i,
      /\b(hospital|sick|accident|surgery|medicine)\b/i,
      /\b(stranded|stuck|trapped|help|rescue)\b/i,
      /\b(money|cash|funds|payment|transfer)\b/i
    ];

    let crisisScore = 0;
    let crisisMessages = 0;

    messages.forEach(message => {
      let messageHasCrisis = false;
      crisisPatterns.forEach(pattern => {
        if (pattern.test(message)) {
          if (!messageHasCrisis) {
            crisisMessages++;
            messageHasCrisis = true;
          }
          crisisScore += 10;
        }
      });
    });

    // High crisis frequency is suspicious
    if (crisisMessages > messages.length * 0.3) {
      crisisScore += 30;
    }

    return Math.min(100, crisisScore);
  }

  private detectMoneyRequests(messages: string[]): string[] {
    const moneyPatterns = [
      /\b(send|transfer|wire|give|lend|borrow).*\b(money|cash|dollars|funds)\b/i,
      /\b(western union|moneygram|paypal|venmo|cashapp|zelle)\b/i,
      /\b(gift card|itunes|steam|amazon|google play)\b/i,
      /\b(bitcoin|crypto|cryptocurrency|wallet)\b/i,
      /\b(bank|account|routing|swift|iban)\b/i
    ];

    const requests: string[] = [];

    messages.forEach(message => {
      moneyPatterns.forEach(pattern => {
        if (pattern.test(message)) {
          requests.push(`Money request detected: "${message.substring(0, 100)}..."`);
        }
      });
    });

    return requests;
  }

  private detectInformationHarvesting(messages: string[]): string[] {
    const infoPatterns = [
      /\b(ssn|social security|driver.?s license|passport|credit card)\b/i,
      /\b(address|where do you live|full name|date of birth)\b/i,
      /\b(bank|account number|routing|pin|password)\b/i,
      /\b(mother.?s maiden name|security question|verification code)\b/i
    ];

    const harvesting: string[] = [];

    messages.forEach(message => {
      infoPatterns.forEach(pattern => {
        if (pattern.test(message)) {
          harvesting.push(`Information request detected: "${message.substring(0, 100)}..."`);
        }
      });
    });

    return harvesting;
  }

  private calculateAuthenticityScore(analysis: ConversationAnalysis): number {
    let score = 70; // Start with neutral-positive

    // Language authenticity
    score += (analysis.message_patterns.language_analysis.native_speaker_probability - 50) * 0.3;
    score -= analysis.message_patterns.language_analysis.copy_paste_likelihood * 0.4;
    score -= analysis.message_patterns.language_analysis.script_following_probability * 0.3;

    // Emotional authenticity
    if (analysis.message_patterns.emotional_patterns.love_bombing_detected) score -= 30;
    score -= analysis.message_patterns.emotional_patterns.emotional_manipulation_score * 0.2;
    score -= analysis.message_patterns.emotional_patterns.sympathy_seeking_frequency * 5;

    // Behavioral red flags
    analysis.behavioral_red_flags.forEach(flag => {
      const penalty = flag.confidence * (flag.severity === 'critical' ? 0.8 : 
                                       flag.severity === 'high' ? 0.6 : 
                                       flag.severity === 'medium' ? 0.4 : 0.2);
      score -= penalty;
    });

    return Math.max(0, Math.min(100, score));
  }

  private assessRiskLevel(analysis: ConversationAnalysis): 'very_low' | 'low' | 'medium' | 'high' | 'very_high' {
    const criticalFlags = analysis.behavioral_red_flags.filter(f => f.severity === 'critical').length;
    const highFlags = analysis.behavioral_red_flags.filter(f => f.severity === 'high').length;
    
    if (criticalFlags > 0 || analysis.authenticity_score < 20) return 'very_high';
    if (highFlags > 1 || analysis.authenticity_score < 40) return 'high';
    if (highFlags > 0 || analysis.authenticity_score < 60) return 'medium';
    if (analysis.authenticity_score < 80) return 'low';
    return 'very_low';
  }

  // Utility methods
  private calculateVariance(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
    const variance = numbers.reduce((sum, num) => sum + Math.pow(num - mean, 2), 0) / numbers.length;
    return variance;
  }

  private calculateStringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  // Advanced pattern detection for specific scammer types
  async detectScammerType(messages: Array<{sender: 'user' | 'match'; content: string}>): Promise<ScammerProfile | null> {
    const matchMessages = messages
      .filter(m => m.sender === 'match')
      .map(m => m.content.toLowerCase())
      .join(' ');

    // Romance Scammer Detection
    const romanceScore = this.calculateRomanceScammerScore(matchMessages);
    if (romanceScore > 70) {
      return {
        scammer_type: 'romance_scammer',
        confidence_level: romanceScore,
        typical_patterns: [
          'Claims to be traveling/deployed/overseas',
          'Fast emotional escalation',
          'Eventually asks for money for emergency',
          'Avoids phone/video calls'
        ],
        next_likely_moves: [
          'Create fake emergency requiring money',
          'Request gift cards or wire transfer',
          'Claim to be coming to visit but need travel money'
        ],
        countermeasures: [
          'Request video call immediately',
          'Ask for verification photo with specific gesture',
          'Never send money or gift cards',
          'Reverse image search profile photos'
        ]
      };
    }

    // Investment Scammer Detection
    const investmentScore = this.calculateInvestmentScammerScore(matchMessages);
    if (investmentScore > 60) {
      return {
        scammer_type: 'investment_scammer',
        confidence_level: investmentScore,
        typical_patterns: [
          'Mentions cryptocurrency or trading',
          'Claims to be financially successful',
          'Offers investment opportunities',
          'Shows fake profit screenshots'
        ],
        next_likely_moves: [
          'Invite to investment platform',
          'Request initial deposit',
          'Show fake profits to encourage more investment'
        ],
        countermeasures: [
          'Never invest money with online matches',
          'Verify any investment claims independently',
          'Be suspicious of get-rich-quick schemes'
        ]
      };
    }

    return null;
  }

  private calculateRomanceScammerScore(text: string): number {
    let score = 0;

    // Location indicators
    if (/\b(deployed|overseas|military|oil rig|peacekeeping|syria|afghanistan|yemen)\b/i.test(text)) score += 25;
    
    // Tragedy indicators
    if (/\b(widow|widowed|deceased|lost my wife|lost my husband|cancer|died)\b/i.test(text)) score += 20;
    
    // Money indicators
    if (/\b(western union|moneygram|gift card|itunes|steam|bitcoin|wire transfer)\b/i.test(text)) score += 30;
    
    // Emergency indicators
    if (/\b(emergency|urgent|hospital|accident|stranded|help|customs|fees)\b/i.test(text)) score += 25;
    
    // Fast emotional escalation
    if (/\b(love|soulmate|destiny|marry|forever|perfect match)\b/i.test(text)) score += 15;

    return Math.min(100, score);
  }

  private calculateInvestmentScammerScore(text: string): number {
    let score = 0;

    // Investment keywords
    if (/\b(bitcoin|crypto|forex|trading|investment|profit|returns)\b/i.test(text)) score += 30;
    
    // Success claims
    if (/\b(successful|wealthy|millionaire|financial freedom|passive income)\b/i.test(text)) score += 20;
    
    // Opportunity language
    if (/\b(opportunity|limited time|guaranteed|risk-free|insider)\b/i.test(text)) score += 25;
    
    // Platform mentions
    if (/\b(platform|app|system|algorithm|signal|mentor)\b/i.test(text)) score += 15;

    return Math.min(100, score);
  }
}

export { BehavioralAnalysisEngine };
