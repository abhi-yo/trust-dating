import { useState, useEffect } from "react";
import {
  ClipboardList,
  Pencil,
  Stars,
  X,
  Clipboard,
  Lightbulb,
  History,
} from "lucide-react";
import { saveHistoryItem, listHistory } from "../lib/history";

interface SmartReply {
  text: string;
  reason: string;
}

interface SmartReplyData {
  replies: SmartReply[];
  sentiment: string;
  tips: string[];
  fallback?: boolean;
  note?: string;
}

interface DetectedMessage {
  message: string;
  timestamp: number;
}

export default function SmartReply() {
  const [detectedMessage, setDetectedMessage] =
    useState<DetectedMessage | null>(null);
  const [smartReplies, setSmartReplies] = useState<SmartReplyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTone, setSelectedTone] = useState<
    "casual" | "fun" | "romantic" | "witty"
  >("casual");
  const [manualInput, setManualInput] = useState("");
  const [inputMethod, setInputMethod] = useState<"auto" | "manual">("auto");
  const [recent, setRecent] = useState(() =>
    listHistory("smartReply").slice(0, 3)
  );
  const [toast, setToast] = useState<string>("");
  const [copiedPulseIndex, setCopiedPulseIndex] = useState<number | null>(null);

  useEffect(() => {
    // Listen for detected messages from clipboard
    if (
      window.electronAPI &&
      typeof window.electronAPI.onMessageDetected === "function"
    ) {
      window.electronAPI.onMessageDetected((data: DetectedMessage) => {
        if (inputMethod === "auto") {
          setDetectedMessage(data);
          generateReplies(data.message);
        }
      });
    } else {
      console.warn("onMessageDetected not available in electronAPI");
    }

    return () => {
      // Clean up listeners if needed
    };
  }, [selectedTone, inputMethod]);

  const generateReplies = async (message: string) => {
    setLoading(true);
    try {
      const result = await window.electronAPI.generateSmartReplies({
        message,
        tone: selectedTone,
        context: "Dating app conversation",
      });

      if (result.success) {
        setSmartReplies(result);
        saveHistoryItem({
          type: "smartReply",
          inputText: message,
          outputSummary: result.replies?.[0]?.text || "",
        });
        setRecent(listHistory("smartReply").slice(0, 3));
      } else {
        console.error("Failed to generate replies:", result.error);
      }
    } catch (error) {
      console.error("Error generating smart replies:", error);
    }
    setLoading(false);
  };

  const handleManualSubmit = async () => {
    const trimmedInput = manualInput.trim();
    if (!trimmedInput || trimmedInput.length < 3) return;

    // Limit input length to prevent API issues
    const limitedInput =
      trimmedInput.length > 500 ? trimmedInput.substring(0, 500) : trimmedInput;

    const messageData = {
      message: limitedInput,
      timestamp: Date.now(),
    };

    setDetectedMessage(messageData);
    await generateReplies(messageData.message);
    setManualInput(""); // Clear input after submission
  };

  const handleInputMethodChange = (method: "auto" | "manual") => {
    setInputMethod(method);
    if (method === "auto") {
      setManualInput("");
    }
    // Clear current message when switching methods
    setDetectedMessage(null);
    setSmartReplies(null);
  };

  const copyToClipboard = async (replyText: string, index?: number) => {
    try {
      await navigator.clipboard.writeText(replyText);
      // Toast + gentle pulse feedback
      setToast("Copied to clipboard");
      if (typeof index === "number") {
        setCopiedPulseIndex(index);
        setTimeout(() => setCopiedPulseIndex(null), 700);
      }
      setTimeout(() => setToast(""), 1600);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  };

  const clearMessage = () => {
    setDetectedMessage(null);
    setSmartReplies(null);
  };

  if (!detectedMessage) {
    return (
      <div
        style={{
          padding: "24px",
          textAlign: "center",
          color: "#ffffff",
          maxWidth: 760,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            fontSize: "20px",
            fontWeight: 700,
            marginBottom: "14px",
            fontFamily: "inherit",
            letterSpacing: 0.2,
          }}
        >
          Smart Reply Assistant
        </div>

        {/* Input Method Toggle */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "20px",
            gap: "8px",
          }}
        >
          <button
            onClick={() => handleInputMethodChange("auto")}
            style={{
              background:
                inputMethod === "auto"
                  ? "rgba(255, 255, 255, 0.25)"
                  : "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              color: "white",
              borderRadius: "6px",
              padding: "6px 12px",
              fontSize: "11px",
              cursor: "pointer",
              fontFamily: "inherit",
              fontWeight: inputMethod === "auto" ? "600" : "400",
            }}
          >
            <span
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <ClipboardList size={14} /> Auto Clipboard
            </span>
          </button>
          <button
            onClick={() => handleInputMethodChange("manual")}
            style={{
              background:
                inputMethod === "manual"
                  ? "rgba(255, 255, 255, 0.25)"
                  : "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              color: "white",
              borderRadius: "6px",
              padding: "6px 12px",
              fontSize: "11px",
              cursor: "pointer",
              fontFamily: "inherit",
              fontWeight: inputMethod === "manual" ? "600" : "400",
            }}
          >
            <span
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <Pencil size={14} /> Manual Input
            </span>
          </button>
        </div>

        {inputMethod === "auto" ? (
          <>
            <div
              style={{
                fontSize: "14px",
                opacity: 0.8,
                lineHeight: "1.5",
                marginBottom: "20px",
              }}
            >
              Copy a message from any dating app to get smart reply suggestions!
            </div>
            {recent.length > 0 && (
              <div style={{ textAlign: "left", marginTop: 8, opacity: 0.85 }}>
                <div
                  style={{
                    fontSize: 12,
                    marginBottom: 6,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <History size={12} /> Recent
                </div>
                <div style={{ display: "grid", gap: 6 }}>
                  {recent.map((h) => (
                    <button
                      key={h.id}
                      onClick={() => setManualInput(h.inputText)}
                      style={{
                        background: "rgba(255,255,255,0.08)",
                        color: "white",
                        border: "1px solid rgba(255,255,255,0.15)",
                        borderRadius: 6,
                        padding: "6px 8px",
                        fontSize: 12,
                        textAlign: "left",
                        cursor: "pointer",
                      }}
                    >
                      {h.inputText.slice(0, 80)}
                      {h.inputText.length > 80 ? "…" : ""}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                borderRadius: "8px",
                padding: "16px",
                border: "1px solid rgba(255,255,255,0.12)",
                marginBottom: "20px",
                marginTop: recent.length > 0 ? "14px" : 0,
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  opacity: 0.75,
                  fontWeight: 700,
                  marginBottom: "10px",
                }}
              >
                Auto-detection mode
              </div>

              <div style={{ maxWidth: 520, margin: "0 auto" }}>
                <div style={{ display: "grid", gap: 8 }}>
                  {[
                    "Copy any message from Tinder, Bumble, Hinge, etc.",
                    "Get 3 personalized reply suggestions instantly",
                    "Click to copy the perfect response",
                  ].map((text, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 10,
                      }}
                    >
                      <div
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: 999,
                          background: "rgba(255,255,255,0.08)",
                          border: "1px solid rgba(255,255,255,0.18)",
                          fontSize: 11,
                          lineHeight: "18px",
                          textAlign: "center",
                          color: "rgba(255,255,255,0.85)",
                          flex: "0 0 18px",
                          marginTop: 1,
                        }}
                      >
                        {i + 1}
                      </div>
                      <div style={{ fontSize: 13, lineHeight: 1.6 }}>
                        {text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div
                style={{
                  marginTop: 12,
                  paddingTop: 10,
                  borderTop: "1px solid rgba(255,255,255,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 11, opacity: 0.65 }}>Press</span>
                <kbd
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.18)",
                    padding: "2px 6px",
                    borderRadius: 6,
                    fontSize: 11,
                    color: "rgba(255,255,255,0.9)",
                  }}
                >
                  Cmd+Shift+C
                </kbd>
                <span style={{ fontSize: 11, opacity: 0.65 }}>
                  for manual detection
                </span>
              </div>
            </div>

            {/* Toast */}
            {toast && (
              <div
                style={{
                  position: "fixed",
                  left: "50%",
                  bottom: 24,
                  transform: "translateX(-50%)",
                  background: "rgba(0,0,0,0.85)",
                  color: "#e5e7eb",
                  border: "1px solid rgba(255,255,255,0.12)",
                  padding: "8px 12px",
                  borderRadius: 8,
                  fontSize: 12,
                  zIndex: 2000,
                }}
              >
                {toast}
              </div>
            )}
          </>
        ) : (
          <>
            <div
              style={{
                fontSize: "14px",
                opacity: 0.8,
                lineHeight: "1.5",
                marginBottom: "20px",
              }}
            >
              Paste a message below to get personalized reply suggestions
            </div>

            <div style={{ marginBottom: "16px", textAlign: "left" }}>
              <textarea
                value={manualInput}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 500) {
                    setManualInput(value);
                  }
                }}
                placeholder="Paste the message you received here..."
                style={{
                  width: "100%",
                  minHeight: "80px",
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  borderRadius: "8px",
                  padding: "12px",
                  color: "white",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  resize: "vertical",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    handleManualSubmit();
                  }
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "rgba(59, 130, 246, 0.6)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(255, 255, 255, 0.3)";
                }}
              />
              <div
                style={{
                  fontSize: "11px",
                  opacity: 0.6,
                  marginTop: "4px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>{manualInput.length}/500 characters</span>
                <span>Press ⌘+Enter to analyze</span>
              </div>
            </div>

            <button
              onClick={handleManualSubmit}
              disabled={
                !manualInput.trim() || manualInput.trim().length < 3 || loading
              }
              style={{
                background:
                  manualInput.trim() && manualInput.trim().length >= 3
                    ? "rgba(59, 130, 246, 0.8)"
                    : "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                color: "white",
                borderRadius: "6px",
                padding: "8px 16px",
                fontSize: "13px",
                cursor:
                  manualInput.trim() && manualInput.trim().length >= 3
                    ? "pointer"
                    : "not-allowed",
                fontFamily: "inherit",
                fontWeight: "500",
                opacity:
                  manualInput.trim() && manualInput.trim().length >= 3
                    ? 1
                    : 0.5,
              }}
            >
              {loading ? (
                "Analyzing..."
              ) : (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Stars size={14} /> Get Smart Replies
                </span>
              )}
            </button>
          </>
        )}

        {/* Test button for development */}
        <div style={{ marginTop: "20px" }}>
          <button
            onClick={() => {
              const testMessage =
                "Hey! How's your weekend going? I'm thinking of checking out that new coffee place downtown.";
              if (inputMethod === "manual") {
                setManualInput(testMessage);
              } else {
                setDetectedMessage({
                  message: testMessage,
                  timestamp: Date.now(),
                });
              }
            }}
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              color: "rgba(255, 255, 255, 0.7)",
              borderRadius: "4px",
              padding: "6px 12px",
              fontSize: "11px",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {inputMethod === "manual" ? "Fill with sample" : "Test with sample"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", color: "#ffffff" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "16px",
              fontWeight: "600",
              fontFamily: "inherit",
              marginBottom: "4px",
            }}
          >
            Smart Reply Suggestions
          </div>
          <div
            style={{
              fontSize: "11px",
              opacity: 0.6,
              color: "rgba(255, 255, 255, 0.7)",
            }}
          >
            {inputMethod === "manual" ? "Manual input" : "Auto-detected"}
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button
            onClick={() => {
              setDetectedMessage(null);
              setSmartReplies(null);
              setManualInput("");
            }}
            style={{
              background: "rgba(59, 130, 246, 0.8)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              color: "white",
              borderRadius: "4px",
              padding: "6px 12px",
              fontSize: "12px",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            <span
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <Stars size={14} /> New Message
            </span>
          </button>
          <button
            onClick={clearMessage}
            style={{
              background: "transparent",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              color: "white",
              borderRadius: "4px",
              padding: "6px 12px",
              fontSize: "12px",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            <span
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <X size={14} /> Close
            </span>
          </button>
        </div>
      </div>

      {/* Original Message */}
      <div style={{ marginBottom: "20px" }}>
        <div
          style={{
            fontSize: "12px",
            opacity: 0.7,
            marginBottom: "8px",
            fontWeight: "500",
          }}
        >
          THEIR MESSAGE:
        </div>
        <div
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            borderRadius: "8px",
            padding: "12px",
            fontSize: "14px",
            lineHeight: "1.4",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          "{detectedMessage.message}"
        </div>
      </div>

      {/* Tone Selector */}
      <div style={{ marginBottom: "20px" }}>
        <div
          style={{
            fontSize: "12px",
            opacity: 0.7,
            marginBottom: "8px",
            fontWeight: "500",
          }}
        >
          REPLY TONE:
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {(["casual", "fun", "romantic", "witty"] as const).map((tone) => (
            <button
              key={tone}
              onClick={() => {
                setSelectedTone(tone);
                generateReplies(detectedMessage.message);
              }}
              style={{
                background:
                  selectedTone === tone
                    ? "rgba(255, 255, 255, 0.2)"
                    : "transparent",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                color: "white",
                borderRadius: "16px",
                padding: "6px 12px",
                fontSize: "11px",
                cursor: "pointer",
                textTransform: "capitalize",
                fontFamily: "inherit",
              }}
            >
              {tone}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div
          style={{
            textAlign: "center",
            padding: "20px",
            fontSize: "14px",
            opacity: 0.8,
          }}
        >
          Generating smart replies...
        </div>
      )}

      {/* Smart Reply Suggestions */}
      {smartReplies && !loading && (
        <div>
          <div
            style={{
              fontSize: "12px",
              opacity: 0.7,
              marginBottom: "12px",
              fontWeight: "500",
            }}
          >
            SUGGESTED REPLIES:
          </div>

          {/* Show fallback notice if using offline responses */}
          {smartReplies.fallback && (
            <div
              style={{
                background: "rgba(255, 165, 0, 0.2)",
                border: "1px solid rgba(255, 165, 0, 0.4)",
                borderRadius: "6px",
                padding: "8px",
                marginBottom: "12px",
                fontSize: "11px",
                color: "#ffcc80",
              }}
            >
              <span
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <Lightbulb size={12} />{" "}
                {smartReplies.note || "Using smart fallback suggestions"}
              </span>
            </div>
          )}

          {smartReplies.replies.map((reply, index) => (
            <div
              key={index}
              style={{
                background: "rgba(255, 255, 255, 0.08)",
                borderRadius: "8px",
                padding: "14px",
                marginBottom: "12px",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                transition: "all 0.2s ease",
                boxShadow:
                  copiedPulseIndex === index
                    ? "0 0 0 6px rgba(59,130,246,0.15)"
                    : "none",
              }}
            >
              <div
                style={{
                  fontSize: "14px",
                  marginBottom: "8px",
                  lineHeight: "1.4",
                }}
              >
                "{reply.text}"
              </div>

              <div
                style={{
                  fontSize: "11px",
                  opacity: 0.6,
                  marginBottom: "10px",
                  fontStyle: "italic",
                }}
              >
                {reply.reason}
              </div>

              <button
                onClick={() => copyToClipboard(reply.text, index)}
                style={{
                  background: "rgba(255, 255, 255, 0.15)",
                  border: "none",
                  color: "white",
                  borderRadius: "4px",
                  padding: "6px 12px",
                  fontSize: "11px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "background 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    "rgba(255, 255, 255, 0.25)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    "rgba(255, 255, 255, 0.15)";
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Clipboard size={12} /> Copy Reply
                </span>
              </button>
            </div>
          ))}

          {/* Conversation Tips */}
          {smartReplies.tips && smartReplies.tips.length > 0 && (
            <div style={{ marginTop: "20px" }}>
              <div
                style={{
                  fontSize: "12px",
                  opacity: 0.7,
                  marginBottom: "8px",
                  fontWeight: "500",
                }}
              >
                Tips:
              </div>
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  borderRadius: "8px",
                  padding: "12px",
                  fontSize: "12px",
                  lineHeight: "1.4",
                }}
              >
                {smartReplies.tips.map((tip, index) => (
                  <div key={index} style={{ marginBottom: "4px" }}>
                    - {tip}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
