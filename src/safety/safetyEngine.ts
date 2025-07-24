import { GoogleGenerativeAI } from '@google/generative-ai';
import { Conversation, DatingInsight, databaseManager } from '../database';

export interface SafetyAlert {
  id: string;
  conversation_id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'catfish' | 'scammer' | 'predator' | 'fake_profile' | 'inappropriate' | 'manipulation' | 'pressure';
  description: string;
  evidence: string[];
  recommended_action: string;
  confidence: number;
  timestamp: number;
}

export interface ProfileVerification {
  platform: string;
  profile_url?: string;
  photos_analyzed: number;
  inconsistencies: string[];
  reverse_image_matches: number;
  profile_completeness: number;
  verification_score: number;
  red_flags: string[];
  green_flags: string[];
}

export interface ConversationSafety {
  conversation_id: string;
  overall_safety_score: number;
  pressure_tactics: Array<{
    type: string;
    message: string;
    timestamp: number;
  }>;
  inappropriate_requests: Array<{
    request: string;
    severity: 'low' | 'medium' | 'high';
    timestamp: number;
  }>;
  consistency_check: {
    story_changes: string[];
    timeline_inconsistencies: string[];
    fact_contradictions: string[];
  };
  trust_indicators: {
    verified_information: string[];
    mutual_connections: number;
    social_media_presence: boolean;
    phone_verification: boolean;
  };
}

class SafetyEngine {
  private genAI: GoogleGenerativeAI;
  private dangerousPatterns: RegExp[];
  private scammerKeywords: string[];
  private pressureTactics: string[];

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.initializeSafetyPatterns();
  }

  private initializeSafetyPatterns(): void {
    this.dangerousPatterns = [
      /send.{0,10}money/i,
      /need.{0,10}help.{0,10}financial/i,
      /emergency.{0,10}cash/i,
      /bitcoin|cryptocurrency|crypto/i,
      /investment.{0,10}opportunity/i,
      /wire.{0,10}transfer/i,
      /bank.{0,10}account/i,
      /social.{0,10}security/i,
      /passport.{0,10}number/i,
      /credit.{0,10}card/i,
      /nude|naked|sex.{0,10}pics/i,
      /adult.{0,10}content/i,
      /cam.{0,10}show/i,
      /sugar.{0,10}daddy|sugar.{0,10}baby/i,
      /escort|prostitut/i,
      /meet.{0,10}tonight/i,
      /come.{0,10}over.{0,10}now/i,
      /hotel.{0,10}room/i,
      /my.{0,10}place.{0,10}alone/i
    ];

    this.scammerKeywords = [
      'military deployment', 'overseas contract', 'oil rig', 'UN peacekeeping',
      'widow', 'inheritance', 'gold bars', 'custom clearance', 'diplomatic bag',
      'love you' // when said too early
    ];

    this.pressureTactics = [
      'if you really loved me', 'prove your love', 'don\'t you trust me',
      'we should meet tonight', 'send me money', 'i need help urgently',
      'delete the app', 'don\'t talk to others', 'only message me'
    ];
  }

  async analyzeSafety(conversation: Conversation): Promise<ConversationSafety> {
    const messages = conversation.messages;
    const contactMessages = messages.filter(m => m.sender === 'contact');
    
    // Check for pressure tactics
    const pressureTactics = this.detectPressureTactics(contactMessages);
    
    // Check for inappropriate requests
    const inappropriateRequests = this.detectInappropriateRequests(contactMessages);
    
    // Analyze consistency
    const consistencyCheck = await this.analyzeConsistency(contactMessages);
    
    // Calculate overall safety score
    let safetyScore = 1.0;
    safetyScore -= pressureTactics.length * 0.2;
    safetyScore -= inappropriateRequests.filter(r => r.severity === 'high').length * 0.3;
    safetyScore -= inappropriateRequests.filter(r => r.severity === 'medium').length * 0.15;
    safetyScore -= consistencyCheck.story_changes.length * 0.1;
    safetyScore = Math.max(0, safetyScore);

    return {
      conversation_id: conversation.id,
      overall_safety_score: safetyScore,
      pressure_tactics: pressureTactics,
      inappropriate_requests: inappropriateRequests,
      consistency_check: consistencyCheck,
      trust_indicators: {
        verified_information: this.extractVerifiedInfo(contactMessages),
        mutual_connections: 0, // Would need social media integration
        social_media_presence: false, // Would need external verification
        phone_verification: false // Would need phone verification system
      }
    };
  }

  async generateSafetyAlerts(conversation: Conversation): Promise<SafetyAlert[]> {
    const alerts: SafetyAlert[] = [];
    const safety = await this.analyzeSafety(conversation);
    
    // Critical safety alerts
    if (safety.overall_safety_score < 0.3) {
      alerts.push({
        id: `safety_critical_${Date.now()}`,
        conversation_id: conversation.id,
        severity: 'critical',
        type: 'predator',
        description: 'Multiple serious red flags detected in this conversation',
        evidence: [
          ...safety.pressure_tactics.map(p => `Pressure tactic: ${p.type}`),
          ...safety.inappropriate_requests.filter(r => r.severity === 'high').map(r => `Inappropriate request: ${r.request}`)
        ],
        recommended_action: 'Block and report this user immediately. Do not meet in person.',
        confidence: 0.95,
        timestamp: Date.now()
      });
    }

    // High severity alerts
    if (safety.pressure_tactics.length > 0) {
      alerts.push({
        id: `safety_pressure_${Date.now()}`,
        conversation_id: conversation.id,
        severity: 'high',
        type: 'manipulation',
        description: 'Manipulation and pressure tactics detected',
        evidence: safety.pressure_tactics.map(p => p.message),
        recommended_action: 'Be very cautious. This person is trying to manipulate you.',
        confidence: 0.85,
        timestamp: Date.now()
      });
    }

    // Medium severity alerts
    if (safety.consistency_check.story_changes.length > 2) {
      alerts.push({
        id: `safety_inconsistent_${Date.now()}`,
        conversation_id: conversation.id,
        severity: 'medium',
        type: 'fake_profile',
        description: 'Multiple inconsistencies in their story detected',
        evidence: safety.consistency_check.story_changes,
        recommended_action: 'Ask clarifying questions about the inconsistencies.',
        confidence: 0.7,
        timestamp: Date.now()
      });
    }

    // Scammer detection
    const scammerAlert = await this.detectScammer(conversation);
    if (scammerAlert) {
      alerts.push(scammerAlert);
    }

    // Catfish detection
    const catfishAlert = await this.detectCatfish(conversation);
    if (catfishAlert) {
      alerts.push(catfishAlert);
    }

    return alerts;
  }

  async verifyProfile(profileData: any): Promise<ProfileVerification> {
    // This would integrate with reverse image search APIs
    // For now, we'll do basic analysis
    
    const verification: ProfileVerification = {
      platform: profileData.platform || 'unknown',
      photos_analyzed: profileData.photos?.length || 0,
      inconsistencies: [],
      reverse_image_matches: 0,
      profile_completeness: this.calculateProfileCompleteness(profileData),
      verification_score: 0.5,
      red_flags: [],
      green_flags: []
    };

    // Check profile completeness
    if (verification.profile_completeness < 0.3) {
      verification.red_flags.push('Very incomplete profile');
    } else if (verification.profile_completeness > 0.8) {
      verification.green_flags.push('Complete and detailed profile');
    }

    // Check for model-like photos (potential red flag)
    if (profileData.photos && profileData.photos.length > 0) {
      const modelPhotoAlert = await this.detectModelPhotos(profileData.photos);
      if (modelPhotoAlert) {
        verification.red_flags.push('Photos appear to be professional/model shots');
      }
    }

    // Calculate final verification score
    verification.verification_score = this.calculateVerificationScore(verification);

    return verification;
  }

  async trackSafetyMetrics(userId: string): Promise<{
    total_conversations: number;
    flagged_conversations: number;
    safety_incidents: number;
    avg_safety_score: number;
    most_common_red_flags: string[];
  }> {
    const conversations = await databaseManager.getAllConversations();
    const userConversations = conversations; // Would filter by user in real implementation
    
    let totalFlags = 0;
    let totalSafetyScore = 0;
    const redFlagCounts: {[key: string]: number} = {};

    for (const conversation of userConversations) {
      const safety = await this.analyzeSafety(conversation);
      totalSafetyScore += safety.overall_safety_score;
      
      if (safety.overall_safety_score < 0.7) {
        totalFlags++;
      }

      // Count red flag types
      safety.pressure_tactics.forEach(tactic => {
        redFlagCounts[tactic.type] = (redFlagCounts[tactic.type] || 0) + 1;
      });
    }

    const mostCommonRedFlags = Object.entries(redFlagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([flag]) => flag);

    return {
      total_conversations: userConversations.length,
      flagged_conversations: totalFlags,
      safety_incidents: totalFlags,
      avg_safety_score: userConversations.length > 0 ? totalSafetyScore / userConversations.length : 0,
      most_common_red_flags: mostCommonRedFlags
    };
  }

  private detectPressureTactics(messages: any[]): Array<{type: string, message: string, timestamp: number}> {
    const tactics: Array<{type: string, message: string, timestamp: number}> = [];
    
    for (const message of messages) {
      const text = message.text.toLowerCase();
      
      // Check for pressure phrases
      for (const tactic of this.pressureTactics) {
        if (text.includes(tactic.toLowerCase())) {
          tactics.push({
            type: tactic,
            message: message.text,
            timestamp: message.timestamp
          });
        }
      }
      
      // Check for urgency patterns
      if (text.includes('now') && (text.includes('need') || text.includes('want'))) {
        tactics.push({
          type: 'urgency_pressure',
          message: message.text,
          timestamp: message.timestamp
        });
      }
    }
    
    return tactics;
  }

  private detectInappropriateRequests(messages: any[]): Array<{request: string, severity: 'low' | 'medium' | 'high', timestamp: number}> {
    const requests: Array<{request: string, severity: 'low' | 'medium' | 'high', timestamp: number}> = [];
    
    for (const message of messages) {
      const text = message.text.toLowerCase();
      
      // High severity
      for (const pattern of this.dangerousPatterns) {
        if (pattern.test(text)) {
          requests.push({
            request: message.text,
            severity: 'high',
            timestamp: message.timestamp
          });
        }
      }
      
      // Medium severity
      if (text.includes('personal info') || text.includes('home address') || text.includes('where do you live')) {
        requests.push({
          request: message.text,
          severity: 'medium',
          timestamp: message.timestamp
        });
      }
      
      // Low severity
      if (text.includes('what\'s your number') && message.timestamp < Date.now() - (24 * 60 * 60 * 1000)) {
        requests.push({
          request: message.text,
          severity: 'low',
          timestamp: message.timestamp
        });
      }
    }
    
    return requests;
  }

  private async analyzeConsistency(messages: any[]): Promise<{
    story_changes: string[];
    timeline_inconsistencies: string[];
    fact_contradictions: string[];
  }> {
    // Use AI to detect inconsistencies
    const conversationText = messages.map(m => m.text).join('\n');
    
    const consistencyPrompt = `Analyze this conversation for inconsistencies in the person's story:

    ${conversationText}

    Look for:
    1. Changes in basic facts (age, location, job, etc.)
    2. Timeline inconsistencies
    3. Contradictory statements

    Return a JSON object with arrays of detected inconsistencies:
    {
      "story_changes": ["specific inconsistency 1", "specific inconsistency 2"],
      "timeline_inconsistencies": ["timeline issue 1"],
      "fact_contradictions": ["contradiction 1"]
    }`;

    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const response = await model.generateContent(consistencyPrompt);
      const result = JSON.parse(response.response.text());
      return result;
    } catch (error) {
      console.error('Error analyzing consistency:', error);
      return {
        story_changes: [],
        timeline_inconsistencies: [],
        fact_contradictions: []
      };
    }
  }

  private extractVerifiedInfo(messages: any[]): string[] {
    const verified: string[] = [];
    
    for (const message of messages) {
      const text = message.text.toLowerCase();
      
      // Look for specific, verifiable claims
      if (text.includes('work at') || text.includes('works at')) {
        verified.push('Work information provided');
      }
      if (text.includes('study at') || text.includes('university') || text.includes('college')) {
        verified.push('Education information provided');
      }
      if (text.includes('from') && (text.includes('city') || text.includes('town'))) {
        verified.push('Location information provided');
      }
    }
    
    return verified;
  }

  private async detectScammer(conversation: Conversation): Promise<SafetyAlert | null> {
    const contactMessages = conversation.messages.filter(m => m.sender === 'contact');
    const conversationText = contactMessages.map(m => m.text).join(' ').toLowerCase();
    
    // Check for common scammer keywords
    for (const keyword of this.scammerKeywords) {
      if (conversationText.includes(keyword.toLowerCase())) {
        return {
          id: `scammer_${Date.now()}`,
          conversation_id: conversation.id,
          severity: 'high',
          type: 'scammer',
          description: `Potential scammer detected - mentions "${keyword}"`,
          evidence: [`Uses scammer keyword: ${keyword}`],
          recommended_action: 'Be extremely cautious. This may be a romance scammer.',
          confidence: 0.8,
          timestamp: Date.now()
        };
      }
    }
    
    return null;
  }

  private async detectCatfish(conversation: Conversation): Promise<SafetyAlert | null> {
    const contactMessages = conversation.messages.filter(m => m.sender === 'contact');
    
    // Look for catfish patterns
    let suspiciousPatterns = 0;
    
    // Refuses video calls
    const videoRefusal = contactMessages.some(m => 
      m.text.toLowerCase().includes('video') && 
      (m.text.toLowerCase().includes('can\'t') || m.text.toLowerCase().includes('broken'))
    );
    if (videoRefusal) suspiciousPatterns++;
    
    // Asks for photos but won't send their own
    const photoAsymmetry = contactMessages.some(m => 
      m.text.toLowerCase().includes('send') && m.text.toLowerCase().includes('photo')
    );
    if (photoAsymmetry) suspiciousPatterns++;
    
    // Claims to travel constantly
    const constantTravel = contactMessages.some(m => 
      m.text.toLowerCase().includes('traveling') || 
      m.text.toLowerCase().includes('business trip')
    );
    if (constantTravel) suspiciousPatterns++;
    
    if (suspiciousPatterns >= 2) {
      return {
        id: `catfish_${Date.now()}`,
        conversation_id: conversation.id,
        severity: 'medium',
        type: 'catfish',
        description: 'Potential catfish - multiple suspicious patterns detected',
        evidence: [
          videoRefusal ? 'Refuses video calls' : '',
          photoAsymmetry ? 'Asks for photos but avoids sending own' : '',
          constantTravel ? 'Claims to be constantly traveling' : ''
        ].filter(Boolean),
        recommended_action: 'Request a video call or real-time photo before meeting.',
        confidence: 0.7,
        timestamp: Date.now()
      };
    }
    
    return null;
  }

  private calculateProfileCompleteness(profileData: any): number {
    let score = 0;
    const fields = ['name', 'age', 'location', 'bio', 'photos', 'interests', 'occupation'];
    
    fields.forEach(field => {
      if (profileData[field] && profileData[field].length > 0) {
        score += 1/fields.length;
      }
    });
    
    return score;
  }

  private async detectModelPhotos(photos: string[]): Promise<boolean> {
    // This would use image analysis APIs
    // For now, we'll return false
    return photos.length > 5; // Simplistic check - too many photos might be suspicious
  }

  private calculateVerificationScore(verification: ProfileVerification): number {
    let score = verification.profile_completeness;
    
    // Adjust based on red/green flags
    score -= verification.red_flags.length * 0.2;
    score += verification.green_flags.length * 0.1;
    
    // Adjust for reverse image matches (would be implemented with actual service)
    if (verification.reverse_image_matches > 0) {
      score -= 0.5;
    }
    
    return Math.max(0, Math.min(1, score));
  }
}

export { SafetyEngine };
