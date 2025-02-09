// src/config/logger.js

const winston = require("winston");
const path = require("path");

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define different colors for each level
const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "blue",
};

// Add colors to winston
winston.addColors(colors);

// Define the format for logs
const format = winston.format.combine(
  // Add timestamp
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  // Add colors
  winston.format.colorize({ all: true }),
  // Define the format of the message showing the timestamp, the level and the message
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Define which logs to store
const transports = [
  // Console transport for development
  new winston.transports.Console(),

  // Error logs file transport
  new winston.transports.File({
    filename: path.join(__dirname, "../logs/error.log"),
    level: "error",
  }),

  // All logs file transport
  new winston.transports.File({
    filename: path.join(__dirname, "../logs/all.log"),
  }),

  // HTTP logs in separate file
  new winston.transports.File({
    filename: path.join(__dirname, "../logs/http.log"),
    level: "http",
  }),
];

// Create the logger instance
const logger = winston.createLogger({
  level: process.env.NODE_ENV === "development" ? "debug" : "warn",
  levels,
  format,
  transports,
});

// Create a stream object for Morgan middleware
const stream = {
  write: (message) => logger.http(message.trim()),
};

module.exports = { logger, stream };
