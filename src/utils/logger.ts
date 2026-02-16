const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 } as const;

type LogLevel = keyof typeof LOG_LEVELS;

const currentLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
}

function formatMessage(level: string, message: string, data?: unknown): string {
  const timestamp = new Date().toISOString();
  const base = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  if (data !== undefined) {
    return `${base} ${JSON.stringify(data)}`;
  }
  return base;
}

export const logger = {
  debug(message: string, data?: unknown) {
    if (shouldLog('debug')) {
      console.error(formatMessage('debug', message, data));
    }
  },
  info(message: string, data?: unknown) {
    if (shouldLog('info')) {
      console.error(formatMessage('info', message, data));
    }
  },
  warn(message: string, data?: unknown) {
    if (shouldLog('warn')) {
      console.error(formatMessage('warn', message, data));
    }
  },
  error(message: string, data?: unknown) {
    if (shouldLog('error')) {
      console.error(formatMessage('error', message, data));
    }
  },
};
