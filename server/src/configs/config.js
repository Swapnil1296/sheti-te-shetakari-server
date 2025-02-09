const dotenv = require("dotenv");

dotenv.config();
const config = {
  db: {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  },
  cryptR: {
    secret: "swapnil@1234&$fjdrouiru93u493jkj3493",
  },
  jwt: {
    secret: "swapnil@1234&$fjdrouiru93u493jkj3493",
  },
};

module.exports = config;
