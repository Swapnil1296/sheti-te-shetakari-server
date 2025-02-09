const express = require("express");
const userController = require("../controller/user.controller");
const { userRegistrationValidation } = require("../validations/user.validator");
const validateRequest = require("../middelware/validateRequest");

const router = express.Router();

router.post(
  "/user-registration",

  userRegistrationValidation,
  validateRequest,
  userController.userRegistration
);

module.exports = router;
