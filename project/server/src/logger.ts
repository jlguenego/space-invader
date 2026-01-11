export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type LogFields = Record<string, unknown>;

export type LogEvent = {
  ts: string;
  level: LogLevel;
  msg: string;
} & LogFields;

export type Logger = {
  debug: (msg: string, fields?: LogFields) => void;
  info: (msg: string, fields?: LogFields) => void;
  warn: (msg: string, fields?: LogFields) => void;
  error: (msg: string, fields?: LogFields) => void;
  child: (fields: LogFields) => Logger;
};

function levelRank(level: LogLevel): number {
  switch (level) {
    case 'debug':
      return 10;
    case 'info':
      return 20;
    case 'warn':
      return 30;
    case 'error':
      return 40;
  }
}

function parseLogLevel(value: string | undefined): LogLevel | undefined {
  if (!value) return undefined;
  const v = value.toLowerCase();
  if (v === 'debug' || v === 'info' || v === 'warn' || v === 'error') return v;
  return undefined;
}

export function serializeError(err: unknown, options?: { includeStack?: boolean }): LogFields {
  if (err instanceof Error) {
    const base: LogFields = {
      errorName: err.name,
      errorMessage: err.message,
    };

    if (options?.includeStack && err.stack) {
      base.errorStack = err.stack;
    }

    return base;
  }

  return { error: err };
}

export function createLogger(options?: {
  level?: LogLevel;
  baseFields?: LogFields;
  sink?: (event: LogEvent) => void;
}): Logger {
  const configuredLevel = options?.level ?? parseLogLevel(process.env.LOG_LEVEL) ?? 'info';
  const configuredRank = levelRank(configuredLevel);
  const baseFields = options?.baseFields ?? {};

  const sink =
    options?.sink ??
    ((event: LogEvent) => {
      const line = `${JSON.stringify(event)}\n`;
      if (event.level === 'warn' || event.level === 'error') {
        process.stderr.write(line);
      } else {
        process.stdout.write(line);
      }
    });

  function emit(level: LogLevel, msg: string, fields?: LogFields) {
    if (levelRank(level) < configuredRank) return;

    const event: LogEvent = {
      ts: new Date().toISOString(),
      level,
      msg,
      ...baseFields,
      ...(fields ?? {}),
    };

    sink(event);
  }

  function child(childFields: LogFields): Logger {
    return createLogger({
      level: configuredLevel,
      baseFields: { ...baseFields, ...childFields },
      sink,
    });
  }

  return {
    debug: (msg, fields) => emit('debug', msg, fields),
    info: (msg, fields) => emit('info', msg, fields),
    warn: (msg, fields) => emit('warn', msg, fields),
    error: (msg, fields) => emit('error', msg, fields),
    child,
  };
}
