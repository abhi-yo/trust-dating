declare module 'electron-next' {
  function prepareNext(rendererDir: string, port?: number): Promise<void>;
  export = prepareNext;
}

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
  
  // Event listeners
  onUrlDetected: (callback: (url: string) => void) => void;
  onImageDetected: (callback: (filePath: string) => void) => void;
  onShowSettings: (callback: () => void) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
