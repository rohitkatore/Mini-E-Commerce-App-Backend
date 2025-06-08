# Mini E-Commerce Application

A full-featured e-commerce backend API built with Node.js, Express, and MongoDB.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [API Documentation](#api-documentation)
  - [Authentication](#authentication)
  - [Products](#products)
  - [Cart](#cart)
  - [Orders](#orders)
  - [Discounts](#discounts)
  - [Reviews](#reviews)

## Features

- User authentication and authorization
- Product management with categories
- Shopping cart functionality
- Order processing and management
- Discount code system
- Product reviews and ratings
- RESTful API design

## Installation

1. Clone the repository

```bash
git clone <repository-url>
cd Mini-E-Commerce-App
```

2. Install dependencies

```bash
npm install
```

3. Create a .env file in the root directory with the following variables:

```
PORT=4000
MONGO_URL=mongodb://127.0.0.1:27017/mini-e-commerce-app
SECRET_KEY=your_jwt_secret

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password
EMAIL_FROM=noreply@yourecommerceapp.com
EMAIL_FROM_NAME=YourAppName
```

4. Start the server

```bash
npm start
```

## API Documentation

### Authentication

#### Register a new user

```http
POST /api/auth/register
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response (201 Created):**

```json
{
  "message": "User register successfully.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Login

```http
POST /api/auth/login
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response (200 OK):**

```json
{
  "message": "Login successfully.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Products

#### Get all products

```http
GET /products
```

**Response (200 OK):**

```json
{
  "products": [
    {
      "_id": "60d21b4667d0d8992e610c85",
      "title": "Product Name",
      "description": "Product description",
      "price": 19.99,
      "img_url": "https://example.com/image.jpg",
      "category": "Electronics",
      "stock": 10,
      "ratingAverage": 4.5,
      "ratingCount": 10,
      "createdAt": "2023-01-15T12:00:00.000Z",
      "updatedAt": "2023-01-15T12:00:00.000Z"
    }
  ]
}
```

#### Get product by ID

```http
GET /products/:id
```

**Response (200 OK):**

```json
{
  "product": {
    "_id": "60d21b4667d0d8992e610c85",
    "title": "Product Name",
    "description": "Product description",
    "price": 19.99,
    "img_url": "https://example.com/image.jpg",
    "category": "Electronics",
    "stock": 10,
    "ratingAverage": 4.5,
    "ratingCount": 10,
    "createdAt": "2023-01-15T12:00:00.000Z",
    "updatedAt": "2023-01-15T12:00:00.000Z"
  }
}
```

#### Search products

```http
GET /products/search
```

**Query Parameters:**

- `query`: Text to search for in title and description
- `category`: Filter by category
- `minPrice`: Minimum price
- `maxPrice`: Maximum price
- `sort`: Sort option (price_asc, price_desc, newest, oldest)

**Response (200 OK):**

```json
{
  "products": [...],
  "count": 5
}
```

#### Get all categories

```http
GET /products/categories
```

**Response (200 OK):**

```json
{
  "categories": ["Electronics", "Clothing", "Books", "Home"]
}
```

#### Create a new product (Admin only)

```http
POST /products/add
```

**Request Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "title": "New Product",
  "description": "Product description",
  "price": 29.99,
  "img_url": "https://example.com/newimage.jpg",
  "category": "Clothing",
  "stock": 25
}
```

**Response (201 Created):**

```json
{
  "message": "Product is created successfully",
  "product": {
    "_id": "60d21b4667d0d8992e610c86",
    "title": "New Product",
    "description": "Product description",
    "price": 29.99,
    "img_url": "https://example.com/newimage.jpg",
    "category": "Clothing",
    "stock": 25
  }
}
```

#### Update a product (Admin only)

```http
PUT /products/edit/:id
```

**Request Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "price": 24.99,
  "stock": 30
}
```

**Response (200 OK):**

```json
{
  "message": "Product updated successfully",
  "product": {
    "_id": "60d21b4667d0d8992e610c86",
    "title": "New Product",
    "description": "Product description",
    "price": 24.99,
    "img_url": "https://example.com/newimage.jpg",
    "category": "Clothing",
    "stock": 30
  }
}
```

#### Delete a product (Admin only)

```http
DELETE /products/delete/:id
```

**Response (200 OK):**

```json
{
  "message": "Product deleted successfully"
}
```

### Cart

#### Get user cart

```http
GET /cart
```

**Request Headers:**

```
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "cart": {
    "_id": "60d21b4667d0d8992e610c87",
    "user": "60d21b4667d0d8992e610c85",
    "items": [
      {
        "product": {
          "_id": "60d21b4667d0d8992e610c85",
          "title": "Product Name",
          "price": 19.99,
          "img_url": "https://example.com/image.jpg"
        },
        "quantity": 2,
        "price": 19.99
      }
    ],
    "totalPrice": 39.98
  }
}
```

#### Add item to cart

```http
POST /cart/add
```

**Request Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "productId": "60d21b4667d0d8992e610c85",
  "quantity": 2
}
```

**Response (200 OK):**

```json
{
  "message": "Item added to cart successfully",
  "cart": {
    "_id": "60d21b4667d0d8992e610c87",
    "user": "60d21b4667d0d8992e610c85",
    "items": [...],
    "totalPrice": 39.98
  }
}
```

#### Update cart item quantity

```http
PUT /cart/update/:productId
```

**Request Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "quantity": 3
}
```

**Response (200 OK):**

```json
{
  "message": "Cart updated successfully",
  "cart": {
    "_id": "60d21b4667d0d8992e610c87",
    "user": "60d21b4667d0d8992e610c85",
    "items": [...],
    "totalPrice": 59.97
  }
}
```

#### Remove item from cart

```http
DELETE /cart/remove/:productId
```

**Request Headers:**

```
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "message": "Item removed from cart successfully",
  "cart": {
    "_id": "60d21b4667d0d8992e610c87",
    "user": "60d21b4667d0d8992e610c85",
    "items": [...],
    "totalPrice": 0
  }
}
```

### Orders

#### Create a new order

```http
POST /orders
```

**Request Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "shippingAddress": "123 Main St, New York, NY 10001",
  "discountCode": "SUMMER20"
}
```

**Response (201 Created):**

```json
{
  "message": "Order placed successfully",
  "order": {
    "_id": "60d21b4667d0d8992e610c89",
    "user": "60d21b4667d0d8992e610c85",
    "items": [...],
    "subtotalAmount": 59.97,
    "discountCode": "SUMMER20",
    "discountAmount": 12.00,
    "totalAmount": 47.97,
    "shippingAddress": "123 Main St, New York, NY 10001",
    "status": "pending",
    "createdAt": "2023-01-18T12:00:00.000Z"
  }
}
```

#### Get user orders

```http
GET /orders
```

**Request Headers:**

```
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "orders": [...]
}
```

#### Get order by ID

```http
GET /orders/:id
```

**Request Headers:**

```
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "order": {
    "_id": "60d21b4667d0d8992e610c89",
    "user": {
      "_id": "60d21b4667d0d8992e610c85",
      "name": "User Name",
      "email": "user@example.com"
    },
    "items": [...],
    "subtotalAmount": 59.97,
    "discountCode": "SUMMER20",
    "discountAmount": 12.00,
    "totalAmount": 47.97,
    "shippingAddress": "123 Main St, New York, NY 10001",
    "status": "pending",
    "createdAt": "2023-01-18T12:00:00.000Z"
  }
}
```

### Discounts

#### Validate a discount code

```http
POST /discount/validate
```

**Request Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "code": "SUMMER20",
  "cartTotal": 100.0
}
```

**Response (200 OK):**

```json
{
  "valid": true,
  "discountCode": "SUMMER20",
  "discountType": "percentage",
  "discountValue": 20,
  "discountAmount": 20.0
}
```

#### Create a discount code (Admin only)

```http
POST /discount
```

**Request Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "code": "WINTER30",
  "discountType": "percentage",
  "value": 30,
  "minPurchase": 50,
  "maxUses": 100,
  "validUntil": "2023-12-31T23:59:59.999Z",
  "active": true
}
```

**Response (201 Created):**

```json
{
  "message": "Discount code created successfully",
  "discount": {
    "_id": "60d21b4667d0d8992e610c90",
    "code": "WINTER30",
    "discountType": "percentage",
    "value": 30,
    "minPurchase": 50,
    "maxUses": 100,
    "usedCount": 0,
    "validUntil": "2023-12-31T23:59:59.999Z",
    "active": true
  }
}
```

#### Get all discount codes (Admin only)

```http
GET /discount
```

**Response (200 OK):**

```json
{
  "discounts": [...]
}
```

#### Update a discount code (Admin only)

```http
PUT /discount/:id
```

**Request Body:**

```json
{
  "value": 25,
  "active": false
}
```

**Response (200 OK):**

```json
{
  "message": "Discount code updated successfully",
  "discount": {
    "_id": "60d21b4667d0d8992e610c90",
    "code": "WINTER30",
    "discountType": "percentage",
    "value": 25,
    "minPurchase": 50,
    "maxUses": 100,
    "usedCount": 0,
    "validUntil": "2023-12-31T23:59:59.999Z",
    "active": false
  }
}
```

#### Delete a discount code (Admin only)

```http
DELETE /discount/:id
```

**Response (200 OK):**

```json
{
  "message": "Discount code deleted successfully"
}
```

### Reviews

#### Get reviews for a product

```http
GET /review/product/:productId
```

**Response (200 OK):**

```json
{
  "count": 2,
  "ratingAverage": 4.5,
  "reviews": [
    {
      "_id": "60d21b4667d0d8992e610c91",
      "user": {
        "email": "user@example.com"
      },
      "product": "60d21b4667d0d8992e610c85",
      "rating": 5,
      "review": "Great product!",
      "title": "Love it!",
      "createdAt": "2023-01-20T12:00:00.000Z"
    }
  ]
}
```

#### Create or update a review

```http
POST /review/product/:productId
```

**Request Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "rating": 5,
  "review": "Great product, highly recommended!",
  "title": "Amazing purchase"
}
```

**Response (201 Created):**

```json
{
  "message": "Review created successfully",
  "review": {
    "_id": "60d21b4667d0d8992e610c91",
    "user": "60d21b4667d0d8992e610c85",
    "product": "60d21b4667d0d8992e610c85",
    "rating": 5,
    "review": "Great product, highly recommended!",
    "title": "Amazing purchase"
  }
}
```

#### Get all reviews by current user

```http
GET /review/user/me
```

**Request Headers:**

```
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "count": 3,
  "reviews": [...]
}
```

#### Delete a review

```http
DELETE /review/:reviewId
```

**Request Headers:**

```
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "message": "Review deleted successfully"
}
```

## Error Responses

All endpoints may return the following error responses:

**400 Bad Request**

```json
{
  "error": "Error message explaining what went wrong"
}
```

**401 Unauthorized**

```json
{
  "message": "Unauthorized: Invalid token format"
}
```

**403 Forbidden**

```json
{
  "message": "Forbidden: Insufficient permissions"
}
```

**404 Not Found**

```json
{
  "error": "Resource not found"
}
```

**500 Server Error**

```json
{
  "error": "Server error message"
}
```

## Technologies Used

- Node.js
- Express.js
- MongoDB with Mongoose
- JSON Web Tokens (JWT) for authentication
- Express Validator for input validation
- Nodemailer for email notifications
- RESTful API design
