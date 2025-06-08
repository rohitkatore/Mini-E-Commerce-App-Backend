// This file ensures all models are properly registered in the correct order

// First, register the Product model
const Product = require("./product.model");

// Then register models that depend on Product
const Cart = require("./cart.model");
const Discount = require("./discount.model");
// Add any other models that should be registered

module.exports = {
  Product,
  Cart,
  Discount,
  // Export any other models you've registered
};
