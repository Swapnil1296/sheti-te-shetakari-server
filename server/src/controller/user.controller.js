const { logger } = require("../configs/logger");
const { registerUser } = require("../models/user.model");
const existingUser = require("../validations/existing-user-validation");
const bcrypt = require("bcrypt");

const userController = {
  userRegistration: async (req, res) => {
    try {
      const { full_name, phone, password, role = "user" } = req.body;

      if (!full_name?.trim() || !phone?.trim() || !password?.trim()) {
        return res
          .status(400)
          .json({ success: false, message: "Provide all required fields" });
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
};

module.exports = userController;
