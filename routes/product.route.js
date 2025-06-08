const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { authenticate, checkRole } = require("../middleware/auth.middleware");
const { productValidationRules } = require("../validation/product.validation");
const {
  addProduct,
  editProduct,
  removeProduct,
  viewProducts,
  viewProduct,
  searchProducts,
  getCategories,
} = require("../controller/product.controller");

router.get("/", viewProducts); // View all products
router.get("/search", searchProducts); // Search and filter products
router.get("/categories", getCategories); // Get all categories
router.get("/:id", viewProduct); // View a specific product

router.post(
  "/add",
  authenticate,
  checkRole(["admin"]),
  productValidationRules,
  addProduct
);

router.put(
  "/edit/:id",
  authenticate,
  checkRole(["admin"]),
  productValidationRules,
  editProduct
);

router.delete("/delete/:id", authenticate, checkRole(["admin"]), removeProduct);

module.exports = router;
