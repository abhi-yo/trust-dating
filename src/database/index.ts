import sqlite3 from 'sqlite3';
import { app } from 'electron';
import path from 'path';

export interface Conversation {
  id: string;
  platform: string;
  contact: string;
  messages: Array<{
    text: string;
    timestamp: number;
    sender: 'user' | 'contact';
    analysis?: {
      sentiment: number;
      keywords: string[];
      tone: string;
      engagement: number;
    };
  }>;
  profile?: {
    name: string;
    age?: number;
    location?: string;
    interests?: string[];
    redFlags?: string[];
    greenFlags?: string[];
    compatibilityScore?: number;
  };
  relationship_stage: 'initial' | 'getting_to_know' | 'interested' | 'dating' | 'serious';
  first_interaction: number;
  last_interaction: number;
  trust_score: number;
  conversation_health: number;
  advice_history: Array<{
    advice: string;
    timestamp: number;
    context: string;
    used: boolean;
  }>;
}

export interface UserProfile {
  id: string;
  preferences: {
    age_range: [number, number];
    interests: string[];
    deal_breakers: string[];
    personality_type: string;
    communication_style: string;
  };
  dating_goals: string[];
  conversation_patterns: {
    response_time_preference: number;
    message_length_preference: 'short' | 'medium' | 'long';
    humor_style: string[];
    topics_to_avoid: string[];
  };
  success_metrics: {
    conversations_started: number;
    dates_secured: number;
    positive_responses: number;
    conversation_length_avg: number;
  };
  learning_data: {
    successful_openers: string[];
    effective_responses: string[];
    topics_that_work: string[];
    timing_patterns: Array<{
      day: string;
      hour: number;
      success_rate: number;
    }>;
  };
}

export interface DatingInsight {
  id: string;
  conversation_id: string;
  type: 'warning' | 'opportunity' | 'advice' | 'pattern';
  message: string;
  confidence: number;
  timestamp: number;
  acted_upon: boolean;
  effectiveness?: number;
}

class DatabaseManager {
  private db: sqlite3.Database | null = null;
  private dbPath: string;

  constructor() {
    this.dbPath = path.join(app.getPath('userData'), 'dating_assistant.db');
    this.initializeDatabase();
  }

  private initializeDatabase(): void {
    this.db = new sqlite3.Database(this.dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        return;
      }
      this.createTables();
    });
  }

  private createTables(): void {
    if (!this.db) return;

    // Create tables first
    const createTableQueries = [
      `CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        platform TEXT NOT NULL,
        contact TEXT NOT NULL,
        messages TEXT NOT NULL,
        profile TEXT,
        relationship_stage TEXT DEFAULT 'initial',
        first_interaction INTEGER NOT NULL,
        last_interaction INTEGER NOT NULL,
        trust_score REAL DEFAULT 0.5,
        conversation_health REAL DEFAULT 0.5,
        advice_history TEXT DEFAULT '[]',
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER DEFAULT (strftime('%s', 'now'))
      )`,
      
      `CREATE TABLE IF NOT EXISTS user_profiles (
        id TEXT PRIMARY KEY,
        preferences TEXT NOT NULL,
        dating_goals TEXT NOT NULL,
        conversation_patterns TEXT NOT NULL,
        success_metrics TEXT NOT NULL,
        learning_data TEXT NOT NULL,
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER DEFAULT (strftime('%s', 'now'))
      )`,
      
      `CREATE TABLE IF NOT EXISTS dating_insights (
        id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL,
        type TEXT NOT NULL,
        message TEXT NOT NULL,
        confidence REAL NOT NULL,
        timestamp INTEGER NOT NULL,
        acted_upon BOOLEAN DEFAULT FALSE,
        effectiveness REAL,
        created_at INTEGER DEFAULT (strftime('%s', 'now'))
      )`
    ];

    // Create indexes after tables
    const createIndexQueries = [
      `CREATE INDEX IF NOT EXISTS idx_conversations_contact ON conversations(contact)`,
      `CREATE INDEX IF NOT EXISTS idx_conversations_platform ON conversations(platform)`,
      `CREATE INDEX IF NOT EXISTS idx_insights_conversation ON dating_insights(conversation_id)`,
      `CREATE INDEX IF NOT EXISTS idx_insights_type ON dating_insights(type)`
    ];

    // Execute table creation first
    createTableQueries.forEach(sql => {
      this.db!.run(sql, (err) => {
        if (err) console.error('Error creating table:', err);
      });
    });

    // Execute index creation after a brief delay to ensure tables exist
    setTimeout(() => {
      createIndexQueries.forEach(sql => {
        this.db!.run(sql, (err) => {
          if (err) console.error('Error creating index:', err);
        });
      });
    }, 100);
  }

  async saveConversation(conversation: Conversation): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const sql = `INSERT OR REPLACE INTO conversations 
        (id, platform, contact, messages, profile, relationship_stage, 
         first_interaction, last_interaction, trust_score, conversation_health, advice_history, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      const params = [
        conversation.id,
        conversation.platform,
        conversation.contact,
        JSON.stringify(conversation.messages),
        JSON.stringify(conversation.profile),
        conversation.relationship_stage,
        conversation.first_interaction,
        conversation.last_interaction,
        conversation.trust_score,
        conversation.conversation_health,
        JSON.stringify(conversation.advice_history),
        Date.now()
      ];

      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async getConversation(id: string): Promise<Conversation | null> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const sql = `SELECT * FROM conversations WHERE id = ?`;
      this.db.get(sql, [id], (err, row: any) => {
        if (err) {
          reject(err);
          return;
        }
        
        if (!row) {
          resolve(null);
          return;
        }

        resolve({
          id: row.id,
          platform: row.platform,
          contact: row.contact,
          messages: JSON.parse(row.messages),
          profile: row.profile ? JSON.parse(row.profile) : undefined,
          relationship_stage: row.relationship_stage,
          first_interaction: row.first_interaction,
          last_interaction: row.last_interaction,
          trust_score: row.trust_score,
          conversation_health: row.conversation_health,
          advice_history: JSON.parse(row.advice_history)
        });
      });
    });
  }

  async getAllConversations(): Promise<Conversation[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const sql = `SELECT * FROM conversations ORDER BY last_interaction DESC`;
      this.db.all(sql, [], (err, rows: any[]) => {
        if (err) {
          reject(err);
          return;
        }

        const conversations = rows.map(row => ({
          id: row.id,
          platform: row.platform,
          contact: row.contact,
          messages: JSON.parse(row.messages),
          profile: row.profile ? JSON.parse(row.profile) : undefined,
          relationship_stage: row.relationship_stage,
          first_interaction: row.first_interaction,
          last_interaction: row.last_interaction,
          trust_score: row.trust_score,
          conversation_health: row.conversation_health,
          advice_history: JSON.parse(row.advice_history)
        }));

        resolve(conversations);
      });
    });
  }

  async saveUserProfile(profile: UserProfile): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const sql = `INSERT OR REPLACE INTO user_profiles 
        (id, preferences, dating_goals, conversation_patterns, success_metrics, learning_data, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)`;

      const params = [
        profile.id,
        JSON.stringify(profile.preferences),
        JSON.stringify(profile.dating_goals),
        JSON.stringify(profile.conversation_patterns),
        JSON.stringify(profile.success_metrics),
        JSON.stringify(profile.learning_data),
        Date.now()
      ];

      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async getUserProfile(id: string = 'default'): Promise<UserProfile | null> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const sql = `SELECT * FROM user_profiles WHERE id = ?`;
      this.db.get(sql, [id], (err, row: any) => {
        if (err) {
          reject(err);
          return;
        }
        
        if (!row) {
          resolve(null);
          return;
        }

        resolve({
          id: row.id,
          preferences: JSON.parse(row.preferences),
          dating_goals: JSON.parse(row.dating_goals),
          conversation_patterns: JSON.parse(row.conversation_patterns),
          success_metrics: JSON.parse(row.success_metrics),
          learning_data: JSON.parse(row.learning_data)
        });
      });
    });
  }

  async saveDatingInsight(insight: DatingInsight): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const sql = `INSERT INTO dating_insights 
        (id, conversation_id, type, message, confidence, timestamp, acted_upon, effectiveness)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

      const params = [
        insight.id,
        insight.conversation_id,
        insight.type,
        insight.message,
        insight.confidence,
        insight.timestamp,
        insight.acted_upon,
        insight.effectiveness
      ];

      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async getInsightsForConversation(conversationId: string): Promise<DatingInsight[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const sql = `SELECT * FROM dating_insights WHERE conversation_id = ? ORDER BY timestamp DESC`;
      this.db.all(sql, [conversationId], (err, rows: any[]) => {
        if (err) {
          reject(err);
          return;
        }

        const insights = rows.map(row => ({
          id: row.id,
          conversation_id: row.conversation_id,
          type: row.type,
          message: row.message,
          confidence: row.confidence,
          timestamp: row.timestamp,
          acted_upon: row.acted_upon,
          effectiveness: row.effectiveness
        }));

        resolve(insights);
      });
    });
  }

  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

export const databaseManager = new DatabaseManager();
