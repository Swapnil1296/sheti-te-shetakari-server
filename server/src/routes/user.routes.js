const express = require("express");
const userController = require("../controller/user.controller");
const {
  userRegistrationValidation,
  userLoginValidation,
} = require("../validations/user.validator");
const validateRequest = require("../middelware/validateRequest");

const router = express.Router();

router.post(
  "/user-registration",

  userRegistrationValidation,
  validateRequest,
  userController.userRegistration
);

router.post(
  "/user-login",
  userLoginValidation,
  validateRequest,
  userController.userLogin
);

module.exports = router;
