import { useState, useEffect } from "react";
import {
  Menu,
  MessageCircle,
  Settings as SettingsIcon,
  Heart,
  Shield,
  Brain,
  X,
} from "lucide-react";
import SmartReply from "../components/SmartReply";
import Settings from "../components/Settings";
import ApiSetup from "../components/ApiSetup";
import InterestAnalyzer from "../components/InterestAnalyzer";
import CatfishDetection from "../components/CatfishDetection";
import ConversationQuality from "../components/ConversationQuality";

export default function Home() {
  const [currentView, setCurrentView] = useState<
    "smartReply" | "settings" | "setup" | "interest" | "catfish" | "quality"
  >("setup");
  const [isFirstRun, setIsFirstRun] = useState(true);
  const [hasValidApiKey, setHasValidApiKey] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [statusHover, setStatusHover] = useState(false);
  const [statusText, setStatusText] = useState("Status");
  const [statusColor, setStatusColor] = useState("rgba(255,255,255,0.6)");

  useEffect(() => {
    const checkSetupStatus = async () => {
      try {
        const firstRun = await window.electronAPI.isFirstRun();
        const validKey = await window.electronAPI.hasValidApiKey();

        setIsFirstRun(firstRun);
        setHasValidApiKey(validKey);

        if (!firstRun && validKey) {
          setCurrentView("smartReply");
        } else {
          setCurrentView("setup");
        }
      } catch (error) {
        console.error("Failed to check setup status:", error);
        setCurrentView("setup");
      }
    };

    checkSetupStatus();
  }, []);

  const handleSetupComplete = () => {
    console.log("handleSetupComplete called");
    setIsFirstRun(false);
    setHasValidApiKey(true);
    setCurrentView("smartReply");
    console.log("Setup complete, switching to smartReply view");
  };

  const handleViewChange = (
    view: "smartReply" | "settings" | "interest" | "catfish" | "quality"
  ) => {
    setCurrentView(view);
    setIsMenuOpen(false);
  };

  const getViewTitle = () => {
    switch (currentView) {
      case "smartReply":
        return "Smart Reply";
      case "interest":
        return "Interest Analysis";
      case "catfish":
        return "Catfish Detection";
      case "quality":
        return "Conversation Quality";
      case "settings":
        return "Settings";
      default:
        return "Dating Assistant";
    }
  };

  const getViewIcon = () => {
    switch (currentView) {
      case "smartReply":
        return <MessageCircle size={16} />;
      case "interest":
        return <Heart size={16} />;
      case "catfish":
        return <Shield size={16} />;
      case "quality":
        return <Brain size={16} />;
      case "settings":
        return <SettingsIcon size={16} />;
      default:
        return <MessageCircle size={16} />;
    }
  };

  if (isFirstRun || !hasValidApiKey) {
    return <ApiSetup onSetupComplete={handleSetupComplete} />;
  }

  return (
    <>
      <style jsx>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        input[type="range"]::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        input[type="range"]:focus::-webkit-slider-thumb {
          box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3);
        }
      `}</style>
      <div
        style={{
          padding: "0",
          background: "rgba(0, 0, 0, 0.85)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          borderRadius: "12px",
          color: "white",
          fontFamily:
            '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          minHeight: "100vh",
          position: "relative",
          border: "none",
          transition: "background 0.3s ease, backdrop-filter 0.3s ease",
        }}
      >
        {/* Minimal Header with Hamburger Menu (sidebar-style dropdown) */}
        <div
          className="drag-handle"
          style={{
            background: "transparent",
            padding: "12px 16px",
            borderRadius: "12px 12px 0 0",
            cursor: "move",
            userSelect: "none",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            position: "relative",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Hamburger Menu Button */}
            <button
              className="no-drag"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              style={{
                background: "transparent",
                border: "none",
                color: "white",
                cursor: "pointer",
                padding: "4px",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.2s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            {/* Current View Title and Icon */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {getViewIcon()}
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  fontFamily: "inherit",
                  color: "#ffffff",
                }}
              >
                {getViewTitle()}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Status chip with hover tooltip */}
            <div
              className="no-drag"
              onMouseEnter={async () => {
                setStatusHover(true);
                try {
                  const net = (window as any).electronAPI?.checkNetworkOnline
                    ? await (window as any).electronAPI.checkNetworkOnline()
                    : { online: navigator.onLine };
                  const prov = (window as any).electronAPI?.checkProviderHealth
                    ? await (window as any).electronAPI.checkProviderHealth()
                    : { ok: navigator.onLine };
                  if (!net.online) {
                    setStatusText("Offline: check your connection");
                    setStatusColor("#f87171");
                  } else if (prov.ok) {
                    setStatusText("Online: provider reachable");
                    setStatusColor("#34d399");
                  } else {
                    setStatusText("Online: provider unreachable");
                    setStatusColor("#fbbf24");
                  }
                } catch {
                  setStatusText("Status unavailable");
                  setStatusColor("#fbbf24");
                }
              }}
              onMouseLeave={() => {
                setStatusHover(false);
                setStatusText("Status");
                setStatusColor("rgba(255,255,255,0.6)");
              }}
              title="Connection status"
              style={{
                position: "relative",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "rgba(255,255,255,0.8)",
                borderRadius: 12,
                padding: "4px 8px",
                fontSize: 11,
                cursor: "default",
              }}
            >
              <span style={{ color: statusColor }}>Status</span>
              {statusHover && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 6px)",
                    right: 0,
                    background: "rgba(0,0,0,0.95)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 8,
                    padding: "6px 8px",
                    fontSize: 11,
                    color: "#e5e7eb",
                    whiteSpace: "nowrap",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                    zIndex: 5,
                  }}
                >
                  {statusText}
                </div>
              )}
            </div>

            <div
              style={{
                fontSize: "11px",
                opacity: 0.8,
                fontFamily: "inherit",
                color: "#ffffff",
              }}
            >
              Cmd+Shift+O
            </div>
          </div>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div
              className="no-drag"
              style={{
                position: "absolute",
                top: "100%",
                left: "16px",
                right: "16px",
                background: "rgba(0, 0, 0, 0.95)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                borderRadius: "8px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                zIndex: 1000,
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
                overflow: "hidden",
              }}
            >
              {/* Menu Items */}
              <button
                onClick={() => handleViewChange("smartReply")}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background:
                    currentView === "smartReply"
                      ? "rgba(255, 255, 255, 0.1)"
                      : "transparent",
                  border: "none",
                  color: "white",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  transition: "background 0.2s ease",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                }}
                onMouseEnter={(e) => {
                  if (currentView !== "smartReply") {
                    e.currentTarget.style.background =
                      "rgba(255, 255, 255, 0.05)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentView !== "smartReply") {
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                <MessageCircle size={16} />
                <span>Smart Reply</span>
                <span
                  style={{ fontSize: "12px", opacity: 0.7, marginLeft: "auto" }}
                >
                  Main
                </span>
              </button>

              <button
                onClick={() => handleViewChange("interest")}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background:
                    currentView === "interest"
                      ? "rgba(255, 255, 255, 0.1)"
                      : "transparent",
                  border: "none",
                  color: "white",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  transition: "background 0.2s ease",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                }}
                onMouseEnter={(e) => {
                  if (currentView !== "interest") {
                    e.currentTarget.style.background =
                      "rgba(255, 255, 255, 0.05)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentView !== "interest") {
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                <Heart size={16} />
                <span>Interest Analysis</span>
              </button>

              <button
                onClick={() => handleViewChange("catfish")}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background:
                    currentView === "catfish"
                      ? "rgba(255, 255, 255, 0.1)"
                      : "transparent",
                  border: "none",
                  color: "white",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  transition: "background 0.2s ease",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                }}
                onMouseEnter={(e) => {
                  if (currentView !== "catfish") {
                    e.currentTarget.style.background =
                      "rgba(255, 255, 255, 0.05)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentView !== "catfish") {
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                <Shield size={16} />
                <span>Catfish Detection</span>
              </button>

              <button
                onClick={() => handleViewChange("quality")}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background:
                    currentView === "quality"
                      ? "rgba(255, 255, 255, 0.1)"
                      : "transparent",
                  border: "none",
                  color: "white",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  transition: "background 0.2s ease",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                }}
                onMouseEnter={(e) => {
                  if (currentView !== "quality") {
                    e.currentTarget.style.background =
                      "rgba(255, 255, 255, 0.05)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentView !== "quality") {
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                <Brain size={16} />
                <span>Conversation Quality</span>
              </button>

              <button
                onClick={() => handleViewChange("settings")}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background:
                    currentView === "settings"
                      ? "rgba(255, 255, 255, 0.1)"
                      : "transparent",
                  border: "none",
                  color: "white",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  transition: "background 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  if (currentView !== "settings") {
                    e.currentTarget.style.background =
                      "rgba(255, 255, 255, 0.05)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentView !== "settings") {
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                <SettingsIcon size={16} />
                <span>Settings</span>
              </button>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div
          className="no-drag"
          style={{
            background: "transparent",
            borderRadius: "0 0 12px 12px",
            minHeight: "calc(100vh - 60px)",
          }}
          onClick={() => setIsMenuOpen(false)} // Close menu when clicking outside
        >
          {/* Views */}
          {currentView === "smartReply" && <SmartReply />}

          {currentView === "interest" && (
            <InterestAnalyzer onBack={() => handleViewChange("smartReply")} />
          )}

          {currentView === "catfish" && (
            <CatfishDetection onBack={() => handleViewChange("smartReply")} />
          )}

          {currentView === "quality" && (
            <ConversationQuality
              onBack={() => handleViewChange("smartReply")}
            />
          )}

          {currentView === "settings" && <Settings />}

          {/* Floating Quick Actions removed for minimal aesthetic */}
        </div>
      </div>
    </>
  );
}
