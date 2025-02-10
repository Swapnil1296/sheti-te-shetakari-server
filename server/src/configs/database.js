// src/configs/database.js
const { Client } = require("pg");
const dotenv = require("dotenv");

dotenv.config();

const createClient = () => {
  const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
  });

  return client;
};

// Create and connect client
const client = createClient();

// Only connect if we're not in a test environment
if (process.env.NODE_ENV !== "test") {
  client
    .connect()
    .then(() => console.log("Connected to PostgreSQL"))
    .catch((err) => {
      console.error("Error connecting to PostgreSQL:", err.message, err.stack);
      process.exit(1);
    });
}

module.exports = client;
