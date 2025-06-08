const { validationResult } = require("express-validator");
const discountModel = require("../model/discount.model");
const cartModel = require("../model/cart.model");

// Validate a discount code
const validateDiscount = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array() });
  }

  const { code, cartTotal } = req.body; // Add cartTotal back to the destructuring

  if (!code) {
    return res.status(400).json({ error: "Discount code is required" });
  }

  try {
    // Get the user's cart to verify the actual cart total if needed
    const userCart = await cartModel
      .findOne({ user: req.user._id })
      .populate("items.product");

    // Use the provided cartTotal or get it from the user's cart
    const actualCartTotal = cartTotal || (userCart ? userCart.totalPrice : 0);

    const discount = await discountModel.findOne({
      code: code.toUpperCase(),
      active: true,
    });

    if (!discount) {
      return res.status(404).json({ error: "Invalid discount code" });
    }

    // Check if code is expired
    if (discount.validUntil && new Date() > discount.validUntil) {
      return res.status(400).json({ error: "Discount code has expired" });
    }

    // Check if maximum uses reached
    if (discount.maxUses && discount.usedCount >= discount.maxUses) {
      return res
        .status(400)
        .json({ error: "Discount code usage limit reached" });
    }

    // Check minimum purchase requirement
    if (actualCartTotal < discount.minPurchase) {
      return res.status(400).json({
        error: `Minimum purchase amount of $${discount.minPurchase} required for this code`,
      });
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (discount.discountType === "percentage") {
      discountAmount = (actualCartTotal * discount.value) / 100;
    } else {
      discountAmount = Math.min(discount.value, actualCartTotal);
    }

    return res.status(200).json({
      valid: true,
      discountCode: discount.code,
      discountType: discount.discountType,
      discountValue: discount.value,
      discountAmount: discountAmount,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Admin: Create a new discount code
const createDiscount = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array() });
  }

  try {
    const discount = await discountModel.create(req.body);
    return res.status(201).json({
      message: "Discount code created successfully",
      discount,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Admin: Get all discount codes
const getAllDiscounts = async (req, res) => {
  try {
    const discounts = await discountModel.find({});
    return res.status(200).json({ discounts });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Admin: Update a discount code
const updateDiscount = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedDiscount = await discountModel.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );
    if (!updatedDiscount) {
      return res.status(404).json({ error: "Discount code not found" });
    }
    return res.status(200).json({
      message: "Discount code updated successfully",
      discount: updatedDiscount,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Admin: Delete a discount code
const deleteDiscount = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedDiscount = await discountModel.findByIdAndDelete(id);
    if (!deletedDiscount) {
      return res.status(404).json({ error: "Discount code not found" });
    }
    return res.status(200).json({
      message: "Discount code deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  validateDiscount,
  createDiscount,
  getAllDiscounts,
  updateDiscount,
  deleteDiscount,
};
