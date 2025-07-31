import React, { useState, useEffect } from 'react';

export default function Settings() {
  const [opacity, setOpacity] = useState(0.85);
  const [currentProvider, setCurrentProvider] = useState('gemini');
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const opacityResult = await window.electronAPI.getAppOpacity();
        setOpacity(opacityResult.opacity);
        
        const provider = await window.electronAPI.getCurrentProvider();
        setCurrentProvider(provider);
        
        const validKey = await window.electronAPI.hasValidApiKey();
        setHasApiKey(validKey);
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };

    loadSettings();
  }, []);

  const handleOpacityChange = async (newOpacity: number) => {
    setOpacity(newOpacity);
    try {
      await window.electronAPI.setAppOpacity(newOpacity);
    } catch (error) {
      console.error('Failed to update opacity:', error);
    }
  };

  return (
    <div style={{ 
      padding: '24px', 
      color: '#ffffff',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h2 style={{ 
        fontSize: '18px', 
        fontWeight: '600', 
        marginBottom: '24px' 
      }}>
        ⚙️ Settings
      </h2>

      {/* Transparency Settings */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ 
          fontSize: '14px', 
          fontWeight: '500', 
          marginBottom: '12px',
          opacity: 0.9
        }}>
          App Transparency
        </h3>
        
        <div style={{ marginBottom: '12px' }}>
          <input
            type="range"
            min="0.2"
            max="1"
            step="0.05"
            value={opacity}
            onChange={(e) => handleOpacityChange(parseFloat(e.target.value))}
            style={{
              width: '100%',
              height: '4px',
              borderRadius: '2px',
              background: 'rgba(255, 255, 255, 0.2)',
              outline: 'none',
              cursor: 'pointer'
            }}
          />
        </div>
        
        <div style={{ 
          fontSize: '12px', 
          opacity: 0.7,
          textAlign: 'center'
        }}>
          {Math.round(opacity * 100)}% opacity
        </div>
      </div>

      {/* API Configuration */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ 
          fontSize: '14px', 
          fontWeight: '500', 
          marginBottom: '12px',
          opacity: 0.9
        }}>
          AI Provider
        </h3>
        
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          padding: '12px',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '4px' }}>
            Current provider:
          </div>
          <div style={{ 
            fontSize: '14px', 
            fontWeight: '500',
            textTransform: 'capitalize',
            color: hasApiKey ? '#10b981' : '#ef4444'
          }}>
            {currentProvider} {hasApiKey ? '✓' : '⚠️ No API key'}
          </div>
        </div>
        
        {!hasApiKey && (
          <div style={{
            marginTop: '12px',
            padding: '12px',
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#fca5a5'
          }}>
            ⚠️ Please restart the app to configure your API key
          </div>
        )}
      </div>

      {/* Keyboard Shortcuts */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ 
          fontSize: '14px', 
          fontWeight: '500', 
          marginBottom: '12px',
          opacity: 0.9
        }}>
          Keyboard Shortcuts
        </h3>
        
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '8px',
          padding: '16px',
          fontSize: '12px',
          lineHeight: '1.6'
        }}>
          <div style={{ marginBottom: '8px' }}>
            <strong>Cmd/Ctrl + Shift + O</strong> - Show/Hide overlay
          </div>
          <div>
            Copy any message to clipboard to get smart reply suggestions
          </div>
        </div>
      </div>

      {/* About */}
      <div>
        <h3 style={{ 
          fontSize: '14px', 
          fontWeight: '500', 
          marginBottom: '12px',
          opacity: 0.9
        }}>
          About
        </h3>
        
        <div style={{
          fontSize: '12px',
          opacity: 0.7,
          lineHeight: '1.5'
        }}>
          <div>Smart Dating Assistant v1.0</div>
          <div>Your privacy-focused dating conversation helper</div>
          <div style={{ marginTop: '8px' }}>
            All data stays on your device. API requests go directly to your chosen provider.
          </div>
        </div>
      </div>
    </div>
  );
}
