const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true, // Add index for faster queries on category
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    img_url: {
      type: String,
      required: true,
    },
    // Add rating fields
    ratingAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      set: (val) => Math.round(val * 10) / 10, // Round to 1 decimal place
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Add text index for search functionality on title and description
productSchema.index({ title: "text", description: "text" });

// Export as "product" - make sure this name matches exactly what's used in refs
const Product = mongoose.model("Product", productSchema);
module.exports = Product;
// Also expose the schema for our registration file
module.exports.schema = productSchema;
