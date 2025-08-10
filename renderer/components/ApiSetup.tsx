import React, { useState, useEffect } from "react";
import { Rocket, Lightbulb, Lock, Eye, EyeOff } from "lucide-react";

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
  const [showKey, setShowKey] = useState(false);

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
      console.log(
        "Calling setApiKey with:",
        selectedProvider,
        apiKey.substring(0, 10) + "..."
      );
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
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 20px",
        background:
          "radial-gradient(1000px 600px at -10% -10%, rgba(37,99,235,0.25) 0%, rgba(2,6,23,0) 60%), radial-gradient(800px 500px at 110% 10%, rgba(16,185,129,0.18) 0%, rgba(2,6,23,0) 60%), #0a0f1f",
        color: "#ffffff",
        fontFamily:
          '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 720,
          background: "rgba(10, 15, 31, 0.85)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 16,
          boxShadow:
            "0 20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          padding: 28,
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 12px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              fontSize: 12,
              color: "#c7d2fe",
              marginBottom: 12,
            }}
          >
            <Rocket size={14} />
            First-time setup
          </div>
          <h1
            style={{
              fontSize: 28,
              lineHeight: 1.2,
              fontWeight: 700,
              margin: 0,
              letterSpacing: -0.2,
            }}
          >
            Welcome to Smart Dating Assistant
          </h1>
          <p
            style={{
              fontSize: 15,
              opacity: 0.8,
              lineHeight: 1.6,
              marginTop: 8,
            }}
          >
            Enter an AI API key to unlock smart replies and safety tools.
          </p>
        </div>

        <div style={{ marginBottom: 18 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <h3
              style={{
                fontSize: 14,
                fontWeight: 600,
                margin: 0,
              }}
            >
              Choose your AI provider
            </h3>
            <div style={{ fontSize: 12, opacity: 0.7 }}>
              Switch anytime in Settings
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {(["gemini", "openai", "anthropic"] as const).map((provider) => (
              <button
                key={provider}
                onClick={() => setSelectedProvider(provider)}
                style={{
                  background:
                    selectedProvider === provider
                      ? "rgba(59,130,246,0.2)"
                      : "rgba(255,255,255,0.06)",
                  border: `1px solid ${
                    selectedProvider === provider
                      ? "#3b82f6"
                      : "rgba(255,255,255,0.1)"
                  }`,
                  color: "#ffffff",
                  padding: "10px 14px",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontSize: 13,
                  textTransform: "capitalize",
                  fontWeight: selectedProvider === provider ? 600 : 500,
                  boxShadow:
                    selectedProvider === provider
                      ? "0 0 0 4px rgba(59,130,246,0.12)"
                      : "none",
                }}
              >
                {provider === "gemini"
                  ? "Gemini"
                  : provider === "openai"
                  ? "OpenAI"
                  : "Claude"}
                {selectedProvider === provider && (
                  <span style={{ marginLeft: 8, opacity: 0.8 }}>
                    (Selected)
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12,
            padding: 16,
            marginBottom: 18,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#93c5fd",
              marginBottom: 10,
            }}
          >
            {instructions.title}
          </div>
          <div style={{ display: "grid", gap: 6 }}>
            {instructions.steps.map((step, index) => (
              <div
                key={index}
                style={{ fontSize: 13, lineHeight: 1.45, opacity: 0.9 }}
              >
                {step}
              </div>
            ))}
          </div>
          <div
            style={{
              marginTop: 12,
              fontSize: 12,
              opacity: 0.8,
              padding: 10,
              borderRadius: 8,
              background: "rgba(255,255,255,0.04)",
            }}
          >
            <span
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <Lightbulb size={14} /> {instructions.note}
            </span>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              display: "block",
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 8,
            }}
          >
            Enter your {instructions.title} key
          </label>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
              }}
              placeholder={instructions.placeholder}
              style={{
                flex: 1,
                padding: "12px 14px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.08)",
                color: "#ffffff",
                fontSize: 14,
                fontFamily: "monospace",
              }}
            />
            <button
              onClick={() => setShowKey((s) => !s)}
              aria-label="Toggle key visibility"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "#ffffff",
                padding: "10px 12px",
                borderRadius: 10,
                cursor: "pointer",
              }}
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {error && (
          <div
            style={{
              background: "rgba(239,68,68,0.12)",
              border: "1px solid rgba(239,68,68,0.5)",
              borderRadius: 10,
              padding: 12,
              marginBottom: 14,
              fontSize: 13,
              color: "#fecaca",
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={handleSave}
            disabled={saving || !apiKey.trim()}
            style={{
              flex: 1,
              background: saving ? "rgba(107,114,128,0.5)" : "#2563eb",
              border: "1px solid rgba(37,99,235,0.9)",
              color: "#ffffff",
              padding: "14px 16px",
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 600,
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving || !apiKey.trim() ? 0.7 : 1,
              boxShadow: "0 10px 30px rgba(37,99,235,0.25)",
            }}
          >
            {saving ? "Saving..." : "Continue"}
          </button>
        </div>

        <div
          style={{
            marginTop: 18,
            padding: 12,
            background: "rgba(16,185,129,0.08)",
            border: "1px solid rgba(16,185,129,0.35)",
            borderRadius: 10,
            fontSize: 12,
            lineHeight: 1.5,
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "#d1fae5",
          }}
        >
          <Lock size={14} /> Your key stays on this device. Requests go directly
          to your provider.
        </div>
      </div>
    </div>
  );
}
