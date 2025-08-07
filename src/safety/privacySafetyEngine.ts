export interface SafetyAlert {
  id: string;
  type: 'privacy' | 'safety' | 'scam' | 'manipulation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  recommendation: string;
  confidence: number;
  timestamp: number;
  pattern: string;
}

export interface SafetyCheck {
  isSafe: boolean;
  riskLevel: number; // 0-1 (0 = safe, 1 = very risky)
  alerts: SafetyAlert[];
  safeTips: string[];
}

export class PrivacySafetyEngine {
  private riskPatterns: Array<{
    pattern: RegExp;
    type: SafetyAlert['type'];
    severity: SafetyAlert['severity'];
    title: string;
    description: string;
    recommendation: string;
    confidence: number;
  }> = [
    // Phone number sharing patterns
    {
      pattern: /(?:my\s+(?:number|phone)\s+is\s*:?\s*)?(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/i,
      type: 'privacy',
      severity: 'high',
      title: 'Phone Number Sharing Risk',
      description: 'Phone number detected in conversation',
      recommendation: 'Avoid sharing phone numbers until you meet in person and feel comfortable',
      confidence: 0.9
    },
    
    // Personal info sharing
    {
      pattern: /(?:i\s+(?:live|work)\s+(?:at|in|on)\s+|my\s+address\s+is\s+|home\s+address|work\s+address).{1,50}/i,
      type: 'privacy',
      severity: 'critical',
      title: 'Personal Address Sharing',
      description: 'Home or work address information detected',
      recommendation: 'Never share your home or work address with someone you haven\'t met',
      confidence: 0.85
    },

    // Social media requests
    {
      pattern: /(?:add\s+me\s+on\s+|follow\s+me\s+on\s+|find\s+me\s+on\s+)(?:instagram|facebook|snapchat|tiktok|twitter)/i,
      type: 'privacy',
      severity: 'medium',
      title: 'Social Media Request',
      description: 'Request to connect on social media platforms',
      recommendation: 'Be cautious about connecting on social media before meeting in person',
      confidence: 0.8
    },

    // Platform migration (WhatsApp, Telegram, etc.)
    {
      pattern: /(?:let\'s\s+(?:move|switch|talk)\s+(?:to|on)\s+|message\s+me\s+on\s+|text\s+me\s+on\s+)(?:whatsapp|telegram|signal|kik|wickr|discord)/i,
      type: 'safety',
      severity: 'high',
      title: 'Platform Migration Request',
      description: 'Request to move conversation to another messaging platform',
      recommendation: 'Stay on the dating app until you\'ve built trust and met in person',
      confidence: 0.9
    },

    // Suspicious links
    {
      pattern: /(?:check\s+out\s+|visit\s+|click\s+|go\s+to\s+)?(?:https?:\/\/|www\.|[a-zA-Z0-9-]+\.(?:com|net|org|co|io|me|ly|tk|ml|ga))/i,
      type: 'scam',
      severity: 'high',
      title: 'Suspicious Link Detected',
      description: 'External link shared in conversation',
      recommendation: 'Never click links from people you don\'t know well. Scammers often use malicious links',
      confidence: 0.85
    },

    // Money/financial requests
    {
      pattern: /(?:send\s+me\s+|need\s+|borrow\s+|lend\s+|transfer\s+|money\s+for\s+|cash\s+for\s+|pay\s+for\s+|emergency\s+fund|financial\s+help|paypal|venmo|cashapp|bitcoin|crypto)/i,
      type: 'scam',
      severity: 'critical',
      title: 'Financial Request',
      description: 'Request for money or financial assistance',
      recommendation: 'NEVER send money to someone you met online. This is a major red flag for scams',
      confidence: 0.95
    },

    // Love bombing/manipulation
    {
      pattern: /(?:love\s+you|soul\s*mate|perfect\s+match|meant\s+to\s+be|destiny|fate\s+brought\s+us).*(?:first\s+(?:day|week|time)|just\s+met|barely\s+know)/i,
      type: 'manipulation',
      severity: 'high',
      title: 'Love Bombing Detected',
      description: 'Excessive romantic language very early in conversation',
      recommendation: 'Be wary of people who express intense feelings too quickly. This can be manipulation',
      confidence: 0.8
    },

    // Personal questions too early
    {
      pattern: /(?:where\s+do\s+you\s+(?:live|work)|what\'s\s+your\s+(?:address|workplace)|where\s+is\s+your\s+(?:house|apartment)|work\s+schedule|when\s+are\s+you\s+home\s+alone)/i,
      type: 'safety',
      severity: 'medium',
      title: 'Invasive Personal Questions',
      description: 'Questions about your location, schedule, or living situation',
      recommendation: 'Avoid sharing specific details about where you live or work until you\'ve met and built trust',
      confidence: 0.75
    },

    // Verification/photo requests
    {
      pattern: /(?:send\s+me\s+a\s+(?:photo|pic|picture|selfie)|prove\s+you\'re\s+real|verification\s+(?:photo|pic)|show\s+me\s+(?:your\s+face|yourself))/i,
      type: 'privacy',
      severity: 'medium',
      title: 'Photo Verification Request',
      description: 'Request for additional photos or verification pictures',
      recommendation: 'Be cautious about sending additional photos. Use the app\'s built-in verification features instead',
      confidence: 0.7
    },

    // Urgency/pressure tactics
    {
      pattern: /(?:right\s+now|immediately|urgent|emergency|time\s+sensitive|hurry|quick|fast|asap|can\'t\s+wait)/i,
      type: 'manipulation',
      severity: 'medium',
      title: 'Pressure/Urgency Tactics',
      description: 'Language creating false urgency or pressure',
      recommendation: 'Legitimate connections don\'t require urgent responses. Take your time to think',
      confidence: 0.6
    },

    // Travel/visit requests
    {
      pattern: /(?:come\s+visit\s+me|i\'ll\s+visit\s+you|meet\s+tonight|come\s+over|your\s+place\s+or\s+mine)/i,
      type: 'safety',
      severity: 'high',
      title: 'Immediate Meeting Request',
      description: 'Request to meet immediately or at private location',
      recommendation: 'Always meet in public places for first dates. Take time to get to know someone first',
      confidence: 0.8
    }
  ];

  private earlyRedFlags = [
    'asks for money',
    'shares phone number immediately',
    'wants to move off platform quickly',
    'asks invasive personal questions',
    'shares external links',
    'requests additional photos',
    'expresses love/strong feelings quickly',
    'creates false urgency'
  ];

  async analyzeConversationSafety(messages: Array<{
    text: string;
    timestamp: number;
    sender: 'user' | 'contact';
  }>): Promise<SafetyCheck> {
    const alerts: SafetyAlert[] = [];
    const safeTips: string[] = [];
    
    let totalRisk = 0;
    let riskCount = 0;

    // Check each message for risk patterns
    for (const message of messages) {
      if (message.sender === 'contact') {
        const messageAlerts = this.checkMessageForRisks(message.text, message.timestamp);
        alerts.push(...messageAlerts);
        
        // Calculate risk contribution
        for (const alert of messageAlerts) {
          const riskWeight = this.getSeverityWeight(alert.severity) * alert.confidence;
          totalRisk += riskWeight;
          riskCount++;
        }
      }
    }

    // Analyze conversation patterns
    const patternAlerts = this.analyzeConversationPatterns(messages);
    alerts.push(...patternAlerts);

    // Calculate overall risk level
    const riskLevel = riskCount > 0 ? Math.min(totalRisk / riskCount, 1) : 0;

    // Generate contextual safety tips
    const contextualTips = this.generateSafetyTips(alerts, messages);
    safeTips.push(...contextualTips);

    return {
      isSafe: riskLevel < 0.3 && alerts.filter(a => a.severity === 'critical' || a.severity === 'high').length === 0,
      riskLevel,
      alerts: alerts.sort((a, b) => {
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      }),
      safeTips
    };
  }

  private checkMessageForRisks(message: string, timestamp: number): SafetyAlert[] {
    const alerts: SafetyAlert[] = [];

    for (const riskPattern of this.riskPatterns) {
      if (riskPattern.pattern.test(message)) {
        alerts.push({
          id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: riskPattern.type,
          severity: riskPattern.severity,
          title: riskPattern.title,
          description: riskPattern.description,
          recommendation: riskPattern.recommendation,
          confidence: riskPattern.confidence,
          timestamp,
          pattern: message.match(riskPattern.pattern)?.[0] || 'pattern match'
        });
      }
    }

    return alerts;
  }

  private analyzeConversationPatterns(messages: Array<{
    text: string;
    timestamp: number;
    sender: 'user' | 'contact';
  }>): SafetyAlert[] {
    const alerts: SafetyAlert[] = [];
    const contactMessages = messages.filter(m => m.sender === 'contact');
    
    if (contactMessages.length === 0) return alerts;

    // Check for conversation timeline red flags
    const firstMessage = contactMessages[0];
    const timeSinceFirst = Date.now() - firstMessage.timestamp;
    const conversationAgeHours = timeSinceFirst / (1000 * 60 * 60);

    // Too much personal info too quickly
    const personalInfoCount = contactMessages.filter(m => 
      /(?:phone|number|address|live|work|schedule|home|alone)/i.test(m.text)
    ).length;

    if (personalInfoCount > 2 && conversationAgeHours < 24) {
      alerts.push({
        id: `pattern_personal_info_${Date.now()}`,
        type: 'privacy',
        severity: 'high',
        title: 'Too Much Personal Information Too Quickly',
        description: 'Multiple requests for personal information in a short time',
        recommendation: 'Slow down sharing personal details. Take time to build trust gradually',
        confidence: 0.8,
        timestamp: Date.now(),
        pattern: 'rapid_personal_info_requests'
      });
    }

    // Platform switch attempts
    const platformSwitchCount = contactMessages.filter(m =>
      /(?:whatsapp|telegram|signal|text\s+me|call\s+me)/i.test(m.text)
    ).length;

    if (platformSwitchCount > 1) {
      alerts.push({
        id: `pattern_platform_switch_${Date.now()}`,
        type: 'safety',
        severity: 'high',
        title: 'Persistent Platform Switch Attempts',
        description: 'Multiple attempts to move conversation off the dating platform',
        recommendation: 'Stay on the dating app. Legitimate matches will respect this boundary',
        confidence: 0.9,
        timestamp: Date.now(),
        pattern: 'persistent_platform_switch'
      });
    }

    return alerts;
  }

  private getSeverityWeight(severity: SafetyAlert['severity']): number {
    switch (severity) {
      case 'critical': return 1.0;
      case 'high': return 0.8;
      case 'medium': return 0.5;
      case 'low': return 0.2;
      default: return 0.1;
    }
  }

  private generateSafetyTips(alerts: SafetyAlert[], messages: Array<{
    text: string;
    timestamp: number;
    sender: 'user' | 'contact';
  }>): string[] {
    const tips: string[] = [];
    const alertTypes = new Set(alerts.map(a => a.type));
    const severities = alerts.map(a => a.severity);

    // Base safety tips
    if (alerts.length === 0) {
      tips.push(
        "✅ No immediate safety concerns detected",
        "💡 Always meet first dates in public places",
        "🔒 Keep personal information private until you build trust"
      );
    }

    // Privacy-specific tips
    if (alertTypes.has('privacy')) {
      tips.push(
        "🔒 Protect your privacy: Avoid sharing phone numbers, addresses, or workplace details early",
        "📱 Use the dating app's messaging until you're comfortable meeting in person"
      );
    }

    // Safety-specific tips
    if (alertTypes.has('safety')) {
      tips.push(
        "⚠️ Stay safe: Meet in public places, tell a friend your plans, trust your instincts",
        "🚫 Don't feel pressured to move conversations to other platforms"
      );
    }

    // Scam-specific tips
    if (alertTypes.has('scam')) {
      tips.push(
        "🚨 Scam alert: Never send money, gift cards, or personal financial information",
        "🔗 Don't click suspicious links or download files from matches"
      );
    }

    // Manipulation-specific tips
    if (alertTypes.has('manipulation')) {
      tips.push(
        "🧠 Trust your gut: Be wary of excessive flattery or pressure tactics",
        "⏰ Take your time: Healthy relationships develop gradually"
      );
    }

    // High-risk situation tips
    if (severities.includes('critical') || severities.filter(s => s === 'high').length > 2) {
      tips.push(
        "🚨 HIGH RISK: Consider ending this conversation and reporting the user",
        "📞 If you feel unsafe, contact local authorities or the app's safety team"
      );
    }

    return Array.from(new Set(tips)); // Remove duplicates
  }

  // Quick check for a single message
  async quickSafetyCheck(message: string): Promise<{
    hasRisk: boolean;
    riskType?: string;
    severity?: string;
    recommendation?: string;
  }> {
    for (const pattern of this.riskPatterns) {
      if (pattern.pattern.test(message)) {
        return {
          hasRisk: true,
          riskType: pattern.type,
          severity: pattern.severity,
          recommendation: pattern.recommendation
        };
      }
    }

    return { hasRisk: false };
  }

  // Get general safety tips for users
  getGeneralSafetyTips(): string[] {
    return [
      "🏛️ Always meet first dates in public places like cafes, restaurants, or museums",
      "👥 Tell a trusted friend about your date plans and location",
      "📱 Keep conversations on the dating app until you've met and feel comfortable",
      "🔒 Don't share personal information like your address, workplace, or phone number early",
      "💰 Never send money, gift cards, or financial information to someone you met online",
      "🔗 Don't click suspicious links or download files from matches",
      "⏰ Take your time getting to know someone - don't rush into meetings",
      "🚫 Trust your instincts - if something feels off, it probably is",
      "📞 Use video calls before meeting to verify the person matches their photos",
      "🚗 Arrange your own transportation to and from dates"
    ];
  }
}
