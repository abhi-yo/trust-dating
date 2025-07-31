import { useState, useEffect } from 'react';
import SmartReply from '../components/SmartReply';
import Settings from '../components/Settings';
import ApiSetup from '../components/ApiSetup';
import InterestAnalyzer from '../components/InterestAnalyzer';

export default function Home() {
  const [currentView, setCurrentView] = useState<'smartReply' | 'settings' | 'setup' | 'interest'>('setup');
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
    console.log("handleSetupComplete called");
    setIsFirstRun(false);
    setHasValidApiKey(true);
    setCurrentView('smartReply');
    console.log("Setup complete, switching to smartReply view");
  };

  if (isFirstRun || !hasValidApiKey) {
    return <ApiSetup onSetupComplete={handleSetupComplete} />;
  }

  return (
    <>
      <style jsx>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        input[type="range"]::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        input[type="range"]:focus::-webkit-slider-thumb {
          box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3);
        }
      `}</style>
    <div style={{ 
      padding: '0', 
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      borderRadius: '12px',
      color: 'white',
      fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      minHeight: '100vh',
      position: 'relative',
      border: 'none',
      transition: 'background 0.3s ease, backdrop-filter 0.3s ease'
    }}>
      {/* Draggable Header */}
      <div 
        className="drag-handle"
        style={{ 
          background: 'transparent',
          padding: '12px 16px',
          borderRadius: '12px 12px 0 0',
          cursor: 'move',
          userSelect: 'none',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div style={{ 
          fontSize: '14px', 
          fontWeight: '600',
          fontFamily: 'inherit',
          color: '#ffffff'
        }}>
          Dating Smart Reply
        </div>
        <div style={{ 
          fontSize: '11px', 
          opacity: 0.8,
          fontFamily: 'inherit',
          color: '#ffffff'
        }}>
          Cmd+Shift+O
        </div>
      </div>
      
      {/* Main Content */}
      <div className="no-drag" style={{ 
        background: 'transparent',
        borderRadius: '0 0 12px 12px'
      }}>
      
      {/* Simple Navigation */}
      <div style={{ 
        display: 'flex', 
        gap: '0px', 
        marginBottom: '0px',
        justifyContent: 'center',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <button 
          className="no-drag"
          onClick={() => setCurrentView('smartReply')}
          style={{
            flex: 1,
            padding: '12px 16px',
            backgroundColor: 'transparent',
            color: 'white',
            borderBottom: currentView === 'smartReply' ? '2px solid white' : 'none',
            border: 'none',
            borderRadius: '0',
            cursor: 'pointer',
            fontSize: '13px',
            fontFamily: 'inherit',
            fontWeight: currentView === 'smartReply' ? '600' : '400',
            transition: 'all 0.2s ease'
          }}
        >
          💬 Smart Reply
        </button>
        <button 
          className="no-drag"
          onClick={() => setCurrentView('interest')}
          style={{
            flex: 1,
            padding: '12px 16px',
            backgroundColor: 'transparent',
            color: 'white',
            borderBottom: currentView === 'interest' ? '2px solid white' : 'none',
            border: 'none',
            borderRadius: '0',
            cursor: 'pointer',
            fontSize: '13px',
            fontFamily: 'inherit',
            fontWeight: currentView === 'interest' ? '600' : '400',
            transition: 'all 0.2s ease'
          }}
        >
          Interest Detection
        </button>
        <button 
          className="no-drag"
          onClick={() => setCurrentView('settings')}
          style={{
            flex: 1,
            padding: '12px 16px',
            backgroundColor: 'transparent',
            color: 'white',
            borderBottom: currentView === 'settings' ? '2px solid white' : 'none',
            border: 'none',
            borderRadius: '0',
            cursor: 'pointer',
            fontSize: '13px',
            fontFamily: 'inherit',
            fontWeight: currentView === 'settings' ? '600' : '400',
            transition: 'all 0.2s ease'
          }}
        >
          ⚙️ Settings
        </button>
      </div>

      {/* Views */}
      {currentView === 'smartReply' && <SmartReply />}
      
      {currentView === 'interest' && <InterestAnalyzer onBack={() => setCurrentView('smartReply')} />}
      
      {currentView === 'settings' && <Settings />}
      </div>
    </div>
    </>
  );
}
