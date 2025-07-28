/// <reference types="react" />
/// <reference types="react-dom" />

interface ElectronAPI {
  // Enhanced conversation analysis
  processChat: (chatData: {
    conversationId: string;
    platform: string;
    contact: string;
    newMessage: string;
    sender: 'user' | 'contact';
    allMessages?: Array<{text: string, timestamp: number, sender: 'user' | 'contact'}>;
  }) => Promise<{
    analysis: {
      sentiment: number;
      keywords: string[];
      tone: string;
      engagement: number;
      redFlags: string[];
      greenFlags: string[];
      suggestions: string[];
      nextSteps: string[];
    };
    advice: Array<{
      type: 'opener' | 'response' | 'topic_change' | 'escalation' | 'safety';
      message: string;
      explanation: string;
      confidence: number;
      timing: 'immediate' | 'wait_1h' | 'wait_3h' | 'wait_1d' | 'weekend';
      context: string;
    }>;
    insights: Array<{
      type: 'warning' | 'opportunity' | 'advice' | 'pattern';
      message: string;
      confidence: number;
      timestamp: number;
    }>;
    safety: {
      trust_score: number;
      conversation_health: number;
      alerts: Array<{
        severity: 'low' | 'medium' | 'high' | 'critical';
        type: string;
        description: string;
        recommended_action: string;
      }>;
    };
    metrics: {
      responseTime: number;
      messageLength: number;
      initiationRate: number;
      questionAsking: number;
      topicDiversity: number;
      emotionalDepth: number;
      interestLevel: number;
      reciprocity: number;
    };
  }>;
  
  // Activity suggestions
  fetchActivities: (interests: string[]) => Promise<string[]>;
  
  // Trust and safety analysis
  analyzeTrust: (profileData: { url?: string, imageFile?: string }) => Promise<{
    trustScore: number;
    verificationStatus: string;
    imageMatches: string[];
    socialProfiles: string[];
    redFlags: string[];
    positiveSignals: string[];
  }>;
  
  safetyCheck: (data: {
    type: 'message' | 'profile';
    content: string;
    conversationId?: string;
  }) => Promise<{
    safe: boolean;
    safety_score: number;
    alerts: Array<{
      severity: 'low' | 'medium' | 'high' | 'critical';
      type: string;
      description: string;
      recommended_action: string;
    }>;
  }>;
  
  // Advanced dating intelligence
  getConversationInsights: (conversationId: string) => Promise<{
    insights: Array<{
      type: string;
      message: string;
      confidence: number;
      timestamp: number;
    }>;
    recommendations: string[];
  }>;
  
  provideAdviceFeedback: (data: {
    conversationId: string;
    adviceUsed: string;
    outcome: 'positive' | 'negative' | 'neutral';
    context: string;
  }) => Promise<void>;
  
  getDatingDashboard: () => Promise<{
    conversations: Array<{
      id: string;
      contact: string;
      platform: string;
      trust_score: number;
      conversation_health: number;
      relationship_stage: string;
      last_interaction: number;
      message_count: number;
    }>;
    stats: {
      total_conversations: number;
      active_conversations: number;
      avg_trust_score: number;
      avg_conversation_health: number;
      dates_secured: number;
      positive_responses: number;
      success_rate: number;
    };
    insights: Array<{
      type: string;
      message: string;
      confidence: number;
      timestamp: number;
    }>;
  }>;
  
  updateUserPreferences: (preferences: any) => Promise<{ success: boolean; error?: string }>;
  
  // Desktop-specific features
  captureScreen: () => Promise<{ success: boolean; data?: any; error?: string }>;
  toggleAutoLaunch: (enabled: boolean) => Promise<{ success: boolean; enabled?: boolean; error?: string }>;
  saveVerificationReport: (reportData: any) => Promise<{ success: boolean; filePath?: string; cancelled?: boolean; error?: string }>;
  setAppOpacity: (opacity: number) => Promise<{ success: boolean }>;
  getAppOpacity: () => Promise<{ opacity: number }>;
  
  // Event listeners
  onUrlDetected: (callback: (url: string) => void) => void;
  onImageDetected: (callback: (filePath: string) => void) => void;
  onShowSettings: (callback: () => void) => void;

  // ADVANCED VERIFICATION SYSTEM APIs
  
  // Comprehensive profile verification with real algorithms
  verifyProfileComprehensive: (request: {
    photos?: string[];
    profile_urls?: string[];
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
  }) => Promise<{
    overall_trust_score: number;
    risk_level: 'very_low' | 'low' | 'medium' | 'high' | 'critical';
    facial_verification: {
      consistency_across_photos: number;
      deepfake_probability: number;
      professional_model_likelihood: number;
      age_progression_natural: boolean;
    };
    digital_footprint: {
      social_media_authenticity: number;
      web_presence_depth: number;
      cross_platform_consistency: number;
      friend_network_quality: number;
    };
    conversation_intelligence: {
      response_pattern_human: number;
      language_authenticity: number;
      emotional_manipulation_detected: boolean;
      scam_pattern_matches: string[];
    };
    likelihood_assessments: {
      catfish_probability: number;
      scammer_probability: number;
      bot_probability: number;
      genuine_person_probability: number;
    };
    critical_warnings: string[];
    immediate_threats: string[];
    safety_recommendations: string[];
    verification_steps: string[];
    conversation_recommendations: string[];
    protection_measures: string[];
  }>;

  // Quick catfish detection from photos
  analyzePhotosCatfish: (photoPaths: string[]) => Promise<{
    catfish_risk: number;
    face_consistency: number;
    deepfake_probability: number;
    professional_likelihood: number;
    reverse_search_hits: number;
    red_flags: string[];
    recommendation: string;
  }>;

  // Advanced conversation pattern analysis
  analyzeConversationAdvanced: (messages: Array<{
    sender: 'user' | 'match';
    content: string;
    timestamp: Date;
  }>) => Promise<{
    authenticity_score: number;
    scammer_probability: number;
    bot_probability: number;
    emotional_manipulation: boolean;
    language_authenticity: number;
    scammer_type: string | null;
    red_flags: Array<{
      pattern_type: string;
      confidence: number;
      indicators: string[];
      severity: 'low' | 'medium' | 'high' | 'critical';
    }>;
    immediate_threats: string[];
    safety_recommendations: string[];
    next_likely_moves: string[];
    countermeasures: string[];
  }>;

  // Real-time safety check during conversation
  safetyCheckRealtime: (profileData: {
    profile?: any;
    social_links?: string[];
    photos?: string[];
    context?: any;
  }) => Promise<{
    is_safe: boolean;
    trust_score: number;
    risk_level: 'very_low' | 'low' | 'medium' | 'high' | 'critical';
    critical_warnings: string[];
    immediate_threats: string[];
    verification_needed: string[];
    protection_measures: string[];
    should_continue: boolean;
    emergency_stop: boolean;
  }>;

  // Export comprehensive verification report
  exportVerificationReport: (verificationData: any) => Promise<{
    success: boolean;
    path?: string;
    message?: string;
  }>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
