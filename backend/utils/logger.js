import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Simple logger implementation
export const logger = {
  info: (message) => {
    const logMessage = `[INFO] ${new Date().toISOString()} - ${message}`;
    console.log(logMessage);
    fs.appendFileSync(path.join(logsDir, 'app.log'), logMessage + '\n');
  },
  
  error: (message) => {
    const logMessage = `[ERROR] ${new Date().toISOString()} - ${message}`;
    console.error(logMessage);
    fs.appendFileSync(path.join(logsDir, 'error.log'), logMessage + '\n');
  },
  
  debug: (message) => {
    if (process.env.NODE_ENV !== 'production') {
      const logMessage = `[DEBUG] ${new Date().toISOString()} - ${message}`;
      console.debug(logMessage);
      fs.appendFileSync(path.join(logsDir, 'debug.log'), logMessage + '\n');
    }
  },
  
  warn: (message) => {
    const logMessage = `[WARN] ${new Date().toISOString()} - ${message}`;
    console.warn(logMessage);
    fs.appendFileSync(path.join(logsDir, 'app.log'), logMessage + '\n');
  }
};
