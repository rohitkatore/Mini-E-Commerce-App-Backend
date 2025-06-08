const {body} = require("express-validator") ;

const userValidationRules = [
    body("email").isEmail().withMessage("Please enter valid email."),
    body("password")
      .isLength({ min: 6 })
      .withMessage("password must me at least 6 character."),
];

module.exports = {userValidationRules}