const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { authenticate, checkRole } = require("../middleware/auth.middleware");
const {
  validateDiscount,
  createDiscount,
  getAllDiscounts,
  updateDiscount,
  deleteDiscount,
} = require("../controller/discount.controller");

// Validate discount code
router.post(
  "/validate",
  authenticate,
  [
    body("code").notEmpty().withMessage("Discount code is required"),
  ],
  validateDiscount
);

// Admin routes
router.post(
  "/",
  authenticate,
  checkRole(["admin"]),
  [
    body("code").notEmpty().withMessage("Code is required"),
    body("discountType")
      .isIn(["percentage", "fixed"])
      .withMessage("Discount type must be percentage or fixed"),
    body("value")
      .isNumeric()
      .withMessage("Value must be a number")
      .custom((value, { req }) => {
        if (
          req.body.discountType === "percentage" &&
          (value <= 0 || value > 100)
        ) {
          throw new Error("Percentage must be between 0 and 100");
        }
        return true;
      }),
  ],
  createDiscount
);

router.get("/", authenticate, checkRole(["admin"]), getAllDiscounts);
router.put("/:id", authenticate, checkRole(["admin"]), updateDiscount);
router.delete("/:id", authenticate, checkRole(["admin"]), deleteDiscount);

module.exports = router;
