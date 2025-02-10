const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { logger } = require("../configs/logger");
const { registerUser } = require("../models/user.model");
const existingUser = require("../validations/existing-user-validation");

const userController = {
  userRegistration: async (req, res) => {
    try {
      const { full_name, phone, password, role = "user" } = req.body;

      if (!full_name?.trim() || !phone?.trim() || !password?.trim()) {
        return res
          .status(400)
          .json({ success: false, message: "Provide all required fields" });
      }
      if (role !== "user") {
        logger.warn("Unauthorized role provided");
        return res.status(403).json({
          success: false,
          message: "Unauthorized role provided",
        });
      }

      const checkExistingUser = await existingUser(phone);
      if (checkExistingUser.status === 200) {
        return res
          .status(400)
          .json({ success: false, message: checkExistingUser.message });
      }

      const hashPassword = await bcrypt.hash(password, 10);

      const userInfo = { full_name, phone, hashPassword, role };
      const registeredUser = await registerUser(userInfo);

      if (registeredUser.status === 201) {
        logger.info("Registration successful");
        return res.status(201).json({
          success: true,
          message: registeredUser.message,
          userId: registeredUser.user?.id,
        });
      }

      return res
        .status(500)
        .json({ success: false, message: "Failed to register user" });
    } catch (error) {
      logger.error(`Registration Error: ${error.message}`);
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  },

  userLogin: async (req, res) => {
    try {
      const { phone, password } = req.body;

      const isValidUser = await existingUser(phone);
      if (!isValidUser || isValidUser.status !== 200) {
        logger.warn(`Login failed: User with phone ${phone} not found`);
        return res.status(401).json({
          success: false,
          message: "Invalid phone number or password",
        });
      }

      const user = isValidUser.user;

      const formattedPassword =
        typeof password === "number" ? String(password) : password;

      const matchPassword = await bcrypt.compare(
        formattedPassword,
        user.password_hash
      );
      if (!matchPassword) {
        logger.warn(`Login failed: Incorrect password for user ${phone}`);
        return res.status(401).json({
          success: false,
          message: "Invalid phone number or password",
        });
      }

      const token = jwt.sign(
        { userId: user.id, role: user.role, username: user.full_name },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      logger.info(`User ${phone} logged in successfully`);
      return res.status(200).json({
        success: true,
        message: "Signed in successfully",
        data: { accessToken: token },
      });
    } catch (error) {
      logger.error(`Login Error: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  },
};

module.exports = userController;
