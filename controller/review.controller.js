const { validationResult } = require("express-validator");
const reviewModel = require("../model/review.model");
const productModel = require("../model/product.model");
const mongoose = require("mongoose");

// Create a new review or update existing one
const createOrUpdateReview = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array() });
  }

  const { productId } = req.params;
  const { rating, review, title } = req.body;
  const userId = req.user._id;

  try {
    // Validate productId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ error: "Invalid product ID format" });
    }

    // Check if product exists
    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Check if user has already reviewed this product
    let existingReview = await reviewModel.findOne({
      user: userId,
      product: productId,
    });

    let message;
    let statusCode;

    if (existingReview) {
      // Update existing review
      const oldRating = existingReview.rating;

      existingReview.rating = rating;
      if (review !== undefined) existingReview.review = review;
      if (title !== undefined) existingReview.title = title;

      await existingReview.save();

      // Update product's rating average
      await updateProductRating(productId, oldRating, rating, false);

      message = "Review updated successfully";
      statusCode = 200;
    } else {
      // Create new review
      existingReview = await reviewModel.create({
        user: userId,
        product: productId,
        rating,
        review: review || "",
        title: title || "",
      });

      // Update product's rating average
      await updateProductRating(productId, 0, rating, true);

      message = "Review created successfully";
      statusCode = 201;
    }

    return res.status(statusCode).json({
      message,
      review: existingReview,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ error: "You have already reviewed this product" });
    }
    return res.status(500).json({ error: error.message });
  }
};

// Helper function to update product ratings
const updateProductRating = async (productId, oldRating, newRating, isNew) => {
  const product = await productModel.findById(productId);

  let { ratingAverage, ratingCount } = product;

  if (isNew) {
    // Adding a new rating
    const newTotal = ratingAverage * ratingCount + newRating;
    ratingCount += 1;
    ratingAverage = newTotal / ratingCount;
  } else {
    // Updating an existing rating
    const totalBeforeUpdate = ratingAverage * ratingCount;
    const totalAfterUpdate = totalBeforeUpdate - oldRating + newRating;
    ratingAverage = totalAfterUpdate / ratingCount;
  }

  await productModel.findByIdAndUpdate(productId, {
    ratingAverage,
    ratingCount,
  });
};

// Get all reviews for a product
const getProductReviews = async (req, res) => {
  const { productId } = req.params;

  try {
    // Validate productId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ error: "Invalid product ID format" });
    }

    // Check if product exists
    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Get reviews with populated user data
    const reviews = await reviewModel
      .find({ product: productId })
      .populate("user", "email") // Only include email from user
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: reviews.length,
      ratingAverage: product.ratingAverage,
      reviews,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Delete a review
const deleteReview = async (req, res) => {
  const { reviewId } = req.params;
  const userId = req.user._id;

  try {
    // Validate reviewId
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ error: "Invalid review ID format" });
    }

    // Find the review
    const review = await reviewModel.findById(reviewId);

    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    // Check if the review belongs to the user or if user is admin
    if (
      review.user.toString() !== userId.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ error: "You are not authorized to delete this review" });
    }

    // Update product ratings
    await updateProductRatingOnDelete(review.product, review.rating);

    // Delete the review
    await reviewModel.findByIdAndDelete(reviewId);

    return res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Helper function to update product rating when a review is deleted
const updateProductRatingOnDelete = async (productId, rating) => {
  const product = await productModel.findById(productId);

  let { ratingAverage, ratingCount } = product;

  if (ratingCount <= 1) {
    // If this is the only review, reset ratings to zero
    ratingAverage = 0;
    ratingCount = 0;
  } else {
    // Recalculate average
    const totalBeforeDelete = ratingAverage * ratingCount;
    ratingCount -= 1;
    ratingAverage = (totalBeforeDelete - rating) / ratingCount;
  }

  await productModel.findByIdAndUpdate(productId, {
    ratingAverage,
    ratingCount,
  });
};

// Get all reviews by current user
const getUserReviews = async (req, res) => {
  const userId = req.user._id;

  try {
    const reviews = await reviewModel
      .find({ user: userId })
      .populate("product", "title img_url")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createOrUpdateReview,
  getProductReviews,
  deleteReview,
  getUserReviews,
};
