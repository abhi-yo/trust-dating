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
  const [error, setError] = useState<string>('');

  return (
    <div style={{ 
      backgroundColor: 'rgba(0,0,0,0.9)', 
      padding: '20px', 
      borderRadius: '8px',
      color: 'white',
      fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <h2 style={{ 
        margin: '0 0 20px 0', 
        fontSize: '24px', 
        color: '#007acc',
        textAlign: 'center'
      }}>
        Trust Verification System
      </h2>
      
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <p>Trust verification system is loading...</p>
        <p>Analysis Mode: {showAdvanced ? 'Advanced' : 'Quick'}</p>
      </div>
    </div>
  );
};

export default TrustChecker;
