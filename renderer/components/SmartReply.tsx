import { useState, useEffect } from 'react';

interface SmartReply {
  text: string;
  reason: string;
}

interface SmartReplyData {
  replies: SmartReply[];
  sentiment: string;
  tips: string[];
  fallback?: boolean;
  note?: string;
}

interface DetectedMessage {
  message: string;
  timestamp: number;
}

export default function SmartReply() {
  const [detectedMessage, setDetectedMessage] = useState<DetectedMessage | null>(null);
  const [smartReplies, setSmartReplies] = useState<SmartReplyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTone, setSelectedTone] = useState<'casual' | 'fun' | 'romantic' | 'witty'>('casual');

  useEffect(() => {
    // Listen for detected messages from clipboard
    if (window.electronAPI && typeof window.electronAPI.onMessageDetected === 'function') {
      window.electronAPI.onMessageDetected((data: DetectedMessage) => {
        setDetectedMessage(data);
        generateReplies(data.message);
      });
    } else {
      console.warn('onMessageDetected not available in electronAPI');
      // For testing, we can simulate a message detection
      // setTimeout(() => {
      //   setDetectedMessage({
      //     message: "Hey! How's your weekend going?",
      //     timestamp: Date.now()
      //   });
      // }, 2000);
    }

    return () => {
      // Clean up listeners if needed
    };
  }, [selectedTone]);

  const generateReplies = async (message: string) => {
    setLoading(true);
    try {
      const result = await window.electronAPI.generateSmartReplies({
        message,
        tone: selectedTone,
        context: 'Dating app conversation'
      });

      if (result.success) {
        setSmartReplies(result);
      } else {
        console.error('Failed to generate replies:', result.error);
      }
    } catch (error) {
      console.error('Error generating smart replies:', error);
    }
    setLoading(false);
  };

  const copyToClipboard = async (replyText: string) => {
    try {
      await navigator.clipboard.writeText(replyText);
      // Visual feedback
      const button = document.activeElement as HTMLButtonElement;
      if (button) {
        const originalText = button.textContent;
        button.textContent = '✓ Copied!';
        setTimeout(() => {
          button.textContent = originalText;
        }, 1500);
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const clearMessage = () => {
    setDetectedMessage(null);
    setSmartReplies(null);
  };

  if (!detectedMessage) {
    return (
      <div style={{ 
        padding: '24px', 
        textAlign: 'center',
        color: '#ffffff'
      }}>
        <div style={{ 
          fontSize: '18px', 
          fontWeight: '600', 
          marginBottom: '12px',
          fontFamily: 'inherit'
        }}>
          💬 Smart Reply Assistant
        </div>
        <div style={{ 
          fontSize: '14px', 
          opacity: 0.8,
          lineHeight: '1.5',
          marginBottom: '20px'
        }}>
          Copy a message from any dating app to get smart reply suggestions!
        </div>
        
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          padding: '16px',
          fontSize: '13px',
          lineHeight: '1.4',
          marginBottom: '20px'
        }}>
          <div style={{ fontWeight: '500', marginBottom: '8px' }}>How it works:</div>
          <div>1. Copy any message from Tinder, Bumble, Hinge, etc.</div>
          <div>2. Get 3 personalized reply suggestions instantly</div>
          <div>3. Click to copy the perfect response</div>
        </div>

        {/* Test button for development */}
        <button
          onClick={() => {
            setDetectedMessage({
              message: "Hey! How's your weekend going? I'm thinking of checking out that new coffee place downtown.",
              timestamp: Date.now()
            });
          }}
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            color: 'white',
            borderRadius: '6px',
            padding: '8px 16px',
            fontSize: '12px',
            cursor: 'pointer',
            fontFamily: 'inherit'
          }}
        >
          🧪 Test with Sample Message
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', color: '#ffffff' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <div style={{ 
          fontSize: '16px', 
          fontWeight: '600',
          fontFamily: 'inherit'
        }}>
          Smart Reply Suggestions
        </div>
        <button
          onClick={clearMessage}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            color: 'white',
            borderRadius: '4px',
            padding: '4px 8px',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          ✕ Clear
        </button>
      </div>

      {/* Original Message */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ 
          fontSize: '12px', 
          opacity: 0.7, 
          marginBottom: '8px',
          fontWeight: '500'
        }}>
          THEIR MESSAGE:
        </div>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          padding: '12px',
          fontSize: '14px',
          lineHeight: '1.4',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          "{detectedMessage.message}"
        </div>
      </div>

      {/* Tone Selector */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ 
          fontSize: '12px', 
          opacity: 0.7, 
          marginBottom: '8px',
          fontWeight: '500'
        }}>
          REPLY TONE:
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {(['casual', 'fun', 'romantic', 'witty'] as const).map(tone => (
            <button
              key={tone}
              onClick={() => {
                setSelectedTone(tone);
                generateReplies(detectedMessage.message);
              }}
              style={{
                background: selectedTone === tone ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: 'white',
                borderRadius: '16px',
                padding: '6px 12px',
                fontSize: '11px',
                cursor: 'pointer',
                textTransform: 'capitalize',
                fontFamily: 'inherit'
              }}
            >
              {tone}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ 
          textAlign: 'center', 
          padding: '20px',
          fontSize: '14px',
          opacity: 0.8
        }}>
          Generating smart replies...
        </div>
      )}

      {/* Smart Reply Suggestions */}
      {smartReplies && !loading && (
        <div>
          <div style={{ 
            fontSize: '12px', 
            opacity: 0.7, 
            marginBottom: '12px',
            fontWeight: '500'
          }}>
            SUGGESTED REPLIES:
          </div>
          
          {/* Show fallback notice if using offline responses */}
          {smartReplies.fallback && (
            <div style={{
              background: 'rgba(255, 165, 0, 0.2)',
              border: '1px solid rgba(255, 165, 0, 0.4)',
              borderRadius: '6px',
              padding: '8px',
              marginBottom: '12px',
              fontSize: '11px',
              color: '#ffcc80'
            }}>
              💡 {smartReplies.note || 'Using smart fallback suggestions'}
            </div>
          )}
          
          {smartReplies.replies.map((reply, index) => (
            <div
              key={index}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                padding: '14px',
                marginBottom: '12px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{
                fontSize: '14px',
                marginBottom: '8px',
                lineHeight: '1.4'
              }}>
                "{reply.text}"
              </div>
              
              <div style={{
                fontSize: '11px',
                opacity: 0.6,
                marginBottom: '10px',
                fontStyle: 'italic'
              }}>
                {reply.reason}
              </div>
              
              <button
                onClick={() => copyToClipboard(reply.text)}
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: 'none',
                  color: 'white',
                  borderRadius: '4px',
                  padding: '6px 12px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'background 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                }}
              >
                📋 Copy Reply
              </button>
            </div>
          ))}

          {/* Conversation Tips */}
          {smartReplies.tips && smartReplies.tips.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <div style={{ 
                fontSize: '12px', 
                opacity: 0.7, 
                marginBottom: '8px',
                fontWeight: '500'
              }}>
                💡 CONVERSATION TIPS:
              </div>
              <div style={{
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '12px',
                lineHeight: '1.4'
              }}>
                {smartReplies.tips.map((tip, index) => (
                  <div key={index} style={{ marginBottom: '4px' }}>
                    • {tip}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
