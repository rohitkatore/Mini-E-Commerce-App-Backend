const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const app = express();

// First, explicitly register all models
require("./model/registerModels");

// Then connect to the database
const connectDB = require("./db/db");
connectDB();

// Import routes after models are registered
const userRoute = require("./routes/user.route");
const productRoute = require("./routes/product.route");
const cartRoute = require("./routes/cart.route");
const orderRoute = require("./routes/order.route");
const discountRoute = require("./routes/discount.route");
const reviewRoute = require("./routes/review.route");

app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());

app.use("/api/auth", userRoute);
app.use("/products", productRoute);
app.use("/cart", cartRoute);
app.use("/orders", orderRoute);
app.use("/discount", discountRoute);
app.use("/review",reviewRoute) ;

module.exports = app;
