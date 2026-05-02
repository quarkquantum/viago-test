import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';

const baseOptions: pino.LoggerOptions = {
  base: { pid: process.pid },
  level: isProduction ? 'info' : 'debug',
  timestamp: pino.stdTimeFunctions.isoTime,
};

const transport = isProduction
  ? undefined
  : pino.transport({
      options: {
        colorize: true,
        ignore: 'pid,hostname',
        levelFirst: true,
        singleLine: true,
      },
      target: 'pino-pretty',
    });

export const logger = pino(baseOptions, transport);

export type Logger = typeof logger;
