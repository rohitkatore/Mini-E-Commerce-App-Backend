const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { authenticate } = require("../middleware/auth.middleware");
const {
  createOrder,
  getUserOrders,
  getOrderDetails,
} = require("../controller/order.controller");

// Create a new order (checkout)
router.post(
  "/",
  authenticate,
  [
    body("shippingAddress")
      .notEmpty()
      .withMessage("Shipping address is required"),
  ],
  createOrder
);

// Get all orders for the logged-in user
router.get("/", authenticate, getUserOrders);

// Get specific order details
router.get("/:id", authenticate, getOrderDetails);

module.exports = router;
