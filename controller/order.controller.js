const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

// Get models
const orderModel = require("../model/order.model");
const cartModel = require("../model/cart.model");
const productModel = require("../model/product.model");
const discountModel = require("../model/discount.model");
const userModel = require("../model/user.model");

// Import email service
const { sendOrderConfirmation } = require("../utils/emailService");

// Create a new order (checkout process)
const createOrder = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array() });
  }

  const { shippingAddress, discountCode } = req.body;

  if (!shippingAddress) {
    return res.status(400).json({ error: "Shipping address is required" });
  }

  const userId = req.user._id;

  try {
    // Get user's cart
    const cart = await cartModel
      .findOne({ user: userId })
      .populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    // Validate stock for each item
    for (const item of cart.items) {
      const product = item.product;
      if (product.stock < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for ${product.title}. Available: ${product.stock}`,
        });
      }
    }

    // Calculate subtotal amount and prepare order items
    let subtotalAmount = 0;
    const orderItems = cart.items.map((item) => {
      const itemTotal = item.quantity * item.product.price;
      subtotalAmount += itemTotal;
      return {
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price,
      };
    });

    // Initialize discount variables
    let discountAmount = 0;
    let validatedDiscountCode = null;

    // Apply discount if provided
    if (discountCode) {
      const discount = await discountModel.findOne({
        code: discountCode.toUpperCase(),
        active: true,
      });

      if (discount) {
        // Check validity
        const isValid =
          (!discount.validUntil || new Date() <= discount.validUntil) &&
          (!discount.maxUses || discount.usedCount < discount.maxUses) &&
          subtotalAmount >= discount.minPurchase;

        if (isValid) {
          validatedDiscountCode = discount.code;

          // Calculate discount amount
          if (discount.discountType === "percentage") {
            discountAmount = (subtotalAmount * discount.value) / 100;
          } else {
            discountAmount = Math.min(discount.value, subtotalAmount);
          }

          // Update discount usage count
          await discountModel.findByIdAndUpdate(discount._id, {
            $inc: { usedCount: 1 },
          });
        }
      }
    }

    // Calculate final total
    const totalAmount = subtotalAmount - discountAmount;

    // Create new order without transaction
    const order = await orderModel.create({
      user: userId,
      items: orderItems,
      subtotalAmount,
      discountCode: validatedDiscountCode,
      discountAmount,
      totalAmount,
      shippingAddress,
    });

    // Store the updated product IDs and quantities for rollback if needed
    const stockUpdates = [];

    // Update product stock
    for (const item of cart.items) {
      const product = await productModel.findByIdAndUpdate(
        item.product._id,
        { $inc: { stock: -item.quantity } },
        { new: true }
      );

      if (!product) {
        // If any product update fails, we should rollback
        // Rollback already updated products
        for (const update of stockUpdates) {
          await productModel.findByIdAndUpdate(update.productId, {
            $inc: { stock: update.quantity },
          });
        }
        // Delete the created order
        await orderModel.findByIdAndDelete(order._id);
        return res
          .status(500)
          .json({ error: "Failed to update product stock" });
      }

      stockUpdates.push({
        productId: item.product._id,
        quantity: item.quantity,
      });
    }

    // Clear the cart after successful order creation and stock updates
    await cartModel.findByIdAndUpdate(cart._id, { $set: { items: [] } });

    // Prepare data for email
    const user = await userModel.findById(userId);

    // Format products data for email
    const productsForEmail = cart.items.map((item) => ({
      title: item.product.title,
      quantity: item.quantity,
      price: item.product.price,
    }));

    // Send order confirmation email
    try {
      await sendOrderConfirmation(user.email, order, productsForEmail);
    } catch (emailError) {
      // Log the error but don't fail the order
      console.error("Failed to send order confirmation email:", emailError);
    }

    return res.status(201).json({
      message: "Order placed successfully",
      order: order,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get orders for the logged-in user
const getUserOrders = async (req, res) => {
  try {
    const userId = req.user._id;

    // First fetch orders without population
    const orders = await orderModel
      .find({ user: userId })
      .sort({ createdAt: -1 });

    // Manual population to avoid schema registration issues
    const populatedOrders = [];

    for (const order of orders) {
      const populatedItems = [];

      for (const item of order.items) {
        const product = await productModel
          .findById(item.product)
          .select("title img_url price");
        if (product) {
          populatedItems.push({
            ...item.toObject(),
            product: product,
          });
        }
      }

      const orderObj = order.toObject();
      orderObj.items = populatedItems;
      populatedOrders.push(orderObj);
    }

    return res.status(200).json({ orders: populatedOrders });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get specific order details
const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid order ID" });
    }

    // Fetch order without population
    const order = await orderModel.findById(id);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Manually populate
    const user = await userModel.findById(order.user).select("name email");

    const populatedItems = [];
    for (const item of order.items) {
      const product = await productModel
        .findById(item.product)
        .select("title description img_url price");
      if (product) {
        populatedItems.push({
          ...item.toObject(),
          product: product,
        });
      }
    }

    // Ensure users can only access their own orders unless admin
    if (
      order.user.toString() !== userId.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ error: "Forbidden: You don't have access to this order" });
    }

    const orderObj = order.toObject();
    orderObj.items = populatedItems;
    orderObj.user = user;

    return res.status(200).json({ order: orderObj });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderDetails,
};
