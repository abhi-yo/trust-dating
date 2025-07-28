/// <reference path="../types/index.d.ts" />
import React, { useState } from 'react';

const NlpProcessor: React.FC = () => {
  const [chatText, setChatText] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const processChat = async () => {
    if (!chatText.trim()) {
      return;
    }

    setLoading(true);
    try {
      let extractedInterests: string[];
      
      if (typeof window !== 'undefined' && window.electronAPI) {
        // Use enhanced conversation analysis API
        const analysisResult = await window.electronAPI.processChat({
          conversationId: `nlp_analysis_${Date.now()}`,
          platform: 'Demo',
          contact: 'Analysis',
          newMessage: chatText,
          sender: 'user',
          allMessages: []
        });
        
        // Extract interests from keywords and suggestions
        extractedInterests = [
          ...analysisResult.analysis.keywords,
          ...analysisResult.analysis.suggestions.slice(0, 3)
        ].slice(0, 5);
      } else {
        // Fallback for development/web environment
        extractedInterests = [
          'outdoor activities',
          'food',
          'travel',
          'music',
          'art'
        ].filter(() => Math.random() > 0.5); // Random selection for demo
      }
      
      setInterests(extractedInterests);
    } catch (error) {
      console.error('Error processing chat:', error);
      setInterests(['general interests']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="no-drag" style={{ 
      padding: '20px',
      backgroundColor: 'rgba(20, 25, 35, 0.7)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderRadius: '12px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      marginBottom: '20px',
      fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
    }}>
            <h3 style={{ 
        textAlign: 'center', 
        marginBottom: '20px', 
        fontSize: '18px',
        fontWeight: '600',
        color: '#ffffff'
      }}>
        Chat Analysis
      </h3>
      
      <div style={{ marginBottom: '20px' }}>
        <textarea
          placeholder="Paste your chat conversation here..."
          value={chatText}
          onChange={(e) => setChatText(e.target.value)}
          rows={4}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backgroundColor: 'rgba(55, 65, 81, 0.6)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            color: '#fff',
            marginBottom: '12px',
            resize: 'vertical',
            fontFamily: 'inherit',
            fontSize: '14px'
          }}
        />
        <button
          onClick={processChat}
          disabled={loading || !chatText.trim()}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: loading || !chatText.trim() ? 'rgba(107, 114, 128, 0.6)' : 'rgba(16, 185, 129, 0.8)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            color: '#fff',
            border: loading || !chatText.trim() ? '1px solid rgba(107, 114, 128, 0.3)' : '1px solid rgba(16, 185, 129, 0.5)',
            borderRadius: '8px',
            cursor: loading || !chatText.trim() ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.3s ease',
            boxShadow: loading || !chatText.trim() ? 'none' : '0 4px 16px rgba(16, 185, 129, 0.3)'
          }}
        >
          {loading ? 'Analyzing...' : 'Extract Interests'}
        </button>
      </div>

      {interests.length > 0 && (
        <div style={{
          backgroundColor: 'rgba(30, 35, 45, 0.7)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h4 style={{ 
            margin: '0 0 16px 0', 
            color: '#e2e8f0', 
            fontFamily: 'inherit',
            fontSize: '16px',
            fontWeight: '600'
          }}>
            Detected Interests:
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {interests.map((interest, index) => (
              <span
                key={index}
                style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.8)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  color: '#fff',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  fontWeight: '500',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  boxShadow: '0 2px 8px rgba(59, 130, 246, 0.2)'
                }}
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NlpProcessor;
