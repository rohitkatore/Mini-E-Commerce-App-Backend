const nodemailer = require('nodemailer');

// Create transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify transporter connection configuration on startup
transporter.verify()
  .then(() => console.log('Email service is ready to send messages'))
  .catch(error => console.log('Error with email service:', error));

// Format currency for use in emails
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
};

/**
 * Send order confirmation email to user
 * @param {Object} userEmail - Email address of the recipient
 * @param {Object} order - Order details
 * @param {Array} products - Array of products in the order with details
 * @returns {Promise} - Email sending result
 */
const sendOrderConfirmation = async (userEmail, order, products) => {
  try {
    // Generate items HTML for the email
    const itemsHtml = products.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.title}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${formatCurrency(item.price)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${formatCurrency(item.price * item.quantity)}</td>
      </tr>
    `).join('');

    // Generate email content
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Thank you for your order!</h2>
        <p>Hi there,</p>
        <p>We're pleased to confirm that your order has been received and is being processed.</p>
        
        <h3>Order Details:</h3>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
        <p><strong>Shipping Address:</strong> ${order.shippingAddress}</p>
        
        <h3>Order Summary:</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="background-color: #f8f9fa;">
            <th style="padding: 10px; text-align: left;">Product</th>
            <th style="padding: 10px; text-align: left;">Quantity</th>
            <th style="padding: 10px; text-align: left;">Price</th>
            <th style="padding: 10px; text-align: left;">Total</th>
          </tr>
          ${itemsHtml}
        </table>
        
        <div style="margin-top: 20px; text-align: right;">
          <p><strong>Subtotal:</strong> ${formatCurrency(order.subtotalAmount)}</p>
          ${order.discountAmount > 0 ? `<p><strong>Discount:</strong> -${formatCurrency(order.discountAmount)}</p>` : ''}
          <p style="font-size: 1.2em;"><strong>Total:</strong> ${formatCurrency(order.totalAmount)}</p>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p>If you have any questions regarding your order, please contact our customer service.</p>
          <p>Thanks for shopping with us!</p>
        </div>
      </div>
    `;

    // Send email
    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
      to: userEmail,
      subject: `Order Confirmation - Order #${order._id}`,
      html: htmlContent
    });

    console.log(`Order confirmation email sent to ${userEmail}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    throw error;
  }
};

module.exports = {
  sendOrderConfirmation
};
