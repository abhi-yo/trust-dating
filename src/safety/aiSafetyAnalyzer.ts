import { UniversalAI } from '../ai/universalAI';
import { PrivacySafetyEngine, SafetyAlert, SafetyCheck } from './privacySafetyEngine';

export interface AiSafetyAnalysis {
  overallRisk: number; // 0-1
  concerns: string[];
  recommendations: string[];
  redFlags: string[];
  positiveSignals: string[];
  trustScore: number; // 0-100
}

export class AiSafetyAnalyzer {
  private privacyEngine: PrivacySafetyEngine;
  private aiClient: UniversalAI | null = null;

  constructor() {
    this.privacyEngine = new PrivacySafetyEngine();
  }

  async initialize(aiClient: UniversalAI) {
    this.aiClient = aiClient;
  }

  async analyzeConversationWithAI(
    messages: Array<{
      text: string;
      timestamp: number;
      sender: 'user' | 'contact';
    }>,
    skipAI: boolean = false
  ): Promise<{
    patternAnalysis: SafetyCheck;
    aiAnalysis?: AiSafetyAnalysis;
    combinedRisk: number;
    finalRecommendations: string[];
  }> {
    // First, run pattern-based analysis
    const patternAnalysis = await this.privacyEngine.analyzeConversationSafety(messages);
    
    let aiAnalysis: AiSafetyAnalysis | undefined;
    let combinedRisk = patternAnalysis.riskLevel;

    // Run AI analysis if available and not skipped
    if (this.aiClient && !skipAI && messages.length > 0) {
      try {
        aiAnalysis = await this.runAiSafetyAnalysis(messages);
        
        // Combine pattern and AI risk scores
        combinedRisk = Math.max(
          patternAnalysis.riskLevel,
          aiAnalysis.overallRisk
        );
      } catch (error) {
        console.error('AI safety analysis failed, using pattern analysis only:', error);
      }
    }

    // Generate final recommendations
    const finalRecommendations = this.generateFinalRecommendations(
      patternAnalysis,
      aiAnalysis,
      combinedRisk
    );

    return {
      patternAnalysis,
      aiAnalysis,
      combinedRisk,
      finalRecommendations
    };
  }

  private async runAiSafetyAnalysis(messages: Array<{
    text: string;
    timestamp: number;
    sender: 'user' | 'contact';
  }>): Promise<AiSafetyAnalysis> {
    if (!this.aiClient) {
      throw new Error('AI client not initialized');
    }

    // Prepare conversation for AI analysis
    const conversationText = messages
      .map(m => `${m.sender === 'user' ? 'User' : 'Match'}: ${m.text}`)
      .join('\n');

    const prompt = `Analyze this dating app conversation for privacy and safety concerns. Look for:

1. Scam patterns (money requests, suspicious links, fake profiles)
2. Privacy risks (sharing personal info too early)
3. Safety concerns (pressure tactics, inappropriate requests)
4. Manipulation techniques (love bombing, urgency, isolation)
5. Platform migration attempts (moving off dating app)

Conversation:
${conversationText}

Consider:
- How quickly personal information is being requested
- Any requests for money, links, or platform changes
- Language patterns that suggest deception or manipulation
- Timeline of the conversation and escalation speed
- Overall authenticity of the conversation

Respond in JSON format:
{
  "overallRisk": <number 0-1>,
  "concerns": ["specific concern 1", "specific concern 2"],
  "recommendations": ["recommendation 1", "recommendation 2"],
  "redFlags": ["red flag 1", "red flag 2"],
  "positiveSignals": ["positive aspect 1", "positive aspect 2"],
  "trustScore": <number 0-100>
}`;

    const result = await this.aiClient.generateContent(prompt);
    const text = result.text;

    // Clean and parse JSON response
    const cleanedText = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .replace(/^[^{]*/, "")
      .replace(/[^}]*$/, "")
      .trim();

    try {
      const analysis = JSON.parse(cleanedText);
      
      return {
        overallRisk: Math.max(0, Math.min(1, analysis.overallRisk || 0)),
        concerns: Array.isArray(analysis.concerns) ? analysis.concerns : [],
        recommendations: Array.isArray(analysis.recommendations) ? analysis.recommendations : [],
        redFlags: Array.isArray(analysis.redFlags) ? analysis.redFlags : [],
        positiveSignals: Array.isArray(analysis.positiveSignals) ? analysis.positiveSignals : [],
        trustScore: Math.max(0, Math.min(100, analysis.trustScore || 50))
      };
    } catch (parseError) {
      console.error('Failed to parse AI safety analysis:', parseError);
      
      // Fallback analysis based on keywords
      return this.generateFallbackAnalysis(conversationText);
    }
  }

  private generateFallbackAnalysis(conversationText: string): AiSafetyAnalysis {
    const riskKeywords = [
      'money', 'send', 'pay', 'cash', 'loan', 'emergency', 'help',
      'whatsapp', 'telegram', 'call me', 'text me', 'phone',
      'love you', 'soulmate', 'perfect', 'destiny', 'fate',
      'click', 'link', 'website', 'download', 'verify',
      'urgent', 'hurry', 'quick', 'now', 'immediate'
    ];

    const safeKeywords = [
      'public', 'coffee', 'restaurant', 'meet', 'date',
      'weekend', 'hobby', 'interest', 'work', 'study'
    ];

    const riskMatches = riskKeywords.filter(keyword => 
      conversationText.toLowerCase().includes(keyword)
    ).length;

    const safeMatches = safeKeywords.filter(keyword =>
      conversationText.toLowerCase().includes(keyword)
    ).length;

    const overallRisk = Math.min(riskMatches / 10, 1);
    const trustScore = Math.max(0, 100 - (riskMatches * 10) + (safeMatches * 5));

    return {
      overallRisk,
      concerns: riskMatches > 2 ? ['Multiple risk indicators detected'] : [],
      recommendations: [
        'Take time to build trust gradually',
        'Meet in public places for safety',
        'Verify identity before sharing personal information'
      ],
      redFlags: riskMatches > 3 ? ['High number of risk keywords detected'] : [],
      positiveSignals: safeMatches > 2 ? ['Normal conversation topics present'] : [],
      trustScore
    };
  }

  private generateFinalRecommendations(
    patternAnalysis: SafetyCheck,
    aiAnalysis?: AiSafetyAnalysis,
    combinedRisk?: number
  ): string[] {
    const recommendations: string[] = [];

    // Start with pattern-based recommendations
    recommendations.push(...patternAnalysis.safeTips);

    // Add AI recommendations if available
    if (aiAnalysis) {
      recommendations.push(...aiAnalysis.recommendations);
    }

    // Add risk-level specific recommendations
    if (combinedRisk && combinedRisk > 0.7) {
      recommendations.push(
        "🚨 HIGH RISK: Strongly consider ending this conversation",
        "📋 Report this user to the dating app's safety team",
        "🔒 Review your privacy settings and shared information"
      );
    } else if (combinedRisk && combinedRisk > 0.4) {
      recommendations.push(
        "⚠️ MODERATE RISK: Proceed with extra caution",
        "👥 Share details with a trusted friend before meeting",
        "📍 Only meet in busy public places with good lighting"
      );
    } else {
      recommendations.push(
        "✅ Lower risk conversation, but stay vigilant",
        "📋 Continue following standard dating safety practices"
      );
    }

    // Remove duplicates and return
    return Array.from(new Set(recommendations));
  }

  // Quick message check for real-time analysis
  async quickMessageCheck(message: string): Promise<{
    hasRisk: boolean;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    alerts: string[];
    tips: string[];
  }> {
    const quickCheck = await this.privacyEngine.quickSafetyCheck(message);
    
    if (!quickCheck.hasRisk) {
      return {
        hasRisk: false,
        riskLevel: 'low',
        alerts: [],
        tips: ['Conversation appears normal - continue with standard safety practices']
      };
    }

    const riskLevel = quickCheck.severity as 'low' | 'medium' | 'high' | 'critical';
    const alerts = [`${quickCheck.riskType?.toUpperCase()}: ${quickCheck.recommendation}`];
    
    const tips = this.getTipsForRiskLevel(riskLevel);

    return {
      hasRisk: true,
      riskLevel,
      alerts,
      tips
    };
  }

  private getTipsForRiskLevel(riskLevel: 'low' | 'medium' | 'high' | 'critical'): string[] {
    switch (riskLevel) {
      case 'critical':
        return [
          "🚨 CRITICAL: Consider ending this conversation immediately",
          "📞 Contact app support or local authorities if threatened",
          "🔒 Do not share any additional personal information"
        ];
      case 'high':
        return [
          "⚠️ HIGH RISK: Proceed with extreme caution",
          "👥 Tell someone about this conversation",
          "🚫 Do not meet this person in private"
        ];
      case 'medium':
        return [
          "⚠️ Be cautious with this conversation",
          "🏛️ Only meet in public if you decide to meet",
          "📱 Keep conversations on the dating app"
        ];
      case 'low':
      default:
        return [
          "💡 Minor concern noted - stay aware",
          "✅ Continue with normal safety practices"
        ];
    }
  }

  // Get safety tips for users
  getSafetyEducation(): {
    generalTips: string[];
    redFlags: string[];
    scamWarnings: string[];
  } {
    return {
      generalTips: this.privacyEngine.getGeneralSafetyTips(),
      redFlags: [
        "Asks for money, loans, or financial help",
        "Wants to move conversation off the dating app quickly",
        "Shares suspicious links or asks you to click them",
        "Asks for personal information like address or workplace",
        "Expresses strong feelings very quickly (love bombing)",
        "Creates false urgency or pressure",
        "Requests additional photos or 'verification' pictures",
        "Profile photos look too professional or model-like",
        "Story doesn't add up or changes over time",
        "Avoids phone calls or video chats"
      ],
      scamWarnings: [
        "Romance scammers often claim to be military, doctors, or traveling",
        "They may have emergencies requiring immediate financial help",
        "Photos are often stolen from other profiles or stock photos",
        "Grammar and language may not match their claimed background",
        "They avoid meeting in person or video calls",
        "Stories about being widowed, overseas, or in crisis are common",
        "They may send gifts early to build trust before asking for money",
        "Multiple spelling or grammar errors despite claiming education"
      ]
    };
  }
}
