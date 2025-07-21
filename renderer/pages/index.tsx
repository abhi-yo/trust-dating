import { useState } from 'react';
import { create } from 'zustand';
import Overlay from '../components/Overlay';
import NlpProcessor from '../components/NlpProcessor';
import ActivitySuggester from '../components/ActivitySuggester';

interface Store { 
  interests: string[]; 
  setInterests: (newInterests: string[]) => void; 
}

const useStore = create<Store>((set) => ({ 
  interests: [], 
  setInterests: (newInterests) => set({ interests: newInterests }) 
}));

export default function Home() {
  const [view, setView] = useState<'trust' | 'activities'>('trust');

  return (
    <div style={{ 
      padding: '10px', 
      background: 'rgba(0,0,0,0.8)', 
      borderRadius: '8px',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      minHeight: '100vh'
    }}>
      <h2 style={{ margin: '0 0 20px 0', textAlign: 'center' }}>Trust & Activities Overlay</h2>
      
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '20px',
        justifyContent: 'center'
      }}>
        <button 
          onClick={() => setView('trust')}
          style={{
            padding: '8px 16px',
            backgroundColor: view === 'trust' ? '#007acc' : '#333',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Trust Check
        </button>
        <button 
          onClick={() => setView('activities')}
          style={{
            padding: '8px 16px',
            backgroundColor: view === 'activities' ? '#007acc' : '#333',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Activities
        </button>
      </div>

      {view === 'trust' && <Overlay />}
      {view === 'activities' && (
        <>
          <NlpProcessor />
          <ActivitySuggester />
        </>
      )}
    </div>
  );
}
