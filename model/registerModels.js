const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

// Explicitly define and register models in the correct order
// First, register the Product model
const productSchema = require("./product.model");

// Then register all other models
const userSchema = require("./user.model");
const cartSchema = require("./cart.model");
const orderSchema = require("./order.model");
const discountSchema = require("./discount.model");
const reviewSchema = require("./review.model");

// Explicitly register models
mongoose.model("Product", productSchema.schema || productSchema);

console.log("All models registered successfully");

module.exports = mongoose;
