const db = require("../configs/database");

const userController = {
  registerUser: async (userInfo) => {
    try {
      const { full_name, phone, hashPassword, role } = userInfo;
      if (!full_name?.trim() || !phone?.trim() || !hashPassword?.trim()) {
        return {
          status: 400,
          message: "Provide all required fields",
          user: null,
        };
      }

      const insertQuery =
        "INSERT INTO users (full_name, phone, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id";
      const result = await db.query(insertQuery, [
        full_name,
        phone,
        hashPassword,
        role,
      ]);
      if (result.rowCount > 0) {
        return {
          status: 201,
          message: "User registered successfully",
          user: result.rows[0],
        };
      }
      return { status: 500, message: "Failed to register user", user: null };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  },
};

module.exports = userController;
