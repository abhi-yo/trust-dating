import { useState, useEffect } from "react";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Eye,
  TrendingUp,
  Users,
  Flag,
  Zap,
  Info,
  Lightbulb,
} from "lucide-react";

interface SafetyAlert {
  id: string;
  type: "privacy" | "safety" | "scam" | "manipulation";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  recommendation: string;
  confidence: number;
  timestamp: number;
  pattern: string;
}

interface SafetyAnalysis {
  patternAnalysis: {
    isSafe: boolean;
    riskLevel: number;
    alerts: SafetyAlert[];
    safeTips: string[];
  };
  aiAnalysis?: {
    overallRisk: number;
    concerns: string[];
    recommendations: string[];
    redFlags: string[];
    positiveSignals: string[];
    trustScore: number;
  };
  combinedRisk: number;
  finalRecommendations: string[];
}

interface ConversationMessage {
  text: string;
  timestamp: number;
  sender: "user" | "contact";
}

export default function PrivacySafety() {
  const [analysisResult, setAnalysisResult] = useState<SafetyAnalysis | null>(
    null
  );
  const [inputMessages, setInputMessages] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "analyze" | "education" | "report" | "stats"
  >("analyze");
  const [quickCheckResult, setQuickCheckResult] = useState<any>(null);
  const [quickMessage, setQuickMessage] = useState("");
  const [safetyEducation, setSafetyEducation] = useState<any>(null);
  const [safetyStats, setSafetyStats] = useState<any>(null);

  useEffect(() => {
    loadSafetyEducation();
    loadSafetyStats();
  }, []);

  const loadSafetyEducation = async () => {
    try {
      const education = await window.electronAPI.getSafetyEducation();
      setSafetyEducation(education);
    } catch (error) {
      console.error("Failed to load safety education:", error);
    }
  };

  const loadSafetyStats = async () => {
    try {
      const stats = await window.electronAPI.getSafetyStats();
      setSafetyStats(stats);
    } catch (error) {
      console.error("Failed to load safety stats:", error);
    }
  };

  const parseMessages = (input: string): ConversationMessage[] => {
    const lines = input
      .trim()
      .split("\n")
      .filter((line) => line.trim());
    const messages: ConversationMessage[] = [];

    for (const line of lines) {
      // Try to parse "Sender: Message" format
      const match = line.match(/^(user|contact|me|them|you|match):\s*(.+)$/i);
      if (match) {
        const sender = match[1].toLowerCase();
        const text = match[2].trim();
        messages.push({
          text,
          timestamp: Date.now() - messages.length * 60000, // Simulate conversation timing
          sender: ["user", "me", "you"].includes(sender) ? "user" : "contact",
        });
      } else if (line.trim()) {
        // If no sender specified, alternate between contact and user
        messages.push({
          text: line.trim(),
          timestamp: Date.now() - messages.length * 60000,
          sender: messages.length % 2 === 0 ? "contact" : "user",
        });
      }
    }

    return messages;
  };

  const analyzeConversation = async () => {
    if (!inputMessages.trim()) return;

    setLoading(true);
    try {
      const messages = parseMessages(inputMessages);
      const result = await window.electronAPI.analyzeConversationSafety(
        messages
      );
      setAnalysisResult(result);
    } catch (error) {
      console.error("Analysis failed:", error);
    }
    setLoading(false);
  };

  const quickSafetyCheck = async () => {
    if (!quickMessage.trim()) return;

    try {
      const result = await window.electronAPI.quickSafetyCheck(
        quickMessage.trim()
      );
      setQuickCheckResult(result);
    } catch (error) {
      console.error("Quick check failed:", error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "#dc2626";
      case "high":
        return "#ea580c";
      case "medium":
        return "#d97706";
      case "low":
        return "#65a30d";
      default:
        return "#6b7280";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertTriangle size={14} />;
      case "high":
        return <AlertTriangle size={14} />;
      case "medium":
        return <Zap size={14} />;
      case "low":
        return <Lightbulb size={14} />;
      default:
        return <Info size={14} />;
    }
  };

  const getRiskLevelText = (risk: number) => {
    if (risk >= 0.8) return { text: "CRITICAL RISK", color: "#dc2626" };
    if (risk >= 0.6) return { text: "HIGH RISK", color: "#ea580c" };
    if (risk >= 0.4) return { text: "MEDIUM RISK", color: "#d97706" };
    if (risk >= 0.2) return { text: "LOW RISK", color: "#65a30d" };
    return { text: "MINIMAL RISK", color: "#16a34a" };
  };

  return (
    <div
      style={{
        padding: "20px",
        color: "#ffffff",
        maxHeight: "80vh",
        overflow: "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <Shield size={24} style={{ marginRight: "8px", color: "#3b82f6" }} />
        <div
          style={{
            fontSize: "18px",
            fontWeight: "600",
            fontFamily: "inherit",
          }}
        >
          Privacy & Safety Center
        </div>
      </div>

      {/* Tab Navigation */}
      <div
        style={{
          display: "flex",
          marginBottom: "20px",
          gap: "8px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          paddingBottom: "12px",
        }}
      >
        {[
          { id: "analyze", label: "Analyze", icon: Shield },
          { id: "education", label: "Safety Tips", icon: Eye },
          { id: "report", label: "Report", icon: Flag },
          { id: "stats", label: "Stats", icon: TrendingUp },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              background:
                activeTab === tab.id
                  ? "rgba(59, 130, 246, 0.8)"
                  : "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              color: "white",
              borderRadius: "6px",
              padding: "8px 12px",
              fontSize: "12px",
              cursor: "pointer",
              fontFamily: "inherit",
              fontWeight: activeTab === tab.id ? "600" : "400",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Analyze Tab */}
      {activeTab === "analyze" && (
        <div>
          {/* Quick Message Check */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: "8px",
              padding: "16px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                fontWeight: "600",
                marginBottom: "12px",
              }}
            >
              Quick Message Safety Check
            </div>
            <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
              <input
                type="text"
                value={quickMessage}
                onChange={(e) => setQuickMessage(e.target.value)}
                placeholder="Paste a single message to check for risks..."
                style={{
                  flex: 1,
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  borderRadius: "4px",
                  padding: "8px 12px",
                  color: "white",
                  fontSize: "14px",
                  fontFamily: "inherit",
                }}
                onKeyDown={(e) => e.key === "Enter" && quickSafetyCheck()}
              />
              <button
                onClick={quickSafetyCheck}
                disabled={!quickMessage.trim()}
                style={{
                  background: quickMessage.trim()
                    ? "rgba(59, 130, 246, 0.8)"
                    : "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  color: "white",
                  borderRadius: "4px",
                  padding: "8px 16px",
                  fontSize: "12px",
                  cursor: quickMessage.trim() ? "pointer" : "not-allowed",
                  fontFamily: "inherit",
                }}
              >
                Check
              </button>
            </div>

            {quickCheckResult && (
              <div
                style={{
                  background: quickCheckResult.hasRisk
                    ? "rgba(239, 68, 68, 0.1)"
                    : "rgba(34, 197, 94, 0.1)",
                  border: `1px solid ${
                    quickCheckResult.hasRisk
                      ? "rgba(239, 68, 68, 0.3)"
                      : "rgba(34, 197, 94, 0.3)"
                  }`,
                  borderRadius: "6px",
                  padding: "12px",
                  fontSize: "13px",
                }}
              >
                <div style={{ fontWeight: "600", marginBottom: "6px" }}>
                  Risk Level: {quickCheckResult.riskLevel.toUpperCase()}
                </div>
                {quickCheckResult.alerts.map((alert: string, index: number) => (
                  <div key={index} style={{ marginBottom: "4px" }}>
                    {alert}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Full Conversation Analysis */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: "8px",
              padding: "16px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                fontWeight: "600",
                marginBottom: "12px",
              }}
            >
              Full Conversation Analysis
            </div>
            <div
              style={{
                fontSize: "12px",
                opacity: 0.8,
                marginBottom: "12px",
                lineHeight: "1.4",
              }}
            >
              Paste your conversation below. Format: "Contact: message" or
              "User: message" (one per line)
            </div>

            <textarea
              value={inputMessages}
              onChange={(e) => setInputMessages(e.target.value)}
              placeholder={`Example:
Contact: Hey! How's your day going?
User: Good thanks! How about you?
Contact: Great! Want to text instead? Here's my number: 555-0123`}
              style={{
                width: "100%",
                minHeight: "120px",
                background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                borderRadius: "6px",
                padding: "12px",
                color: "white",
                fontSize: "14px",
                fontFamily: "inherit",
                resize: "vertical",
                marginBottom: "12px",
              }}
            />

            <button
              onClick={analyzeConversation}
              disabled={!inputMessages.trim() || loading}
              style={{
                background: inputMessages.trim()
                  ? "rgba(59, 130, 246, 0.8)"
                  : "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                color: "white",
                borderRadius: "6px",
                padding: "10px 20px",
                fontSize: "14px",
                cursor: inputMessages.trim() ? "pointer" : "not-allowed",
                fontFamily: "inherit",
                fontWeight: "500",
              }}
            >
              {loading ? "Analyzing..." : "Analyze Safety"}
            </button>
          </div>

          {/* Analysis Results */}
          {analysisResult && (
            <div
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                borderRadius: "8px",
                padding: "16px",
              }}
            >
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  marginBottom: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Shield size={20} />
                Safety Analysis Results
              </div>

              {/* Risk Level */}
              <div style={{ marginBottom: "20px" }}>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    marginBottom: "8px",
                  }}
                >
                  Overall Risk Assessment
                </div>
                <div
                  style={{
                    background: "rgba(0, 0, 0, 0.3)",
                    borderRadius: "8px",
                    padding: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "50%",
                      background: `conic-gradient(${
                        getRiskLevelText(analysisResult.combinedRisk).color
                      } ${
                        analysisResult.combinedRisk * 360
                      }deg, rgba(255,255,255,0.1) 0deg)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "14px",
                      fontWeight: "600",
                    }}
                  >
                    {Math.round(analysisResult.combinedRisk * 100)}%
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: "600",
                        color: getRiskLevelText(analysisResult.combinedRisk)
                          .color,
                      }}
                    >
                      {getRiskLevelText(analysisResult.combinedRisk).text}
                    </div>
                    <div style={{ fontSize: "12px", opacity: 0.8 }}>
                      Based on pattern and AI analysis
                    </div>
                  </div>
                </div>
              </div>

              {/* Alerts */}
              {analysisResult.patternAnalysis.alerts.length > 0 && (
                <div style={{ marginBottom: "20px" }}>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      marginBottom: "8px",
                    }}
                  >
                    Security Alerts (
                    {analysisResult.patternAnalysis.alerts.length})
                  </div>
                  {analysisResult.patternAnalysis.alerts.map((alert, index) => (
                    <div
                      key={alert.id || index}
                      style={{
                        background: "rgba(239, 68, 68, 0.1)",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                        borderRadius: "6px",
                        padding: "12px",
                        marginBottom: "8px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginBottom: "6px",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                          }}
                        >
                          {getSeverityIcon(alert.severity)}
                        </span>
                        <span
                          style={{
                            fontWeight: "600",
                            color: getSeverityColor(alert.severity),
                          }}
                        >
                          {alert.title}
                        </span>
                        <span
                          style={{
                            fontSize: "11px",
                            opacity: 0.7,
                            background: "rgba(0,0,0,0.3)",
                            padding: "2px 6px",
                            borderRadius: "10px",
                          }}
                        >
                          {Math.round(alert.confidence * 100)}% confidence
                        </span>
                      </div>
                      <div style={{ fontSize: "13px", marginBottom: "6px" }}>
                        {alert.description}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          fontStyle: "italic",
                          opacity: 0.9,
                        }}
                      >
                        Recommendation: {alert.recommendation}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* AI Analysis */}
              {analysisResult.aiAnalysis && (
                <div style={{ marginBottom: "20px" }}>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      marginBottom: "8px",
                    }}
                  >
                    AI Analysis (Trust Score:{" "}
                    {analysisResult.aiAnalysis.trustScore}%)
                  </div>

                  {analysisResult.aiAnalysis.redFlags.length > 0 && (
                    <div style={{ marginBottom: "12px" }}>
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: "600",
                          color: "#ef4444",
                          marginBottom: "4px",
                        }}
                      >
                        Red Flags:
                      </div>
                      {analysisResult.aiAnalysis.redFlags.map((flag, index) => (
                        <div
                          key={index}
                          style={{
                            fontSize: "12px",
                            opacity: 0.9,
                            marginLeft: "16px",
                          }}
                        >
                          • {flag}
                        </div>
                      ))}
                    </div>
                  )}

                  {analysisResult.aiAnalysis.positiveSignals.length > 0 && (
                    <div style={{ marginBottom: "12px" }}>
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: "600",
                          color: "#22c55e",
                          marginBottom: "4px",
                        }}
                      >
                        Positive Signals:
                      </div>
                      {analysisResult.aiAnalysis.positiveSignals.map(
                        (signal, index) => (
                          <div
                            key={index}
                            style={{
                              fontSize: "12px",
                              opacity: 0.9,
                              marginLeft: "16px",
                            }}
                          >
                            • {signal}
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Recommendations */}
              <div>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    marginBottom: "8px",
                  }}
                >
                  Safety Recommendations
                </div>
                {analysisResult.finalRecommendations.map((rec, index) => (
                  <div
                    key={index}
                    style={{
                      background: "rgba(59, 130, 246, 0.1)",
                      border: "1px solid rgba(59, 130, 246, 0.3)",
                      borderRadius: "4px",
                      padding: "8px 12px",
                      marginBottom: "6px",
                      fontSize: "12px",
                    }}
                  >
                    {rec}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Safety Education Tab */}
      {activeTab === "education" && safetyEducation && (
        <div>
          <div style={{ marginBottom: "20px" }}>
            <div
              style={{
                fontSize: "16px",
                fontWeight: "600",
                marginBottom: "12px",
              }}
            >
              📚 Dating Safety Education
            </div>

            {/* General Tips */}
            <div
              style={{
                background: "rgba(34, 197, 94, 0.1)",
                border: "1px solid rgba(34, 197, 94, 0.3)",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  marginBottom: "8px",
                  color: "#22c55e",
                }}
              >
                ✅ General Safety Tips
              </div>
              {safetyEducation.generalTips.map((tip: string, index: number) => (
                <div
                  key={index}
                  style={{ fontSize: "12px", marginBottom: "4px" }}
                >
                  {tip}
                </div>
              ))}
            </div>

            {/* Red Flags */}
            <div
              style={{
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  marginBottom: "8px",
                  color: "#ef4444",
                }}
              >
                🚩 Red Flags to Watch For
              </div>
              {safetyEducation.redFlags.map((flag: string, index: number) => (
                <div
                  key={index}
                  style={{ fontSize: "12px", marginBottom: "4px" }}
                >
                  • {flag}
                </div>
              ))}
            </div>

            {/* Scam Warnings */}
            <div
              style={{
                background: "rgba(245, 158, 11, 0.1)",
                border: "1px solid rgba(245, 158, 11, 0.3)",
                borderRadius: "8px",
                padding: "16px",
              }}
            >
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  marginBottom: "8px",
                  color: "#f59e0b",
                }}
              >
                ⚠️ Common Scam Patterns
              </div>
              {safetyEducation.scamWarnings.map(
                (warning: string, index: number) => (
                  <div
                    key={index}
                    style={{ fontSize: "12px", marginBottom: "4px" }}
                  >
                    • {warning}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* Report Tab */}
      {activeTab === "report" && (
        <div>
          <div
            style={{
              fontSize: "16px",
              fontWeight: "600",
              marginBottom: "12px",
            }}
          >
            🚨 Report Safety Incident
          </div>
          <div
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: "8px",
              padding: "16px",
              fontSize: "13px",
              textAlign: "center",
            }}
          >
            <Flag size={48} style={{ margin: "0 auto 12px", opacity: 0.6 }} />
            <div style={{ marginBottom: "12px" }}>
              Report suspicious behavior, scams, or safety concerns to help
              protect the community.
            </div>
            <div
              style={{
                fontSize: "11px",
                opacity: 0.7,
              }}
            >
              This feature would integrate with the dating app's reporting
              system in a production environment.
            </div>
          </div>
        </div>
      )}

      {/* Stats Tab */}
      {activeTab === "stats" && safetyStats && (
        <div>
          <div
            style={{
              fontSize: "16px",
              fontWeight: "600",
              marginBottom: "12px",
            }}
          >
            📊 Safety Statistics
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                borderRadius: "8px",
                padding: "12px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "#3b82f6",
                }}
              >
                {safetyStats.totalAnalyses}
              </div>
              <div style={{ fontSize: "11px", opacity: 0.8 }}>
                Total Analyses
              </div>
            </div>
            <div
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                borderRadius: "8px",
                padding: "12px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "#ef4444",
                }}
              >
                {safetyStats.riskDetected}
              </div>
              <div style={{ fontSize: "11px", opacity: 0.8 }}>
                Risks Detected
              </div>
            </div>
          </div>

          <div
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: "8px",
              padding: "16px",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                fontWeight: "600",
                marginBottom: "8px",
              }}
            >
              Safety Score: {safetyStats.safetyScore}%
            </div>
            <div
              style={{
                background: "rgba(0, 0, 0, 0.3)",
                height: "8px",
                borderRadius: "4px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  background:
                    safetyStats.safetyScore > 80
                      ? "#22c55e"
                      : safetyStats.safetyScore > 60
                      ? "#f59e0b"
                      : "#ef4444",
                  height: "100%",
                  width: `${safetyStats.safetyScore}%`,
                  transition: "width 0.3s ease",
                }}
              />
            </div>
            <div style={{ fontSize: "11px", opacity: 0.7, marginTop: "4px" }}>
              Based on your dating safety awareness and practices
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
