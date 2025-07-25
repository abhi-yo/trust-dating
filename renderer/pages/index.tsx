import { useState } from 'react';
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
  const [view, setView] = useState<'trust' | 'chat' | 'activities' | 'desktop' | 'verification'>('trust');

  return (
    <div style={{ 
      padding: '0', 
      background: 'rgba(0,0,0,0.8)', 
      borderRadius: '8px',
      color: 'white',
      fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      minHeight: '100vh',
      position: 'relative'
    }}>
      {/* Draggable Header */}
      <div 
        className="drag-handle"
        style={{ 
          background: 'rgba(0, 122, 204, 0.8)',
          padding: '8px 10px',
          borderRadius: '8px 8px 0 0',
          cursor: 'move',
          userSelect: 'none',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div style={{ 
          fontSize: '12px', 
          fontWeight: '500',
          fontFamily: 'inherit'
        }}>
          Trust & Activities
        </div>
        <div style={{ 
          fontSize: '10px', 
          opacity: 0.7,
          fontFamily: 'inherit'
        }}>
          Drag to move
        </div>
      </div>
      
      {/* Main Content */}
      <div className="no-drag" style={{ padding: '15px' }}>
        <h2 style={{ margin: '0 0 20px 0', textAlign: 'center', fontFamily: 'inherit', fontSize: '18px' }}>Dating Assistant</h2>
      
      <div style={{ 
        display: 'flex', 
        gap: '5px', 
        marginBottom: '20px',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        <button 
          className="no-drag"
          onClick={() => setView('trust')}
          style={{
            padding: '6px 12px',
            backgroundColor: view === 'trust' ? '#007acc' : '#333',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px',
            fontFamily: 'inherit'
          }}
        >
          Trust
        </button>
        <button 
          className="no-drag"
          onClick={() => setView('verification')}
          style={{
            padding: '6px 12px',
            backgroundColor: view === 'verification' ? '#dc3545' : '#333',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px',
            fontFamily: 'inherit'
          }}
        >
          🔍 Advanced
        </button>
        <button 
          className="no-drag"
          onClick={() => setView('chat')}
          style={{
            padding: '6px 12px',
            backgroundColor: view === 'chat' ? '#007acc' : '#333',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px',
            fontFamily: 'inherit'
          }}
        >
          Chat
        </button>
        <button 
          className="no-drag"
          onClick={() => setView('activities')}
          style={{
            padding: '6px 12px',
            backgroundColor: view === 'activities' ? '#007acc' : '#333',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px',
            fontFamily: 'inherit'
          }}
        >
          Activities
        </button>
        <button 
          className="no-drag"
          onClick={() => setView('desktop')}
          style={{
            padding: '6px 12px',
            backgroundColor: view === 'desktop' ? '#007acc' : '#333',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px',
            fontFamily: 'inherit'
          }}
        >
          Desktop
        </button>
      </div>

      {view === 'trust' && <TrustChecker />}
      {view === 'verification' && <TrustChecker showAdvanced={true} />}
      {view === 'chat' && <NlpProcessor />}
      {view === 'activities' && <ActivitySuggester />}
      {view === 'desktop' && <DesktopFeatures />}
      </div>
    </div>
  );
}
