const { body } = require("express-validator");

const reviewValidationRules = [
  body("rating")
    .notEmpty()
    .withMessage("Rating is required")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
  body("review")
    .optional()
    .isString()
    .withMessage("Review must be a string")
    .isLength({ max: 500 })
    .withMessage("Review must be less than 500 characters"),
  body("title")
    .optional()
    .isString()
    .withMessage("Title must be a string")
    .isLength({ max: 100 })
    .withMessage("Title must be less than 100 characters"),
];

module.exports = {
  reviewValidationRules,
};
