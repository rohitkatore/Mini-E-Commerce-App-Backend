const express = require("express");
const router = express.Router();
const userController = require("../controller/user.controller");
const {userValidationRules} = require("../validation/user.validation")

router.post(
  "/register",userValidationRules,
  userController.register
);
router.post("/login",userValidationRules, userController.login);

module.exports = router;
