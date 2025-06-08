const express = require("express");
const router = express.Router();
const cartController = require("../controller/cart.controller");
const { authenticate, checkRole } = require("../middleware/auth.middleware");
const {
  addToCartValidation,
  updateCartValidation,
} = require("../validation/cart.validation");

// All cart routes require authentication
router.use(authenticate);

// Add item to cart
router.post("/add", addToCartValidation, cartController.addToCart);

// Update cart item quantity
router.put(
  "/update/:productId",
  updateCartValidation,
  cartController.updateCartItem
);

// Remove item from cart
router.delete("/remove/:productId", cartController.removeCartItem);

// View cart
router.get("/", cartController.getCart);

module.exports = router;
