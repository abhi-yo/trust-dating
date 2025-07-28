import React, { useState, useEffect } from 'react';

interface ConversationData {
  id: string;
  contact: string;
  platform: string;
  trust_score: number;
  conversation_health: number;
  relationship_stage: string;
  last_interaction: number;
  message_count: number;
}

interface DashboardStats {
  total_conversations: number;
  active_conversations: number;
  avg_trust_score: number;
  avg_conversation_health: number;
  dates_secured: number;
  positive_responses: number;
  success_rate: number;
}

interface Insight {
  type: string;
  message: string;
  confidence: number;
  timestamp: number;
}

const DatingDashboard: React.FC = () => {
  const [conversations, setConversations] = useState<ConversationData[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total_conversations: 0,
    active_conversations: 0,
    avg_trust_score: 0,
    avg_conversation_health: 0,
    dates_secured: 0,
    positive_responses: 0,
    success_rate: 0
  });
  const [insights, setInsights] = useState<Insight[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const dashboard = await window.electronAPI.getDatingDashboard();
      setConversations(dashboard.conversations);
      setStats(dashboard.stats);
      setInsights(dashboard.insights);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  };

  const testConversationAnalysis = async () => {
    setLoading(true);
    try {
      // Simulate a dating conversation
      const testChatData = {
        conversationId: 'demo_conversation_1',
        platform: 'Tinder',
        contact: 'Sarah',
        newMessage: "Hey! I saw you're into hiking too. Have you been to any good trails lately? I just discovered this amazing spot in the mountains last weekend",
        sender: 'contact' as const,
        allMessages: [
          {
            text: "Hey! How's your week going?",
            timestamp: Date.now() - 7200000, // 2 hours ago
            sender: 'user' as const
          },
          {
            text: "Pretty good! Just finished a great workout. How about you?",
            timestamp: Date.now() - 6300000, // 1.75 hours ago
            sender: 'contact' as const
          },
          {
            text: "Nice! I love staying active too. What kind of workouts do you enjoy?",
            timestamp: Date.now() - 5400000, // 1.5 hours ago
            sender: 'user' as const
          },
          {
            text: "I'm really into hiking and rock climbing. There's something about being outdoors that just energizes me!",
            timestamp: Date.now() - 4500000, // 1.25 hours ago
            sender: 'contact' as const
          },
          {
            text: "That sounds amazing! I've been wanting to try rock climbing. Any beginner-friendly places you'd recommend?",
            timestamp: Date.now() - 3600000, // 1 hour ago
            sender: 'user' as const
          }
        ]
      };

      const result = await window.electronAPI.processChat(testChatData);
      setAnalysisResult(result);
      setSelectedConversation('demo_conversation_1');
      
      // Reload dashboard to see updated data
      await loadDashboard();
    } catch (error) {
      console.error('Error analyzing conversation:', error);
    }
    setLoading(false);
  };

  const provideFeedback = async (advice: string, outcome: 'positive' | 'negative' | 'neutral') => {
    try {
      await window.electronAPI.provideAdviceFeedback({
        conversationId: selectedConversation,
        adviceUsed: advice,
        outcome,
        context: 'User testing feedback'
      });
      alert(`Feedback recorded! The AI will learn from this ${outcome} outcome.`);
    } catch (error) {
      console.error('Error providing feedback:', error);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getHealthColor = (score: number) => {
    if (score >= 0.8) return 'text-green-400';
    if (score >= 0.6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning': return '';
      case 'opportunity': return '';
      case 'advice': return '';
      case 'pattern': return '';
      default: return '';
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, rgba(6, 10, 20, 0.95), rgba(15, 23, 42, 0.95))',
      backdropFilter: 'blur(20px)',
      color: '#e2e8f0',
      padding: '24px',
      fontFamily: '"DM Sans", sans-serif'
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: '700', 
            marginBottom: '8px',
            color: '#ffffff'
          }}>
            Dating Intelligence Dashboard
          </h1>
          <p style={{ 
            color: '#94a3b8',
            fontSize: '16px',
            lineHeight: '1.5'
          }}>
            Advanced AI-powered dating assistant with conversation analysis, safety monitoring, and personalized advice
          </p>
        </div>

        {/* Demo Button */}
        <div className="mb-8">
          <button
            onClick={testConversationAnalysis}
            disabled={loading}
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 px-6 py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50"
          >
            {loading ? '🔄 Analyzing...' : '🧪 Test AI Analysis'}
          </button>
          <p className="text-sm text-gray-400 mt-2">Click to analyze a sample conversation with our advanced AI systems</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900/60 backdrop-blur-md border border-gray-700 rounded-xl p-6">
            <div className="text-2xl font-bold text-blue-400">{stats.total_conversations}</div>
            <div className="text-gray-400">Total Conversations</div>
          </div>
          <div className="bg-gray-900/60 backdrop-blur-md border border-gray-700 rounded-xl p-6">
            <div className="text-2xl font-bold text-green-400">{stats.active_conversations}</div>
            <div className="text-gray-400">Active Chats</div>
          </div>
          <div className="bg-gray-900/60 backdrop-blur-md border border-gray-700 rounded-xl p-6">
            <div className="text-2xl font-bold text-purple-400">{Math.round(stats.avg_trust_score * 100)}%</div>
            <div className="text-gray-400">Avg Trust Score</div>
          </div>
          <div className="bg-gray-900/60 backdrop-blur-md border border-gray-700 rounded-xl p-6">
            <div className="text-2xl font-bold text-pink-400">{stats.dates_secured}</div>
            <div className="text-gray-400">Dates Secured</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Analysis Results */}
          {analysisResult && (
            <div className="bg-gray-900/60 backdrop-blur-md border border-gray-700 rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4">AI Analysis Results</h2>
              
              {/* Message Analysis */}
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Message Analysis</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Sentiment:</span>
                    <span className={analysisResult.analysis.sentiment > 0.3 ? 'text-green-400' : analysisResult.analysis.sentiment < -0.3 ? 'text-red-400' : 'text-yellow-400'}>
                      {(analysisResult.analysis.sentiment * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tone:</span>
                    <span className="text-blue-400 capitalize">{analysisResult.analysis.tone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Engagement:</span>
                    <span className="text-purple-400">{(analysisResult.analysis.engagement * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>

              {/* Safety Score */}
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Safety & Trust</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Trust Score:</span>
                    <span className={getHealthColor(analysisResult.safety.trust_score)}>
                      {(analysisResult.safety.trust_score * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Conversation Health:</span>
                    <span className={getHealthColor(analysisResult.safety.conversation_health)}>
                      {(analysisResult.safety.conversation_health * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* AI Advice */}
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Personalized Advice</h3>
                <div className="space-y-3">
                  {analysisResult.advice.slice(0, 3).map((advice: any, index: number) => (
                    <div key={index} className="bg-gray-800/50 rounded-lg p-3">
                      <div className="font-medium text-blue-400 text-sm mb-1">{advice.type.replace('_', ' ').toUpperCase()}</div>
                      <div className="text-sm mb-2">"{advice.message}"</div>
                      <div className="text-xs text-gray-400 mb-2">{advice.explanation}</div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => provideFeedback(advice.message, 'positive')}
                          className="text-xs bg-green-600 hover:bg-green-700 px-2 py-1 rounded transition-colors"
                        >
                          Helpful
                        </button>
                        <button
                          onClick={() => provideFeedback(advice.message, 'negative')}
                          className="text-xs bg-red-600 hover:bg-red-700 px-2 py-1 rounded transition-colors"
                        >
                          👎 Not helpful
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Conversation Metrics */}
              <div>
                <h3 className="font-semibold mb-2">Conversation Metrics</h3>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <div className="text-gray-400">Response Time</div>
                    <div className="text-green-400">{(analysisResult.metrics.responseTime * 100).toFixed(0)}%</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Reciprocity</div>
                    <div className="text-blue-400">{(analysisResult.metrics.reciprocity * 100).toFixed(0)}%</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Question Asking</div>
                    <div className="text-purple-400">{(analysisResult.metrics.questionAsking * 100).toFixed(0)}%</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Interest Level</div>
                    <div className="text-pink-400">{(analysisResult.metrics.interestLevel * 100).toFixed(0)}%</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recent Insights */}
          <div className="bg-gray-900/60 backdrop-blur-md border border-gray-700 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">Recent Insights</h2>
            <div className="space-y-3">
              {insights.length > 0 ? insights.slice(0, 6).map((insight, index) => (
                <div key={index} className="bg-gray-800/50 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <span className="text-lg">{getInsightIcon(insight.type)}</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{insight.message}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        Confidence: {(insight.confidence * 100).toFixed(0)}% • {formatTimestamp(insight.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center text-gray-400 py-8">
                  <div className="text-2xl mb-2"></div>
                  <div>No insights yet</div>
                  <div className="text-sm">Start analyzing conversations to see AI insights</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Conversations List */}
        {conversations.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">💬 Your Conversations</h2>
            <div className="bg-gray-900/60 backdrop-blur-md border border-gray-700 rounded-xl p-6">
              <div className="space-y-3">
                {conversations.map((conv) => (
                  <div key={conv.id} className="bg-gray-800/50 rounded-lg p-4 cursor-pointer hover:bg-gray-800/70 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold">{conv.contact}</div>
                        <div className="text-sm text-gray-400">{conv.platform} • {conv.message_count} messages</div>
                        <div className="text-xs text-gray-500 mt-1">Stage: {conv.relationship_stage}</div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm ${getHealthColor(conv.trust_score)}`}>
                          Trust: {(conv.trust_score * 100).toFixed(0)}%
                        </div>
                        <div className={`text-sm ${getHealthColor(conv.conversation_health)}`}>
                          Health: {(conv.conversation_health * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatTimestamp(conv.last_interaction)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Feature Highlights */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">AI Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 border border-blue-700 rounded-xl p-6">
              <div className="text-2xl mb-2"></div>
              <h3 className="font-semibold mb-2">Conversation Analysis</h3>
              <p className="text-sm text-gray-300">Real-time sentiment analysis, tone detection, and engagement scoring with NLP</p>
            </div>
            <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 border border-purple-700 rounded-xl p-6">
              <div className="text-2xl mb-2"></div>
              <h3 className="font-semibold mb-2">Personalized Learning</h3>
              <p className="text-sm text-gray-300">AI learns from your successes and failures to improve advice over time</p>
            </div>
            <div className="bg-gradient-to-br from-red-900/40 to-red-800/40 border border-red-700 rounded-xl p-6">
              <div className="text-2xl mb-2"></div>
              <h3 className="font-semibold mb-2">Safety Detection</h3>
              <p className="text-sm text-gray-300">Advanced scammer, catfish, and red flag detection with real-time alerts</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatingDashboard;
