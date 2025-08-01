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
  const [manualInput, setManualInput] = useState('');
  const [inputMethod, setInputMethod] = useState<'auto' | 'manual'>('auto');

  useEffect(() => {
    // Listen for detected messages from clipboard
    if (window.electronAPI && typeof window.electronAPI.onMessageDetected === 'function') {
      window.electronAPI.onMessageDetected((data: DetectedMessage) => {
        if (inputMethod === 'auto') {
          setDetectedMessage(data);
          generateReplies(data.message);
        }
      });
    } else {
      console.warn('onMessageDetected not available in electronAPI');
    }

    return () => {
      // Clean up listeners if needed
    };
  }, [selectedTone, inputMethod]);

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

  const handleManualSubmit = async () => {
    const trimmedInput = manualInput.trim();
    if (!trimmedInput || trimmedInput.length < 3) return;
    
    // Limit input length to prevent API issues
    const limitedInput = trimmedInput.length > 500 ? trimmedInput.substring(0, 500) : trimmedInput;
    
    const messageData = {
      message: limitedInput,
      timestamp: Date.now()
    };
    
    setDetectedMessage(messageData);
    await generateReplies(messageData.message);
    setManualInput(''); // Clear input after submission
  };

  const handleInputMethodChange = (method: 'auto' | 'manual') => {
    setInputMethod(method);
    if (method === 'auto') {
      setManualInput('');
    }
    // Clear current message when switching methods
    setDetectedMessage(null);
    setSmartReplies(null);
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
        
        {/* Input Method Toggle */}
        <div style={{ 
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '20px',
          gap: '8px'
        }}>
          <button
            onClick={() => handleInputMethodChange('auto')}
            style={{
              background: inputMethod === 'auto' ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: 'white',
              borderRadius: '6px',
              padding: '8px 16px',
              fontSize: '12px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontWeight: inputMethod === 'auto' ? '600' : '400'
            }}
          >
            📋 Auto Clipboard
          </button>
          <button
            onClick={() => handleInputMethodChange('manual')}
            style={{
              background: inputMethod === 'manual' ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: 'white',
              borderRadius: '6px',
              padding: '8px 16px',
              fontSize: '12px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontWeight: inputMethod === 'manual' ? '600' : '400'
            }}
          >
            ✏️ Manual Input
          </button>
        </div>

        {inputMethod === 'auto' ? (
          <>
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
              <div style={{ fontWeight: '500', marginBottom: '8px' }}>Auto-detection mode:</div>
              <div>1. Copy any message from Tinder, Bumble, Hinge, etc.</div>
              <div>2. Get 3 personalized reply suggestions instantly</div>
              <div>3. Click to copy the perfect response</div>
              <div style={{ marginTop: '8px', opacity: 0.7 }}>
                Or use <kbd style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 4px', borderRadius: '3px' }}>Cmd+Shift+C</kbd> for manual detection
              </div>
            </div>
          </>
        ) : (
          <>
            <div style={{ 
              fontSize: '14px', 
              opacity: 0.8,
              lineHeight: '1.5',
              marginBottom: '20px'
            }}>
              Paste a message below to get personalized reply suggestions
            </div>
            
            <div style={{ marginBottom: '16px', textAlign: 'left' }}>
              <textarea
                value={manualInput}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 500) {
                    setManualInput(value);
                  }
                }}
                placeholder="Paste the message you received here..."
                style={{
                  width: '100%',
                  minHeight: '80px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '8px',
                  padding: '12px',
                  color: 'white',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    handleManualSubmit();
                  }
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(59, 130, 246, 0.6)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                }}
              />
              <div style={{ 
                fontSize: '11px', 
                opacity: 0.6, 
                marginTop: '4px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span>
                  {manualInput.length}/500 characters
                </span>
                <span>
                  Press ⌘+Enter to analyze
                </span>
              </div>
            </div>
            
            <button
              onClick={handleManualSubmit}
              disabled={!manualInput.trim() || manualInput.trim().length < 3 || loading}
              style={{
                background: (manualInput.trim() && manualInput.trim().length >= 3) ? 'rgba(59, 130, 246, 0.8)' : 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: 'white',
                borderRadius: '6px',
                padding: '10px 20px',
                fontSize: '14px',
                cursor: (manualInput.trim() && manualInput.trim().length >= 3) ? 'pointer' : 'not-allowed',
                fontFamily: 'inherit',
                fontWeight: '500',
                opacity: (manualInput.trim() && manualInput.trim().length >= 3) ? 1 : 0.5
              }}
            >
              {loading ? '🔄 Analyzing...' : '✨ Get Smart Replies'}
            </button>
          </>
        )}

        {/* Test button for development */}
        <div style={{ marginTop: '20px' }}>
          <button
            onClick={() => {
              const testMessage = "Hey! How's your weekend going? I'm thinking of checking out that new coffee place downtown.";
              if (inputMethod === 'manual') {
                setManualInput(testMessage);
              } else {
                setDetectedMessage({
                  message: testMessage,
                  timestamp: Date.now()
                });
              }
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: 'rgba(255, 255, 255, 0.7)',
              borderRadius: '4px',
              padding: '6px 12px',
              fontSize: '11px',
              cursor: 'pointer',
              fontFamily: 'inherit'
            }}
          >
            🧪 {inputMethod === 'manual' ? 'Fill with sample' : 'Test with sample'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', color: '#ffffff' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <div>
          <div style={{ 
            fontSize: '16px', 
            fontWeight: '600',
            fontFamily: 'inherit',
            marginBottom: '4px'
          }}>
            Smart Reply Suggestions
          </div>
          <div style={{
            fontSize: '11px',
            opacity: 0.6,
            color: 'rgba(255, 255, 255, 0.7)'
          }}>
            {inputMethod === 'manual' ? '✏️ Manual input' : '📋 Auto-detected'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => {
              setDetectedMessage(null);
              setSmartReplies(null);
              setManualInput('');
            }}
            style={{
              background: 'rgba(59, 130, 246, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: 'white',
              borderRadius: '4px',
              padding: '6px 12px',
              fontSize: '12px',
              cursor: 'pointer',
              fontFamily: 'inherit'
            }}
          >
            ✨ New Message
          </button>
          <button
            onClick={clearMessage}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: 'white',
              borderRadius: '4px',
              padding: '6px 12px',
              fontSize: '12px',
              cursor: 'pointer',
              fontFamily: 'inherit'
            }}
          >
            ✕ Close
          </button>
        </div>
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
