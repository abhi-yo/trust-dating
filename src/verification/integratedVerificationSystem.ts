import { AdvancedCatfishDetector, CatfishAnalysis, ProfileVerificationResult } from './advancedCatfishDetector';
import { BehavioralAnalysisEngine, ConversationAnalysis, ScammerProfile } from './behavioralAnalysisEngine';
import * as fs from 'fs';
import * as path from 'path';

export interface ComprehensiveVerificationResult {
  overall_trust_score: number; // 0-100 (100 = completely trustworthy)
  risk_level: 'very_low' | 'low' | 'medium' | 'high' | 'critical';
  
  // Core Analysis Results
  catfish_analysis: CatfishAnalysis;
  behavioral_analysis: ConversationAnalysis;
  profile_verification: ProfileVerificationResult;
  scammer_profile: ScammerProfile | null;
  
  // Advanced Algorithms
  facial_verification: {
    consistency_across_photos: number; // 0-100
    deepfake_probability: number; // 0-100
    professional_model_likelihood: number; // 0-100
    age_progression_natural: boolean;
  };
  
  digital_footprint: {
    social_media_authenticity: number; // 0-100
    web_presence_depth: number; // years of verifiable presence
    cross_platform_consistency: number; // 0-100
    friend_network_quality: number; // 0-100
  };
  
  conversation_intelligence: {
    response_pattern_human: number; // 0-100
    language_authenticity: number; // 0-100
    emotional_manipulation_detected: boolean;
    scam_pattern_matches: string[];
  };
  
  // Real-time Red Flags
  critical_warnings: string[];
  immediate_threats: string[];
  safety_recommendations: string[];
  
  // Predictive Analysis
  likelihood_assessments: {
    catfish_probability: number; // 0-100
    scammer_probability: number; // 0-100
    bot_probability: number; // 0-100
    genuine_person_probability: number; // 0-100
  };
  
  // Actionable Intelligence
  verification_steps: string[];
  conversation_recommendations: string[];
  protection_measures: string[];
}

export interface VerificationRequest {
  photos?: string[]; // File paths to photos
  profile_urls?: string[]; // Social media URLs
  conversation_messages?: Array<{
    sender: 'user' | 'match';
    content: string;
    timestamp: Date;
    read_receipt?: boolean;
  }>;
  profile_data?: {
    name?: string;
    age?: number;
    location?: string;
    profession?: string;
    bio?: string;
  };
  additional_context?: {
    platform: string;
    match_duration_days: number;
    video_call_attempted: boolean;
    phone_call_attempted: boolean;
    meeting_attempted: boolean;
  };
}

class IntegratedVerificationSystem {
  private catfishDetector: AdvancedCatfishDetector;
  private behavioralEngine: BehavioralAnalysisEngine;
  private verificationCache: Map<string, ComprehensiveVerificationResult> = new Map();

  constructor() {
    this.catfishDetector = new AdvancedCatfishDetector();
    this.behavioralEngine = new BehavioralAnalysisEngine();
  }

  async performComprehensiveVerification(request: VerificationRequest): Promise<ComprehensiveVerificationResult> {
    console.log('🔍 Starting comprehensive verification analysis...');

    // Initialize result structure
    const result: ComprehensiveVerificationResult = {
      overall_trust_score: 50,
      risk_level: 'medium',
      catfish_analysis: this.getDefaultCatfishAnalysis(),
      behavioral_analysis: this.getDefaultBehavioralAnalysis(),
      profile_verification: this.getDefaultProfileVerification(),
      scammer_profile: null,
      facial_verification: {
        consistency_across_photos: 50,
        deepfake_probability: 0,
        professional_model_likelihood: 0,
        age_progression_natural: true
      },
      digital_footprint: {
        social_media_authenticity: 50,
        web_presence_depth: 0,
        cross_platform_consistency: 50,
        friend_network_quality: 50
      },
      conversation_intelligence: {
        response_pattern_human: 50,
        language_authenticity: 50,
        emotional_manipulation_detected: false,
        scam_pattern_matches: []
      },
      critical_warnings: [],
      immediate_threats: [],
      safety_recommendations: [],
      likelihood_assessments: {
        catfish_probability: 50,
        scammer_probability: 50,
        bot_probability: 50,
        genuine_person_probability: 50
      },
      verification_steps: [],
      conversation_recommendations: [],
      protection_measures: []
    };

    // 1. IMAGE & CATFISH ANALYSIS
    if (request.photos && request.photos.length > 0) {
      console.log('📸 Analyzing photos for catfish indicators...');
      try {
        result.catfish_analysis = await this.catfishDetector.analyzeCatfishRisk(
          request.photos,
          request.profile_data || {}
        );
        
        // Extract facial verification data
        result.facial_verification = {
          consistency_across_photos: result.catfish_analysis.face_analysis.face_match_across_photos,
          deepfake_probability: result.catfish_analysis.face_analysis.deepfake_probability,
          professional_model_likelihood: result.catfish_analysis.face_analysis.professional_photo_likelihood,
          age_progression_natural: result.catfish_analysis.behavioral_patterns.photo_progression_natural
        };
        
        console.log(`📊 Catfish risk score: ${result.catfish_analysis.overall_risk_score}%`);
      } catch (error) {
        console.error('Photo analysis failed:', error);
        result.critical_warnings.push('Photo analysis failed - unable to verify image authenticity');
      }
    }

    // 2. PROFILE VERIFICATION
    if (request.profile_urls && request.profile_urls.length > 0) {
      console.log('🌐 Verifying social media profiles...');
      try {
        result.profile_verification = await this.catfishDetector.verifyProfile(
          request.profile_urls[0],
          request.profile_urls
        );
        
        // Extract digital footprint data
        result.digital_footprint = {
          social_media_authenticity: result.profile_verification.social_footprint.friend_network_analysis.network_authenticity,
          web_presence_depth: result.profile_verification.digital_footprint.web_presence_years,
          cross_platform_consistency: result.profile_verification.social_footprint.consistency_across_platforms,
          friend_network_quality: result.profile_verification.social_footprint.friend_network_analysis.network_authenticity
        };
        
        console.log(`🔗 Profile legitimacy: ${result.profile_verification.profile_legitimacy}%`);
      } catch (error) {
        console.error('Profile verification failed:', error);
        result.critical_warnings.push('Profile verification failed - unable to validate social media presence');
      }
    }

    // 3. BEHAVIORAL ANALYSIS
    if (request.conversation_messages && request.conversation_messages.length > 0) {
      console.log('💬 Analyzing conversation patterns...');
      try {
        result.behavioral_analysis = await this.behavioralEngine.analyzeConversation(
          request.conversation_messages
        );
        
        // Extract conversation intelligence
        result.conversation_intelligence = {
          response_pattern_human: result.behavioral_analysis.message_patterns.response_time_analysis.consistency_score,
          language_authenticity: result.behavioral_analysis.message_patterns.language_analysis.native_speaker_probability,
          emotional_manipulation_detected: result.behavioral_analysis.message_patterns.emotional_patterns.emotional_manipulation_score > 50,
          scam_pattern_matches: result.behavioral_analysis.behavioral_red_flags.map(flag => flag.pattern_type)
        };
        
        // Detect specific scammer type
        result.scammer_profile = await this.behavioralEngine.detectScammerType(
          request.conversation_messages
        );
        
        console.log(`🧠 Authenticity score: ${result.behavioral_analysis.authenticity_score}%`);
      } catch (error) {
        console.error('Behavioral analysis failed:', error);
        result.critical_warnings.push('Behavioral analysis failed - unable to analyze conversation patterns');
      }
    }

    // 4. ADVANCED ALGORITHMIC ANALYSIS
    await this.performAdvancedAnalysis(request, result);

    // 5. CALCULATE OVERALL SCORES
    this.calculateOverallScores(result);

    // 6. GENERATE ACTIONABLE RECOMMENDATIONS
    this.generateRecommendations(request, result);

    // 7. ASSESS IMMEDIATE THREATS
    this.assessImmediateThreats(result);

    console.log(`✅ Verification complete. Overall trust score: ${result.overall_trust_score}%`);
    console.log(`⚠️  Risk level: ${result.risk_level.toUpperCase()}`);

    return result;
  }

  private async performAdvancedAnalysis(
    request: VerificationRequest,
    result: ComprehensiveVerificationResult
  ): Promise<void> {
    console.log('🔬 Performing advanced algorithmic analysis...');

    // Cross-reference analysis
    await this.crossReferenceFindings(result);

    // Pattern correlation
    await this.correlatePatterns(result);

    // Timeline analysis
    if (request.additional_context) {
      await this.analyzeTimeline(request.additional_context, result);
    }

    // Predictive modeling
    await this.calculateLikelihoodAssessments(result);
  }

  private async crossReferenceFindings(result: ComprehensiveVerificationResult): Promise<void> {
    // Cross-reference catfish analysis with behavioral patterns
    const imageRiskHigh = result.catfish_analysis.overall_risk_score > 70;
    const behaviorRiskHigh = result.behavioral_analysis.authenticity_score < 30;
    
    if (imageRiskHigh && behaviorRiskHigh) {
      result.critical_warnings.push('HIGH RISK: Both image analysis and behavioral patterns indicate potential fraud');
      result.immediate_threats.push('Multiple verification systems flagged this profile as suspicious');
    }

    // Cross-reference reverse image search with social media verification
    const reverseImageHits = result.catfish_analysis.image_forensics.reverse_search_matches.length;
    const socialMediaWeak = result.profile_verification.profile_legitimacy < 40;
    
    if (reverseImageHits > 3 && socialMediaWeak) {
      result.critical_warnings.push('Photos found elsewhere online combined with weak social media presence');
    }

    // Language patterns vs claimed location
    const nonNativeSpeaker = result.behavioral_analysis.message_patterns.language_analysis.native_speaker_probability < 50;
    if (nonNativeSpeaker && result.profile_verification.location_verification.ip_location_consistency === false) {
      result.critical_warnings.push('Language patterns inconsistent with claimed location');
    }
  }

  private async correlatePatterns(result: ComprehensiveVerificationResult): Promise<void> {
    // Professional photos + script-like language = model/catfish
    const professionalPhotos = result.facial_verification.professional_model_likelihood > 70;
    const scriptLanguage = result.behavioral_analysis.message_patterns.language_analysis.script_following_probability > 60;
    
    if (professionalPhotos && scriptLanguage) {
      result.likelihood_assessments.catfish_probability += 30;
      result.critical_warnings.push('Professional photos combined with scripted language patterns');
    }

    // Fast emotional escalation + money requests = romance scammer
    const loveBoarding = result.behavioral_analysis.message_patterns.emotional_patterns.love_bombing_detected;
    const scammerFlags = result.behavioral_analysis.behavioral_red_flags.filter(f => f.pattern_type === 'scammer');
    
    if (loveBoarding && scammerFlags.length > 0) {
      result.likelihood_assessments.scammer_probability += 40;
      result.immediate_threats.push('Romance scammer pattern detected: fast emotional escalation with financial requests');
    }

    // Consistent timing + copy-paste language = bot
    const consistentTiming = result.behavioral_analysis.message_patterns.response_time_analysis.suspicious_timing;
    const copyPasteHigh = result.behavioral_analysis.message_patterns.language_analysis.copy_paste_likelihood > 70;
    
    if (consistentTiming && copyPasteHigh) {
      result.likelihood_assessments.bot_probability += 35;
      result.critical_warnings.push('Automated/bot behavior detected in conversation patterns');
    }
  }

  private async analyzeTimeline(
    context: NonNullable<VerificationRequest['additional_context']>,
    result: ComprehensiveVerificationResult
  ): Promise<void> {
    // Analyze progression speed
    if (context.match_duration_days < 7) {
      const earlyRedFlags = result.behavioral_analysis.behavioral_red_flags.length;
      if (earlyRedFlags > 2) {
        result.critical_warnings.push('Multiple red flags detected within first week of contact');
      }
    }

    // Video/call avoidance analysis
    if (context.match_duration_days > 14) {
      if (!context.video_call_attempted && !context.phone_call_attempted) {
        result.critical_warnings.push('No voice/video contact after 2+ weeks - avoidance pattern');
        result.likelihood_assessments.catfish_probability += 25;
      }
    }

    // Meeting avoidance
    if (context.match_duration_days > 30 && !context.meeting_attempted) {
      result.critical_warnings.push('No meeting attempts after 1+ month - possible catfish/scammer');
      result.likelihood_assessments.catfish_probability += 20;
    }
  }

  private async calculateLikelihoodAssessments(result: ComprehensiveVerificationResult): Promise<void> {
    // Catfish probability calculation
    result.likelihood_assessments.catfish_probability = Math.min(100, 
      (result.catfish_analysis.overall_risk_score * 0.4) +
      ((100 - result.facial_verification.consistency_across_photos) * 0.3) +
      (result.facial_verification.professional_model_likelihood * 0.3)
    );

    // Scammer probability calculation
    const scammerPatterns = result.behavioral_analysis.behavioral_red_flags.filter(f => 
      f.pattern_type === 'scammer'
    ).length;
    
    result.likelihood_assessments.scammer_probability = Math.min(100,
      (scammerPatterns * 25) +
      (result.behavioral_analysis.message_patterns.emotional_patterns.emotional_manipulation_score * 0.5) +
      (result.conversation_intelligence.emotional_manipulation_detected ? 30 : 0)
    );

    // Bot probability calculation
    result.likelihood_assessments.bot_probability = Math.min(100,
      (result.behavioral_analysis.message_patterns.language_analysis.copy_paste_likelihood * 0.6) +
      (result.behavioral_analysis.message_patterns.response_time_analysis.suspicious_timing ? 40 : 0)
    );

    // Genuine person probability (inverse calculation)
    const avgNegative = (
      result.likelihood_assessments.catfish_probability +
      result.likelihood_assessments.scammer_probability +
      result.likelihood_assessments.bot_probability
    ) / 3;
    
    result.likelihood_assessments.genuine_person_probability = Math.max(0, 100 - avgNegative);
  }

  private calculateOverallScores(result: ComprehensiveVerificationResult): void {
    // Weighted scoring system
    const weights = {
      catfish_analysis: 0.25,
      behavioral_analysis: 0.30,
      profile_verification: 0.20,
      facial_verification: 0.15,
      digital_footprint: 0.10
    };

    let trustScore = 0;

    // Catfish analysis contribution (inverted - lower risk = higher trust)
    trustScore += (100 - result.catfish_analysis.overall_risk_score) * weights.catfish_analysis;

    // Behavioral analysis contribution
    trustScore += result.behavioral_analysis.authenticity_score * weights.behavioral_analysis;

    // Profile verification contribution
    trustScore += result.profile_verification.profile_legitimacy * weights.profile_verification;

    // Facial verification contribution
    const faceScore = (
      result.facial_verification.consistency_across_photos +
      (100 - result.facial_verification.deepfake_probability) +
      (100 - result.facial_verification.professional_model_likelihood)
    ) / 3;
    trustScore += faceScore * weights.facial_verification;

    // Digital footprint contribution
    const digitalScore = (
      result.digital_footprint.social_media_authenticity +
      Math.min(100, result.digital_footprint.web_presence_depth * 20) +
      result.digital_footprint.cross_platform_consistency
    ) / 3;
    trustScore += digitalScore * weights.digital_footprint;

    // Apply critical warning penalties
    const criticalPenalty = result.critical_warnings.length * 10;
    const threatPenalty = result.immediate_threats.length * 15;
    
    result.overall_trust_score = Math.max(0, Math.min(100, trustScore - criticalPenalty - threatPenalty));

    // Determine risk level
    if (result.overall_trust_score >= 80) result.risk_level = 'very_low';
    else if (result.overall_trust_score >= 60) result.risk_level = 'low';
    else if (result.overall_trust_score >= 40) result.risk_level = 'medium';
    else if (result.overall_trust_score >= 20) result.risk_level = 'high';
    else result.risk_level = 'critical';
  }

  private generateRecommendations(
    request: VerificationRequest,
    result: ComprehensiveVerificationResult
  ): void {
    // Verification steps
    if (result.facial_verification.consistency_across_photos < 70) {
      result.verification_steps.push('Request a live video call with specific gestures or poses');
      result.verification_steps.push('Ask for a selfie with today\'s newspaper or specific sign');
    }

    if (result.digital_footprint.social_media_authenticity < 50) {
      result.verification_steps.push('Verify social media profiles by checking tagged photos by others');
      result.verification_steps.push('Look for mutual friends or connections');
    }

    if (result.conversation_intelligence.language_authenticity < 60) {
      result.verification_steps.push('Test with local cultural references or slang');
      result.verification_steps.push('Ask spontaneous questions that require immediate responses');
    }

    // Conversation recommendations
    if (result.likelihood_assessments.scammer_probability > 50) {
      result.conversation_recommendations.push('Avoid sharing personal information (address, workplace, financial details)');
      result.conversation_recommendations.push('Be wary of emotional manipulation tactics');
      result.conversation_recommendations.push('Never send money, gift cards, or financial assistance');
    }

    if (result.likelihood_assessments.catfish_probability > 60) {
      result.conversation_recommendations.push('Insist on video calls before developing emotional attachment');
      result.conversation_recommendations.push('Ask for verification photos with specific requirements');
      result.conversation_recommendations.push('Be cautious of reasons for avoiding face-to-face contact');
    }

    // Protection measures
    result.protection_measures.push('Never share financial information or send money');
    result.protection_measures.push('Meet in public places for first meetings');
    result.protection_measures.push('Tell friends/family about your dating activities');
    result.protection_measures.push('Trust your instincts - if something feels off, investigate further');
    
    if (result.risk_level === 'high' || result.risk_level === 'critical') {
      result.protection_measures.push('Consider ending communication due to high risk indicators');
      result.protection_measures.push('Report suspicious profiles to the dating platform');
      result.protection_measures.push('Consider contacting authorities if threats or scams are involved');
    }
  }

  private assessImmediateThreats(result: ComprehensiveVerificationResult): void {
    // Money request threats
    const moneyPatterns = result.behavioral_analysis.behavioral_red_flags.filter(flag => 
      flag.indicators.some(indicator => indicator.toLowerCase().includes('money'))
    );
    
    if (moneyPatterns.length > 0) {
      result.immediate_threats.push('FINANCIAL SCAM ALERT: Money requests detected in conversation');
    }

    // Sextortion threats
    if (result.scammer_profile?.scammer_type === 'sextortion') {
      result.immediate_threats.push('SEXTORTION RISK: Pattern indicates potential blackmail scheme');
    }

    // Information harvesting
    const infoHarvesting = result.behavioral_analysis.behavioral_red_flags.filter(flag =>
      flag.indicators.some(indicator => indicator.includes('Information request'))
    );
    
    if (infoHarvesting.length > 0) {
      result.immediate_threats.push('IDENTITY THEFT RISK: Suspicious information gathering detected');
    }

    // Deepfake detection
    if (result.facial_verification.deepfake_probability > 70) {
      result.immediate_threats.push('DEEPFAKE ALERT: AI-generated images detected - not a real person');
    }

    // Critical catfish indicators
    if (result.likelihood_assessments.catfish_probability > 80) {
      result.immediate_threats.push('CATFISH ALERT: High probability of fake identity');
    }
  }

  // Default data structures for initialization
  private getDefaultCatfishAnalysis(): CatfishAnalysis {
    return {
      overall_risk_score: 0,
      face_analysis: {
        faces_detected: 0,
        age_consistency: true,
        gender_consistency: true,
        face_match_across_photos: 0,
        professional_photo_likelihood: 0,
        deepfake_probability: 0
      },
      image_forensics: {
        reverse_search_matches: [],
        metadata_analysis: {
          camera_consistency: true,
          location_consistency: true,
          timestamp_analysis: [],
          editing_software_detected: []
        },
        technical_indicators: {
          compression_artifacts: false,
          upscaling_detected: false,
          noise_pattern_analysis: 'normal',
          color_space_inconsistencies: false
        }
      },
      behavioral_patterns: {
        photo_progression_natural: true,
        lighting_consistency: 0,
        background_analysis: [],
        clothing_style_consistency: true,
        body_proportions_consistent: true
      },
      social_verification: {
        cross_platform_presence: [],
        mutual_connections_verified: 0,
        tagged_photos_by_others: 0,
        social_graph_authenticity: 0
      },
      red_flags: [],
      authenticity_score: 50
    };
  }

  private getDefaultBehavioralAnalysis(): ConversationAnalysis {
    return {
      message_patterns: {
        response_time_analysis: {
          average_response_time: 0,
          consistency_score: 50,
          timezone_indicators: [],
          suspicious_timing: false
        },
        language_analysis: {
          grammar_consistency: 50,
          vocabulary_sophistication: 50,
          native_speaker_probability: 50,
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
  }

  private getDefaultProfileVerification(): ProfileVerificationResult {
    return {
      profile_legitimacy: 50,
      social_footprint: {
        platforms_found: [],
        account_ages: [],
        consistency_across_platforms: 50,
        friend_network_analysis: {
          total_connections: 0,
          mutual_friends: 0,
          network_authenticity: 50
        }
      },
      digital_footprint: {
        web_presence_years: 0,
        professional_presence: false,
        news_mentions: [],
        public_records_match: false
      },
      location_verification: {
        stated_location: '',
        verified_locations: [],
        ip_location_consistency: false,
        check_ins_authentic: false
      },
      verification_confidence: 50
    };
  }

  async cleanup(): Promise<void> {
    await this.catfishDetector.cleanup();
    this.verificationCache.clear();
  }
}

export { IntegratedVerificationSystem };
