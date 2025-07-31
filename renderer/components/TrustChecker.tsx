/// <reference path="../types/index.d.ts" />
import React, { useState } from 'react';

interface TrustData {
  imageMatches: string[];
  mutualConnections: string[];
  socialProfiles: string[];
  trustScore: number;
  verificationStatus: 'verified' | 'suspicious' | 'unknown';
  redFlags?: string[];
  positiveSignals?: string[];
}

interface ComprehensiveVerificationResult {
  overall_trust_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical' | 'very_low';
  catfish_analysis?: any;
  facial_verification?: {
    consistency_across_photos: number;
    deepfake_probability: number;
    reverse_search_hits: number;
  };
  scammer_analysis?: any;
  social_media_verification?: any;
  conversation_analysis?: any;
  critical_warnings?: string[];
  immediate_threats?: string[];
  likelihood_assessments?: {
    catfish_probability: number;
    scammer_probability: number;
    bot_probability: number;
    genuine_person_probability: number;
  };
  verification_steps: string[];
  protection_measures: string[];
  safety_recommendations: string[];
}

interface TrustCheckerProps {
  showAdvanced?: boolean;
}

const TrustChecker: React.FC<TrustCheckerProps> = ({ showAdvanced = false }) => {
  const [profileUrl, setProfileUrl] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [socialLinks, setSocialLinks] = useState('');
  const [conversationText, setConversationText] = useState('');
  const [trustData, setTrustData] = useState<TrustData | null>(null);
  const [comprehensiveResult, setComprehensiveResult] = useState<ComprehensiveVerificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysisMode, setAnalysisMode] = useState<'quick' | 'comprehensive'>(showAdvanced ? 'comprehensive' : 'quick');

  const performComprehensiveVerification = async () => {
    if (!profileUrl && !selectedImage && !socialLinks && !conversationText) {
      alert('Please provide at least one form of data to analyze');
      return;
    }

    setLoading(true);
    try {
      const verificationData = {
        photos: selectedImage ? [selectedImage.name] : [],
        profile_urls: socialLinks.split('\n').filter(url => url.trim()),
        conversation_messages: conversationText.split('\n').filter(msg => msg.trim()).map((content, index) => ({
          sender: index % 2 === 0 ? 'match' as const : 'user' as const,
          content: content,
          timestamp: new Date()
        })),
        profile_data: {
          name: 'Sample Profile',
          age: 28,
          location: 'Unknown',
          profession: 'Unknown'
        },
        additional_context: {
          platform: 'Dating App',
          match_duration_days: 3,
          video_call_attempted: false,
          phone_call_attempted: false,
          meeting_attempted: false
        }
      };

      // Use the actual comprehensive verification API
      if (window.electronAPI?.verifyProfileComprehensive) {
        const result = await window.electronAPI.verifyProfileComprehensive(verificationData);
        setComprehensiveResult({
          overall_trust_score: result.overall_trust_score,
          risk_level: result.risk_level,
          // catfish_analysis: result.catfish_analysis || {},
          facial_verification: {
            consistency_across_photos: result.facial_verification?.consistency_across_photos || 50,
            deepfake_probability: result.facial_verification?.deepfake_probability || 0,
            reverse_search_hits: 0 // This might not be available in the API response
          },
          scammer_analysis: result.conversation_intelligence,
          social_media_verification: result.digital_footprint,
          conversation_analysis: result.conversation_intelligence,
          critical_warnings: result.critical_warnings || [],
          immediate_threats: result.immediate_threats || [],
          likelihood_assessments: result.likelihood_assessments || {
            catfish_probability: 50,
            scammer_probability: 50,
            bot_probability: 50,
            genuine_person_probability: 50
          },
          verification_steps: result.verification_steps || [],
          protection_measures: result.protection_measures || [],
          safety_recommendations: result.safety_recommendations || []
        });
      } else {
        // Fallback demo data
        setComprehensiveResult({
          overall_trust_score: 65,
          risk_level: 'medium',
          catfish_analysis: { overall_risk_score: 35 },
          facial_verification: {
            consistency_across_photos: 85,
            deepfake_probability: 15,
            reverse_search_hits: 2
          },
          likelihood_assessments: {
            catfish_probability: 35,
            scammer_probability: 25,
            bot_probability: 20,
            genuine_person_probability: 75
          },
          critical_warnings: ['Demo mode - real verification unavailable'],
          immediate_threats: [],
          verification_steps: [
            'Request video call',
            'Verify social media profiles',
            'Ask for additional photos'
          ],
          protection_measures: [
            'Never send money or gift cards',
            'Request video call before meeting',
            'Verify identity through multiple channels'
          ],
          safety_recommendations: [
            'Proceed with caution',
            'Trust your instincts',
            'Report suspicious behavior to platform'
          ]
        });
      }
    } catch (error) {
      console.error('Comprehensive verification error:', error);
      alert('Error performing comprehensive verification');
    } finally {
      setLoading(false);
    }
  };

  const analyzeProfile = async () => {
    if (!profileUrl.trim() && !selectedImage) {
      alert('Please enter a profile URL or upload an image');
      return;
    }

    setLoading(true);
    try {
      let trustAnalysis: TrustData;
      
      if (typeof window !== 'undefined' && window.electronAPI) {
        // Use Electron API with Gemini for real analysis
        const profileData = {
          url: profileUrl.trim() || undefined,
          imageFile: selectedImage?.name
        };
        
        const result = await window.electronAPI.analyzeTrust(profileData);
        trustAnalysis = {
          imageMatches: result.imageMatches,
          mutualConnections: ['Sarah M.', 'John D.'], // Mock mutual connections for demo
          socialProfiles: result.socialProfiles,
          trustScore: result.trustScore,
          verificationStatus: result.verificationStatus as 'verified' | 'suspicious' | 'unknown',
          redFlags: result.redFlags,
          positiveSignals: result.positiveSignals
        };
      } else {
        // Fallback for development/web environment
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
        
        trustAnalysis = {
          imageMatches: selectedImage ? ['Found on Instagram', 'Found on Facebook'] : [],
          mutualConnections: ['Sarah M.', 'John D.'],
          socialProfiles: ['Instagram: @username', 'LinkedIn: Professional Profile'],
          trustScore: Math.floor(Math.random() * 30) + 70, // Random score between 70-100
          verificationStatus: Math.random() > 0.3 ? 'verified' : 'suspicious'
        };
      }

      setTrustData(trustAnalysis);
    } catch (error) {
      console.error('Error analyzing profile:', error);
      alert('Error analyzing profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const getTrustColor = (score: number) => {
    if (score >= 80) return '#28a745'; // Green
    if (score >= 60) return '#ffc107'; // Yellow
    return '#dc3545'; // Red
  };

  const getTrustLabel = (status: string, score: number) => {
    if (status === 'verified' && score >= 80) return 'Highly Trustworthy';
    if (status === 'verified') return 'Trustworthy';
    if (status === 'suspicious') return 'Suspicious';
    return 'Unknown';
  };

  return (
    <div className="no-drag" style={{ 
      fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      backgroundColor: 'transparent', 
      padding: '24px', 
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      color: 'white'
    }}>
      <h3 style={{ 
        margin: '0 0 24px 0', 
        color: '#ffffff',
        textAlign: 'center', 
        fontSize: '22px',
        fontWeight: '600'
      }}>
        {showAdvanced ? 'Advanced Verification System' : 'Quick Trust Check'}
      </h3>

      {/* Analysis Mode Toggle */}
      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        marginBottom: '24px',
        justifyContent: 'center'
      }}>
        <button
          onClick={() => setAnalysisMode('quick')}
          style={{
            padding: '10px 20px',
            backgroundColor: 'transparent',
            color: 'white',
            border: analysisMode === 'quick' ? '1px solid rgba(255, 255, 255, 0.8)' : '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: analysisMode === 'quick' ? '600' : '400',
            transition: 'all 0.3s ease',
            opacity: analysisMode === 'quick' ? 1 : 0.7
          }}
        >
          Quick Analysis
        </button>
        <button
          onClick={() => setAnalysisMode('comprehensive')}
          style={{
            padding: '10px 20px',
            backgroundColor: analysisMode === 'comprehensive' ? 'rgba(220, 53, 69, 0.8)' : 'rgba(55, 65, 81, 0.6)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            color: 'white',
            border: analysisMode === 'comprehensive' ? '1px solid rgba(220, 53, 69, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.3s ease',
            boxShadow: analysisMode === 'comprehensive' ? '0 4px 16px rgba(220, 53, 69, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.2)'
          }}
        >
          Comprehensive Verification
        </button>
      </div>

      {/* Quick Analysis Mode */}
      {analysisMode === 'quick' && (
        <div style={{
          backgroundColor: 'rgba(30, 35, 45, 0.7)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          marginBottom: '20px'
        }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#e2e8f0', fontWeight: '500' }}>
              Profile URL:
            </label>
            <input
              type="text"
              value={profileUrl}
              onChange={(e) => setProfileUrl(e.target.value)}
              placeholder="Enter dating profile URL..."
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: 'rgba(55, 65, 81, 0.6)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '14px',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <button
            onClick={analyzeProfile}
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: loading ? 'rgba(107, 114, 128, 0.6)' : 'rgba(59, 130, 246, 0.8)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              color: 'white',
              border: loading ? '1px solid rgba(107, 114, 128, 0.3)' : '1px solid rgba(59, 130, 246, 0.5)',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.3s ease',
              boxShadow: loading ? 'none' : '0 4px 16px rgba(59, 130, 246, 0.3)',
              marginBottom: '20px'
            }}
          >
            {loading ? 'Analyzing...' : 'Quick Trust Check'}
          </button>
        </div>
      )}

      {/* Comprehensive Analysis Mode */}
      {analysisMode === 'comprehensive' && (
        <div>
          {/* Photo Upload Section */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '10px', 
              fontSize: '15px', 
              fontWeight: '600',
              color: '#e2e8f0'
            }}>
              Upload Photos for Analysis
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) setSelectedImage(file);
              }}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: 'rgba(55, 65, 81, 0.6)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '2px dashed rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: '#cbd5e1',
                marginBottom: '12px',
                fontFamily: 'inherit'
              }}
            />
            {selectedImage && (
              <div style={{ 
                color: '#10b981', 
                fontSize: '13px',
                fontWeight: '500',
                padding: '8px',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderRadius: '6px',
                border: '1px solid rgba(16, 185, 129, 0.2)'
              }}>
                Photo selected: {selectedImage.name}
              </div>
            )}
            <button
              onClick={() => {/* Photo analysis logic */}}
              disabled={loading || !selectedImage}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: loading || !selectedImage ? 'rgba(107, 114, 128, 0.6)' : 'rgba(245, 158, 11, 0.8)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                color: 'white',
                border: loading || !selectedImage ? '1px solid rgba(107, 114, 128, 0.3)' : '1px solid rgba(245, 158, 11, 0.5)',
                borderRadius: '8px',
                cursor: loading || !selectedImage ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                marginTop: '8px',
                transition: 'all 0.3s ease',
                boxShadow: loading || !selectedImage ? 'none' : '0 4px 16px rgba(245, 158, 11, 0.3)'
              }}
            >
              {loading ? 'Analyzing...' : 'Analyze Photos for Catfish Detection'}
            </button>
          </div>

          {/* Social Media Links */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '10px', 
              fontSize: '15px', 
              fontWeight: '600',
              color: '#e2e8f0'
            }}>
              Social Media Profiles (one per line)
            </label>
            <textarea
              value={socialLinks}
              onChange={(e) => setSocialLinks(e.target.value)}
              placeholder={`Instagram: @username
Facebook: profile-url
LinkedIn: profile-url`}
              style={{
                width: '100%',
                height: '90px',
                padding: '12px',
                backgroundColor: 'rgba(55, 65, 81, 0.6)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '14px',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Conversation Analysis */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '10px', 
              fontSize: '15px', 
              fontWeight: '600',
              color: '#e2e8f0'
            }}>
              Conversation Messages
            </label>
            <textarea
              value={conversationText}
              onChange={(e) => setConversationText(e.target.value)}
              placeholder={`Enter conversation messages (one per line)
Example:
Hey beautiful! How are you doing?
I'm good, thanks for asking
I'm traveling for work but would love to meet
That sounds great, when will you be back?`}
              style={{
                width: '100%',
                height: '130px',
                padding: '12px',
                backgroundColor: 'rgba(55, 65, 81, 0.6)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '14px',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
            <button
              onClick={() => {/* Conversation analysis logic */}}
              disabled={loading || !conversationText.trim()}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: loading || !conversationText.trim() ? 'rgba(107, 114, 128, 0.6)' : 'rgba(220, 53, 69, 0.8)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                color: 'white',
                border: loading || !conversationText.trim() ? '1px solid rgba(107, 114, 128, 0.3)' : '1px solid rgba(220, 53, 69, 0.5)',
                borderRadius: '8px',
                cursor: loading || !conversationText.trim() ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                marginTop: '12px',
                transition: 'all 0.3s ease',
                boxShadow: loading || !conversationText.trim() ? 'none' : '0 4px 16px rgba(220, 53, 69, 0.3)'
              }}
            >
              {loading ? 'Analyzing...' : 'Analyze for Scammer Patterns'}
            </button>
          </div>

          {/* Comprehensive Analysis Button */}
          <button
            onClick={performComprehensiveVerification}
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: loading ? 'rgba(107, 114, 128, 0.6)' : 'rgba(220, 53, 69, 0.8)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              color: 'white',
              border: loading ? '1px solid rgba(107, 114, 128, 0.3)' : '1px solid rgba(220, 53, 69, 0.5)',
              borderRadius: '10px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: '24px',
              transition: 'all 0.3s ease',
              boxShadow: loading ? 'none' : '0 4px 20px rgba(220, 53, 69, 0.4)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            {loading ? 'Performing Comprehensive Analysis...' : 'COMPREHENSIVE VERIFICATION'}
          </button>
        </div>
      )}

      {/* Quick Analysis Results */}
      {trustData && analysisMode === 'quick' && (
        <div>
          {/* Trust Score Display */}
          <div style={{
            padding: '20px',
            backgroundColor: 'rgba(30, 35, 45, 0.7)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            marginBottom: '20px'
          }}>
            <h4 style={{ 
              margin: '0 0 20px 0', 
              color: '#e2e8f0', 
              fontFamily: 'inherit',
              fontSize: '16px',
              fontWeight: '600'
            }}>
              Trust Score
            </h4>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '20px',
                fontWeight: '700',
                marginRight: '20px',
                fontFamily: 'inherit',
                border: '2px solid rgba(255, 255, 255, 0.1)',
                boxShadow: `0 4px 16px ${getTrustColor(trustData.trustScore)}40`
              }}>
                {trustData.trustScore}
              </div>
              <div>
                <div style={{ 
                  color: getTrustColor(trustData.trustScore), 
                  fontWeight: '600',
                  fontSize: '18px',
                  fontFamily: 'inherit'
                }}>
                  {getTrustLabel(trustData.verificationStatus, trustData.trustScore)}
                </div>
                <div style={{ 
                  color: '#94a3b8', 
                  fontSize: '13px', 
                  fontFamily: 'inherit',
                  marginTop: '4px'
                }}>
                  Based on available verification data
                </div>
              </div>
            </div>
          </div>

          {/* Image Verification Results */}
          {trustData.imageMatches.length > 0 && (
            <div style={{
              padding: '20px',
              backgroundColor: 'rgba(30, 35, 45, 0.7)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              marginBottom: '20px'
            }}>
              <h4 style={{ 
                margin: '0 0 16px 0', 
                color: '#e2e8f0', 
                fontFamily: 'inherit',
                fontSize: '16px',
                fontWeight: '600'
              }}>
                Image Verification
              </h4>
              {trustData.imageMatches.map((match, index) => (
                <div key={index} style={{
                  color: '#10b981',
                  fontSize: '14px',
                  marginBottom: '8px',
                  fontFamily: 'inherit',
                  padding: '8px 12px',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  borderRadius: '6px',
                  border: '1px solid rgba(16, 185, 129, 0.2)'
                }}>
                  {match}
                </div>
              ))}
            </div>
          )}

          {/* Social Profiles */}
          {trustData.socialProfiles.length > 0 && (
            <div style={{
              padding: '20px',
              backgroundColor: 'rgba(30, 35, 45, 0.7)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              marginBottom: '20px'
            }}>
              <h4 style={{ 
                margin: '0 0 16px 0', 
                color: '#e2e8f0', 
                fontFamily: 'inherit',
                fontSize: '16px',
                fontWeight: '600'
              }}>
                Social Verification
              </h4>
              {trustData.socialProfiles.map((profile, index) => (
                <div key={index} style={{
                  color: '#3b82f6',
                  fontSize: '14px',
                  marginBottom: '8px',
                  fontFamily: 'inherit',
                  padding: '8px 12px',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  borderRadius: '6px',
                  border: '1px solid rgba(59, 130, 246, 0.2)'
                }}>
                  {profile}
                </div>
              ))}
            </div>
          )}

          {/* Mutual Connections */}
          <div style={{
            padding: '20px',
            backgroundColor: 'rgba(30, 35, 45, 0.7)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h4 style={{ 
              margin: '0 0 16px 0', 
              color: '#e2e8f0', 
              fontFamily: 'inherit',
              fontSize: '16px',
              fontWeight: '600'
            }}>
              Mutual Connections
            </h4>
            {trustData.mutualConnections.length > 0 ? (
              trustData.mutualConnections.map((connection, index) => (
                <div key={index} style={{
                  color: '#10b981',
                  fontSize: '14px',
                  marginBottom: '8px',
                  fontFamily: 'inherit',
                  padding: '8px 12px',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  borderRadius: '6px',
                  border: '1px solid rgba(16, 185, 129, 0.2)'
                }}>
                  {connection}
                </div>
              ))
            ) : (
              <div style={{ 
                color: '#94a3b8', 
                fontSize: '14px', 
                fontFamily: 'inherit',
                padding: '12px',
                backgroundColor: 'rgba(107, 114, 128, 0.1)',
                borderRadius: '6px',
                border: '1px solid rgba(107, 114, 128, 0.2)'
              }}>
                No mutual connections found.
                <br />
                <small style={{ fontFamily: 'inherit', color: '#6b7280' }}>
                  Connect your social accounts for better matching.
                </small>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Comprehensive Analysis Results */}
      {comprehensiveResult && analysisMode === 'comprehensive' && (
        <div style={{ 
          marginTop: '24px', 
          padding: '24px', 
          backgroundColor: 'rgba(20, 25, 35, 0.8)', 
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: '16px',
          border: `2px solid ${
            comprehensiveResult.risk_level === 'critical' ? 'rgba(220, 53, 69, 0.5)' :
            comprehensiveResult.risk_level === 'high' ? 'rgba(253, 126, 20, 0.5)' :
            comprehensiveResult.risk_level === 'medium' ? 'rgba(255, 193, 7, 0.5)' :
            comprehensiveResult.risk_level === 'low' ? 'rgba(40, 167, 69, 0.5)' : 'rgba(32, 201, 151, 0.5)'
          }`,
          boxShadow: `0 8px 32px ${
            comprehensiveResult.risk_level === 'critical' ? 'rgba(220, 53, 69, 0.3)' :
            comprehensiveResult.risk_level === 'high' ? 'rgba(253, 126, 20, 0.3)' :
            comprehensiveResult.risk_level === 'medium' ? 'rgba(255, 193, 7, 0.3)' :
            comprehensiveResult.risk_level === 'low' ? 'rgba(40, 167, 69, 0.3)' : 'rgba(32, 201, 151, 0.3)'
          }`
        }}>
          <h3 style={{ 
            margin: '0 0 24px 0', 
            color: '#ffffff',
            fontSize: '20px',
            fontWeight: '600',
            textAlign: 'center'
          }}>
            Comprehensive Verification Results
          </h3>

          {/* Overall Score */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '28px',
              fontWeight: '700',
              border: '3px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
            }}>
              {comprehensiveResult.overall_trust_score}%
            </div>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ 
              fontSize: '18px', 
              fontWeight: 'bold',
              color: comprehensiveResult.risk_level === 'critical' ? '#dc3545' :
                     comprehensiveResult.risk_level === 'high' ? '#fd7e14' :
                     comprehensiveResult.risk_level === 'medium' ? '#ffc107' :
                     comprehensiveResult.risk_level === 'low' ? '#28a745' : '#20c997'
            }}>
              Risk Level: {comprehensiveResult.risk_level.toUpperCase()}
            </div>
          </div>

          {/* Critical Warnings */}
          {comprehensiveResult.critical_warnings && comprehensiveResult.critical_warnings.length > 0 && (
            <div style={{
              backgroundColor: '#dc3545',
              padding: '15px',
              borderRadius: '6px',
              marginBottom: '15px'
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#fff' }}>Critical Warnings</h4>
              {comprehensiveResult.critical_warnings.map((warning, index) => (
                <div key={index} style={{ color: '#fff', fontSize: '12px', marginBottom: '5px' }}>
                  • {warning}
                </div>
              ))}
            </div>
          )}

          {/* Immediate Threats */}
          {comprehensiveResult.immediate_threats && comprehensiveResult.immediate_threats.length > 0 && (
            <div style={{
              backgroundColor: '#8b0000',
              padding: '15px',
              borderRadius: '6px',
              marginBottom: '15px'
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#fff' }}>🚨 Immediate Threats</h4>
              {comprehensiveResult.immediate_threats.map((threat, index) => (
                <div key={index} style={{ color: '#fff', fontSize: '12px', marginBottom: '5px' }}>
                  • {threat}
                </div>
              ))}
            </div>
          )}

          {/* Likelihood Assessments */}
          {comprehensiveResult.likelihood_assessments && (
            <div style={{
              backgroundColor: 'rgba(40, 40, 40, 0.95)',
              padding: '15px',
              borderRadius: '6px',
              marginBottom: '15px'
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#fff' }}>Risk Assessment</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px' }}>
                <div style={{ color: '#dc3545' }}>
                  Catfish Risk: {comprehensiveResult.likelihood_assessments.catfish_probability}%
                </div>
                <div style={{ color: '#fd7e14' }}>
                  Scammer Risk: {comprehensiveResult.likelihood_assessments.scammer_probability}%
                </div>
                <div style={{ color: '#ffc107' }}>
                  Bot Risk: {comprehensiveResult.likelihood_assessments.bot_probability}%
                </div>
                <div style={{ color: '#28a745' }}>
                  Genuine Person: {comprehensiveResult.likelihood_assessments.genuine_person_probability}%
                </div>
              </div>
            </div>
          )}

          {/* Facial Verification */}
          {comprehensiveResult.facial_verification && (
            <div style={{
              backgroundColor: 'rgba(40, 40, 40, 0.95)',
              padding: '15px',
              borderRadius: '6px',
              marginBottom: '15px'
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#fff' }}>Facial Analysis</h4>
              <div style={{ fontSize: '12px' }}>
                <div style={{ marginBottom: '5px' }}>
                  Photo Consistency: {comprehensiveResult.facial_verification.consistency_across_photos}%
                </div>
                <div style={{ marginBottom: '5px', color: comprehensiveResult.facial_verification.deepfake_probability > 30 ? '#dc3545' : '#28a745' }}>
                  Deepfake Risk: {comprehensiveResult.facial_verification.deepfake_probability}%
                </div>
              </div>
            </div>
          )}

          {/* Safety Recommendations */}
          {comprehensiveResult.safety_recommendations && comprehensiveResult.safety_recommendations.length > 0 && (
            <div style={{
              backgroundColor: 'rgba(40, 40, 40, 0.95)',
              padding: '15px',
              borderRadius: '6px',
              marginBottom: '15px'
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#fff' }}>Safety Recommendations</h4>
              {comprehensiveResult.safety_recommendations.map((rec, index) => (
                <div key={index} style={{ color: '#ccc', fontSize: '12px', marginBottom: '5px' }}>
                  • {rec}
                </div>
              ))}
            </div>
          )}

          {/* Protection Measures */}
          {comprehensiveResult.protection_measures && comprehensiveResult.protection_measures.length > 0 && (
            <div style={{
              backgroundColor: 'rgba(40, 40, 40, 0.95)',
              padding: '15px',
              borderRadius: '6px'
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#fff' }}>Protection Measures</h4>
              {comprehensiveResult.protection_measures.map((measure, index) => (
                <div key={index} style={{ color: '#ccc', fontSize: '12px', marginBottom: '5px' }}>
                  • {measure}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TrustChecker;
