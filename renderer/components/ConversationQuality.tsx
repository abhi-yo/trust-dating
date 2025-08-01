import React, { useState, useEffect } from "react";
import { ConversationQualityChecker, ConversationQualityResult } from '../lib/conversationQualityChecker';

interface ConversationQualityProps {
  onClose?: () => void;
  onBack?: () => void;
}

export default function ConversationQuality({ onClose, onBack }: ConversationQualityProps) {
  const [conversationText, setConversationText] = useState("");
  const [analysis, setAnalysis] = useState<ConversationQualityResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [checker] = useState(() => new ConversationQualityChecker());
  const [clipboardText, setClipboardText] = useState("");

  // Auto-detect clipboard content
  useEffect(() => {
    const checkClipboard = async () => {
      try {
        if (window.electronAPI?.getClipboard) {
          const clipText = await window.electronAPI.getClipboard();
          if (clipText && clipText !== clipboardText && clipText.length > 50) {
            if (clipText.includes('\n') || /:\s/.test(clipText) || clipText.length > 200) {
              setClipboardText(clipText);
            }
          }
        }
      } catch (error) {
        console.log('Clipboard access not available');
      }
    };

    checkClipboard();
    const interval = setInterval(checkClipboard, 2000);
    return () => clearInterval(interval);
  }, [clipboardText]);

  const handleUseClipboard = () => {
    setConversationText(clipboardText);
    setClipboardText("");
  };

  const handleAnalyze = async () => {
    if (!conversationText.trim()) return;
    setIsAnalyzing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      const result = checker.analyzeConversation(conversationText);
      setAnalysis(result);
    } catch (error) {
      console.error("Error analyzing conversation:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const clipboardText = await window.electronAPI.getClipboard();
      setConversationText(clipboardText);
    } catch (error) {
      console.error("Error reading clipboard:", error);
    }
  };

  const getEngagementColor = (level: string) => {
    switch (level) {
      case 'Excellent': return "#ffffff";
      case 'Good': return "#f3f4f6";
      case 'Average': return "#d1d5db";
      case 'Poor': return "#9ca3af";
      case 'Very Poor': return "#6b7280";
      default: return "#9ca3af";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "#ffffff";
    if (score >= 70) return "#f3f4f6";
    if (score >= 55) return "#d1d5db";
    if (score >= 35) return "#9ca3af";
    return "#6b7280";
  };

  const getScoreBarWidth = (score: number) => {
    return Math.max(score, 5);
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.7)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, fontFamily: "system-ui, -apple-system, sans-serif"
    }}>
      <div style={{
        backgroundColor: "rgba(0, 0, 0, 0.95)", borderRadius: "12px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
        width: "90%", maxWidth: "700px", maxHeight: "85vh",
        overflow: "hidden", display: "flex", flexDirection: "column"
      }}>
        
        {/* Header */}
        <div style={{
          padding: "16px 20px", borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          display: "flex", alignItems: "center", justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {onBack && (
              <button onClick={onBack} style={{
                background: "none", border: "none", color: "#9ca3af",
                fontSize: "18px", cursor: "pointer", padding: "4px", borderRadius: "4px"
              }}>←</button>
            )}
            <div>
              <h2 style={{ margin: 0, color: "white", fontSize: "18px", fontWeight: "500" }}>
                Conversation Quality Checker
              </h2>
              <p style={{ margin: "2px 0 0 0", color: "#9ca3af", fontSize: "13px" }}>
                Get feedback on your messaging engagement
              </p>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} style={{
              background: "none", border: "none", color: "#9ca3af",
              fontSize: "20px", cursor: "pointer", padding: "4px", borderRadius: "4px"
            }}>×</button>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: "20px", overflow: "auto", flex: 1 }}>
          
          {/* Clipboard Detection */}
          {clipboardText && (
            <div style={{
              marginBottom: "16px", padding: "12px",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "8px"
            }}>
              <p style={{ margin: "0 0 8px 0", color: "#d1d5db", fontSize: "13px" }}>
                Conversation detected in clipboard
              </p>
              <button onClick={handleUseClipboard} style={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                color: "#ffffff", padding: "6px 12px",
                borderRadius: "6px", fontSize: "12px", cursor: "pointer"
              }}>Use This Text</button>
            </div>
          )}

          {/* Input Section */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{
              display: "block", color: "#d1d5db", fontSize: "14px",
              marginBottom: "8px", fontWeight: "500"
            }}>Paste your conversation:</label>
            
            <div style={{ position: "relative" }}>
              <textarea
                value={conversationText}
                onChange={(e) => setConversationText(e.target.value)}
                placeholder="Paste your conversation here to analyze your messaging style..."
                style={{
                  width: "100%", height: "120px", padding: "12px",
                  backgroundColor: "rgba(0, 0, 0, 0.8)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "8px", color: "white", fontSize: "13px",
                  resize: "vertical", outline: "none", fontFamily: "inherit"
                }}
              />
              <button onClick={handlePasteFromClipboard} style={{
                position: "absolute", top: "8px", right: "8px",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                color: "#ffffff", padding: "4px 8px",
                borderRadius: "4px", fontSize: "11px", cursor: "pointer"
              }}>Paste</button>
            </div>
          </div>

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={!conversationText.trim() || isAnalyzing}
            style={{
              width: "100%",
              backgroundColor: !conversationText.trim() || isAnalyzing 
                ? "rgba(75, 85, 99, 0.5)" : "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.2)", color: "white", padding: "12px",
              borderRadius: "8px", fontSize: "14px", fontWeight: "500",
              cursor: !conversationText.trim() || isAnalyzing ? "not-allowed" : "pointer",
              marginBottom: "24px"
            }}
          >
            {isAnalyzing ? "Analyzing..." : "Check My Conversation Quality"}
          </button>

          {/* Results Section */}
          {analysis && (
            <div style={{
              background: "rgba(255, 255, 255, 0.03)",
              borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.08)",
              padding: "16px"
            }}>
              
              {/* Overall Score */}
              <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <h3 style={{
                  margin: "0 0 8px 0", color: getEngagementColor(analysis.engagementLevel),
                  fontSize: "20px", fontWeight: "500"
                }}>
                  Engagement Quality: {analysis.engagementLevel}
                </h3>
                <div style={{
                  color: getScoreColor(analysis.overallScore), fontSize: "16px",
                  fontWeight: "500", marginBottom: "4px"
                }}>
                  Score: {analysis.overallScore}/100
                </div>
                <div style={{ color: "#9ca3af", fontSize: "12px", marginBottom: "12px" }}>
                  Based on {analysis.userMessageCount} of your messages
                </div>
                
                {/* Score Bar */}
                <div style={{
                  width: "100%", height: "8px",
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  borderRadius: "4px", overflow: "hidden", margin: "8px 0"
                }}>
                  <div style={{
                    width: `${getScoreBarWidth(analysis.overallScore)}%`,
                    height: "100%", backgroundColor: getScoreColor(analysis.overallScore),
                    borderRadius: "4px", transition: "width 0.5s ease"
                  }} />
                </div>
              </div>

              {/* Analysis Breakdown */}
              <div style={{ marginBottom: "16px" }}>
                <h4 style={{ margin: "0 0 12px 0", color: "#d1d5db", fontSize: "14px", fontWeight: "500" }}>
                  Analysis Breakdown
                </h4>
                <div style={{ display: "grid", gap: "8px" }}>
                  {Object.entries(analysis.analysis).map(([key, metric]) => (
                    <div key={key} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "8px 0", borderBottom: "1px solid rgba(255, 255, 255, 0.05)"
                    }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <span style={{ color: "#d1d5db", fontSize: "13px" }}>
                          {key === 'questionAsking' ? 'Question Asking' :
                           key === 'messageLength' ? 'Message Length' :
                           key === 'openEndedness' ? 'Open-Ended Questions' :
                           key === 'responseQuality' ? 'Response Quality' :
                           key === 'conversationFlow' ? 'Conversation Flow' : key}
                        </span>
                        <span style={{ color: "#9ca3af", fontSize: "11px" }}>
                          {metric.details}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{
                          width: "50px", height: "4px",
                          backgroundColor: "rgba(255, 255, 255, 0.1)",
                          borderRadius: "2px", overflow: "hidden"
                        }}>
                          <div style={{
                            width: `${getScoreBarWidth(metric.score)}%`,
                            height: "100%", backgroundColor: getScoreColor(metric.score),
                            borderRadius: "2px"
                          }} />
                        </div>
                        <span style={{
                          color: getScoreColor(metric.score), fontSize: "12px",
                          fontWeight: "500", minWidth: "35px"
                        }}>
                          {metric.score}/100
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strengths */}
              {analysis.strengths && analysis.strengths.length > 0 && (
                <div style={{ marginBottom: "16px" }}>
                  <h4 style={{ margin: "0 0 8px 0", color: "#d1d5db", fontSize: "14px", fontWeight: "500" }}>
                    💪 Your Strengths
                  </h4>
                  <div style={{ display: "grid", gap: "6px" }}>
                    {analysis.strengths.map((strength, index) => (
                      <div key={index} style={{
                        color: "#f3f4f6", fontSize: "12px", padding: "6px 8px",
                        backgroundColor: "rgba(255, 255, 255, 0.05)",
                        borderRadius: "4px", border: "1px solid rgba(255, 255, 255, 0.1)"
                      }}>
                        • {strength}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Improvements */}
              {analysis.improvements && analysis.improvements.length > 0 && (
                <div style={{ marginBottom: "16px" }}>
                  <h4 style={{ margin: "0 0 8px 0", color: "#d1d5db", fontSize: "14px", fontWeight: "500" }}>
                    📈 Areas for Improvement
                  </h4>
                  <div style={{ display: "grid", gap: "6px" }}>
                    {analysis.improvements.map((improvement, index) => (
                      <div key={index} style={{
                        color: "#9ca3af", fontSize: "12px", padding: "6px 8px",
                        backgroundColor: "rgba(255, 255, 255, 0.02)",
                        borderRadius: "4px", border: "1px solid rgba(255, 255, 255, 0.05)"
                      }}>
                        • {improvement}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Specific Tips */}
              {analysis.specificTips && analysis.specificTips.length > 0 && (
                <div style={{ marginBottom: "16px" }}>
                  <h4 style={{ margin: "0 0 8px 0", color: "#d1d5db", fontSize: "14px", fontWeight: "500" }}>
                    💡 Specific Tips to Improve
                  </h4>
                  <div style={{ display: "grid", gap: "6px" }}>
                    {analysis.specificTips.map((tip, index) => (
                      <div key={index} style={{
                        color: "#ffffff", fontSize: "12px", padding: "8px 10px",
                        backgroundColor: "rgba(255, 255, 255, 0.08)",
                        borderRadius: "4px", border: "1px solid rgba(255, 255, 255, 0.15)"
                      }}>
                        {tip}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Example Better Replies */}
              {analysis.exampleBetterReplies && analysis.exampleBetterReplies.length > 0 && (
                <div>
                  <h4 style={{ margin: "0 0 8px 0", color: "#d1d5db", fontSize: "14px", fontWeight: "500" }}>
                    ✨ Example Improvements
                  </h4>
                  <div style={{ display: "grid", gap: "12px" }}>
                    {analysis.exampleBetterReplies.map((example, index) => (
                      <div key={index} style={{
                        padding: "12px",
                        backgroundColor: "rgba(255, 255, 255, 0.02)",
                        borderRadius: "6px", border: "1px solid rgba(255, 255, 255, 0.08)"
                      }}>
                        <div style={{ marginBottom: "8px" }}>
                          <span style={{ color: "#9ca3af", fontSize: "11px", fontWeight: "500" }}>
                            Instead of:
                          </span>
                          <div style={{
                            color: "#6b7280", fontSize: "12px", fontStyle: "italic",
                            padding: "4px 8px", backgroundColor: "rgba(0, 0, 0, 0.3)",
                            borderRadius: "4px", margin: "4px 0"
                          }}>
                            "{example.original}"
                          </div>
                        </div>
                        <div>
                          <span style={{ color: "#d1d5db", fontSize: "11px", fontWeight: "500" }}>
                            Try this:
                          </span>
                          <div style={{
                            color: "#ffffff", fontSize: "12px",
                            padding: "6px 10px", backgroundColor: "rgba(255, 255, 255, 0.05)",
                            borderRadius: "4px", margin: "4px 0",
                            border: "1px solid rgba(255, 255, 255, 0.1)"
                          }}>
                            "{example.improved}"
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
