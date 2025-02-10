const { logger } = require("../configs/logger");
const db = require("../configs/database");

const existingUser = async (phone) => {
  try {
    if (!phone?.trim()) {
      return { status: 400, message: "Phone number is required", user: null };
    }

    const query = "SELECT * FROM users WHERE phone = $1";
    const result = await db.query(query, [phone]);

    if (result.rowCount > 0) {
      logger.info(`User exists with phone number: ${phone}`);
      return {
        status: 200,
        message: "user already exists with provided details",
        user: result.rows[0],
      };
    }

    return {
      status: 404,
      message: "User does not exist",
      user: null,
    };
  } catch (error) {
    return { status: 500, message: error.message, user: null };
  }
};

module.exports = existingUser;
