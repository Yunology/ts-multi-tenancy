// src/log.ts
import { Request, Response } from 'express';
import { createLogger, format, transports } from 'winston';

export const HttpLevel = (req: Request, { statusCode }: Response, err: Error): string => {
  let levelStr = 'unknown';
  if (statusCode >= 100) { levelStr = 'info'; }
  if (statusCode >= 400) { levelStr = 'warn'; }
  if (statusCode >= 500) { levelStr = 'error'; }
  if (statusCode === 401 || statusCode === 403) { levelStr = 'critical'; }
  return levelStr;
};

export const httpConsoleFormat = format.combine(
  format.colorize(),
  format.printf(({ level: logLevel, timestamp, meta }) => {
    const { req, res, responseTime } = meta;
    const {
      httpVersion, method, url, headers,
    } = req;
    const { 'x-real-ip': realIp } = headers;
    const { statusCode } = res;
    return `${logLevel}: ${timestamp} [${realIp}] HTTP/${httpVersion} ${statusCode}`
      + ` ${method} (${responseTime}ms) - ${url}`;
  }),
);

export const logger = createLogger({
  level: 'info',
  format: format.json(),
  transports: [
    new transports.File({ filename: 'error.log', level: 'error' }),
    new transports.File({ filename: 'combine.log' }),
  ],
});
