import {
  app,
  BrowserWindow,
  globalShortcut,
  ipcMain,
  IpcMainInvokeEvent,
  clipboard,
  shell,
  dialog,
  nativeImage,
  Tray,
  Menu,
  desktopCapturer,
} from "electron";
import * as path from "path";
import * as os from "os";
import { pathToFileURL } from "url";
import { promises as fs } from "fs";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  databaseManager,
  Conversation,
  UserProfile,
  DatingInsight,
} from "./src/database";
import {
  ConversationAnalyzer,
  MessageAnalysis,
  ConversationMetrics,
  DatingAdvice,
} from "./src/analysis/conversationAnalyzer";
import { UniversalAI } from "./src/ai/universalAI";
import { apiKeyManager } from "./src/config/apiKeyManager";
import { LearningEngine } from "./src/analysis/learningEngine";
import { SafetyEngine, SafetyAlert } from "./src/safety/safetyEngine";
import { AiSafetyAnalyzer } from "./src/safety/aiSafetyAnalyzer";
const chokidar = require("chokidar");
const clipboardy = require("clipboardy");
const notifier = require("node-notifier");
const screenshot = require("screenshot-desktop");
const prepareNext = require("electron-next");

let mainWindow: BrowserWindow | null;
let conversationAnalyzer: ConversationAnalyzer | null = null;
let learningEngine: LearningEngine | null = null;
let safetyEngine: SafetyEngine | null = null;
let aiSafetyAnalyzer: AiSafetyAnalyzer | null = null;
let appOpacity: number = 0.85; // Default opacity is 85%

// Rate limiting and caching for API calls - DISABLED for full functionality
let lastApiCall = 0;
let apiCallCount = 0;
let dailyApiCallCount = 0;
let lastResetDate = new Date().toDateString();
const MIN_API_INTERVAL = 0; // No rate limiting - allow immediate API calls
const MAX_DAILY_CALLS = 1000; // Very high limit to effectively disable daily restrictions
const replyCache = new Map<string, any>(); // Cache responses for repeated messages

// Debounce mechanism to prevent UI spam and multiple API calls for same message - DISABLED
const activeRequests = new Map<string, Promise<any>>();
// Removed: processedMessages, messageProcessingTimeout, lastManualCheck (no longer needed for rate limiting)

// Function to check if we can make an API call - ALWAYS RETURN TRUE
function canMakeApiCall(): boolean {
  const now = Date.now();
  const today = new Date().toDateString();

  // Reset daily count if it's a new day (for tracking purposes only)
  if (today !== lastResetDate) {
    dailyApiCallCount = 0;
    lastResetDate = today;
    console.log(`📅 New day: Reset API counter to 0 (rate limiting disabled)`);
  }

  console.log(
    `✅ API call always allowed: ${dailyApiCallCount} calls made today (no limits)`
  );
  return true; // Always allow API calls
}

// Function to record an API call - tracking only, no restrictions
function recordApiCall() {
  lastApiCall = Date.now();
  apiCallCount++;
  dailyApiCallCount++;
  console.log(
    `API Call recorded. Daily: ${dailyApiCallCount} (unlimited), Total: ${apiCallCount}`
  );
}

// Function to get cached response or generate hash for caching
function getCachedResponse(message: string, tone: string): any | null {
  const cacheKey = `${message.toLowerCase().trim()}_${tone}`;
  const cached = replyCache.get(cacheKey);

  if (cached) {
    console.log(
      `💾 Cache hit for: "${message.substring(0, 30)}..." (${
        replyCache.size
      } entries)`
    );
    return cached;
  }

  return null;
}

function setCachedResponse(message: string, tone: string, response: any) {
  const cacheKey = `${message.toLowerCase().trim()}_${tone}`;
  replyCache.set(cacheKey, response);

  // Limit cache size to prevent memory issues
  if (replyCache.size > 100) {
    const firstKey = replyCache.keys().next().value;
    replyCache.delete(firstKey);
    console.log(
      `🧹 Cache cleanup: Removed oldest entry (${replyCache.size}/100)`
    );
  }

  console.log(
    `💾 Cached response for: "${message.substring(0, 30)}..." (${
      replyCache.size
    }/100 entries)`
  );
}
async function saveOpacitySetting(opacity: number) {
  try {
    const settingsPath = path.join(app.getPath("userData"), "settings.json");
    let settings = {};

    try {
      const settingsData = await fs.readFile(settingsPath, "utf8");
      settings = JSON.parse(settingsData);
    } catch (err) {
      // File doesn't exist yet or is invalid, use empty settings
    }

    settings = { ...settings, opacity };
    await fs.writeFile(settingsPath, JSON.stringify(settings));
  } catch (error) {
    console.error("Error saving opacity setting:", error);
  }
}

// Function to load opacity setting from disk
async function loadOpacitySetting(): Promise<number> {
  try {
    const settingsPath = path.join(app.getPath("userData"), "settings.json");
    const settingsData = await fs.readFile(settingsPath, "utf8");
    const settings = JSON.parse(settingsData);
    return typeof settings.opacity === "number" ? settings.opacity : 0.85;
  } catch (error) {
    // Default to 85% if settings file doesn't exist or is invalid
    return 0.85;
  }
}

// Initialize AI engines
async function initializeAI() {
  const apiKey = await apiKeyManager.getApiKey(); // Use user's API key instead of env variable
  if (apiKey) {
    conversationAnalyzer = new ConversationAnalyzer(apiKey);
    learningEngine = new LearningEngine();
    safetyEngine = new SafetyEngine(apiKey);
    const providerCfg = await apiKeyManager.getProviderConfig();
    const apiKeyForProvider = await apiKeyManager.getApiKey(
      providerCfg.provider as any
    );
    aiSafetyAnalyzer = new AiSafetyAnalyzer();
    if (apiKeyForProvider) {
      aiSafetyAnalyzer.initialize(
        new UniversalAI({
          provider: providerCfg.provider,
          apiKey: apiKeyForProvider,
          model: providerCfg.model,
          endpoint: providerCfg.endpoint,
        })
      );
    }

    console.log("✅ AI engines initialized successfully");
  }
}

async function createWindow() {
  // Only prepare Next.js in development mode
  if (!app.isPackaged) {
    await prepareNext("./renderer", 3002); // Use port 3002 for electron-next
  }

  // Load saved opacity setting
  appOpacity = await loadOpacitySetting();

  // Initialize AI systems
  await initializeAI();

  const firstRun = await apiKeyManager.isFirstRun();
  const hasKey = await apiKeyManager.hasValidApiKey();
  const initialOpacity = !hasKey || firstRun ? 1.0 : appOpacity;

  mainWindow = new BrowserWindow({
    width: 400,
    height: 600,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    resizable: true,
    movable: true,
    opacity: initialOpacity,
    icon: (() => {
      try {
        const iconPath = app.isPackaged
          ? path.join(
              process.resourcesPath,
              "assets",
              "icons",
              process.platform === "win32"
                ? "trustdating-icon.ico"
                : "trustdating.icns"
            )
          : path.resolve(
              process.cwd(),
              "assets",
              "icons",
              process.platform === "win32"
                ? "trustdating-icon.ico"
                : "trustdating.icns"
            );
        const img = nativeImage.createFromPath(iconPath);
        return img.isEmpty() ? undefined : img;
      } catch {
        return undefined;
      }
    })(),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (app.isPackaged) {
    const indexHtmlPath = path.resolve(
      __dirname,
      "..",
      "renderer-dist",
      "index.html"
    );
    mainWindow.loadURL(pathToFileURL(indexHtmlPath).toString());
  } else {
    mainWindow.loadURL("http://localhost:3002");
  }

  globalShortcut.register("CommandOrControl+Shift+O", () => {
    if (mainWindow)
      mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });

  // Manual clipboard check shortcut for immediate response - NO COOLDOWN
  globalShortcut.register("CommandOrControl+Shift+C", async () => {
    try {
      console.log("Manual clipboard check triggered (no rate limiting)");

      const currentClipboard = clipboard.readText();

      if (currentClipboard && currentClipboard.length > 0) {
        console.log(
          "Manual check - clipboard content:",
          currentClipboard.substring(0, 100) + "..."
        );

        // Accept any non-empty text for manual checks
        const isValidMessage =
          currentClipboard.trim().length > 0 && currentClipboard.length < 5000;

        if (isValidMessage && mainWindow) {
          console.log("✅ Manual check - showing overlay immediately");

          // Check API usage and inform user (for info only)
          const apiUsage = {
            dailyUsed: dailyApiCallCount,
            dailyLimit: MAX_DAILY_CALLS,
            canMakeCall: true, // Always true now
          };

          notifier.notify({
            title: "💬 Manual Check",
            message: `Getting smart replies... (${apiUsage.dailyUsed} API calls made today)`,
            sound: true,
            wait: false,
          });

          mainWindow.show();
          mainWindow.webContents.send("message-detected", {
            message: currentClipboard,
            timestamp: Date.now(),
            manual: true,
            apiUsage,
          });
        } else {
          // If somehow empty, do nothing
          console.log("Manual check: empty clipboard");
        }
      } else {
        console.log("❌ Manual check - clipboard empty");
        notifier.notify({
          title: "⚠️ Clipboard Empty",
          message: "Copy a message first, then try Cmd+Shift+C",
          sound: false,
          wait: false,
        });
      }
    } catch (error) {
      console.error("Manual clipboard check error:", error);
    }
  });

  // Privacy & Safety Center IPC handlers
  ipcMain.handle("analyzeConversationSafety", async (_evt, messages) => {
    try {
      if (!aiSafetyAnalyzer)
        throw new Error("AI safety analyzer not initialized");
      const result = await aiSafetyAnalyzer.analyzeConversationWithAI(
        messages,
        true
      );
      // Track simple stats
      safetyStats.totalAnalyses += 1;
      if (result.combinedRisk > 0.3) safetyStats.riskDetected += 1;
      safetyStats.safetyScore = Math.round((1 - result.combinedRisk) * 100);
      return result;
    } catch (e: any) {
      console.error("analyzeConversationSafety failed:", e);
      throw e;
    }
  });

  ipcMain.handle("quickSafetyCheck", async (_evt, message: string) => {
    try {
      if (!aiSafetyAnalyzer)
        throw new Error("AI safety analyzer not initialized");
      const quick = await aiSafetyAnalyzer.quickMessageCheck(message);
      return quick;
    } catch (e: any) {
      console.error("quickSafetyCheck failed:", e);
      throw e;
    }
  });

  const safetyStats = { totalAnalyses: 0, riskDetected: 0, safetyScore: 100 };
  ipcMain.handle("getSafetyStats", async () => safetyStats);
  ipcMain.handle("getSafetyEducation", async () => {
    try {
      if (!aiSafetyAnalyzer) aiSafetyAnalyzer = new AiSafetyAnalyzer();
      return aiSafetyAnalyzer.getSafetyEducation();
    } catch (e: any) {
      console.error("getSafetyEducation failed:", e);
      return { generalTips: [], redFlags: [], scamWarnings: [] };
    }
  });

  // API Key Management Handlers
  ipcMain.handle(
    "set-api-key",
    async (
      _event,
      provider: "gemini" | "openai" | "anthropic" | "openrouter" | "custom",
      apiKey: string,
      options?: { model?: string; endpoint?: string }
    ) => {
      await apiKeyManager.setApiKey(provider, apiKey, options);
      // Reinitialize AI with new API key
      await initializeAI();
    }
  );

  ipcMain.handle(
    "get-api-key",
    async (
      _event,
      provider?: "gemini" | "openai" | "anthropic" | "openrouter" | "custom"
    ) => {
      return await apiKeyManager.getApiKey(provider);
    }
  );

  ipcMain.handle("has-valid-api-key", async () => {
    return await apiKeyManager.hasValidApiKey();
  });

  ipcMain.handle("is-first-run", async () => {
    return await apiKeyManager.isFirstRun();
  });

  ipcMain.handle("get-current-provider", async () => {
    return await apiKeyManager.getCurrentProvider();
  });

  // Get provider configuration
  ipcMain.handle("get-provider-config", async () => {
    return await apiKeyManager.getProviderConfig();
  });

  // Get available models for a provider
  ipcMain.handle("get-available-models", async (_event, provider: string) => {
    return UniversalAI.getAvailableModels(provider);
  });

  // Get API usage statistics
  ipcMain.handle("get-api-usage", async () => {
    const today = new Date().toDateString();

    // Reset daily count if it's a new day
    if (today !== lastResetDate) {
      dailyApiCallCount = 0;
      lastResetDate = today;
    }

    const timeSinceLastCall = Date.now() - lastApiCall;
    const canMakeCall = canMakeApiCall();
    const nextCallAvailable = canMakeCall
      ? 0
      : Math.ceil((MIN_API_INTERVAL - timeSinceLastCall) / 1000);

    return {
      dailyUsed: dailyApiCallCount,
      dailyLimit: MAX_DAILY_CALLS,
      totalCalls: apiCallCount,
      canMakeCall: true, // Always true now
      nextCallAvailable: 0, // Always 0 now
      cacheSize: replyCache.size,
      rateLimitMessage: "No rate limits - full API access enabled",
    };
  });

  // Health checks
  ipcMain.handle("check-network-online", async () => {
    try {
      // Determine connectivity without contacting external hosts
      const interfaces = os.networkInterfaces();
      const hasExternalInterface = Object.values(interfaces).some((list) =>
        (list || []).some(
          (iface: any) =>
            !iface.internal && !!iface.address && iface.family === "IPv4"
        )
      );
      return { online: hasExternalInterface };
    } catch {
      return { online: false };
    }
  });

  ipcMain.handle("check-provider-health", async () => {
    try {
      const providerConfig = await apiKeyManager.getProviderConfig();
      // Do a lightweight HEAD to provider endpoint if available, else assume online
      if (providerConfig.endpoint) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);
        const res = await fetch(providerConfig.endpoint, {
          method: "HEAD" as any,
          signal: controller.signal,
        });
        clearTimeout(timeout);
        return { ok: res.ok, endpoint: providerConfig.endpoint };
      }
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e?.message };
    }
  });

  // Smart Reply Generation for Dating Apps with retry logic and rate limiting
  ipcMain.handle(
    "generate-smart-replies",
    async (
      _event: IpcMainInvokeEvent,
      data: {
        message: string;
        context?: string;
        platform?: string;
        tone?: "casual" | "fun" | "romantic" | "witty";
      }
    ) => {
      const tone = data.tone || "casual";
      const requestKey = `${data.message}_${tone}`;

      // Check if this exact request is already being processed
      if (activeRequests.has(requestKey)) {
        console.log("✅ Returning active request for same message");
        return await activeRequests.get(requestKey);
      }

      // Check cache first
      const cachedResponse = getCachedResponse(data.message, tone);
      if (cachedResponse) {
        console.log("✅ Returning cached response");
        return { ...cachedResponse, cached: true };
      }

      // Create the request promise
      const requestPromise = (async () => {
        try {
          // No rate limit checking - always proceed with API calls
          console.log("✅ Proceeding with API call (rate limiting disabled)");

          const maxRetries = 2; // Increased retries since we're not worried about quota
          const retryDelay = 1000; // Reduced delay

          for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
              const apiKey = await apiKeyManager.getApiKey();
              if (!apiKey) {
                throw new Error("No API key configured");
              }

              recordApiCall(); // Record the API call

              const providerConfig = await apiKeyManager.getProviderConfig();
              const aiClient = new UniversalAI({
                provider: providerConfig.provider,
                apiKey: apiKey,
                model: providerConfig.model,
                endpoint: providerConfig.endpoint,
              });

              const platform = data.platform || "dating app";
              const context = data.context || "early conversation";

              const prompt = `You are a dating conversation expert. Given this message from a ${platform}:

"${data.message}"

Context: ${context}
Desired tone: ${tone}

Generate 3 smart, authentic reply suggestions that:
1. Are engaging and likely to continue the conversation
2. Match the ${tone} tone
3. Avoid being cheesy or generic
4. Show genuine interest
5. Are appropriate for the dating context

Format as JSON:
{
  "replies": [
    {"text": "reply 1", "reason": "why this works"},
    {"text": "reply 2", "reason": "why this works"}, 
    {"text": "reply 3", "reason": "why this works"}
  ],
  "sentiment": "positive/neutral/negative",
  "tips": ["conversation tip 1", "conversation tip 2"]
}`;

              const result = await aiClient.generateContent(prompt);
              const text = result.text;

              // Clean and parse JSON response
              const cleanedText = text
                .replace(/```json\n?/g, "")
                .replace(/```\n?/g, "")
                .replace(/^[^{]*/, "")
                .replace(/[^}]*$/, "")
                .trim();

              try {
                const analysis = JSON.parse(cleanedText);
                const finalResponse = {
                  success: true,
                  replies: analysis.replies || [],
                  sentiment: analysis.sentiment || "neutral",
                  tips: analysis.tips || [],
                  apiCallsRemaining: "unlimited",
                };

                // Cache the successful response
                setCachedResponse(data.message, tone, finalResponse);

                return finalResponse;
              } catch (parseError) {
                console.error("JSON parsing failed:", parseError);
                // Fallback responses
                const fallbackResponse = {
                  success: true,
                  replies: [
                    {
                      text: "That sounds interesting! Tell me more about that.",
                      reason: "Shows interest and encourages elaboration",
                    },
                    {
                      text: "I love that! What got you into that?",
                      reason: "Enthusiastic and asks engaging follow-up",
                    },
                    {
                      text: "Haha, that's awesome! I can relate to that.",
                      reason: "Light, positive, and builds connection",
                    },
                  ],
                  sentiment: "positive",
                  tips: [
                    "Ask open-ended questions",
                    "Show genuine interest",
                    "Share something about yourself too",
                  ],
                  apiCallsRemaining: "unlimited",
                };

                setCachedResponse(data.message, tone, fallbackResponse);
                return fallbackResponse;
              }
            } catch (error) {
              console.error(
                `Smart reply generation attempt ${attempt + 1} failed:`,
                error
              );

              // Check if it's a quota exceeded error
              const isQuotaExceeded =
                error instanceof Error &&
                (error.message.includes("quota") ||
                  error.message.includes("rate limit") ||
                  error.message.includes("429"));

              if (isQuotaExceeded) {
                console.log("❌ API quota exceeded, using fallback");
                const quotaExceededResponse = {
                  success: true,
                  replies: [
                    {
                      text: "That sounds really interesting! I'd love to hear more about that.",
                      reason: "Shows genuine curiosity",
                    },
                    {
                      text: `I've always wanted to try that! What's it like?`,
                      reason: "Engaging and personal",
                    },
                    {
                      text: "That's so cool! You seem like you have great stories.",
                      reason: "Complimentary and encouraging",
                    },
                  ],
                  sentiment: "positive",
                  tips: [
                    "Keep the conversation flowing",
                    "Ask follow-up questions",
                    "Share your own experiences",
                  ],
                  quotaExceeded: true,
                  note: "API quota exceeded by provider. Using smart offline suggestions.",
                  apiCallsRemaining: "unlimited",
                };

                setCachedResponse(data.message, tone, quotaExceededResponse);
                return quotaExceededResponse;
              }

              // Check if it's a 503 Service Unavailable error
              const isOverloaded =
                error instanceof Error &&
                (error.message.includes("503") ||
                  error.message.includes("overloaded") ||
                  error.message.includes("Service Unavailable"));

              if (isOverloaded && attempt < maxRetries) {
                console.log(`API overloaded, retrying in ${retryDelay}ms...`);
                await new Promise((resolve) => setTimeout(resolve, retryDelay));
                continue;
              }

              // Final fallback for all error types
              const errorFallbackResponse = {
                success: true,
                replies: [
                  {
                    text: "That sounds really interesting! I'd love to hear more about that.",
                    reason: "Shows genuine curiosity",
                  },
                  {
                    text: `I've always wanted to try that! What's it like?`,
                    reason: "Engaging and personal",
                  },
                  {
                    text: "That's so cool! You seem like you have great stories.",
                    reason: "Complimentary and encouraging",
                  },
                ],
                sentiment: "positive",
                tips: [
                  "Keep the conversation flowing",
                  "Ask follow-up questions",
                  "Share your own experiences",
                ],
                fallback: true,
                note: isOverloaded
                  ? "AI service temporarily busy - using smart fallback responses"
                  : "Using offline suggestions",
                apiCallsRemaining: "unlimited",
              };

              setCachedResponse(data.message, tone, errorFallbackResponse);
              return errorFallbackResponse;
            }
          }
        } finally {
          // Remove from active requests when done
          activeRequests.delete(requestKey);
        }
      })();

      // Store the promise to prevent duplicate requests
      activeRequests.set(requestKey, requestPromise);

      return await requestPromise;
    }
  );

  // Enhanced conversation analysis with AI intelligence
  ipcMain.handle(
    "process-chat",
    async (
      _event: IpcMainInvokeEvent,
      chatData: {
        conversationId: string;
        platform: string;
        contact: string;
        newMessage: string;
        sender: "user" | "contact";
        allMessages?: Array<{
          text: string;
          timestamp: number;
          sender: "user" | "contact";
        }>;
      }
    ) => {
      try {
        if (!conversationAnalyzer) return ["No analysis available"];

        // Get or create conversation
        let conversation = await databaseManager.getConversation(
          chatData.conversationId
        );

        if (!conversation) {
          conversation = {
            id: chatData.conversationId,
            platform: chatData.platform,
            contact: chatData.contact,
            messages: chatData.allMessages || [],
            relationship_stage: "initial",
            first_interaction: Date.now(),
            last_interaction: Date.now(),
            trust_score: 0.5,
            conversation_health: 0.5,
            advice_history: [],
          };
        }

        // Add new message
        conversation.messages.push({
          text: chatData.newMessage,
          timestamp: Date.now(),
          sender: chatData.sender,
        });

        conversation.last_interaction = Date.now();

        // Analyze the message
        const messageAnalysis = await conversationAnalyzer.analyzeMessage(
          chatData.newMessage,
          conversation
        );

        // Update conversation metrics
        const conversationMetrics =
          await conversationAnalyzer.analyzeConversation(conversation);
        conversation.conversation_health =
          (conversationMetrics.emotionalDepth +
            conversationMetrics.reciprocity +
            conversationMetrics.interestLevel) /
          3;

        // Safety analysis
        if (safetyEngine) {
          const safetyAnalysis = await safetyEngine.analyzeSafety(conversation);
          conversation.trust_score = safetyAnalysis.overall_safety_score;

          // Generate safety alerts
          const safetyAlerts = await safetyEngine.generateSafetyAlerts(
            conversation
          );
          for (const alert of safetyAlerts) {
            await databaseManager.saveDatingInsight({
              id: alert.id,
              conversation_id: conversation.id,
              type: "warning",
              message: alert.description,
              confidence: alert.confidence,
              timestamp: alert.timestamp,
              acted_upon: false,
            });
          }
        }

        // Get user profile for personalized advice
        let userProfile = await databaseManager.getUserProfile();
        if (!userProfile) {
          userProfile = {
            id: "default",
            preferences: {
              age_range: [22, 35],
              interests: ["travel", "food", "music"],
              deal_breakers: ["smoking"],
              personality_type: "outgoing",
              communication_style: "casual",
            },
            dating_goals: ["meaningful relationship"],
            conversation_patterns: {
              response_time_preference: 2,
              message_length_preference: "medium",
              humor_style: ["witty", "playful"],
              topics_to_avoid: [],
            },
            success_metrics: {
              conversations_started: 0,
              dates_secured: 0,
              positive_responses: 0,
              conversation_length_avg: 0,
            },
            learning_data: {
              successful_openers: [],
              effective_responses: [],
              topics_that_work: [],
              timing_patterns: [],
            },
          };
          await databaseManager.saveUserProfile(userProfile);
        }

        // Generate personalized dating advice
        const baseAdvice = await conversationAnalyzer.generateDatingAdvice(
          conversation,
          userProfile,
          messageAnalysis
        );
        const personalizedAdvice = learningEngine
          ? await learningEngine.generatePersonalizedAdvice(
              conversation,
              userProfile,
              baseAdvice
            )
          : baseAdvice;

        // Detect conversation patterns and insights
        const patternInsights =
          await conversationAnalyzer.detectConversationPatterns(conversation);
        for (const insight of patternInsights) {
          await databaseManager.saveDatingInsight(insight);
        }

        // Learning engine analysis
        if (learningEngine) {
          const learningInsights =
            await learningEngine.analyzeConversationSuccess(
              conversation,
              conversationMetrics
            );
          for (const insight of learningInsights) {
            await databaseManager.saveDatingInsight(insight);
          }
        }

        // Save updated conversation
        await databaseManager.saveConversation(conversation);

        // Return comprehensive analysis
        return {
          analysis: messageAnalysis,
          advice: personalizedAdvice,
          insights: [
            ...patternInsights,
            ...(learningEngine
              ? await learningEngine.analyzeConversationSuccess(
                  conversation,
                  conversationMetrics
                )
              : []),
          ],
          safety: {
            trust_score: conversation.trust_score,
            conversation_health: conversation.conversation_health,
            alerts: safetyEngine
              ? await safetyEngine.generateSafetyAlerts(conversation)
              : [],
          },
          metrics: conversationMetrics,
        };
      } catch (error) {
        console.error("Error processing chat:", error);
        return {
          analysis: {
            sentiment: 0.5,
            keywords: [],
            tone: "neutral",
            engagement: 0.5,
            redFlags: [],
            greenFlags: [],
            suggestions: [],
            nextSteps: [],
          },
          advice: [
            {
              type: "response",
              message: "Keep the conversation flowing naturally",
              explanation: "Basic advice",
              confidence: 0.7,
              timing: "immediate",
              context: "fallback",
            },
          ],
          insights: [],
          safety: { trust_score: 0.5, conversation_health: 0.5, alerts: [] },
        };
      }
    }
  );

  // Advanced Dating Intelligence Handlers

  // Get conversation insights and patterns
  ipcMain.handle(
    "get-conversation-insights",
    async (_event: IpcMainInvokeEvent, conversationId: string) => {
      try {
        const insights = await databaseManager.getInsightsForConversation(
          conversationId
        );
        const conversation = await databaseManager.getConversation(
          conversationId
        );

        if (!conversation) return { insights: [], recommendations: [] };

        // Generate real-time recommendations
        let recommendations: string[] = [];
        if (conversationAnalyzer) {
          const metrics = await conversationAnalyzer.analyzeConversation(
            conversation
          );

          if (metrics.reciprocity < 0.4) {
            recommendations.push(
              "They might be losing interest - try asking an engaging question"
            );
          }
          if (metrics.questionAsking < 0.3) {
            recommendations.push(
              "Ask more questions to show interest and keep the conversation flowing"
            );
          }
          if (metrics.emotionalDepth < 0.5) {
            recommendations.push(
              "Share something personal to deepen the connection"
            );
          }
          if (metrics.responseTime < 0.6) {
            recommendations.push(
              "Their response time is good - they seem engaged"
            );
          }
        }

        return {
          insights: insights.map((insight) => ({
            type: insight.type,
            message: insight.message,
            confidence: insight.confidence,
            timestamp: insight.timestamp,
          })),
          recommendations,
        };
      } catch (error) {
        console.error("Error getting conversation insights:", error);
        return { insights: [], recommendations: [] };
      }
    }
  );

  // Learn from user feedback on advice
  ipcMain.handle(
    "provide-advice-feedback",
    async (
      _event: IpcMainInvokeEvent,
      data: {
        conversationId: string;
        adviceUsed: string;
        outcome: "positive" | "negative" | "neutral";
        context: string;
      }
    ) => {
      try {
        if (!learningEngine) return;

        const conversation = await databaseManager.getConversation(
          data.conversationId
        );
        const userProfile = await databaseManager.getUserProfile();

        if (conversation && userProfile) {
          await learningEngine.learnFromOutcome(
            conversation,
            {
              type: "response",
              message: data.adviceUsed,
              explanation: "User provided feedback",
              confidence: 0.8,
              timing: "immediate",
              context: data.context,
            },
            data.outcome,
            userProfile
          );

          // Update success metrics
          if (data.outcome === "positive") {
            await learningEngine.updateSuccessMetrics(
              userProfile,
              "positive_response"
            );
          }
        }
      } catch (error) {
        console.error("Error processing advice feedback:", error);
      }
    }
  );

  // Get personalized dating dashboard
  ipcMain.handle("get-dating-dashboard", async (_event: IpcMainInvokeEvent) => {
    try {
      const conversations = await databaseManager.getAllConversations();
      const userProfile = await databaseManager.getUserProfile();

      if (!userProfile) return { conversations: [], stats: {}, insights: [] };

      // Calculate comprehensive stats
      const stats = {
        total_conversations: conversations.length,
        active_conversations: conversations.filter(
          (c) => Date.now() - c.last_interaction < 7 * 24 * 60 * 60 * 1000
        ).length,
        avg_trust_score:
          conversations.length > 0
            ? conversations.reduce((sum, c) => sum + c.trust_score, 0) /
              conversations.length
            : 0,
        avg_conversation_health:
          conversations.length > 0
            ? conversations.reduce((sum, c) => sum + c.conversation_health, 0) /
              conversations.length
            : 0,
        dates_secured: userProfile.success_metrics.dates_secured,
        positive_responses: userProfile.success_metrics.positive_responses,
        success_rate:
          userProfile.success_metrics.conversations_started > 0
            ? userProfile.success_metrics.positive_responses /
              userProfile.success_metrics.conversations_started
            : 0,
      };

      // Get safety metrics
      let safetyMetrics = {};
      if (safetyEngine) {
        safetyMetrics = await safetyEngine.trackSafetyMetrics("default");
      }

      // Recent insights across all conversations
      const allInsights: DatingInsight[] = [];
      for (const conversation of conversations.slice(0, 10)) {
        const insights = await databaseManager.getInsightsForConversation(
          conversation.id
        );
        allInsights.push(...insights);
      }

      const recentInsights = allInsights
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 10);

      return {
        conversations: conversations.map((c) => ({
          id: c.id,
          contact: c.contact,
          platform: c.platform,
          trust_score: c.trust_score,
          conversation_health: c.conversation_health,
          relationship_stage: c.relationship_stage,
          last_interaction: c.last_interaction,
          message_count: c.messages.length,
        })),
        stats: { ...stats, ...safetyMetrics },
        insights: recentInsights,
      };
    } catch (error) {
      console.error("Error getting dating dashboard:", error);
      return { conversations: [], stats: {}, insights: [] };
    }
  });

  // Update user preferences for better personalization
  ipcMain.handle(
    "update-user-preferences",
    async (_event: IpcMainInvokeEvent, preferences: any) => {
      try {
        let userProfile = await databaseManager.getUserProfile();

        if (!userProfile) {
          userProfile = {
            id: "default",
            preferences: preferences,
            dating_goals: [],
            conversation_patterns: {
              response_time_preference: 2,
              message_length_preference: "medium",
              humor_style: [],
              topics_to_avoid: [],
            },
            success_metrics: {
              conversations_started: 0,
              dates_secured: 0,
              positive_responses: 0,
              conversation_length_avg: 0,
            },
            learning_data: {
              successful_openers: [],
              effective_responses: [],
              topics_that_work: [],
              timing_patterns: [],
            },
          };
        } else {
          userProfile.preferences = {
            ...userProfile.preferences,
            ...preferences,
          };
        }

        await databaseManager.saveUserProfile(userProfile);
        return { success: true };
      } catch (error) {
        console.error("Error updating user preferences:", error);
        return { success: false, error: error.message };
      }
    }
  );

  // Safety check for specific message/profile
  ipcMain.handle(
    "safety-check",
    async (
      _event: IpcMainInvokeEvent,
      data: {
        type: "message" | "profile";
        content: string;
        conversationId?: string;
      }
    ) => {
      try {
        if (!safetyEngine) return { safe: true, alerts: [] };

        if (data.type === "message" && data.conversationId) {
          const conversation = await databaseManager.getConversation(
            data.conversationId
          );
          if (conversation) {
            // Add the message temporarily for analysis
            const tempConversation = {
              ...conversation,
              messages: [
                ...conversation.messages,
                {
                  text: data.content,
                  timestamp: Date.now(),
                  sender: "contact" as const,
                },
              ],
            };

            const safetyAnalysis = await safetyEngine.analyzeSafety(
              tempConversation
            );
            const alerts = await safetyEngine.generateSafetyAlerts(
              tempConversation
            );

            return {
              safe: safetyAnalysis.overall_safety_score > 0.6,
              safety_score: safetyAnalysis.overall_safety_score,
              alerts: alerts.map((alert) => ({
                severity: alert.severity,
                type: alert.type,
                description: alert.description,
                recommended_action: alert.recommended_action,
              })),
            };
          }
        }

        // Profile safety check would be implemented here
        return { safe: true, safety_score: 0.8, alerts: [] };
      } catch (error) {
        console.error("Error in safety check:", error);
        return { safe: true, safety_score: 0.5, alerts: [] };
      }
    }
  );

  ipcMain.handle(
    "fetch-activities",
    async (_event: IpcMainInvokeEvent, interests: string[]) => {
      try {
        // Initialize Gemini AI
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `Based on these interests: ${interests.join(
          ", "
        )}, suggest 5 specific date activities that would be perfect for someone with these interests. Format each suggestion as a short, actionable activity description. Be creative but practical:

Return format:
- Activity 1 description
- Activity 2 description
- Activity 3 description
- Activity 4 description
- Activity 5 description`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Parse the activities from the response
        const activities = text
          .split("\n")
          .filter(
            (line) => line.trim().startsWith("-") || line.trim().startsWith("•")
          )
          .map((line) => line.replace(/^[-•]\s*/, "").trim())
          .filter((activity) => activity.length > 0)
          .slice(0, 5);

        return activities.length > 0
          ? activities
          : [
              `Visit a local art gallery or museum (${
                interests[0] || "culture"
              })`,
              `☕ Try a specialty coffee shop with unique atmosphere`,
              `🌳 Take a scenic walk or hike in a nearby park`,
              `Explore a restaurant serving cuisine you both haven't tried`,
              `🎵 Check out live music at a local venue`,
            ];
      } catch (error) {
        console.error("Error fetching activities with Gemini:", error);
        // Fallback activities based on interests
        return [
          `Visit local art gallery (${interests[0] || "art"})`,
          `☕ Coffee tasting at specialty cafe`,
          `🌳 Nature walk in nearby park`,
          `Try a new restaurant together`,
          `🎵 Attend a live music event`,
        ];
      }
    }
  );

  // Trust verification handler
  // Enhanced trust analysis with real AI and desktop features
  ipcMain.handle(
    "analyze-trust",
    async (
      _event: IpcMainInvokeEvent,
      profileData: { url?: string; imageFile?: string }
    ) => {
      console.log("TRUST ANALYSIS STARTED:", profileData);

      try {
        // Initialize Gemini AI
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        let prompt = "";
        let analysisData: any = {};

        if (profileData.url) {
          // Fetch webpage content for real analysis
          try {
            const response = await fetch(profileData.url);
            const htmlContent = await response.text();

            // Extract meaningful content from HTML
            const textContent = htmlContent
              .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
              .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
              .replace(/<[^>]+>/g, " ")
              .replace(/\s+/g, " ")
              .trim()
              .substring(0, 2000); // Limit content size

            prompt = `Analyze this dating profile webpage content for authenticity and potential red flags:

URL: ${profileData.url}
Content: ${textContent}

Consider these factors:
- Profile completeness and detail quality
- Language patterns indicating genuineness vs. fake profiles
- Photo authenticity indicators from descriptions
- Contact information patterns
- Bio authenticity and personality depth
- Common scam patterns and red flags
- Social media presence indicators

Provide a detailed trust analysis in this exact JSON format:
{
  "trustScore": <number 1-100>,
  "verificationStatus": "<verified|suspicious|unknown>",
  "imageMatches": ["<detailed analysis of photos mentioned>"],
  "socialProfiles": ["<specific social media findings>"],
  "redFlags": ["<specific concerning patterns found>"],
  "positiveSignals": ["<specific authentic indicators found>"]
}`;
          } catch (fetchError) {
            console.log(
              "Could not fetch URL content, analyzing URL structure instead"
            );
            prompt = `Analyze this dating profile URL structure and domain for potential red flags: ${profileData.url}

Analyze:
- Domain legitimacy and reputation
- URL structure patterns
- Platform authenticity
- Known scam domains
- Geographic indicators

Return analysis in JSON format with trustScore, verificationStatus, imageMatches, socialProfiles, redFlags, and positiveSignals.`;
          }
        } else if (profileData.imageFile) {
          prompt = `Analyze an uploaded profile image for authenticity indicators. Since this is image analysis, provide guidance on verification steps.

Return JSON with:
{
  "trustScore": <75-90 for uploaded images>,
  "verificationStatus": "pending_verification",
  "imageMatches": ["Reverse image search recommended", "Check for metadata analysis"],
  "socialProfiles": ["Cross-reference with social platforms"],
  "redFlags": ["Verify image originality"],
  "positiveSignals": ["User provided image for verification", "Engagement in verification process"]
}`;
        }

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up JSON response
        const cleanedText = text
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .replace(/^[^{]*/, "")
          .replace(/[^}]*$/, "")
          .trim();

        try {
          const analysis = JSON.parse(cleanedText);

          // Validate and enhance the response
          const validatedAnalysis = {
            trustScore: Math.max(1, Math.min(100, analysis.trustScore || 50)),
            verificationStatus: [
              "verified",
              "suspicious",
              "unknown",
              "pending_verification",
            ].includes(analysis.verificationStatus)
              ? analysis.verificationStatus
              : "unknown",
            imageMatches: Array.isArray(analysis.imageMatches)
              ? analysis.imageMatches
              : ["Analysis pending"],
            socialProfiles: Array.isArray(analysis.socialProfiles)
              ? analysis.socialProfiles
              : ["Connect for verification"],
            redFlags: Array.isArray(analysis.redFlags) ? analysis.redFlags : [],
            positiveSignals: Array.isArray(analysis.positiveSignals)
              ? analysis.positiveSignals
              : ["Analysis completed"],
          };

          // Send desktop notification about analysis completion
          notifier.notify({
            title: "Trust Analysis Complete",
            message: `Trust Score: ${validatedAnalysis.trustScore}/100 - ${validatedAnalysis.verificationStatus}`,
            sound: true,
            wait: false,
          });

          return validatedAnalysis;
        } catch (parseError) {
          console.error(
            "JSON parsing failed:",
            parseError,
            "Raw text:",
            cleanedText
          );
          throw new Error("Failed to parse AI response");
        }
      } catch (error) {
        console.error("TRUST ANALYSIS ERROR:", error);
        console.error("Error details:", error.message);

        // Enhanced fallback with desktop notification
        notifier.notify({
          title: "Analysis Error",
          message: "Trust analysis failed - using fallback analysis",
          sound: true,
          wait: false,
        });

        return {
          trustScore: 50,
          verificationStatus: "unknown",
          imageMatches: ["Analysis temporarily unavailable"],
          socialProfiles: ["Connect accounts for verification"],
          redFlags: ["Unable to complete full analysis"],
          positiveSignals: ["Manual verification recommended"],
        };
      }
    }
  );
}

// Desktop-specific features that web apps cannot provide
const initializeDesktopFeatures = () => {
  // Set app transparency/opacity handler
  ipcMain.handle("set-app-opacity", async (_event, opacity: number) => {
    try {
      appOpacity = opacity;

      // Update window opacity
      if (mainWindow) {
        mainWindow.setOpacity(opacity);
      }

      // Save to disk
      await saveOpacitySetting(opacity);

      return { success: true, opacity };
    } catch (error) {
      console.error("Error setting app opacity:", error);
      return { success: false, error: error.message };
    }
  });

  // Get current app transparency/opacity
  ipcMain.handle("get-app-opacity", async () => {
    return { opacity: appOpacity };
  });

  // Auto-capture screenshots for profile verification
  ipcMain.handle("capture-screen", async () => {
    try {
      const sources = await desktopCapturer.getSources({ types: ["screen"] });
      if (sources.length > 0) {
        const capturedImage = await screenshot.all();
        notifier.notify({
          title: "Screenshot Captured",
          message: "Screen captured for profile verification",
          sound: true,
        });
        return { success: true, data: capturedImage };
      }
    } catch (error) {
      console.error("Screenshot capture failed:", error);
      return { success: false, error: error.message };
    }
  });

  // Get clipboard content
  ipcMain.handle("get-clipboard", async () => {
    try {
      return clipboard.readText();
    } catch (error) {
      console.error("Error reading clipboard:", error);
      return "";
    }
  });

  // Monitor clipboard for dating messages (less aggressive to save API quota)
  let lastClipboard = "";
  let clipboardCheckCount = 0;

  const clipboardMonitor = setInterval(async () => {
    try {
      const currentClipboard = clipboard.readText();
      clipboardCheckCount++;

      // Debug logging every 60 checks (every 5 minutes)
      if (clipboardCheckCount % 60 === 0) {
        console.log(
          `Clipboard monitor active - Check #${clipboardCheckCount}, API calls today: ${dailyApiCallCount}/${MAX_DAILY_CALLS}`
        );
      }

      if (currentClipboard !== lastClipboard && currentClipboard.length > 0) {
        console.log(
          "Clipboard changed:",
          currentClipboard.substring(0, 100) + "..."
        );
        lastClipboard = currentClipboard;

        // Accept any non-empty text for auto detection
        const isValidMessage =
          currentClipboard.trim().length > 0 && currentClipboard.length < 5000;

        console.log("Message evaluation:", {
          length: currentClipboard.length,
          wordCount: currentClipboard.split(" ").length,
          hasFile: currentClipboard.includes("file://"),
          hasLocalhost: currentClipboard.includes("localhost"),
          isJustNumbers: /^[\d\s\-\+\(\)]+$/.test(currentClipboard),
          isEmail: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(
            currentClipboard
          ),
          hasPassword: currentClipboard.toLowerCase().includes("password"),
          isValidMessage,
          canMakeApiCall: canMakeApiCall(),
        });

        if (isValidMessage && mainWindow) {
          console.log("✅ Message detected - sending to renderer");
          const apiUsage = {
            dailyUsed: dailyApiCallCount,
            dailyLimit: MAX_DAILY_CALLS,
            canMakeCall: canMakeApiCall(),
          };
          mainWindow.webContents.send("message-detected", {
            message: currentClipboard,
            timestamp: Date.now(),
            manual: false,
            apiUsage,
          });
        }
      }
    } catch (error) {
      console.error("Clipboard monitor error:", error);
    }
  }, 5000); // Check every 5 seconds instead of 500ms

  // Watch for downloaded images that might be profile pictures
  const downloadsPath = path.join(os.homedir(), "Downloads");
  const imageWatcher = chokidar.watch(downloadsPath, {
    ignored: [/node_modules/, /\.git/, /\.(txt|log|json|md)$/],
    persistent: true,
    ignoreInitial: true,
    depth: 1, // Only watch direct files in Downloads, not subdirectories
    usePolling: false,
  });

  imageWatcher.on("add", async (filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    if ([".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext)) {
      const fileName = path.basename(filePath);

      // Check if it might be a profile picture
      const profileKeywords = [
        "profile",
        "avatar",
        "photo",
        "pic",
        "image",
        "selfie",
      ];
      const mightBeProfile = profileKeywords.some((keyword) =>
        fileName.toLowerCase().includes(keyword)
      );

      if (mightBeProfile) {
        notifier.notify({
          title: "Profile Image Detected",
          message: `New image detected: ${fileName}. Analyze for verification?`,
          sound: true,
          actions: ["Analyze Image", "Ignore"],
          closeLabel: "Close",
        });

        if (mainWindow) {
          mainWindow.webContents.send("image-detected", filePath);
        }
      }
    }
  });

  // System integration for auto-launch
  ipcMain.handle("toggle-auto-launch", async (_event, enabled: boolean) => {
    try {
      const AutoLaunch = require("auto-launch");
      const autoLauncher = new AutoLaunch({
        name: "Trust Dating Overlay",
        path: process.execPath,
        isHidden: true,
      });

      if (enabled) {
        await autoLauncher.enable();
        notifier.notify({
          title: "Auto-Launch Enabled",
          message: "Trust Dating Overlay will start with your system",
          sound: true,
        });
      } else {
        await autoLauncher.disable();
        notifier.notify({
          title: "Auto-Launch Disabled",
          message: "Trust Dating Overlay will not start automatically",
          sound: true,
        });
      }

      return { success: true, enabled };
    } catch (error) {
      console.error("Auto-launch toggle failed:", error);
      return { success: false, error: error.message };
    }
  });

  // Desktop-native file operations
  ipcMain.handle("save-verification-report", async (_event, reportData) => {
    try {
      const result = await dialog.showSaveDialog(mainWindow!, {
        title: "Save Verification Report",
        defaultPath: `trust-report-${Date.now()}.json`,
        filters: [
          { name: "JSON Reports", extensions: ["json"] },
          { name: "All Files", extensions: ["*"] },
        ],
      });

      if (!result.canceled && result.filePath) {
        await fs.writeFile(
          result.filePath,
          JSON.stringify(reportData, null, 2)
        );

        notifier.notify({
          title: "Report Saved",
          message: `Verification report saved to ${path.basename(
            result.filePath
          )}`,
          sound: true,
        });

        return { success: true, filePath: result.filePath };
      }

      return { success: false, cancelled: true };
    } catch (error) {
      console.error("Save report failed:", error);
      return { success: false, error: error.message };
    }
  });

  // API Key management for settings
  ipcMain.handle(
    "write-file",
    async (_event, filename: string, content: string) => {
      try {
        const filePath = path.resolve(filename);
        await fs.writeFile(filePath, content, "utf-8");
        return { success: true };
      } catch (error) {
        console.error("Write file failed:", error);
        return { success: false, error: error.message };
      }
    }
  );

  ipcMain.handle("get-current-api-key", async () => {
    try {
      const envPath = path.resolve(".env");
      const envContent = await fs.readFile(envPath, "utf-8");
      const match = envContent.match(/GEMINI_API_KEY\s*=\s*(.+)/);
      return match ? match[1].trim() : null;
    } catch (error) {
      console.error("Get API key failed:", error);
      return null;
    }
  });

  // Native system tray integration
  const createTray = () => {
    // Create a tray icon using app icons
    let trayImage: Electron.NativeImage = nativeImage.createEmpty();
    try {
      const trayIconPath = app.isPackaged
        ? path.join(
            process.resourcesPath,
            "assets",
            "icons",
            process.platform === "win32"
              ? "trustdating-icon.ico"
              : "trustdating.icns"
          )
        : path.resolve(
            __dirname,
            "assets",
            "icons",
            process.platform === "win32"
              ? "trustdating-icon.ico"
              : "trustdating.icns"
          );
      const img = nativeImage.createFromPath(trayIconPath);
      if (!img.isEmpty()) {
        trayImage =
          process.platform === "darwin"
            ? img.resize({ width: 16, height: 16 })
            : img;
      }
    } catch {}
    const tray = new Tray(trayImage);
    tray.setToolTip("Trust Dating Overlay");

    const contextMenu = Menu.buildFromTemplate([
      {
        label: "Show Overlay",
        click: () => {
          if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
          }
        },
      },
      {
        label: "Capture Screen",
        click: async () => {
          try {
            await screenshot.all();
            notifier.notify({
              title: "Screenshot Captured",
              message: "Screenshot saved for verification",
              sound: true,
            });
          } catch (error) {
            notifier.notify({
              title: "Capture Failed",
              message: "Could not capture screenshot",
              sound: true,
            });
          }
        },
      },
      { type: "separator" },
      {
        label: "Settings",
        click: () => {
          if (mainWindow) {
            mainWindow.show();
            mainWindow.webContents.send("show-settings");
          }
        },
      },
      {
        label: "Quit",
        click: () => {
          app.quit();
        },
      },
    ]);

    tray.setContextMenu(contextMenu);
    return tray;
  };

  // Initialize system tray
  const systemTray = createTray();

  // Clean up on app quit
  app.on("before-quit", () => {
    clearInterval(clipboardMonitor);
    imageWatcher.close();
    if (systemTray) systemTray.destroy();
  });
};

// Load app settings
async function loadAppSettings() {
  try {
    const userDataPath = app.getPath("userData");
    const settingsPath = path.join(userDataPath, "settings.json");

    try {
      const settingsData = await fs.readFile(settingsPath, "utf-8");
      const settings = JSON.parse(settingsData);

      if (typeof settings.opacity === "number") {
        appOpacity = Math.max(0.2, Math.min(1.0, settings.opacity));
        console.log("Loaded opacity setting:", appOpacity);
      }
    } catch (fileError) {
      // Settings file doesn't exist yet, will use defaults
      console.log("Using default opacity setting:", appOpacity);
    }
  } catch (error) {
    console.error("Error loading settings:", error);
  }
}

// Initialize verification system when app starts
app.whenReady().then(async () => {
  await loadAppSettings(); // Load settings first
  // Set Dock icon explicitly in development for macOS
  try {
    if (process.platform === "darwin") {
      const dockIconPath = app.isPackaged
        ? path.join(
            process.resourcesPath,
            "assets",
            "icons",
            "trustdating.icns"
          )
        : path.resolve(process.cwd(), "assets", "icons", "trustdating.icns");
      const dockImg = nativeImage.createFromPath(dockIconPath);
      if (!dockImg.isEmpty() && app.dock) {
        app.dock.setIcon(dockImg);
      }
    }
  } catch (e) {
    console.warn("Dock icon set failed:", e);
  }
  createWindow();
  initializeDesktopFeatures(); // Initialize desktop-specific features
  // Ensure the window is visible on launch in production
  if (mainWindow) {
    mainWindow.on("ready-to-show", () => mainWindow && mainWindow.show());
  }
});

app.on("will-quit", () => globalShortcut.unregisterAll());
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
