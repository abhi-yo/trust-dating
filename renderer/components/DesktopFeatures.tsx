import React, { useState, useEffect } from 'react';

const DesktopFeatures: React.FC = () => {
  const [autoLaunchEnabled, setAutoLaunchEnabled] = useState(false);
  const [lastCaptureResult, setLastCaptureResult] = useState<string>('');
  const [detectedUrl, setDetectedUrl] = useState<string>('');

  useEffect(() => {
    // Listen for clipboard URL detections
    if (typeof window !== 'undefined' && window.electronAPI) {
      window.electronAPI.onUrlDetected((url: string) => {
        setDetectedUrl(url);
      });

      window.electronAPI.onImageDetected((filePath: string) => {
        console.log('Image detected:', filePath);
      });

      window.electronAPI.onShowSettings(() => {
        // This component could be shown when settings is triggered
        console.log('Show settings triggered');
      });
    }
  }, []);

  const handleCaptureScreen = async () => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      try {
        const result = await window.electronAPI.captureScreen();
        if (result.success) {
          setLastCaptureResult('Screenshot captured successfully!');
        } else {
          setLastCaptureResult(`Capture failed: ${result.error}`);
        }
      } catch (error) {
        setLastCaptureResult('Failed to capture screen');
      }
    }
  };

  const handleToggleAutoLaunch = async () => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      try {
        const newState = !autoLaunchEnabled;
        const result = await window.electronAPI.toggleAutoLaunch(newState);
        if (result.success) {
          setAutoLaunchEnabled(newState);
        }
      } catch (error) {
        console.error('Failed to toggle auto-launch:', error);
      }
    }
  };

  const handleSaveReport = async () => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      const reportData = {
        timestamp: new Date().toISOString(),
        features: {
          clipboardMonitoring: true,
          screenCapture: true,
          fileWatching: true,
          systemTray: true,
          autoLaunch: autoLaunchEnabled,
          nativeNotifications: true
        },
        analysis: {
          trustScore: 88,
          verificationStatus: 'verified',
          platformAnalysis: 'Complete'
        }
      };

      try {
        const result = await window.electronAPI.saveVerificationReport(reportData);
        if (result.success && !result.cancelled) {
          setLastCaptureResult(`Report saved to: ${result.filePath}`);
        }
      } catch (error) {
        setLastCaptureResult('Failed to save report');
      }
    }
  };

  return (
    <div style={{ 
      fontFamily: '"DM Sans", sans-serif',
      padding: '0',
      background: 'transparent',
      color: '#e2e8f0'
    }}>
      <h3 style={{ 
        color: '#ffffff',
        marginBottom: '20px',
        fontSize: '18px',
        fontWeight: '600',
        textAlign: 'center'
      }}>
        Desktop Features
      </h3>
      
      <div style={{ 
        marginBottom: '16px',
        textAlign: 'center'
      }}>
        <p style={{ 
          color: '#94a3b8',
          fontSize: '13px',
          marginBottom: '10px',
          textAlign: 'center',
          lineHeight: '1.4'
        }}>
          Unique capabilities only possible with desktop apps
        </p>
      </div>

      {/* Screen Capture */}
      <div style={{ 
        marginBottom: '16px', 
        padding: '16px', 
        background: 'rgba(30, 41, 59, 0.4)', 
        backdropFilter: 'blur(12px)',
        borderRadius: '12px',
        border: '1px solid rgba(71, 85, 105, 0.4)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}>
        <h4 style={{ 
          color: '#ffffff', 
          fontSize: '14px', 
          marginBottom: '10px', 
          fontWeight: '600'
        }}>
          Screen Capture
        </h4>
        <button
          onClick={handleCaptureScreen}
          className="no-drag"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '12px',
            cursor: 'pointer',
            fontFamily: 'inherit',
            width: '100%',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(8px)',
            fontWeight: '500'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Capture Screen for Verification
        </button>
      </div>

      {/* Clipboard Monitoring */}
      <div style={{ 
        marginBottom: '16px', 
        padding: '16px', 
        background: 'rgba(30, 41, 59, 0.4)', 
        backdropFilter: 'blur(12px)',
        borderRadius: '12px',
        border: '1px solid rgba(71, 85, 105, 0.4)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}>
        <h4 style={{ 
          color: '#ffffff', 
          fontSize: '14px', 
          marginBottom: '8px', 
          fontWeight: '600'
        }}>
          Clipboard Monitoring
        </h4>
        <p style={{ 
          fontSize: '12px', 
          color: '#94a3b8', 
          lineHeight: '1.4',
          marginBottom: '8px'
        }}>
          Automatically detects dating profile URLs copied to clipboard
        </p>
        {detectedUrl && (
          <div style={{ 
            marginTop: '8px', 
            padding: '8px 12px', 
            background: 'rgba(14, 165, 233, 0.15)', 
            backdropFilter: 'blur(8px)',
            borderRadius: '8px',
            fontSize: '11px',
            color: '#38bdf8',
            border: '1px solid rgba(14, 165, 233, 0.3)',
            fontWeight: '500'
          }}>
            Detected: {detectedUrl.substring(0, 40)}...
          </div>
        )}
      </div>

      {/* Auto Launch */}
      <div style={{ 
        marginBottom: '16px', 
        padding: '16px', 
        background: 'rgba(30, 41, 59, 0.4)', 
        backdropFilter: 'blur(12px)',
        borderRadius: '12px',
        border: '1px solid rgba(71, 85, 105, 0.4)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}>
        <h4 style={{ 
          color: '#ffffff', 
          fontSize: '14px', 
          marginBottom: '10px', 
          fontWeight: '600'
        }}>
          Auto Launch
        </h4>
        <label 
          className="no-drag"
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            fontSize: '12px', 
            cursor: 'pointer',
            color: '#e2e8f0',
            fontWeight: '500'
          }}
        >
          <input
            type="checkbox"
            checked={autoLaunchEnabled}
            onChange={handleToggleAutoLaunch}
            style={{ 
              marginRight: '10px',
              accentColor: '#8b5cf6',
              transform: 'scale(1.1)'
            }}
            className="no-drag"
          />
          Start with system
        </label>
      </div>

      {/* File Operations */}
      <div style={{ 
        marginBottom: '16px', 
        padding: '16px', 
        background: 'rgba(30, 41, 59, 0.4)', 
        backdropFilter: 'blur(12px)',
        borderRadius: '12px',
        border: '1px solid rgba(71, 85, 105, 0.4)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}>
        <h4 style={{ 
          color: '#ffffff', 
          fontSize: '14px', 
          marginBottom: '10px', 
          fontWeight: '600'
        }}>
          Native File Operations
        </h4>
        <button
          onClick={handleSaveReport}
          className="no-drag"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '12px',
            cursor: 'pointer',
            fontFamily: 'inherit',
            width: '100%',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(8px)',
            fontWeight: '500'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Save Verification Report
        </button>
      </div>

      {/* Status Display */}
      {lastCaptureResult && (
        <div style={{
          marginTop: '16px',
          padding: '12px',
          background: 'rgba(34, 197, 94, 0.15)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          borderRadius: '8px',
          fontSize: '11px',
          color: '#4ade80',
          lineHeight: '1.4',
          fontWeight: '500'
        }}>
          {lastCaptureResult}
        </div>
      )}

      <div style={{ 
        marginTop: '16px',
        padding: '16px',
        background: 'rgba(120, 53, 15, 0.25)',
        backdropFilter: 'blur(12px)',
        borderRadius: '12px',
        fontSize: '11px',
        color: '#fbbf24',
        lineHeight: '1.5',
        border: '1px solid rgba(217, 119, 6, 0.4)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ 
          fontWeight: '700', 
          marginBottom: '8px',
          fontSize: '12px',
          color: '#ffffff'
        }}>
          Why Desktop App?
        </div>
        <div style={{ 
          color: '#fcd34d',
          fontWeight: '500',
          lineHeight: '1.6'
        }}>
          • Real-time clipboard monitoring<br />
          • Native screen capture without browser permissions<br />
          • System tray integration<br />
          • File system watching<br />
          • Auto-launch with OS<br />
          • Native notifications
        </div>
      </div>
    </div>
  );
};

export default DesktopFeatures;
