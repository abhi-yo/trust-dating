import { useState, useEffect } from 'react';
import { create } from 'zustand';
import TrustChecker from '../components/TrustChecker';
import NlpProcessor from '../components/NlpProcessor';
import ActivitySuggester from '../components/ActivitySuggester';
import DesktopFeatures from '../components/DesktopFeatures';

interface Store { 
  interests: string[]; 
  setInterests: (newInterests: string[]) => void; 
}

const useStore = create<Store>((set) => ({ 
  interests: [], 
  setInterests: (newInterests) => set({ interests: newInterests }) 
}));

export default function Home() {
  const [view, setView] = useState<'trust' | 'chat' | 'activities' | 'desktop' | 'verification' | 'settings'>('trust');
  const [transparency, setTransparency] = useState(85); // Default 85% opacity
  
  // Load saved opacity on component mount
  useEffect(() => {
    async function loadOpacity() {
      try {
        const response = await window.electronAPI.getAppOpacity();
        if (response && typeof response.opacity === 'number') {
          setTransparency(Math.round(response.opacity * 100));
        }
      } catch (error) {
        console.error('Failed to load opacity setting:', error);
      }
    }
    
    loadOpacity();
  }, []);
  
  // Update window opacity when transparency changes
  useEffect(() => {
    async function updateOpacity() {
      try {
        await window.electronAPI.setAppOpacity(transparency / 100);
      } catch (error) {
        console.error('Failed to update opacity:', error);
      }
    }
    
    updateOpacity();
  }, [transparency]);

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
      background: `rgba(0, 0, 0, ${transparency / 100})`,
      backdropFilter: `blur(${Math.max(2, Math.min(10, 12 * transparency / 100))}px)`,
      WebkitBackdropFilter: `blur(${Math.max(2, Math.min(10, 12 * transparency / 100))}px)`,
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
          Trust & Activities
        </div>
        <div style={{ 
          fontSize: '11px', 
          opacity: 0.8,
          fontFamily: 'inherit',
          color: '#ffffff'
        }}>
          Drag to move
        </div>
      </div>
      
      {/* Main Content */}
      <div className="no-drag" style={{ 
        padding: '20px',
        background: 'transparent',
        borderRadius: '0 0 12px 12px'
      }}>
        <h2 style={{ 
          margin: '0 0 24px 0', 
          textAlign: 'center', 
          fontFamily: 'inherit', 
          fontSize: '20px',
          fontWeight: '600',
          color: '#ffffff'
        }}>
          Dating Assistant
        </h2>
      
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        marginBottom: '24px',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        <button 
          className="no-drag"
          onClick={() => setView('trust')}
          style={{
            padding: '8px 16px',
            backgroundColor: 'transparent',
            color: 'white',
            borderBottom: view === 'trust' ? '2px solid white' : 'none',
            border: 'none',
            borderRadius: '0',
            cursor: 'pointer',
            fontSize: '12px',
            fontFamily: 'inherit',
            fontWeight: view === 'trust' ? '600' : '400',
            transition: 'all 0.2s ease'
          }}
        >
          Trust
        </button>
        <button 
          className="no-drag"
          onClick={() => setView('verification')}
          style={{
            padding: '8px 16px',
            backgroundColor: 'transparent',
            color: 'white',
            borderBottom: view === 'verification' ? '2px solid white' : 'none',
            border: 'none',
            borderRadius: '0',
            cursor: 'pointer',
            fontSize: '12px',
            fontFamily: 'inherit',
            fontWeight: view === 'verification' ? '600' : '400',
            transition: 'all 0.2s ease'
          }}
        >
          Advanced
        </button>
        <button 
          className="no-drag"
          onClick={() => setView('chat')}
          style={{
            padding: '8px 16px',
            backgroundColor: 'transparent',
            color: 'white',
            borderBottom: view === 'chat' ? '2px solid white' : 'none',
            border: 'none',
            borderRadius: '0',
            cursor: 'pointer',
            fontSize: '12px',
            fontFamily: 'inherit',
            fontWeight: view === 'chat' ? '600' : '400',
            transition: 'all 0.2s ease'
          }}
        >
          Chat
        </button>
        <button 
          className="no-drag"
          onClick={() => setView('activities')}
          style={{
            padding: '8px 16px',
            backgroundColor: 'transparent',
            color: 'white',
            borderBottom: view === 'activities' ? '2px solid white' : 'none',
            border: 'none',
            borderRadius: '0',
            cursor: 'pointer',
            fontSize: '12px',
            fontFamily: 'inherit',
            fontWeight: view === 'activities' ? '600' : '400',
            transition: 'all 0.2s ease'
          }}
        >
          Activities
        </button>
        <button 
          className="no-drag"
          onClick={() => setView('desktop')}
          style={{
            padding: '8px 16px',
            backgroundColor: 'transparent',
            color: 'white',
            borderBottom: view === 'desktop' ? '2px solid white' : 'none',
            border: 'none',
            borderRadius: '0',
            cursor: 'pointer',
            fontSize: '12px',
            fontFamily: 'inherit',
            fontWeight: view === 'desktop' ? '600' : '400',
            transition: 'all 0.2s ease'
          }}
        >
          Desktop
        </button>
        <button 
          className="no-drag"
          onClick={() => setView('settings')}
          style={{
            padding: '8px 16px',
            backgroundColor: 'transparent',
            color: 'white',
            borderBottom: view === 'settings' ? '2px solid white' : 'none',
            border: 'none',
            borderRadius: '0',
            cursor: 'pointer',
            fontSize: '12px',
            fontFamily: 'inherit',
            fontWeight: view === 'settings' ? '600' : '400',
            transition: 'all 0.2s ease'
          }}
        >
          Settings
        </button>
      </div>

      {view === 'trust' && <TrustChecker />}
      {view === 'verification' && <TrustChecker showAdvanced={true} />}
      {view === 'chat' && <NlpProcessor />}
      {view === 'activities' && <ActivitySuggester />}
      {view === 'desktop' && <DesktopFeatures />}
      {view === 'settings' && (
        <div className="no-drag" style={{ padding: '20px' }}>
          <h3 style={{ 
            margin: '0 0 24px 0', 
            color: '#ffffff',
            fontSize: '18px',
            fontWeight: '600',
            fontFamily: 'inherit'
          }}>
            Settings
          </h3>
          
          <div style={{ marginBottom: '32px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '12px', 
              fontSize: '14px', 
              color: '#ffffff', 
              fontWeight: '500',
              fontFamily: 'inherit'
            }}>
              App Transparency: {transparency}%
            </label>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              marginBottom: '8px'
            }}>
              <span style={{ 
                fontSize: '12px', 
                color: '#cccccc',
                minWidth: '60px'
              }}>
                Transparent
              </span>
              
              <input
                type="range"
                min="20"
                max="100"
                value={transparency}
                onChange={(e) => setTransparency(Number(e.target.value))}
                style={{
                  flex: 1,
                  height: '4px',
                  borderRadius: '2px',
                  background: `linear-gradient(to right, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.8) ${transparency}%, rgba(255, 255, 255, 0.3) ${transparency}%, rgba(255, 255, 255, 0.3) 100%)`,
                  outline: 'none',
                  cursor: 'pointer',
                  WebkitAppearance: 'none',
                  appearance: 'none'
                }}
              />
              
              <span style={{ 
                fontSize: '12px', 
                color: '#cccccc',
                minWidth: '40px'
              }}>
                Solid
              </span>
            </div>
            
            <div style={{ 
              fontSize: '12px', 
              color: '#888888',
              fontStyle: 'italic',
              marginTop: '8px'
            }}>
              Adjust the transparency level of the entire app. This controls both background darkness and blur effect. Lower values make the app more see-through.
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ 
              margin: '0 0 16px 0', 
              color: '#ffffff',
              fontSize: '16px',
              fontWeight: '500',
              fontFamily: 'inherit'
            }}>
              Privacy & Security
            </h4>
            
            <div style={{ 
              padding: '16px',
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#cccccc',
              lineHeight: '1.5'
            }}>
              • All analysis is performed locally on your device<br/>
              • No personal data is stored or transmitted<br/>
              • Use keyboard shortcut Cmd/Ctrl+Shift+O to toggle overlay<br/>
              • Your conversations remain private and secure
            </div>
          </div>

          <div style={{ 
            display: 'flex', 
            gap: '12px',
            marginTop: '24px'
          }}>
            <button
              onClick={() => setTransparency(85)}
              style={{
                padding: '8px 16px',
                background: 'transparent',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.2s ease'
              }}
            >
              Reset to Default (85%)
            </button>
            
            <button
              onClick={() => setView('trust')}
              style={{
                padding: '8px 16px',
                background: 'transparent',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.2s ease'
              }}
            >
              Back to Trust Checker
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
    </>
  );
}
