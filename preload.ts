import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // Enhanced conversation analysis
  processChat: (chatData: {
    conversationId: string;
    platform: string;
    contact: string;
    newMessage: string;
    sender: 'user' | 'contact';
    allMessages?: Array<{text: string, timestamp: number, sender: 'user' | 'contact'}>;
  }) => ipcRenderer.invoke('process-chat', chatData),
  
  // Activity suggestions
  fetchActivities: (interests: string[]) => ipcRenderer.invoke('fetch-activities', interests),
  
  // Trust and safety analysis
  analyzeTrust: (profileData: { url?: string, imageFile?: string }) => ipcRenderer.invoke('analyze-trust', profileData),
  safetyCheck: (data: {
    type: 'message' | 'profile';
    content: string;
    conversationId?: string;
  }) => ipcRenderer.invoke('safety-check', data),
  
  // Advanced dating intelligence
  getConversationInsights: (conversationId: string) => ipcRenderer.invoke('get-conversation-insights', conversationId),
  provideAdviceFeedback: (data: {
    conversationId: string;
    adviceUsed: string;
    outcome: 'positive' | 'negative' | 'neutral';
    context: string;
  }) => ipcRenderer.invoke('provide-advice-feedback', data),
  getDatingDashboard: () => ipcRenderer.invoke('get-dating-dashboard'),
  updateUserPreferences: (preferences: any) => ipcRenderer.invoke('update-user-preferences', preferences),
  
  // Desktop-specific features
  captureScreen: () => ipcRenderer.invoke('capture-screen'),
  toggleAutoLaunch: (enabled: boolean) => ipcRenderer.invoke('toggle-auto-launch', enabled),
  saveVerificationReport: (reportData: any) => ipcRenderer.invoke('save-verification-report', reportData),
  
  // Event listeners for desktop features
  onUrlDetected: (callback: (url: string) => void) => 
    ipcRenderer.on('url-detected', (_event, url) => callback(url)),
  onImageDetected: (callback: (filePath: string) => void) => 
    ipcRenderer.on('image-detected', (_event, filePath) => callback(filePath)),
  onShowSettings: (callback: () => void) => 
    ipcRenderer.on('show-settings', () => callback()),

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
  }) => ipcRenderer.invoke('verify-profile-comprehensive', request),

  // Quick catfish detection from photos
  analyzePhotosCatfish: (photoPaths: string[]) => 
    ipcRenderer.invoke('analyze-photos-catfish', photoPaths),

  // Advanced conversation pattern analysis
  analyzeConversationAdvanced: (messages: Array<{
    sender: 'user' | 'match';
    content: string;
    timestamp: Date;
  }>) => ipcRenderer.invoke('analyze-conversation-advanced', messages),

  // Real-time safety check during conversation
  safetyCheckRealtime: (profileData: {
    profile?: any;
    social_links?: string[];
    photos?: string[];
    context?: any;
  }) => ipcRenderer.invoke('safety-check-realtime', profileData),

  // Export comprehensive verification report
  exportVerificationReport: (verificationData: any) => 
    ipcRenderer.invoke('export-verification-report', verificationData)
});
