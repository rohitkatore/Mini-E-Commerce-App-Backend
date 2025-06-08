const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth.middleware");
const { reviewValidationRules } = require("../validation/review.validation");
const {
  createOrUpdateReview,
  getProductReviews,
  deleteReview,
  getUserReviews,
} = require("../controller/review.controller");

// Public route to view all reviews for a product
router.get("/product/:productId", getProductReviews);

// Protected routes
router.use(authenticate);

// Create/update a review for a product
router.post("/product/:productId", reviewValidationRules, createOrUpdateReview);

// Get all reviews by the current user
router.get("/user/me", getUserReviews);

// Delete a review
router.delete("/:reviewId", deleteReview);

module.exports = router;
