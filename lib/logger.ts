import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';
import { NextRequest } from 'next/server';

// Log directory is set to "log" at the root of the project
const logDir = path.join(process.cwd(), 'log');

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  transports: [
    // Error logs
    new winston.transports.DailyRotateFile({
      filename: path.join(logDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxFiles: '14d',
    }),
    // API request/response logs
    new winston.transports.DailyRotateFile({
      filename: path.join(logDir, 'api-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
    }),
  ],
});

// If we're not in production then log to the console as well
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

// Helper to safely extract headers
const getHeaders = (req: Request | NextRequest) => {
  try {
    return Object.fromEntries(req.headers.entries());
  } catch (e) {
    return {};
  }
};

// Wrapper for API Request logging
export const logApiRequest = (req: Request | NextRequest, message: string = 'API Request') => {
  logger.info(message, {
    type: 'request',
    url: req.url,
    method: req.method,
    headers: getHeaders(req),
  });
};

// Wrapper for API Response logging
export const logApiResponse = (req: Request | NextRequest, status: number, data?: any, message: string = 'API Response') => {
  logger.info(message, {
    type: 'response',
    url: req.url,
    method: req.method,
    status,
    // Safely log small response data if needed
    data: process.env.NODE_ENV !== 'production' ? data : undefined,
  });
};

// Wrapper for API Error logging
export const logApiError = (req: Request | NextRequest, error: any, message: string = 'API Error') => {
  logger.error(message, {
    type: 'error',
    url: req.url,
    method: req.method,
    error: error?.message || error,
    stack: error?.stack,
  });
};
