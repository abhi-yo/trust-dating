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

const TrustChecker: React.FC = () => {
  const [profileUrl, setProfileUrl] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [trustData, setTrustData] = useState<TrustData | null>(null);
  const [loading, setLoading] = useState(false);

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
    <div className="no-drag" style={{ fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#fff', fontFamily: 'inherit' }}>Trust Verification</h3>
      
      {/* Profile URL Input */}
      <div style={{
        padding: '15px',
        backgroundColor: 'rgba(40, 40, 40, 0.95)',
        borderRadius: '8px',
        border: '1px solid #555',
        marginBottom: '15px'
      }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#fff', fontFamily: 'inherit' }}>Profile URL Analysis</h4>
        <input
          type="text"
          placeholder="Enter dating profile URL..."
          value={profileUrl}
          onChange={(e) => setProfileUrl(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #555',
            backgroundColor: '#333',
            color: '#fff',
            marginBottom: '10px',
            fontFamily: 'inherit'
          }}
        />
      </div>

      {/* Profile Image Upload */}
      <div style={{
        padding: '15px',
        backgroundColor: 'rgba(40, 40, 40, 0.95)',
        borderRadius: '8px',
        border: '1px solid #555',
        marginBottom: '15px'
      }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#fff', fontFamily: 'inherit' }}>Profile Image Verification</h4>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          style={{
            width: '100%',
            padding: '8px',
            backgroundColor: '#333',
            color: '#fff',
            border: '1px solid #555',
            borderRadius: '4px',
            marginBottom: '10px',
            fontFamily: 'inherit'
          }}
        />
        {selectedImage && (
          <div style={{ color: '#28a745', fontSize: '12px', marginBottom: '10px', fontFamily: 'inherit' }}>
            ✓ Image selected: {selectedImage.name}
          </div>
        )}
      </div>

      {/* Analyze Button */}
      <button
        onClick={analyzeProfile}
        disabled={loading || (!profileUrl.trim() && !selectedImage)}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: loading || (!profileUrl.trim() && !selectedImage) ? '#555' : '#007acc',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: loading || (!profileUrl.trim() && !selectedImage) ? 'not-allowed' : 'pointer',
          marginBottom: '15px',
          fontSize: '14px',
          fontWeight: 'bold',
          fontFamily: 'inherit'
        }}
      >
        {loading ? 'Analyzing...' : 'Run Trust Analysis'}
      </button>

      {/* Trust Results */}
      {trustData && (
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
    </div>
  );
};

export default TrustChecker;
