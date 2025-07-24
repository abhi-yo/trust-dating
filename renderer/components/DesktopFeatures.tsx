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
        color: '#f1f5f9',
        marginBottom: '16px',
        fontSize: '16px',
        fontWeight: '600',
        textAlign: 'center'
      }}>
        Desktop Features
      </h3>
      
      <div style={{ marginBottom: '12px' }}>
        <p style={{ 
          color: '#94a3b8',
          fontSize: '12px',
          marginBottom: '8px',
          textAlign: 'center',
          lineHeight: '1.4'
        }}>
          Unique capabilities only possible with desktop apps
        </p>
      </div>

      {/* Screen Capture */}
      <div style={{ 
        marginBottom: '12px', 
        padding: '12px', 
        background: 'rgba(30, 41, 59, 0.3)', 
        borderRadius: '8px',
        border: '1px solid rgba(71, 85, 105, 0.3)'
      }}>
        <h4 style={{ 
          color: '#cbd5e1', 
          fontSize: '13px', 
          marginBottom: '8px', 
          fontWeight: '500' 
        }}>
          Screen Capture
        </h4>
        <button
          onClick={handleCaptureScreen}
          className="no-drag"
          style={{
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            color: 'white',
            border: 'none',
            padding: '6px 12px',
            borderRadius: '4px',
            fontSize: '11px',
            cursor: 'pointer',
            fontFamily: 'inherit',
            width: '100%',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.8)';
          }}
        >
          Capture Screen for Verification
        </button>
      </div>

      {/* Clipboard Monitoring */}
      <div style={{ 
        marginBottom: '12px', 
        padding: '12px', 
        background: 'rgba(30, 41, 59, 0.3)', 
        borderRadius: '8px',
        border: '1px solid rgba(71, 85, 105, 0.3)'
      }}>
        <h4 style={{ 
          color: '#cbd5e1', 
          fontSize: '13px', 
          marginBottom: '6px', 
          fontWeight: '500' 
        }}>
          Clipboard Monitoring
        </h4>
        <p style={{ fontSize: '11px', color: '#94a3b8', lineHeight: '1.3' }}>
          Automatically detects dating profile URLs copied to clipboard
        </p>
        {detectedUrl && (
          <div style={{ 
            marginTop: '6px', 
            padding: '6px', 
            background: 'rgba(14, 165, 233, 0.1)', 
            borderRadius: '4px',
            fontSize: '10px',
            color: '#38bdf8',
            border: '1px solid rgba(14, 165, 233, 0.2)'
          }}>
            Detected: {detectedUrl.substring(0, 40)}...
          </div>
        )}
      </div>

      {/* Auto Launch */}
      <div style={{ 
        marginBottom: '12px', 
        padding: '12px', 
        background: 'rgba(30, 41, 59, 0.3)', 
        borderRadius: '8px',
        border: '1px solid rgba(71, 85, 105, 0.3)'
      }}>
        <h4 style={{ 
          color: '#cbd5e1', 
          fontSize: '13px', 
          marginBottom: '8px', 
          fontWeight: '500' 
        }}>
          Auto Launch
        </h4>
        <label 
          className="no-drag"
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            fontSize: '11px', 
            cursor: 'pointer',
            color: '#e2e8f0'
          }}
        >
          <input
            type="checkbox"
            checked={autoLaunchEnabled}
            onChange={handleToggleAutoLaunch}
            style={{ 
              marginRight: '8px',
              accentColor: '#3b82f6'
            }}
            className="no-drag"
          />
          Start with system
        </label>
      </div>

      {/* File Operations */}
      <div style={{ 
        marginBottom: '12px', 
        padding: '12px', 
        background: 'rgba(30, 41, 59, 0.3)', 
        borderRadius: '8px',
        border: '1px solid rgba(71, 85, 105, 0.3)'
      }}>
        <h4 style={{ 
          color: '#cbd5e1', 
          fontSize: '13px', 
          marginBottom: '8px', 
          fontWeight: '500' 
        }}>
          Native File Operations
        </h4>
        <button
          onClick={handleSaveReport}
          className="no-drag"
          style={{
            backgroundColor: 'rgba(16, 185, 129, 0.8)',
            color: 'white',
            border: 'none',
            padding: '6px 12px',
            borderRadius: '4px',
            fontSize: '11px',
            cursor: 'pointer',
            fontFamily: 'inherit',
            width: '100%',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.8)';
          }}
        >
          Save Verification Report
        </button>
      </div>

      {/* Status Display */}
      {lastCaptureResult && (
        <div style={{
          marginTop: '12px',
          padding: '8px',
          background: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid rgba(34, 197, 94, 0.2)',
          borderRadius: '4px',
          fontSize: '10px',
          color: '#4ade80',
          lineHeight: '1.3'
        }}>
          {lastCaptureResult}
        </div>
      )}

      <div style={{ 
        marginTop: '12px',
        padding: '10px',
        background: 'rgba(120, 53, 15, 0.2)',
        borderRadius: '6px',
        fontSize: '10px',
        color: '#fbbf24',
        lineHeight: '1.4',
        border: '1px solid rgba(217, 119, 6, 0.3)'
      }}>
        <div style={{ fontWeight: '600', marginBottom: '4px' }}>Why Desktop App?</div>
        <div style={{ color: '#fcd34d' }}>
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
