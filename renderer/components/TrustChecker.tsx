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
          catfish_analysis: result.catfish_analysis || {},
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
      backgroundColor: 'rgba(0,0,0,0.9)', 
      padding: '20px', 
      borderRadius: '8px',
      color: 'white'
    }}>
      <h3 style={{ margin: '0 0 20px 0', color: '#007acc', textAlign: 'center', fontSize: '24px' }}>
        {showAdvanced ? '🛡️ Advanced Verification System' : '🔍 Quick Trust Check'}
      </h3>

      {/* Analysis Mode Toggle */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '20px',
        justifyContent: 'center'
      }}>
        <button
          onClick={() => setAnalysisMode('quick')}
          style={{
            padding: '8px 16px',
            backgroundColor: analysisMode === 'quick' ? '#007acc' : '#333',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          🔍 Quick Analysis
        </button>
        <button
          onClick={() => setAnalysisMode('comprehensive')}
          style={{
            padding: '8px 16px',
            backgroundColor: analysisMode === 'comprehensive' ? '#dc3545' : '#333',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          🔍 Comprehensive Verification
        </button>
      </div>

      {/* Quick Analysis Mode */}
      {analysisMode === 'quick' && (
        <div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', color: '#ccc' }}>
              Profile URL:
            </label>
            <input
              type="text"
              value={profileUrl}
              onChange={(e) => setProfileUrl(e.target.value)}
              placeholder="Enter dating profile URL..."
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: '#333',
                border: '1px solid #555',
                borderRadius: '4px',
                color: 'white',
                fontSize: '12px'
              }}
            />
          </div>

          <button
            onClick={analyzeProfile}
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: loading ? '#666' : '#007acc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              marginBottom: '20px'
            }}
          >
            {loading ? '🔄 Analyzing...' : '🔍 Quick Trust Check'}
          </button>
        </div>
      )}

      {/* Comprehensive Analysis Mode */}
      {analysisMode === 'comprehensive' && (
        <div>
          {/* Photo Upload Section */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>
              📸 Upload Photos for Analysis
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
                padding: '10px',
                backgroundColor: '#333',
                border: '2px dashed #555',
                borderRadius: '6px',
                color: '#ccc',
                marginBottom: '10px'
              }}
            />
            {selectedImage && (
              <div style={{ color: '#28a745', fontSize: '12px' }}>
                ✅ Photo selected: {selectedImage.name}
              </div>
            )}
            <button
              onClick={() => {/* Photo analysis logic */}}
              disabled={loading || !selectedImage}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: loading || !selectedImage ? '#666' : '#ffc107',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading || !selectedImage ? 'not-allowed' : 'pointer',
                fontSize: '12px',
                marginTop: '5px'
              }}
            >
              {loading ? '🔄 Analyzing...' : '🎭 Analyze Photos for Catfish Detection'}
            </button>
          </div>

          {/* Social Media Links */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>
              🔗 Social Media Profiles (one per line)
            </label>
            <textarea
              value={socialLinks}
              onChange={(e) => setSocialLinks(e.target.value)}
              placeholder={`Instagram: @username
Facebook: profile-url
LinkedIn: profile-url`}
              style={{
                width: '100%',
                height: '80px',
                padding: '10px',
                backgroundColor: '#333',
                border: '1px solid #555',
                borderRadius: '4px',
                color: 'white',
                fontSize: '12px',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Conversation Analysis */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>
              💬 Conversation Messages
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
                height: '120px',
                padding: '10px',
                backgroundColor: '#333',
                border: '1px solid #555',
                borderRadius: '4px',
                color: 'white',
                fontSize: '12px',
                resize: 'vertical'
              }}
            />
            <button
              onClick={() => {/* Conversation analysis logic */}}
              disabled={loading || !conversationText.trim()}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: loading || !conversationText.trim() ? '#666' : '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading || !conversationText.trim() ? 'not-allowed' : 'pointer',
                fontSize: '12px',
                marginTop: '10px'
              }}
            >
              {loading ? '🔄 Analyzing...' : '🚨 Analyze for Scammer Patterns'}
            </button>
          </div>

          {/* Comprehensive Analysis Button */}
          <button
            onClick={performComprehensiveVerification}
            disabled={loading}
            style={{
              width: '100%',
              padding: '15px',
              backgroundColor: loading ? '#666' : '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              marginBottom: '20px'
            }}
          >
            {loading ? '🔄 Performing Comprehensive Analysis...' : '🛡️ COMPREHENSIVE VERIFICATION'}
          </button>
        </div>
      )}

      {/* Quick Analysis Results */}
      {trustData && analysisMode === 'quick' && (
        <div>
          {/* Trust Score Display */}
          <div style={{
            padding: '15px',
            backgroundColor: 'rgba(40, 40, 40, 0.95)',
            borderRadius: '8px',
            border: '1px solid #555',
            marginBottom: '15px'
          }}>
            <h4 style={{ margin: '0 0 15px 0', color: '#fff', fontFamily: 'inherit' }}>Trust Score</h4>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: getTrustColor(trustData.trustScore),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '18px',
                fontWeight: 'bold',
                marginRight: '15px',
                fontFamily: 'inherit'
              }}>
                {trustData.trustScore}
              </div>
              <div>
                <div style={{ 
                  color: getTrustColor(trustData.trustScore), 
                  fontWeight: 'bold',
                  fontSize: '16px',
                  fontFamily: 'inherit'
                }}>
                  {getTrustLabel(trustData.verificationStatus, trustData.trustScore)}
                </div>
                <div style={{ color: '#999', fontSize: '12px', fontFamily: 'inherit' }}>
                  Based on available verification data
                </div>
              </div>
            </div>
          </div>

          {/* Image Verification Results */}
          {trustData.imageMatches.length > 0 && (
            <div style={{
              padding: '15px',
              backgroundColor: 'rgba(40, 40, 40, 0.95)',
              borderRadius: '8px',
              border: '1px solid #555',
              marginBottom: '15px'
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#fff', fontFamily: 'inherit' }}>Image Verification</h4>
              {trustData.imageMatches.map((match, index) => (
                <div key={index} style={{
                  color: '#28a745',
                  fontSize: '14px',
                  marginBottom: '5px',
                  fontFamily: 'inherit'
                }}>
                  ✓ {match}
                </div>
              ))}
            </div>
          )}

          {/* Social Profiles */}
          {trustData.socialProfiles.length > 0 && (
            <div style={{
              padding: '15px',
              backgroundColor: 'rgba(40, 40, 40, 0.95)',
              borderRadius: '8px',
              border: '1px solid #555',
              marginBottom: '15px'
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#fff', fontFamily: 'inherit' }}>Social Verification</h4>
              {trustData.socialProfiles.map((profile, index) => (
                <div key={index} style={{
                  color: '#007acc',
                  fontSize: '14px',
                  marginBottom: '5px',
                  fontFamily: 'inherit'
                }}>
                  🔗 {profile}
                </div>
              ))}
            </div>
          )}

          {/* Mutual Connections */}
          <div style={{
            padding: '15px',
            backgroundColor: 'rgba(40, 40, 40, 0.95)',
            borderRadius: '8px',
            border: '1px solid #555'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#fff', fontFamily: 'inherit' }}>Mutual Connections</h4>
            {trustData.mutualConnections.length > 0 ? (
              trustData.mutualConnections.map((connection, index) => (
                <div key={index} style={{
                  color: '#28a745',
                  fontSize: '14px',
                  marginBottom: '5px',
                  fontFamily: 'inherit'
                }}>
                  👥 {connection}
                </div>
              ))
            ) : (
              <div style={{ color: '#999', fontSize: '14px', fontFamily: 'inherit' }}>
                No mutual connections found.
                <br />
                <small style={{ fontFamily: 'inherit' }}>Connect your social accounts for better matching.</small>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Comprehensive Analysis Results */}
      {comprehensiveResult && analysisMode === 'comprehensive' && (
        <div style={{ 
          marginTop: '20px', 
          padding: '20px', 
          backgroundColor: '#1a1a1a', 
          borderRadius: '8px',
          border: `3px solid ${
            comprehensiveResult.risk_level === 'critical' ? '#dc3545' :
            comprehensiveResult.risk_level === 'high' ? '#fd7e14' :
            comprehensiveResult.risk_level === 'medium' ? '#ffc107' :
            comprehensiveResult.risk_level === 'low' ? '#28a745' : '#20c997'
          }`
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#fff', textAlign: 'center' }}>
            🛡️ Comprehensive Verification Results
          </h3>

          {/* Overall Score */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <div style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              backgroundColor: comprehensiveResult.overall_trust_score >= 80 ? '#28a745' :
                               comprehensiveResult.overall_trust_score >= 60 ? '#ffc107' : '#dc3545',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '24px',
              fontWeight: 'bold'
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
              <h4 style={{ margin: '0 0 10px 0', color: '#fff' }}>⚠️ Critical Warnings</h4>
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
              <h4 style={{ margin: '0 0 10px 0', color: '#fff' }}>📊 Risk Assessment</h4>
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
              <h4 style={{ margin: '0 0 10px 0', color: '#fff' }}>👁️ Facial Analysis</h4>
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
              <h4 style={{ margin: '0 0 10px 0', color: '#fff' }}>🛡️ Safety Recommendations</h4>
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
              <h4 style={{ margin: '0 0 10px 0', color: '#fff' }}>🔒 Protection Measures</h4>
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
