/// <reference path="../types/index.d.ts" />
import React, { useState } from 'react';

const ActivitySuggester: React.FC = () => {
  const [activities, setActivities] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const availableInterests = [
    'outdoor activities',
    'food',
    'travel',
    'music',
    'art',
    'sports',
    'movies',
    'books',
    'gaming',
    'fitness'
  ];

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const fetchActivities = async () => {
    if (selectedInterests.length === 0) {
      return;
    }

    setLoading(true);
    try {
      let result: string[];
      
      if (typeof window !== 'undefined' && window.electronAPI) {
        // Use Electron API when available
        result = await window.electronAPI.fetchActivities(selectedInterests);
      } else {
        // Fallback activities for development/web environment
        const mockActivities = [
          `🎨 Visit local art gallery (${selectedInterests[0]})`,
          `☕ Coffee tasting at specialty cafe`,
          `🌳 Nature walk in nearby park`,
          `🍽️ Try a new restaurant together`,
          `🎵 Attend a live music event`,
          `🏛️ Explore local museums`,
          `🎭 Check out theater performances`,
          `🌅 Sunrise/sunset viewing spot`
        ];
        
        result = mockActivities
          .sort(() => Math.random() - 0.5)
          .slice(0, 5);
      }
      
      setActivities(result);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setActivities(['Coffee meetup at local cafe', 'Walk in public park']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="no-drag" style={{ 
      padding: '15px',
      backgroundColor: 'rgba(40, 40, 40, 0.95)',
      borderRadius: '8px',
      border: '1px solid #555',
      fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#fff', fontFamily: 'inherit' }}>Activity Suggestions</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#fff', fontSize: '14px', fontFamily: 'inherit' }}>
          Select Interests:
        </h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '15px' }}>
          {availableInterests.map((interest) => (
            <button
              key={interest}
              onClick={() => toggleInterest(interest)}
              style={{
                padding: '6px 12px',
                borderRadius: '4px',
                border: 'none',
                fontSize: '12px',
                cursor: 'pointer',
                backgroundColor: selectedInterests.includes(interest) ? '#28a745' : '#555',
                color: '#fff',
                fontFamily: 'inherit'
              }}
            >
              {interest}
            </button>
          ))}
        </div>
        
        <button
          onClick={fetchActivities}
          disabled={loading || selectedInterests.length === 0}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: loading || selectedInterests.length === 0 ? '#555' : '#dc3545',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: loading || selectedInterests.length === 0 ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit'
          }}
        >
          {loading ? 'Finding Activities...' : 'Get Activity Suggestions'}
        </button>
      </div>

      {activities.length > 0 && (
        <div style={{
          backgroundColor: '#222',
          padding: '15px',
          borderRadius: '4px',
          border: '1px solid #555'
        }}>
          <h4 style={{ margin: '0 0 15px 0', color: '#fff', fontFamily: 'inherit' }}>Suggested Activities:</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {activities.map((activity, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: '#333',
                  padding: '10px',
                  borderRadius: '4px',
                  border: '1px solid #555',
                  color: '#fff',
                  fontSize: '14px',
                  fontFamily: 'inherit'
                }}
              >
                {activity}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivitySuggester;
