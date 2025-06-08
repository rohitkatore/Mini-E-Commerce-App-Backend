const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      required: false,
      trim: true,
      maxlength: 500,
    },
    title: {
      type: String,
      required: false,
      trim: true,
      maxlength: 100,
    },
  },
  { timestamps: true }
);

// Compound index to ensure a user can only review a product once
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
module.exports.schema = reviewSchema;
