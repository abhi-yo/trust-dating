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
      padding: '15px',
      backgroundColor: 'rgba(40, 40, 40, 0.95)',
      borderRadius: '8px',
      border: '1px solid #555',
      marginBottom: '15px',
      fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#fff', fontFamily: 'inherit' }}>Chat Analysis</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <textarea
          placeholder="Paste your chat conversation here..."
          value={chatText}
          onChange={(e) => setChatText(e.target.value)}
          rows={4}
          style={{
            width: '100%',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #555',
            backgroundColor: '#333',
            color: '#fff',
            marginBottom: '10px',
            resize: 'vertical',
            fontFamily: 'inherit'
          }}
        />
        <button
          onClick={processChat}
          disabled={loading || !chatText.trim()}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: loading || !chatText.trim() ? '#555' : '#28a745',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: loading || !chatText.trim() ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit'
          }}
        >
          {loading ? 'Analyzing...' : 'Extract Interests'}
        </button>
      </div>

      {interests.length > 0 && (
        <div style={{
          backgroundColor: '#222',
          padding: '15px',
          borderRadius: '4px',
          border: '1px solid #555'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#fff', fontFamily: 'inherit' }}>Detected Interests:</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {interests.map((interest, index) => (
              <span
                key={index}
                style={{
                  backgroundColor: '#007acc',
                  color: '#fff',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontFamily: 'inherit'
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
