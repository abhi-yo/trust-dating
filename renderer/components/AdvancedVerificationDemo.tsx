import React, { useState, useEffect } from 'react';

interface AdvancedVerificationDemoProps {
  isVisible: boolean;
}

const AdvancedVerificationDemo: React.FC<AdvancedVerificationDemoProps> = ({ isVisible }) => {
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeDemo, setActiveDemo] = useState<'photos' | 'conversation' | 'comprehensive'>('comprehensive');

  // Demo data
  const demoPhotos = ['/demo/profile1.jpg', '/demo/profile2.jpg', '/demo/profile3.jpg'];
  const demoConversation = [
    { sender: 'match' as const, content: 'Hey beautiful! You look amazing in your photos', timestamp: new Date() },
    { sender: 'user' as const, content: 'Thank you! How was your day?', timestamp: new Date() },
    { sender: 'match' as const, content: 'It was good! I am deployed overseas right now as a soldier', timestamp: new Date() },
    { sender: 'user' as const, content: 'Oh interesting, where are you stationed?', timestamp: new Date() },
    { sender: 'match' as const, content: 'I cannot say for security reasons. But I really need someone to talk to', timestamp: new Date() },
    { sender: 'user' as const, content: 'I understand. How long have you been deployed?', timestamp: new Date() },
    { sender: 'match' as const, content: 'About 6 months. My dear, I have fallen in love with you already. You are my soulmate', timestamp: new Date() },
    { sender: 'user' as const, content: 'That seems very fast...', timestamp: new Date() },
    { sender: 'match' as const, content: 'True love knows no time limits! I want to come visit you but I need money for flight ticket', timestamp: new Date() }
  ];

  const demoProfileData = {
    name: 'John Anderson',
    age: 34,
    location: 'Los Angeles, CA',
    profession: 'Military Officer',
    bio: 'Looking for true love and meaningful connection. Currently deployed overseas.'
  };

  const handleComprehensiveVerification = async () => {
    if (!window.electronAPI?.verifyProfileComprehensive) {
      console.error('Advanced verification system not available');
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await window.electronAPI.verifyProfileComprehensive({
        photos: demoPhotos,
        profile_urls: ['https://instagram.com/johna_military', 'https://facebook.com/john.anderson.soldier'],
        conversation_messages: demoConversation,
        profile_data: demoProfileData,
        additional_context: {
          platform: 'Tinder',
          match_duration_days: 3,
          video_call_attempted: false,
          phone_call_attempted: false,
          meeting_attempted: false
        }
      });
      
      setVerificationResult(result);
    } catch (error) {
      console.error('Verification failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePhotoAnalysis = async () => {
    if (!window.electronAPI?.analyzePhotosCatfish) return;
    
    setIsAnalyzing(true);
    try {
      const result = await window.electronAPI.analyzePhotosCatfish(demoPhotos);
      setVerificationResult({ photo_analysis: result });
    } catch (error) {
      console.error('Photo analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConversationAnalysis = async () => {
    if (!window.electronAPI?.analyzeConversationAdvanced) return;
    
    setIsAnalyzing(true);
    try {
      const result = await window.electronAPI.analyzeConversationAdvanced(demoConversation);
      setVerificationResult({ conversation_analysis: result });
    } catch (error) {
      console.error('Conversation analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const exportReport = async () => {
    if (!verificationResult || !window.electronAPI?.exportVerificationReport) return;
    
    try {
      const result = await window.electronAPI.exportVerificationReport(verificationResult);
      if (result.success) {
        alert(`Report exported successfully to: ${result.path}`);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'very_low': return '#10b981';
      case 'low': return '#3b82f6';
      case 'medium': return '#f59e0b';
      case 'high': return '#f97316';
      case 'critical': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getTrustScoreColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#3b82f6';
    if (score >= 40) return '#f59e0b';
    if (score >= 20) return '#f97316';
    return '#ef4444';
  };

  if (!isVisible) return null;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-white border rounded-lg shadow-sm">
        <div className="border-b p-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            🛡️ Advanced Dating Verification System
          </h2>
          <p className="text-gray-600 mt-2">
            Real algorithmic verification beyond AI APIs - Advanced catfish detection, behavioral analysis, and comprehensive safety assessment
          </p>
        </div>
        
        <div className="p-6">
          <div className="border-b mb-6">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveDemo('comprehensive')}
                className={`pb-2 px-1 border-b-2 font-medium text-sm ${
                  activeDemo === 'comprehensive' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'
                }`}
              >
                🛡️ Comprehensive
              </button>
              <button
                onClick={() => setActiveDemo('photos')}
                className={`pb-2 px-1 border-b-2 font-medium text-sm ${
                  activeDemo === 'photos' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'
                }`}
              >
                📸 Photo Analysis
              </button>
              <button
                onClick={() => setActiveDemo('conversation')}
                className={`pb-2 px-1 border-b-2 font-medium text-sm ${
                  activeDemo === 'conversation' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'
                }`}
              >
                💬 Conversation
              </button>
            </nav>
          </div>

          {activeDemo === 'comprehensive' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium text-sm mb-2">Facial Recognition</h3>
                  <div className="text-xs text-gray-600">
                    • Face consistency analysis<br/>
                    • Deepfake detection<br/>
                    • Professional photo detection<br/>
                    • Age progression verification
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium text-sm mb-2">Behavioral Analysis</h3>
                  <div className="text-xs text-gray-600">
                    • Response timing patterns<br/>
                    • Language authenticity<br/>
                    • Emotional manipulation detection<br/>
                    • Scammer pattern matching
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium text-sm mb-2">Digital Footprint</h3>
                  <div className="text-xs text-gray-600">
                    • Social media verification<br/>
                    • Cross-platform consistency<br/>
                    • Web presence analysis<br/>
                    • Friend network quality
                  </div>
                </div>
              </div>
              
              <button 
                onClick={handleComprehensiveVerification}
                disabled={isAnalyzing}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium disabled:opacity-50"
              >
                {isAnalyzing ? 'Analyzing...' : 'Run Comprehensive Verification'}
              </button>
            </div>
          )}

          {activeDemo === 'photos' && (
            <div className="space-y-4">
              <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900">📸 Photo Analysis Features</h4>
                <p className="text-blue-800 text-sm mt-1">
                  Reverse image search, facial recognition, deepfake detection, professional photo identification, and metadata analysis
                </p>
              </div>
              
              <button 
                onClick={handlePhotoAnalysis}
                disabled={isAnalyzing}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium disabled:opacity-50"
              >
                {isAnalyzing ? 'Analyzing Photos...' : 'Analyze Demo Photos'}
              </button>
            </div>
          )}

          {activeDemo === 'conversation' && (
            <div className="space-y-4">
              <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900">💬 Conversation Analysis Features</h4>
                <p className="text-blue-800 text-sm mt-1">
                  Scammer pattern detection, emotional manipulation analysis, response timing evaluation, and language authenticity assessment
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg max-h-40 overflow-y-auto">
                <div className="text-sm font-medium mb-2">Demo Conversation:</div>
                {demoConversation.slice(0, 3).map((msg, idx) => (
                  <div key={idx} className="text-xs mb-1">
                    <span className="font-semibold">{msg.sender}:</span> {msg.content}
                  </div>
                ))}
                <div className="text-xs text-gray-500">... and 6 more messages</div>
              </div>
              
              <button 
                onClick={handleConversationAnalysis}
                disabled={isAnalyzing}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium disabled:opacity-50"
              >
                {isAnalyzing ? 'Analyzing Conversation...' : 'Analyze Demo Conversation'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Results Display */}
      {verificationResult && (
        <div className="space-y-6">
          {/* Overall Trust Score */}
          {verificationResult.overall_trust_score !== undefined && (
            <div className="bg-white border rounded-lg shadow-sm">
              <div className="border-b p-4 flex items-center justify-between">
                <h3 className="font-semibold">✅ Verification Results</h3>
                <button 
                  onClick={exportReport} 
                  className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded border"
                >
                  📄 Export Report
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium mb-2">Overall Trust Score</div>
                    <div 
                      className="text-3xl font-bold"
                      style={{ color: getTrustScoreColor(verificationResult.overall_trust_score) }}
                    >
                      {verificationResult.overall_trust_score}%
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="h-2 rounded-full" 
                        style={{ 
                          width: `${verificationResult.overall_trust_score}%`,
                          backgroundColor: getTrustScoreColor(verificationResult.overall_trust_score)
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium mb-2">Risk Level</div>
                    <span 
                      className="px-2 py-1 rounded text-white text-sm font-medium"
                      style={{ backgroundColor: getRiskColor(verificationResult.risk_level) }}
                    >
                      {verificationResult.risk_level?.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Likelihood Assessments */}
                {verificationResult.likelihood_assessments && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Risk Assessments</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span>Catfish Probability:</span>
                        <span className="font-semibold">{verificationResult.likelihood_assessments.catfish_probability}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Scammer Probability:</span>
                        <span className="font-semibold">{verificationResult.likelihood_assessments.scammer_probability}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Bot Probability:</span>
                        <span className="font-semibold">{verificationResult.likelihood_assessments.bot_probability}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Genuine Person:</span>
                        <span className="font-semibold text-green-600">{verificationResult.likelihood_assessments.genuine_person_probability}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Critical Warnings */}
          {verificationResult.critical_warnings?.length > 0 && (
            <div className="border border-red-200 bg-red-50 rounded-lg p-4">
              <h4 className="font-medium text-red-900 flex items-center gap-2">
                ⚠️ Critical Warnings
              </h4>
              <ul className="list-disc list-inside space-y-1 text-red-800 text-sm mt-2">
                {verificationResult.critical_warnings.map((warning: string, idx: number) => (
                  <li key={idx}>{warning}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Immediate Threats */}
          {verificationResult.immediate_threats?.length > 0 && (
            <div className="border border-red-200 bg-red-50 rounded-lg p-4">
              <h4 className="font-medium text-red-900 flex items-center gap-2">
                🚨 Immediate Threats
              </h4>
              <ul className="list-disc list-inside space-y-1 text-red-800 text-sm mt-2">
                {verificationResult.immediate_threats.map((threat: string, idx: number) => (
                  <li key={idx}>{threat}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Analysis Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Facial Verification */}
            {verificationResult.facial_verification && (
              <div className="bg-white border rounded-lg p-4">
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  👁️ Facial Analysis
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span>Face Consistency:</span>
                    <span className="font-semibold">{verificationResult.facial_verification.consistency_across_photos}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Deepfake Risk:</span>
                    <span className="font-semibold">{verificationResult.facial_verification.deepfake_probability}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Professional Photos:</span>
                    <span className="font-semibold">{verificationResult.facial_verification.professional_model_likelihood}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Age Progression:</span>
                    <span className="font-semibold">
                      {verificationResult.facial_verification.age_progression_natural ? '✅' : '❌'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Conversation Intelligence */}
            {verificationResult.conversation_intelligence && (
              <div className="bg-white border rounded-lg p-4">
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  🧠 Conversation Analysis
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span>Human Pattern:</span>
                    <span className="font-semibold">{verificationResult.conversation_intelligence.response_pattern_human}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Language Authentic:</span>
                    <span className="font-semibold">{verificationResult.conversation_intelligence.language_authenticity}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Manipulation:</span>
                    <span className="font-semibold">
                      {verificationResult.conversation_intelligence.emotional_manipulation_detected ? '⚠️' : '✅'}
                    </span>
                  </div>
                  {verificationResult.conversation_intelligence.scam_pattern_matches?.length > 0 && (
                    <div className="text-red-600 font-semibold">
                      Scam patterns: {verificationResult.conversation_intelligence.scam_pattern_matches.length}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Digital Footprint */}
            {verificationResult.digital_footprint && (
              <div className="bg-white border rounded-lg p-4">
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  🌐 Digital Footprint
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span>Social Media Auth:</span>
                    <span className="font-semibold">{verificationResult.digital_footprint.social_media_authenticity}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Web Presence:</span>
                    <span className="font-semibold">{verificationResult.digital_footprint.web_presence_depth} years</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cross-Platform:</span>
                    <span className="font-semibold">{verificationResult.digital_footprint.cross_platform_consistency}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Friend Network:</span>
                    <span className="font-semibold">{verificationResult.digital_footprint.friend_network_quality}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Safety Recommendations */}
          {verificationResult.safety_recommendations?.length > 0 && (
            <div className="bg-white border rounded-lg p-4">
              <h4 className="text-sm font-medium mb-3">🛡️ Safety Recommendations</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {verificationResult.safety_recommendations.map((rec: string, idx: number) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Verification Steps */}
          {verificationResult.verification_steps?.length > 0 && (
            <div className="bg-white border rounded-lg p-4">
              <h4 className="text-sm font-medium mb-3">📋 Recommended Verification Steps</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                {verificationResult.verification_steps.map((step: string, idx: number) => (
                  <li key={idx}>{step}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedVerificationDemo;

interface AdvancedVerificationDemoProps {
  isVisible: boolean;
}

const AdvancedVerificationDemo: React.FC<AdvancedVerificationDemoProps> = ({ isVisible }) => {
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeDemo, setActiveDemo] = useState<'photos' | 'conversation' | 'comprehensive'>('comprehensive');

  // Demo data
  const demoPhotos = ['/demo/profile1.jpg', '/demo/profile2.jpg', '/demo/profile3.jpg'];
  const demoConversation = [
    { sender: 'match' as const, content: 'Hey beautiful! You look amazing in your photos', timestamp: new Date() },
    { sender: 'user' as const, content: 'Thank you! How was your day?', timestamp: new Date() },
    { sender: 'match' as const, content: 'It was good! I am deployed overseas right now as a soldier', timestamp: new Date() },
    { sender: 'user' as const, content: 'Oh interesting, where are you stationed?', timestamp: new Date() },
    { sender: 'match' as const, content: 'I cannot say for security reasons. But I really need someone to talk to', timestamp: new Date() },
    { sender: 'user' as const, content: 'I understand. How long have you been deployed?', timestamp: new Date() },
    { sender: 'match' as const, content: 'About 6 months. My dear, I have fallen in love with you already. You are my soulmate', timestamp: new Date() },
    { sender: 'user' as const, content: 'That seems very fast...', timestamp: new Date() },
    { sender: 'match' as const, content: 'True love knows no time limits! I want to come visit you but I need money for flight ticket', timestamp: new Date() }
  ];

  const demoProfileData = {
    name: 'John Anderson',
    age: 34,
    location: 'Los Angeles, CA',
    profession: 'Military Officer',
    bio: 'Looking for true love and meaningful connection. Currently deployed overseas.'
  };

  const handleComprehensiveVerification = async () => {
    if (!window.electronAPI?.verifyProfileComprehensive) {
      console.error('Advanced verification system not available');
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await window.electronAPI.verifyProfileComprehensive({
        photos: demoPhotos,
        profile_urls: ['https://instagram.com/johna_military', 'https://facebook.com/john.anderson.soldier'],
        conversation_messages: demoConversation,
        profile_data: demoProfileData,
        additional_context: {
          platform: 'Tinder',
          match_duration_days: 3,
          video_call_attempted: false,
          phone_call_attempted: false,
          meeting_attempted: false
        }
      });
      
      setVerificationResult(result);
    } catch (error) {
      console.error('Verification failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePhotoAnalysis = async () => {
    if (!window.electronAPI?.analyzePhotosCatfish) return;
    
    setIsAnalyzing(true);
    try {
      const result = await window.electronAPI.analyzePhotosCatfish(demoPhotos);
      setVerificationResult({ photo_analysis: result });
    } catch (error) {
      console.error('Photo analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConversationAnalysis = async () => {
    if (!window.electronAPI?.analyzeConversationAdvanced) return;
    
    setIsAnalyzing(true);
    try {
      const result = await window.electronAPI.analyzeConversationAdvanced(demoConversation);
      setVerificationResult({ conversation_analysis: result });
    } catch (error) {
      console.error('Conversation analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const exportReport = async () => {
    if (!verificationResult || !window.electronAPI?.exportVerificationReport) return;
    
    try {
      const result = await window.electronAPI.exportVerificationReport(verificationResult);
      if (result.success) {
        alert(`Report exported successfully to: ${result.path}`);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'very_low': return 'bg-green-500';
      case 'low': return 'bg-blue-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTrustScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    if (score >= 20) return 'text-orange-600';
    return 'text-red-600';
  };

  if (!isVisible) return null;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            Advanced Dating Verification System
          </CardTitle>
          <CardDescription>
            Real algorithmic verification beyond AI APIs - Advanced catfish detection, behavioral analysis, and comprehensive safety assessment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeDemo} onValueChange={(value: any) => setActiveDemo(value)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="comprehensive" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Comprehensive
              </TabsTrigger>
              <TabsTrigger value="photos" className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Photo Analysis
              </TabsTrigger>
              <TabsTrigger value="conversation" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Conversation
              </TabsTrigger>
            </TabsList>

            <TabsContent value="comprehensive" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Facial Recognition</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-muted-foreground">
                      • Face consistency analysis<br/>
                      • Deepfake detection<br/>
                      • Professional photo detection<br/>
                      • Age progression verification
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Behavioral Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-muted-foreground">
                      • Response timing patterns<br/>
                      • Language authenticity<br/>
                      • Emotional manipulation detection<br/>
                      • Scammer pattern matching
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Digital Footprint</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-muted-foreground">
                      • Social media verification<br/>
                      • Cross-platform consistency<br/>
                      • Web presence analysis<br/>
                      • Friend network quality
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Button 
                onClick={handleComprehensiveVerification}
                disabled={isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? 'Analyzing...' : 'Run Comprehensive Verification'}
              </Button>
            </TabsContent>

            <TabsContent value="photos" className="space-y-4">
              <Alert>
                <Camera className="h-4 w-4" />
                <AlertTitle>Photo Analysis Features</AlertTitle>
                <AlertDescription>
                  Reverse image search, facial recognition, deepfake detection, professional photo identification, and metadata analysis
                </AlertDescription>
              </Alert>
              
              <Button 
                onClick={handlePhotoAnalysis}
                disabled={isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? 'Analyzing Photos...' : 'Analyze Demo Photos'}
              </Button>
            </TabsContent>

            <TabsContent value="conversation" className="space-y-4">
              <Alert>
                <MessageSquare className="h-4 w-4" />
                <AlertTitle>Conversation Analysis Features</AlertTitle>
                <AlertDescription>
                  Scammer pattern detection, emotional manipulation analysis, response timing evaluation, and language authenticity assessment
                </AlertDescription>
              </Alert>
              
              <div className="bg-gray-50 p-4 rounded-lg max-h-40 overflow-y-auto">
                <div className="text-sm font-medium mb-2">Demo Conversation:</div>
                {demoConversation.slice(0, 3).map((msg, idx) => (
                  <div key={idx} className="text-xs mb-1">
                    <span className="font-semibold">{msg.sender}:</span> {msg.content}
                  </div>
                ))}
                <div className="text-xs text-muted-foreground">... and 6 more messages</div>
              </div>
              
              <Button 
                onClick={handleConversationAnalysis}
                disabled={isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? 'Analyzing Conversation...' : 'Analyze Demo Conversation'}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Results Display */}
      {verificationResult && (
        <div className="space-y-6">
          {/* Overall Trust Score */}
          {verificationResult.overall_trust_score !== undefined && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5" />
                    Verification Results
                  </span>
                  <Button onClick={exportReport} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium mb-2">Overall Trust Score</div>
                    <div className={`text-3xl font-bold ${getTrustScoreColor(verificationResult.overall_trust_score)}`}>
                      {verificationResult.overall_trust_score}%
                    </div>
                    <Progress value={verificationResult.overall_trust_score} className="mt-2" />
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium mb-2">Risk Level</div>
                    <Badge className={`${getRiskColor(verificationResult.risk_level)} text-white`}>
                      {verificationResult.risk_level?.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                {/* Likelihood Assessments */}
                {verificationResult.likelihood_assessments && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Risk Assessments</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span>Catfish Probability:</span>
                        <span className="font-semibold">{verificationResult.likelihood_assessments.catfish_probability}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Scammer Probability:</span>
                        <span className="font-semibold">{verificationResult.likelihood_assessments.scammer_probability}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Bot Probability:</span>
                        <span className="font-semibold">{verificationResult.likelihood_assessments.bot_probability}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Genuine Person:</span>
                        <span className="font-semibold text-green-600">{verificationResult.likelihood_assessments.genuine_person_probability}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Critical Warnings */}
          {verificationResult.critical_warnings?.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Critical Warnings</AlertTitle>
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {verificationResult.critical_warnings.map((warning: string, idx: number) => (
                    <li key={idx} className="text-sm">{warning}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Immediate Threats */}
          {verificationResult.immediate_threats?.length > 0 && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Immediate Threats</AlertTitle>
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {verificationResult.immediate_threats.map((threat: string, idx: number) => (
                    <li key={idx} className="text-sm">{threat}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Detailed Analysis Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Facial Verification */}
            {verificationResult.facial_verification && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Facial Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span>Face Consistency:</span>
                    <span className="font-semibold">{verificationResult.facial_verification.consistency_across_photos}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Deepfake Risk:</span>
                    <span className="font-semibold">{verificationResult.facial_verification.deepfake_probability}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Professional Photos:</span>
                    <span className="font-semibold">{verificationResult.facial_verification.professional_model_likelihood}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Age Progression:</span>
                    <span className="font-semibold">
                      {verificationResult.facial_verification.age_progression_natural ? 
                        <CheckCircle className="h-3 w-3 text-green-600 inline" /> : 
                        <XCircle className="h-3 w-3 text-red-600 inline" />
                      }
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Conversation Intelligence */}
            {verificationResult.conversation_intelligence && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    Conversation Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span>Human Pattern:</span>
                    <span className="font-semibold">{verificationResult.conversation_intelligence.response_pattern_human}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Language Authentic:</span>
                    <span className="font-semibold">{verificationResult.conversation_intelligence.language_authenticity}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Manipulation:</span>
                    <span className="font-semibold">
                      {verificationResult.conversation_intelligence.emotional_manipulation_detected ? 
                        <AlertCircle className="h-3 w-3 text-red-600 inline" /> : 
                        <CheckCircle className="h-3 w-3 text-green-600 inline" />
                      }
                    </span>
                  </div>
                  {verificationResult.conversation_intelligence.scam_pattern_matches?.length > 0 && (
                    <div className="text-red-600 font-semibold">
                      Scam patterns: {verificationResult.conversation_intelligence.scam_pattern_matches.length}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Digital Footprint */}
            {verificationResult.digital_footprint && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Digital Footprint
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span>Social Media Auth:</span>
                    <span className="font-semibold">{verificationResult.digital_footprint.social_media_authenticity}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Web Presence:</span>
                    <span className="font-semibold">{verificationResult.digital_footprint.web_presence_depth} years</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cross-Platform:</span>
                    <span className="font-semibold">{verificationResult.digital_footprint.cross_platform_consistency}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Friend Network:</span>
                    <span className="font-semibold">{verificationResult.digital_footprint.friend_network_quality}%</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Photo Analysis Results */}
          {verificationResult.photo_analysis && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Photo Analysis Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span>Catfish Risk:</span>
                    <span className="font-semibold">{verificationResult.photo_analysis.catfish_risk}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Face Consistency:</span>
                    <span className="font-semibold">{verificationResult.photo_analysis.face_consistency}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Deepfake Risk:</span>
                    <span className="font-semibold">{verificationResult.photo_analysis.deepfake_probability}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Reverse Search Hits:</span>
                    <span className="font-semibold">{verificationResult.photo_analysis.reverse_search_hits}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-sm font-medium">Recommendation:</div>
                  <div className="text-sm text-muted-foreground">{verificationResult.photo_analysis.recommendation}</div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Conversation Analysis Results */}
          {verificationResult.conversation_analysis && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Conversation Analysis Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span>Authenticity Score:</span>
                    <span className="font-semibold">{verificationResult.conversation_analysis.authenticity_score}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Scammer Probability:</span>
                    <span className="font-semibold">{verificationResult.conversation_analysis.scammer_probability}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bot Probability:</span>
                    <span className="font-semibold">{verificationResult.conversation_analysis.bot_probability}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Language Authenticity:</span>
                    <span className="font-semibold">{verificationResult.conversation_analysis.language_authenticity}%</span>
                  </div>
                </div>

                {verificationResult.conversation_analysis.scammer_type && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Scammer Type Detected</AlertTitle>
                    <AlertDescription>
                      {verificationResult.conversation_analysis.scammer_type}
                    </AlertDescription>
                  </Alert>
                )}

                {verificationResult.conversation_analysis.next_likely_moves?.length > 0 && (
                  <div>
                    <div className="text-sm font-medium mb-2">Predicted Next Moves:</div>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {verificationResult.conversation_analysis.next_likely_moves.map((move: string, idx: number) => (
                        <li key={idx}>{move}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {verificationResult.conversation_analysis.countermeasures?.length > 0 && (
                  <div>
                    <div className="text-sm font-medium mb-2">Recommended Countermeasures:</div>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {verificationResult.conversation_analysis.countermeasures.map((measure: string, idx: number) => (
                        <li key={idx}>{measure}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Safety Recommendations */}
          {verificationResult.safety_recommendations?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Safety Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {verificationResult.safety_recommendations.map((rec: string, idx: number) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Verification Steps */}
          {verificationResult.verification_steps?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Recommended Verification Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-decimal list-inside space-y-1 text-sm">
                  {verificationResult.verification_steps.map((step: string, idx: number) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedVerificationDemo;
