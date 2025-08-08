import React, { useState, useEffect } from "react";
import {
  Key,
  TestTube,
  Info,
  Keyboard,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";

export default function Settings() {
  const [opacity, setOpacity] = useState(0.85);
  const [currentProvider, setCurrentProvider] = useState("gemini");
  const [hasApiKey, setHasApiKey] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [isUpdatingKey, setIsUpdatingKey] = useState(false);
  const [apiKeyMessage, setApiKeyMessage] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [apiUsage, setApiUsage] = useState({
    dailyUsed: 0,
    dailyLimit: 40,
    totalCalls: 0,
    canMakeCall: true,
    nextCallAvailable: 0,
    cacheSize: 0,
    rateLimitMessage: "Ready for API calls",
  });
  const [selectedModel, setSelectedModel] = useState("");
  const [customEndpoint, setCustomEndpoint] = useState("");
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [providerConfig, setProviderConfig] = useState({
    provider: "gemini",
    model: "",
    endpoint: "",
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const opacityResult = await window.electronAPI.getAppOpacity();
        setOpacity(opacityResult.opacity);

        const provider = await window.electronAPI.getCurrentProvider();
        setCurrentProvider(provider);

        const validKey = await window.electronAPI.hasValidApiKey();
        setHasApiKey(validKey);

        // Load current API key (masked)
        if (validKey) {
          setApiKey("••••••••••••••••"); // Show masked for existing key
        }

        // Load provider configuration
        try {
          const config = await window.electronAPI.getProviderConfig();
          setProviderConfig({
            provider: config.provider,
            model: config.model || "",
            endpoint: config.endpoint || "",
          });
          setSelectedModel(config.model || "");
          setCustomEndpoint(config.endpoint || "");

          // Load available models for current provider
          const models = await window.electronAPI.getAvailableModels(
            config.provider
          );
          setAvailableModels(models);
        } catch (error) {
          console.error("Failed to load provider config:", error);
        }

        // Load API usage statistics
        try {
          const usage = await window.electronAPI.getApiUsage();
          setApiUsage(usage);
        } catch (error) {
          console.error("Failed to load API usage:", error);
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    };

    loadSettings();

    // Refresh API usage every 30 seconds
    const interval = setInterval(async () => {
      try {
        const usage = await window.electronAPI.getApiUsage();
        setApiUsage(usage);
      } catch (error) {
        console.error("Failed to refresh API usage:", error);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleOpacityChange = async (newOpacity: number) => {
    setOpacity(newOpacity);
    try {
      await window.electronAPI.setAppOpacity(newOpacity);
    } catch (error) {
      console.error("Failed to update opacity:", error);
    }
  };

  const handleUpdateApiKey = async () => {
    if (!apiKey.trim() || apiKey.includes("•")) {
      setApiKeyMessage("Please enter a valid API key");
      return;
    }

    setIsUpdatingKey(true);
    setApiKeyMessage("");

    try {
      const options: any = {};
      if (currentProvider === "openrouter" && selectedModel) {
        options.model = selectedModel;
      }
      if (currentProvider === "custom") {
        options.model = selectedModel;
        options.endpoint = customEndpoint;
      }

      await window.electronAPI.setApiKey(
        currentProvider as
          | "gemini"
          | "openai"
          | "anthropic"
          | "openrouter"
          | "custom",
        apiKey,
        options
      );

      setHasApiKey(true);
      setShowApiKeyInput(false);
      setApiKeyMessage("✅ API key updated successfully!");

      // Reload provider config
      const config = await window.electronAPI.getProviderConfig();
      setProviderConfig({
        provider: config.provider,
        model: config.model || "",
        endpoint: config.endpoint || "",
      });

      setTimeout(() => setApiKeyMessage(""), 3000);
    } catch (error) {
      console.error("Failed to update API key:", error);
      setApiKeyMessage("❌ Failed to update API key");
    } finally {
      setIsUpdatingKey(false);
    }
  };

  const handleProviderChange = async (provider: string) => {
    setCurrentProvider(provider);

    // Load available models for the new provider
    try {
      const models = await window.electronAPI.getAvailableModels(provider);
      setAvailableModels(models);
      setSelectedModel(models[0] || "");
    } catch (error) {
      console.error("Failed to load models for provider:", error);
      setAvailableModels([]);
    }

    // Reset form
    setApiKey("");
    setHasApiKey(false);
    setCustomEndpoint("");
    setShowApiKeyInput(true);
  };

  const toggleShowKey = () => {
    if (showKey) {
      // Hide the key - show masked version
      setApiKey("•".repeat(Math.max(0, apiKey.length - 4)) + apiKey.slice(-4));
    } else {
      // Show input for new key
      setApiKey("");
    }
    setShowKey(!showKey);
  };

  const testClipboardDetection = async () => {
    try {
      const clipboardContent = await window.electronAPI.getClipboard();
      alert(
        `Current clipboard: "${clipboardContent}"\n\nNow try pressing Cmd+Shift+C to test manual detection.`
      );
    } catch (error) {
      alert("Failed to read clipboard: " + error);
    }
  };

  return (
    <div
      style={{
        padding: "24px",
        color: "#ffffff",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Header removed per request; start directly with sections */}

      {/* Transparency Settings */}
      <div style={{ marginBottom: "32px" }}>
        <h3
          style={{
            fontSize: "14px",
            fontWeight: "500",
            marginBottom: "12px",
            opacity: 0.9,
          }}
        >
          App Transparency
        </h3>

        <div style={{ marginBottom: "12px" }}>
          <input
            type="range"
            min="0.2"
            max="1"
            step="0.05"
            value={opacity}
            onChange={(e) => handleOpacityChange(parseFloat(e.target.value))}
            style={{
              width: "100%",
              height: "4px",
              borderRadius: "2px",
              background: "rgba(255, 255, 255, 0.2)",
              outline: "none",
              cursor: "pointer",
            }}
          />
        </div>

        <div
          style={{
            fontSize: "12px",
            opacity: 0.7,
            textAlign: "center",
          }}
        >
          {Math.round(opacity * 100)}% opacity
        </div>
      </div>

      {/* API Configuration */}
      <div style={{ marginBottom: "32px" }}>
        <h3
          style={{
            fontSize: "14px",
            fontWeight: "500",
            marginBottom: "12px",
            opacity: 0.9,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Key size={14} />
          API Key Management
        </h3>

        {/* API Usage Statistics */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            borderRadius: "8px",
            padding: "12px",
            marginBottom: "16px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              fontWeight: "500",
              marginBottom: "8px",
              opacity: 0.9,
            }}
          >
            Daily API Usage
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "8px",
            }}
          >
            <span style={{ fontSize: "12px", opacity: 0.7 }}>
              Calls Today: {apiUsage.dailyUsed}/{apiUsage.dailyLimit}
            </span>
            <span
              style={{
                fontSize: "12px",
                color: apiUsage.canMakeCall ? "#4ade80" : "#f87171",
              }}
            >
              {apiUsage.canMakeCall ? "Ready" : "Rate Limited"}
            </span>
          </div>

          <div
            style={{
              width: "100%",
              height: "4px",
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: "2px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${Math.min(
                  100,
                  (apiUsage.dailyUsed / apiUsage.dailyLimit) * 100
                )}%`,
                height: "100%",
                background: apiUsage.canMakeCall ? "#4ade80" : "#f87171",
                transition: "width 0.3s ease",
              }}
            />
          </div>

          {!apiUsage.canMakeCall && apiUsage.nextCallAvailable > 0 && (
            <div
              style={{
                fontSize: "11px",
                opacity: 0.6,
                marginTop: "6px",
                textAlign: "center",
              }}
            >
              Next call available in {apiUsage.nextCallAvailable}s
            </div>
          )}

          <div
            style={{
              fontSize: "11px",
              opacity: 0.5,
              marginTop: "6px",
              textAlign: "center",
            }}
          >
            Cache: {apiUsage.cacheSize} responses • Total: {apiUsage.totalCalls}{" "}
            calls
          </div>
        </div>

        {/* Provider Selection */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "16px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              fontWeight: "500",
              marginBottom: "12px",
              opacity: 0.9,
            }}
          >
            AI Provider
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "8px",
              marginBottom: "12px",
            }}
          >
            {["gemini", "openrouter", "openai", "anthropic", "custom"].map(
              (provider) => (
                <button
                  key={provider}
                  onClick={() => handleProviderChange(provider)}
                  style={{
                    background:
                      currentProvider === provider
                        ? "rgba(59, 130, 246, 0.3)"
                        : "rgba(255, 255, 255, 0.1)",
                    border:
                      currentProvider === provider
                        ? "1px solid #3b82f6"
                        : "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "6px",
                    padding: "8px",
                    fontSize: "11px",
                    color: "#fff",
                    cursor: "pointer",
                    textTransform: "capitalize",
                    transition: "all 0.2s ease",
                  }}
                >
                  {provider === "openrouter" ? "OpenRouter" : provider}
                </button>
              )
            )}
          </div>

          {/* Model Selection for OpenRouter and Custom */}
          {(currentProvider === "openrouter" ||
            currentProvider === "custom") && (
            <div style={{ marginBottom: "12px" }}>
              <div
                style={{ fontSize: "11px", opacity: 0.7, marginBottom: "4px" }}
              >
                Model:
              </div>
              {currentProvider === "openrouter" ? (
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  style={{
                    width: "100%",
                    background: "rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "4px",
                    padding: "6px",
                    fontSize: "11px",
                    color: "#fff",
                  }}
                >
                  {availableModels.map((model) => (
                    <option
                      key={model}
                      value={model}
                      style={{ background: "#1f2937", color: "#fff" }}
                    >
                      {model}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  placeholder="e.g., gpt-4o, claude-3.5-sonnet"
                  style={{
                    width: "100%",
                    background: "rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "4px",
                    padding: "6px",
                    fontSize: "11px",
                    color: "#fff",
                  }}
                />
              )}
            </div>
          )}

          {/* Custom Endpoint for Custom Provider */}
          {currentProvider === "custom" && (
            <div style={{ marginBottom: "12px" }}>
              <div
                style={{ fontSize: "11px", opacity: 0.7, marginBottom: "4px" }}
              >
                API Endpoint:
              </div>
              <input
                type="text"
                value={customEndpoint}
                onChange={(e) => setCustomEndpoint(e.target.value)}
                placeholder="https://api.example.com/v1"
                style={{
                  width: "100%",
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "4px",
                  padding: "6px",
                  fontSize: "11px",
                  color: "#fff",
                }}
              />
            </div>
          )}

          <div style={{ fontSize: "10px", opacity: 0.6, textAlign: "center" }}>
            {currentProvider === "openrouter" &&
              "Free Horizon Alpha model available"}
            {currentProvider === "gemini" && "Free tier: 50 requests/day"}
            {currentProvider === "openai" && "Pay-per-use pricing"}
            {currentProvider === "anthropic" && "Pay-per-use pricing"}
            {currentProvider === "custom" && "Configure your own endpoint"}
          </div>
        </div>

        <div
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            borderRadius: "8px",
            padding: "16px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          <div style={{ fontSize: "12px", opacity: 0.8, marginBottom: "8px" }}>
            Current provider:{" "}
            <strong style={{ textTransform: "capitalize" }}>
              {currentProvider}
            </strong>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: "14px",
              fontWeight: 500,
              marginBottom: "12px",
              color: hasApiKey ? "#10b981" : "#ef4444",
            }}
          >
            {hasApiKey ? <CheckCircle size={16} /> : <XCircle size={16} />}
            Status: {hasApiKey ? "API Key Configured" : "No API Key Set"}
          </div>

          {hasApiKey && (
            <div style={{ marginBottom: "12px" }}>
              <div
                style={{ fontSize: "12px", opacity: 0.8, marginBottom: "4px" }}
              >
                Current API Key:
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "8px",
                }}
              >
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: "12px",
                    background: "rgba(255, 255, 255, 0.1)",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    flex: 1,
                  }}
                >
                  {apiKey || "••••••••••••••••"}
                </span>
                <button
                  onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                  style={{
                    background: "rgba(255, 255, 255, 0.2)",
                    border: "none",
                    borderRadius: "4px",
                    padding: "4px 8px",
                    color: "white",
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  {showApiKeyInput ? "Cancel" : "Update"}
                </button>
              </div>
            </div>
          )}

          {(showApiKeyInput || !hasApiKey) && (
            <div style={{ marginBottom: "12px" }}>
              <div
                style={{ fontSize: "12px", opacity: 0.8, marginBottom: "4px" }}
              >
                {hasApiKey
                  ? "Enter new API key:"
                  : "Enter your Gemini API key:"}
              </div>
              <div
                style={{ display: "flex", gap: "8px", alignItems: "center" }}
              >
                <input
                  type={showKey ? "text" : "password"}
                  value={showKey ? apiKey : apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    setApiKeyMessage("");
                  }}
                  placeholder="AIzaSy..."
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    background: "rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    borderRadius: "6px",
                    color: "white",
                    fontSize: "12px",
                    outline: "none",
                  }}
                />
                <button
                  onClick={toggleShowKey}
                  style={{
                    background: "rgba(255, 255, 255, 0.2)",
                    border: "none",
                    borderRadius: "4px",
                    padding: "8px 10px",
                    color: "white",
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button
                  onClick={handleUpdateApiKey}
                  disabled={isUpdatingKey}
                  style={{
                    background: isUpdatingKey
                      ? "rgba(255, 255, 255, 0.1)"
                      : "rgba(255, 255, 255, 0.9)",
                    color: isUpdatingKey ? "rgba(255, 255, 255, 0.5)" : "black",
                    border: "none",
                    borderRadius: "6px",
                    padding: "8px 12px",
                    fontSize: "12px",
                    fontWeight: "500",
                    cursor: isUpdatingKey ? "not-allowed" : "pointer",
                  }}
                >
                  {isUpdatingKey ? "Saving..." : "Save"}
                </button>
              </div>
              <div
                style={{
                  fontSize: "10px",
                  opacity: 0.6,
                  marginTop: "4px",
                }}
              >
                Get your API key from: https://aistudio.google.com/app/apikey
              </div>
            </div>
          )}

          {apiKeyMessage && (
            <div
              style={{
                padding: "8px 12px",
                borderRadius: "6px",
                fontSize: "12px",
                marginTop: "8px",
                background: apiKeyMessage.includes("✅")
                  ? "rgba(16, 185, 129, 0.2)"
                  : "rgba(239, 68, 68, 0.2)",
                border: apiKeyMessage.includes("✅")
                  ? "1px solid rgba(16, 185, 129, 0.4)"
                  : "1px solid rgba(239, 68, 68, 0.4)",
                color: apiKeyMessage.includes("✅") ? "#6ee7b7" : "#fca5a5",
              }}
            >
              {apiKeyMessage}
            </div>
          )}

          {!hasApiKey && (
            <div
              style={{
                marginTop: "12px",
                padding: "12px",
                background: "rgba(239, 68, 68, 0.2)",
                border: "1px solid rgba(239, 68, 68, 0.4)",
                borderRadius: "6px",
                fontSize: "12px",
                color: "#fca5a5",
              }}
            >
              <span
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <AlertTriangle size={14} /> API key required for all analysis
                features to work
              </span>
            </div>
          )}
        </div>

        {/* Usage Tips */}
        <div
          style={{
            marginTop: "12px",
            padding: "12px",
            background: "rgba(59, 130, 246, 0.1)",
            border: "1px solid rgba(59, 130, 246, 0.3)",
            borderRadius: "6px",
            fontSize: "11px",
            color: "#93c5fd",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontWeight: 500,
              marginBottom: "4px",
            }}
          >
            <Lightbulb size={14} /> When to update your API key:
          </div>
          <div style={{ opacity: 0.8, lineHeight: "1.4" }}>
            - When you see "API quota exceeded" errors
            <br />
            - When responses stop working suddenly
            <br />
            - When switching to a different Google account
            <br />- For better rate limits or billing management
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts */}
      <div style={{ marginBottom: "32px" }}>
        <h3
          style={{
            fontSize: "14px",
            fontWeight: "500",
            marginBottom: "12px",
            opacity: 0.9,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Keyboard size={14} />
          Keyboard Shortcuts
        </h3>

        <div
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            borderRadius: "8px",
            padding: "16px",
            fontSize: "12px",
            lineHeight: "1.6",
          }}
        >
          <div style={{ marginBottom: "8px" }}>
            <strong>Cmd/Ctrl + Shift + O</strong> - Show/Hide overlay
          </div>
          <div style={{ marginBottom: "8px" }}>
            <strong>Cmd/Ctrl + Shift + C</strong> - Force check clipboard & get
            replies
          </div>
          <div style={{ opacity: 0.8 }}>
            Auto-detection: Copy any message to clipboard for smart replies
          </div>
          <div style={{ opacity: 0.8, marginTop: "4px" }}>
            Manual trigger: Use Cmd+Shift+C if auto-detection isn't working
          </div>
        </div>
      </div>

      {/* Appearance removed to keep single aesthetic (dark) */}

      {/* Debug Tools */}
      <div style={{ marginBottom: "32px" }}>
        <h3
          style={{
            fontSize: "14px",
            fontWeight: "500",
            marginBottom: "12px",
            opacity: 0.9,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <TestTube size={14} />
          Troubleshooting
        </h3>

        <div
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            borderRadius: "8px",
            padding: "16px",
            fontSize: "12px",
            lineHeight: "1.6",
          }}
        >
          <div style={{ marginBottom: "12px", opacity: 0.8 }}>
            If clipboard detection isn't working reliably:
          </div>

          <button
            onClick={testClipboardDetection}
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              borderRadius: "6px",
              padding: "8px 12px",
              color: "white",
              fontSize: "12px",
              cursor: "pointer",
              marginBottom: "8px",
              marginRight: "8px",
            }}
          >
            Test Clipboard Access
          </button>

          <div style={{ opacity: 0.7, fontSize: "11px" }}>
            <div>- Clipboard monitor checks every 500ms</div>
            <div>- Filters out URLs, emails, and phone numbers</div>
            <div>- Use manual trigger (Cmd+Shift+C) for immediate response</div>
            <div>- Check console logs if issues persist</div>
          </div>
        </div>
      </div>

      {/* About */}
      <div>
        <h3
          style={{
            fontSize: "14px",
            fontWeight: "500",
            marginBottom: "12px",
            opacity: 0.9,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Info size={14} />
          About
        </h3>

        <div
          style={{
            fontSize: "12px",
            opacity: 0.7,
            lineHeight: "1.5",
          }}
        >
          <div>Smart Dating Assistant v1.0</div>
          <div>Your privacy-focused dating conversation helper</div>
          <div style={{ marginTop: "8px" }}>
            All data stays on your device. API requests go directly to your
            chosen provider.
          </div>
        </div>
      </div>
    </div>
  );
}
