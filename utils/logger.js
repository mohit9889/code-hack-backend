import { createLogger, format, transports, addColors } from 'winston';

// Define colors for different log levels
const customColors = {
  info: 'green',
  warn: 'yellow',
  error: 'red',
};

// Apply custom colors to Winston
addColors(customColors);

// Create the logger
const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.colorize({ all: true }), // Apply colors to all logs
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}] - ${message}`;
    })
  ),
  transports: [
    new transports.Console(), // Colored logs in console
  ],
});

export default logger;
