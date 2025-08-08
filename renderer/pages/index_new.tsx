import { useState, useEffect } from 'react';
import SmartReply from '../components/SmartReply';
import Settings from '../components/Settings';
import ApiSetup from '../components/ApiSetup';

export default function Home() {
  const [currentView, setCurrentView] = useState<'smartReply' | 'settings' | 'setup'>('setup');
  const [isFirstRun, setIsFirstRun] = useState(true);
  const [hasValidApiKey, setHasValidApiKey] = useState(false);

  useEffect(() => {
    const checkSetupStatus = async () => {
      try {
        const firstRun = await window.electronAPI.isFirstRun();
        const validKey = await window.electronAPI.hasValidApiKey();
        
        setIsFirstRun(firstRun);
        setHasValidApiKey(validKey);
        
        if (!firstRun && validKey) {
          setCurrentView('smartReply');
        } else {
          setCurrentView('setup');
        }
      } catch (error) {
        console.error('Failed to check setup status:', error);
        setCurrentView('setup');
      }
    };

    checkSetupStatus();
  }, []);

  const handleSetupComplete = () => {
    setIsFirstRun(false);
    setHasValidApiKey(true);
    setCurrentView('smartReply');
  };

  if (isFirstRun || !hasValidApiKey) {
    return <ApiSetup onSetupComplete={handleSetupComplete} />;
  }

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Navigation */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        background: 'rgba(255, 255, 255, 0.1)'
      }}>
        <button
          onClick={() => setCurrentView('smartReply')}
          style={{
            flex: 1,
            padding: '16px',
            background: 'transparent',
            border: 'none',
            color: 'white',
            borderBottom: currentView === 'smartReply' ? '2px solid white' : 'none',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: currentView === 'smartReply' ? '600' : '400',
            transition: 'all 0.2s ease'
          }}
        >
          Smart Reply
        </button>
        <button
          onClick={() => setCurrentView('settings')}
          style={{
            flex: 1,
            padding: '16px',
            background: 'transparent',
            border: 'none',
            color: 'white',
            borderBottom: currentView === 'settings' ? '2px solid white' : 'none',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: currentView === 'settings' ? '600' : '400',
            transition: 'all 0.2s ease'
          }}
        >
          Settings
        </button>
      </div>

      {/* Content */}
      {currentView === 'smartReply' && <SmartReply />}
      {currentView === 'settings' && <Settings />}
    </div>
  );
}
