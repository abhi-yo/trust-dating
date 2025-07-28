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
          `Visit local art gallery (${selectedInterests[0]})`,
          `Coffee tasting at specialty cafe`,
          `Nature walk in nearby park`,
          `Try a new restaurant together`,
          `Attend a live music event`,
          `Check out local farmers market`,
          `Check out theater performances`,
          `Sunrise/sunset viewing spot`
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
      padding: '20px',
      backgroundColor: 'rgba(20, 25, 35, 0.7)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderRadius: '12px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
    }}>
            <h3 style={{ 
        textAlign: 'center', 
        marginBottom: '20px', 
        fontSize: '18px',
        fontWeight: '600',
        color: '#ffffff'
      }}>
        Activity Suggestions
      </h3>
      
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ 
          margin: '0 0 12px 0', 
          color: '#e2e8f0', 
          fontSize: '15px', 
          fontFamily: 'inherit',
          fontWeight: '600'
        }}>
          Select Interests:
        </h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
          {availableInterests.map((interest) => (
            <button
              key={interest}
              onClick={() => toggleInterest(interest)}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                cursor: 'pointer',
                backgroundColor: selectedInterests.includes(interest) ? 'rgba(16, 185, 129, 0.8)' : 'rgba(55, 65, 81, 0.6)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                color: '#fff',
                fontFamily: 'inherit',
                fontWeight: '500',
                transition: 'all 0.3s ease',
                border: selectedInterests.includes(interest) ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: selectedInterests.includes(interest) ? '0 4px 16px rgba(16, 185, 129, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.2)'
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
            padding: '12px',
            backgroundColor: loading || selectedInterests.length === 0 ? 'rgba(107, 114, 128, 0.6)' : 'rgba(220, 53, 69, 0.8)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            color: '#fff',
            border: loading || selectedInterests.length === 0 ? '1px solid rgba(107, 114, 128, 0.3)' : '1px solid rgba(220, 53, 69, 0.5)',
            borderRadius: '8px',
            cursor: loading || selectedInterests.length === 0 ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.3s ease',
            boxShadow: loading || selectedInterests.length === 0 ? 'none' : '0 4px 16px rgba(220, 53, 69, 0.3)'
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
                  <div style={{
          backgroundColor: 'rgba(30, 35, 45, 0.7)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          marginTop: '20px'
        }}>
          <h4 style={{ 
            margin: '0 0 16px 0', 
            color: '#e2e8f0', 
            fontFamily: 'inherit',
            fontSize: '16px',
            fontWeight: '600'
          }}>
            Suggested Activities:
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {activities.map((activity, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: 'rgba(55, 65, 81, 0.6)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#f3f4f6',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(75, 85, 99, 0.8)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(55, 65, 81, 0.6)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {activity}
              </div>
            ))}
          </div>
        </div>
        </div>
      )}
    </div>
  );
};

export default ActivitySuggester;
