const { validationResult } = require("express-validator");
const cartModel = require("../model/cart.model");
const productModel = require("../model/product.model");
const mongoose = require("mongoose");

// Validate MongoDB ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Add item to cart
const addToCart = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array() });
  }

  const { productId, quantity } = req.body;
  const userId = req.user._id;

  try {
    // Check if product exists and has sufficient stock
    const product = await productModel.findById(productId);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ error: "Not enough stock available" });
    }

    // Find user's cart or create if doesn't exist
    let cart = await cartModel.findOne({ user: userId });

    if (!cart) {
      cart = new cartModel({
        user: userId,
        items: [],
        totalPrice: 0,
      });
    }

    // Check if product is already in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Update quantity if product already exists
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;

      if (newQuantity > product.stock) {
        return res.status(400).json({ error: "Not enough stock available" });
      }

      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new product to cart
      cart.items.push({
        product: productId,
        quantity: quantity,
        price: product.price,
      });
    }

    // Calculate total price
    cart.calculateTotalPrice();

    await cart.save();

    // Populate product details for response
    await cart.populate("items.product", "title img_url price");

    return res.status(200).json({
      message: "Item added to cart successfully",
      cart,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array() });
  }

  const { productId } = req.params;
  const { quantity } = req.body;
  const userId = req.user._id;

  if (!isValidObjectId(productId)) {
    return res.status(400).json({ error: "Invalid product ID format" });
  }

  try {
    // Check if product exists and has sufficient stock
    const product = await productModel.findById(productId);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ error: "Not enough stock available" });
    }

    // Find user's cart
    const cart = await cartModel.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    // Find the item in cart
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ error: "Item not found in cart" });
    }

    // Update quantity
    cart.items[itemIndex].quantity = quantity;

    // Calculate total price
    cart.calculateTotalPrice();

    await cart.save();

    // Populate product details for response
    await cart.populate("items.product", "title img_url price");

    return res.status(200).json({
      message: "Cart updated successfully",
      cart,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Remove item from cart
const removeCartItem = async (req, res) => {
  const { productId } = req.params;
  const userId = req.user._id;

  if (!isValidObjectId(productId)) {
    return res.status(400).json({ error: "Invalid product ID format" });
  }

  try {
    // Find user's cart
    const cart = await cartModel.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    // Find the item in cart
    const initialItemsCount = cart.items.length;
    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    if (cart.items.length === initialItemsCount) {
      return res.status(404).json({ error: "Item not found in cart" });
    }

    // Calculate total price
    cart.calculateTotalPrice();

    // Save the cart (or remove it if empty)
    if (cart.items.length === 0) {
      await cartModel.findByIdAndDelete(cart._id);
      return res
        .status(200)
        .json({ message: "Item removed and cart is now empty" });
    } else {
      await cart.save();

      // Populate product details for response
      await cart.populate("items.product", "title img_url price");

      return res.status(200).json({
        message: "Item removed from cart successfully",
        cart,
      });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// View cart
const getCart = async (req, res) => {
  const userId = req.user._id;

  try {
    // Find user's cart with populated product details
    const cart = await cartModel
      .findOne({ user: userId })
      .populate("items.product", "title img_url price");

    if (!cart) {
      return res.status(200).json({
        message: "Cart is empty",
        cart: {
          items: [],
          totalPrice: 0,
        },
      });
    }

    return res.status(200).json({ cart });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addToCart,
  updateCartItem,
  removeCartItem,
  getCart,
};
