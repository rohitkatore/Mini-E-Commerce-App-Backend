const { validationResult } = require("express-validator");
const productModel = require("../model/product.model");
const mongoose = require("mongoose");

// Validate MongoDB ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const addProduct = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array() });
  }
  const { title, description, price, stock, img_url, category } = req.body;
  try {
    const product = await productModel.create({
      title,
      description,
      price,
      category,
      stock,
      img_url,
    });

    if (!product) {
      return res.status(500).json({ error: "Failed to create product" });
    }

    return res
      .status(201)
      .json({ message: "Product is created successfully", product });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const editProduct = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array() });
  }

  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: "Id is required" });
  }

  if (!isValidObjectId(id)) {
    return res.status(400).json({ error: "Invalid product ID format" });
  }

  const { title, description, price, stock, img_url, category } = req.body;

  try {
    const updatedProduct = await productModel.findByIdAndUpdate(
      id,
      {
        title,
        description,
        price,
        category,
        stock,
        img_url,
      },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }
    return res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const removeProduct = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: "Id is required" });
  }

  if (!isValidObjectId(id)) {
    return res.status(400).json({ error: "Invalid product ID format" });
  }

  try {
    const deletedProduct = await productModel.findByIdAndDelete(id);
    if (!deletedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }
    return res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const viewProducts = async (req, res) => {
  try {
    const products = await productModel.find({});
    if (!products || products.length === 0) {
      return res.status(404).json({ error: "No products found" });
    }
    return res.status(200).json({ products });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const viewProduct = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: "Id is required" });
  }

  if (!isValidObjectId(id)) {
    return res.status(400).json({ error: "Invalid product ID format" });
  }

  try {
    const product = await productModel.findById(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    return res.status(200).json({ product });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Search and filter products
const searchProducts = async (req, res) => {
  try {
    const { query, category, minPrice, maxPrice, sort } = req.query;

    // Build the filter object
    let filter = {};

    // Text search if query parameter is provided
    if (query) {
      filter.$text = { $search: query };
    }

    // Category filter
    if (category) {
      filter.category = category;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Build sort object
    let sortOption = {};
    if (sort) {
      switch (sort) {
        case "price_asc":
          sortOption = { price: 1 };
          break;
        case "price_desc":
          sortOption = { price: -1 };
          break;
        case "newest":
          sortOption = { createdAt: -1 };
          break;
        case "oldest":
          sortOption = { createdAt: 1 };
          break;
        default:
          sortOption = { createdAt: -1 }; // Default to newest
      }
    } else {
      sortOption = { createdAt: -1 }; // Default sort
    }

    const products = await productModel.find(filter).sort(sortOption);

    if (!products || products.length === 0) {
      return res
        .status(404)
        .json({ error: "No products found matching your criteria" });
    }

    return res.status(200).json({ products, count: products.length });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get all categories
const getCategories = async (req, res) => {
  try {
    const categories = await productModel.distinct("category");
    return res.status(200).json({ categories });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addProduct,
  editProduct,
  removeProduct,
  viewProducts,
  viewProduct,
  searchProducts,
  getCategories,
};
