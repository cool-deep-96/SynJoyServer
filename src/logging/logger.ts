import { createLogger, format, Logger, transports } from "winston";
import path from "path";
import fs from "fs";

const { combine, timestamp, json, colorize, printf } = format;

// Custom format for console logging with colors and pretty-printed objects
const consoleLogFormat = printf(({ level, message, timestamp, ...meta }) => {
  const metaString = meta && Object.keys(meta).length 
    ? JSON.stringify(meta, null, 2) // Pretty prints with 2-space indentation
    : '';
  return `${timestamp} ${level}: ${message} ${metaString}`;
});

// Define the path for the log file in the `src/logging` folder
const logDir = path.join(__dirname);
const logFilePath = path.join(logDir, 'app.log');

// Create the logging directory if it doesn't exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Create a Winston logger
const logger: Logger = createLogger({
  level: "info",
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // Adds a readable timestamp
    json() // Logs in JSON format for structured logging
  ),
  transports: [
    new transports.Console({
      format: combine(
        colorize(), // Adds color to the console logs based on the level
        consoleLogFormat // Uses the custom console format
      ),
    }),
    new transports.File({
      filename: logFilePath,
      maxsize: 5 * 1024 * 1024, // 5 MB per log file before rotation
      maxFiles: 5, // Keep up to 5 rotated log files
      format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        json() // JSON format for easier log analysis
      ),
    }),
  ],
  exitOnError: false, // Prevents the logger from exiting on errors
});

// if (process.env.NODE_ENV === 'development') {
//   logger.add(new transports.Console({
//     format: format.simple(),
//   }));
// }
export default logger;
