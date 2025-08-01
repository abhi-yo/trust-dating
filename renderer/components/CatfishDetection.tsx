import React, { useState, useEffect } from "react";
import { CatfishDetector, CatfishAnalysisResult } from '../lib/catfishDetector';

interface CatfishDetectionProps {
  onClose?: () => void;
  onBack?: () => void;
}

export default function CatfishDetection({ onClose, onBack }: CatfishDetectionProps) {
  const [conversationText, setConversationText] = useState("");
  const [analysis, setAnalysis] = useState<CatfishAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detector] = useState(() => new CatfishDetector());
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
      await new Promise(resolve => setTimeout(resolve, 800));
      const result = detector.analyzeConversation(conversationText);
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

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'Very Low': return "#ffffff";
      case 'Low': return "#d1d5db";
      case 'Medium': return "#9ca3af";
      case 'High': return "#6b7280";
      case 'Very High': return "#4b5563";
      default: return "#9ca3af";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "#ffffff";
    if (score >= 50) return "#d1d5db";
    if (score >= 30) return "#9ca3af";
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
        width: "90%", maxWidth: "650px", maxHeight: "85vh",
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
                Catfish Detection
              </h2>
              <p style={{ margin: "2px 0 0 0", color: "#9ca3af", fontSize: "13px" }}>
                Analyze if someone seems real or potentially fake
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
            }}>Paste conversation:</label>
            
            <div style={{ position: "relative" }}>
              <textarea
                value={conversationText}
                onChange={(e) => setConversationText(e.target.value)}
                placeholder="Paste your conversation here..."
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
            {isAnalyzing ? "Analyzing..." : "Analyze Realness"}
          </button>

          {/* Results Section */}
          {analysis && (
            <div style={{
              background: "rgba(255, 255, 255, 0.03)",
              borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.08)",
              padding: "16px"
            }}>
              
              {/* Realness Score */}
              <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <h3 style={{
                  margin: "0 0 8px 0", color: getScoreColor(analysis.realnessScore),
                  fontSize: "20px", fontWeight: "500"
                }}>
                  Realness Score: {analysis.realnessScore}/100
                </h3>
                <div style={{
                  color: getRiskColor(analysis.riskLevel), fontSize: "14px",
                  fontWeight: "500", marginBottom: "8px"
                }}>
                  Risk Level: {analysis.riskLevel}
                </div>
                
                {/* Score Bar */}
                <div style={{
                  width: "100%", height: "8px",
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  borderRadius: "4px", overflow: "hidden", margin: "8px 0"
                }}>
                  <div style={{
                    width: `${getScoreBarWidth(analysis.realnessScore)}%`,
                    height: "100%", backgroundColor: getScoreColor(analysis.realnessScore),
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
                  {Object.entries(analysis.breakdown).map(([key, metric]) => (
                    <div key={key} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "8px 0", borderBottom: "1px solid rgba(255, 255, 255, 0.05)"
                    }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <span style={{ color: "#d1d5db", fontSize: "13px" }}>
                          {key === 'responsePatterns' ? 'Response Patterns' :
                           key === 'personalDetails' ? 'Personal Details' :
                           key === 'escalationSpeed' ? 'Escalation Speed' :
                           key === 'languageConsistency' ? 'Language Consistency' :
                           key === 'profileAlignment' ? 'Profile Alignment' : key}
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

              {/* Red Flags */}
              {analysis.redFlags && analysis.redFlags.length > 0 && (
                <div style={{ marginBottom: "16px" }}>
                  <h4 style={{ margin: "0 0 8px 0", color: "#d1d5db", fontSize: "14px", fontWeight: "500" }}>
                    ⚠️ Red Flags
                  </h4>
                  <div style={{ display: "grid", gap: "6px" }}>
                    {analysis.redFlags.map((flag, index) => (
                      <div key={index} style={{
                        color: "#6b7280", fontSize: "12px", padding: "6px 8px",
                        backgroundColor: "rgba(255, 255, 255, 0.02)",
                        borderRadius: "4px", border: "1px solid rgba(255, 255, 255, 0.05)"
                      }}>
                        • {flag}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Green Flags */}
              {analysis.greenFlags && analysis.greenFlags.length > 0 && (
                <div style={{ marginBottom: "16px" }}>
                  <h4 style={{ margin: "0 0 8px 0", color: "#d1d5db", fontSize: "14px", fontWeight: "500" }}>
                    ✅ Green Flags
                  </h4>
                  <div style={{ display: "grid", gap: "6px" }}>
                    {analysis.greenFlags.map((flag, index) => (
                      <div key={index} style={{
                        color: "#d1d5db", fontSize: "12px", padding: "6px 8px",
                        backgroundColor: "rgba(255, 255, 255, 0.02)",
                        borderRadius: "4px", border: "1px solid rgba(255, 255, 255, 0.05)"
                      }}>
                        • {flag}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {analysis.recommendations && analysis.recommendations.length > 0 && (
                <div>
                  <h4 style={{ margin: "0 0 8px 0", color: "#d1d5db", fontSize: "14px", fontWeight: "500" }}>
                    💡 Recommendations
                  </h4>
                  <div style={{ display: "grid", gap: "6px" }}>
                    {analysis.recommendations.map((rec, index) => (
                      <div key={index} style={{
                        color: "#ffffff", fontSize: "12px", padding: "8px 10px",
                        backgroundColor: "rgba(255, 255, 255, 0.05)",
                        borderRadius: "4px", border: "1px solid rgba(255, 255, 255, 0.1)"
                      }}>
                        {rec}
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
