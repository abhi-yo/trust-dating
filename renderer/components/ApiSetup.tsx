import React, { useState, useEffect } from "react";

interface ApiSetupProps {
  onSetupComplete: () => void;
}

export default function ApiSetup({ onSetupComplete }: ApiSetupProps) {
  const [selectedProvider, setSelectedProvider] = useState<
    "gemini" | "openai" | "anthropic"
  >("gemini");
  const [apiKey, setApiKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    console.log("handleSave called");
    console.log("electronAPI available:", !!window.electronAPI);
    
    if (!apiKey.trim()) {
      setError("Please enter an API key");
      return;
    }

    if (apiKey.length < 10) {
      setError("API key seems too short");
      return;
    }

    setSaving(true);
    setError("");

    try {
      console.log("Calling setApiKey with:", selectedProvider, apiKey.substring(0, 10) + "...");
      await window.electronAPI.setApiKey(selectedProvider, apiKey);
      console.log("setApiKey successful, calling onSetupComplete");
      onSetupComplete();
    } catch (err) {
      console.error("Error saving API key:", err);
      setError(`Failed to save API key: ${err?.message || err}`);
    } finally {
      setSaving(false);
    }
  };

  const getInstructions = () => {
    switch (selectedProvider) {
      case "gemini":
        return {
          title: "Google Gemini API",
          steps: [
            "1. Go to Google AI Studio (https://makersuite.google.com/app/apikey)",
            "2. Sign in with your Google account",
            '3. Click "Create API Key"',
            "4. Copy the generated API key",
            "5. Paste it below",
          ],
          placeholder: "AIzaSy...",
          note: "Free tier: 15 requests/minute, 1500 requests/day",
        };
      case "openai":
        return {
          title: "OpenAI API",
          steps: [
            "1. Go to OpenAI Platform (https://platform.openai.com/api-keys)",
            "2. Sign in to your OpenAI account",
            '3. Click "Create new secret key"',
            "4. Copy the generated API key",
            "5. Paste it below",
          ],
          placeholder: "sk-...",
          note: "Pay-per-use: ~$0.002 per request",
        };
      case "anthropic":
        return {
          title: "Anthropic Claude API",
          steps: [
            "1. Go to Anthropic Console (https://console.anthropic.com/)",
            "2. Sign in to your Anthropic account",
            "3. Navigate to API Keys",
            "4. Create a new API key",
            "5. Copy and paste it below",
          ],
          placeholder: "sk-ant-...",
          note: "Pay-per-use: ~$0.003 per request",
        };
    }
  };

  const instructions = getInstructions();

  return (
    <div
      style={{
        padding: "32px",
        maxWidth: "600px",
        margin: "0 auto",
        color: "white",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          textAlign: "center",
          marginBottom: "32px",
        }}
      >
        <h1
          style={{
            fontSize: "24px",
            fontWeight: "600",
            marginBottom: "8px",
          }}
        >
          🚀 Welcome to Smart Dating Assistant
        </h1>
        <p
          style={{
            fontSize: "16px",
            opacity: 0.8,
            lineHeight: "1.5",
          }}
        >
          To get started, you'll need an AI API key. Don't worry, it's free and
          takes 2 minutes!
        </p>
      </div>

      {/* Provider Selection */}
      <div style={{ marginBottom: "24px" }}>
        <h3
          style={{
            fontSize: "16px",
            fontWeight: "500",
            marginBottom: "12px",
          }}
        >
          Choose your AI provider:
        </h3>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          {(["gemini", "openai", "anthropic"] as const).map((provider) => (
            <button
              key={provider}
              onClick={() => setSelectedProvider(provider)}
              style={{
                background:
                  selectedProvider === provider
                    ? "rgba(59, 130, 246, 0.5)"
                    : "rgba(255, 255, 255, 0.1)",
                border: `1px solid ${
                  selectedProvider === provider
                    ? "#3b82f6"
                    : "rgba(255, 255, 255, 0.2)"
                }`,
                color: "white",
                padding: "12px 16px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                textTransform: "capitalize",
                fontWeight: selectedProvider === provider ? "500" : "400",
              }}
            >
              {provider === "gemini"
                ? "🟢 Gemini (Recommended)"
                : provider === "openai"
                ? "🔴 OpenAI"
                : "🟣 Claude"}
            </button>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.05)",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "24px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <h4
          style={{
            fontSize: "14px",
            fontWeight: "500",
            marginBottom: "12px",
            color: "#60a5fa",
          }}
        >
          {instructions.title}
        </h4>

        <div style={{ marginBottom: "16px" }}>
          {instructions.steps.map((step, index) => (
            <div
              key={index}
              style={{
                fontSize: "13px",
                lineHeight: "1.4",
                marginBottom: "4px",
                opacity: 0.9,
              }}
            >
              {step}
            </div>
          ))}
        </div>

        <div
          style={{
            fontSize: "12px",
            opacity: 0.7,
            fontStyle: "italic",
            padding: "8px",
            background: "rgba(255, 255, 255, 0.05)",
            borderRadius: "6px",
          }}
        >
          💡 {instructions.note}
        </div>
      </div>

      {/* API Key Input */}
      <div style={{ marginBottom: "24px" }}>
        <label
          style={{
            display: "block",
            fontSize: "14px",
            fontWeight: "500",
            marginBottom: "8px",
          }}
        >
          Enter your {instructions.title} key:
        </label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder={instructions.placeholder}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            background: "rgba(255, 255, 255, 0.1)",
            color: "white",
            fontSize: "14px",
            fontFamily: "monospace",
          }}
        />
      </div>

      {error && (
        <div
          style={{
            background: "rgba(239, 68, 68, 0.2)",
            border: "1px solid rgba(239, 68, 68, 0.4)",
            borderRadius: "6px",
            padding: "12px",
            marginBottom: "16px",
            fontSize: "14px",
            color: "#fca5a5",
          }}
        >
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: "12px" }}>
        <button
          onClick={handleSave}
          disabled={saving || !apiKey.trim()}
          style={{
            flex: 1,
            background: saving ? "rgba(107, 114, 128, 0.5)" : "#3b82f6",
            border: "none",
            color: "white",
            padding: "14px",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "500",
            cursor: saving ? "not-allowed" : "pointer",
            opacity: saving || !apiKey.trim() ? 0.6 : 1,
          }}
        >
          {saving ? "Saving..." : "🚀 Start Using Smart Dating Assistant"}
        </button>
      </div>

      {/* Privacy Note */}
      <div
        style={{
          marginTop: "24px",
          padding: "16px",
          background: "rgba(34, 197, 94, 0.1)",
          border: "1px solid rgba(34, 197, 94, 0.2)",
          borderRadius: "8px",
          fontSize: "12px",
          lineHeight: "1.4",
          opacity: 0.8,
        }}
      >
        🔒 <strong>Privacy:</strong> Your API key is stored locally on your
        device and never sent to our servers. All AI requests go directly from
        your computer to your chosen provider.
      </div>
    </div>
  );
}
