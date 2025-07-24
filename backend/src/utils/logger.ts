export class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  info(message: string, meta?: any): void {
    this.log('INFO', message, meta);
  }

  error(message: string, error?: Error, meta?: any): void {
    this.log('ERROR', message, { error: error?.message, stack: error?.stack, ...meta });
  }

  warn(message: string, meta?: any): void {
    this.log('WARN', message, meta);
  }

  debug(message: string, meta?: any): void {
    this.log('DEBUG', message, meta);
  }

  private log(level: LogLevel, message: string, meta?: any): void {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      meta,
      pid: process.pid
    };

    this.logs.push(logEntry);
    
    // Keep only the latest logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output with formatting
    const formattedMessage = `[${logEntry.timestamp}] [${level}] ${message}`;
    
    switch (level) {
      case 'ERROR':
        console.error(formattedMessage, meta || '');
        break;
      case 'WARN':
        console.warn(formattedMessage, meta || '');
        break;
      case 'DEBUG':
        console.debug(formattedMessage, meta || '');
        break;
      default:
        console.log(formattedMessage, meta || '');
    }
  }

  getLogs(level?: LogLevel, limit?: number): LogEntry[] {
    let filteredLogs = this.logs;
    
    if (level) {
      filteredLogs = this.logs.filter(log => log.level === level);
    }
    
    if (limit) {
      filteredLogs = filteredLogs.slice(-limit);
    }
    
    return filteredLogs;
  }

  clearLogs(): void {
    this.logs = [];
  }

  // Performance monitoring
  startTimer(label: string): () => number {
    const start = process.hrtime.bigint();
    return () => {
      const end = process.hrtime.bigint();
      const duration = Number(end - start) / 1000000; // Convert to milliseconds
      this.info(`Timer [${label}]`, { duration_ms: duration });
      return duration;
    };
  }

  // Memory usage logging
  logMemoryUsage(label?: string): void {
    const usage = process.memoryUsage();
    this.info(`Memory usage ${label ? `[${label}]` : ''}`, {
      rss: `${Math.round(usage.rss / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`,
      external: `${Math.round(usage.external / 1024 / 1024)}MB`
    });
  }
}

type LogLevel = 'INFO' | 'ERROR' | 'WARN' | 'DEBUG';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  meta?: any;
  pid: number;
}
