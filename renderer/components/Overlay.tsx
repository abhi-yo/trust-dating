import React, { useState } from 'react';

const Overlay: React.FC = () => {
  const [url, setUrl] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);

  const analyzePage = async () => {
    if (!url.trim()) {
      setAnalysis('Please enter a valid URL');
      return;
    }

    setLoading(true);
    try {
      // Simulate trust analysis
      const mockAnalysis = `Trust Analysis for ${url}:
      
Domain Analysis:
- SSL Certificate: Valid
- Domain Age: 2+ years
- Security Rating: 8/10

Red Flags:
- None detected

Trust Score: 85/100
- This appears to be a legitimate website
- No suspicious patterns found
- Safe for basic interactions

Recommendations:
- Verify profile information independently
- Start with public meetings
- Trust your instincts`;

      setAnalysis(mockAnalysis);
    } catch (error) {
      setAnalysis('Error analyzing the page. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      padding: '15px',
      backgroundColor: 'rgba(40, 40, 40, 0.95)',
      borderRadius: '8px',
      border: '1px solid #555'
    }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#fff' }}>Trust Analysis</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <input
          type="text"
          placeholder="Enter dating profile URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #555',
            backgroundColor: '#333',
            color: '#fff',
            marginBottom: '10px'
          }}
        />
        <button
          onClick={analyzePage}
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: loading ? '#555' : '#007acc',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Analyzing...' : 'Analyze Trust Score'}
        </button>
      </div>

      {analysis && (
        <div style={{
          backgroundColor: '#222',
          padding: '15px',
          borderRadius: '4px',
          border: '1px solid #555',
          whiteSpace: 'pre-line',
          fontSize: '14px',
          color: '#fff'
        }}>
          {analysis}
        </div>
      )}
    </div>
  );
};

export default Overlay;
