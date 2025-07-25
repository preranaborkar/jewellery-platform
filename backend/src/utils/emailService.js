// backend/src/utils/emailService.js
const nodemailer = require('nodemailer');

// Generate random OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail', // or your email service
    auth: {
      user: process.env.EMAIL_USER, // your email
      pass: process.env.EMAIL_PASS  // your app password
    }
  });
};

// Send OTP email
const sendOTPEmail = async (email, otp, firstName) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: {
        name: 'Jewelry Store',
        address: process.env.EMAIL_USER
      },
      to: email,
      subject: 'Verify Your Email - Jewelry Store',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #d4af37; margin: 0;">Jewelry Store</h1>
            <p style="color: #666; margin: 5px 0;">Luxury Jewelry Collection</p>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 10px; text-align: center;">
            <h2 style="color: #333; margin-bottom: 20px;">Welcome ${firstName}!</h2>
            <p style="color: #666; margin-bottom: 30px;">Thank you for registering with Jewelry Store. Please verify your email address to complete your registration.</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #333; margin-bottom: 10px; font-size: 16px;">Your verification code is:</p>
              <h1 style="color: #d4af37; font-size: 36px; margin: 10px 0; letter-spacing: 4px;">${otp}</h1>
              <p style="color: #999; font-size: 14px;">This code will expire in 10 minutes</p>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">If you didn't request this verification, please ignore this email.</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px;">© 2024 Jewelry Store. All rights reserved.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('OTP email sent successfully to:', email);
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw error;
  }
};

// Send welcome email
const sendWelcomeEmail = async (email, firstName) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: {
        name: 'Jewelry Store',
        address: process.env.EMAIL_USER
      },
      to: email,
      subject: 'Welcome to Jewelry Store - Your Account is Ready!',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #d4af37; margin: 0;">Jewelry Store</h1>
            <p style="color: #666; margin: 5px 0;">Luxury Jewelry Collection</p>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 10px;">
            <h2 style="color: #333; margin-bottom: 20px; text-align: center;">Welcome to Our Family, ${firstName}! 🎉</h2>
            
            <p style="color: #666; margin-bottom: 20px;">Your email has been successfully verified and your account is now active. You can now:</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <ul style="color: #333; line-height: 1.6;">
                <li>Browse our exquisite jewelry collection</li>
                <li>Add items to your wishlist</li>
                <li>Enjoy secure and fast checkout</li>
                <li>Track your orders in real-time</li>
                <li>Get exclusive offers and updates</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/shop" style="background: #d4af37; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Start Shopping</a>
            </div>
            
            <p style="color: #666; font-size: 14px; text-align: center;">If you have any questions, feel free to contact our support team.</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px;">© 2024 Jewelry Store. All rights reserved.</p>
            <p style="color: #999; font-size: 12px;">
              <a href="${process.env.FRONTEND_URL}/contact" style="color: #d4af37; text-decoration: none;">Contact Us</a> | 
              <a href="${process.env.FRONTEND_URL}/terms" style="color: #d4af37; text-decoration: none;">Terms</a> | 
              <a href="${process.env.FRONTEND_URL}/privacy" style="color: #d4af37; text-decoration: none;">Privacy</a>
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully to:', email);
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
};



const sendPasswordResetEmail = async (email, otp, firstName) => {
  try {
     const transporter = createTransporter();
    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to: email,
      subject: 'Password Reset - Jewelry Store',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
          <p>Hello ${firstName},</p>
          <p>We received a request to reset your password for your Jewelry Store account.</p>
          <p>Your password reset OTP is:</p>
          <div style="background: #f4f4f4; padding: 20px; text-align: center; border-radius: 5px; margin: 20px 0;">
            <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
          </div>
          <p>This OTP is valid for 10 minutes only.</p>
          <p>If you didn't request this password reset, please ignore this email.</p>
          <p>Best regards,<br>Jewelry Store Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully');
  } catch (error) {
    console.error('Password reset email sending error:', error);
    throw error;
  }
};


// Email templates
const getOrderConfirmationTemplate = (order) => {
    const formatCurrency = (amount) => `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    
    const productsHTML = order.products.map(item => `
        <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 15px; vertical-align: top;">
                <img src="${item.product.image[0] || ''}" alt="${item.product.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;">
            </td>
            <td style="padding: 15px; vertical-align: top;">
                <h4 style="margin: 0 0 8px 0; color: #333;">${item.product.name}</h4>
                <p style="margin: 0; color: #666; font-size: 14px;">Quantity: ${item.quantity}</p>
            </td>
            <td style="padding: 15px; text-align: right; vertical-align: top;">
                <strong style="color: #333;">${formatCurrency(item.price * item.quantity)}</strong>
            </td>
        </tr>
    `).join('');

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Order Confirmation</title>
        </head>
        <body style="font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="margin: 0; font-size: 28px;">Order Confirmed!</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Thank you for your purchase</p>
            </div>
            
            <div style="background: #fff; padding: 30px; border: 1px solid #eee; border-top: none;">
                <div style="margin-bottom: 30px;">
                    <h2 style="color: #333; margin-bottom: 15px;">Hello ${order.user.firstName}!</h2>
                    <p style="margin: 0; color: #666; font-size: 16px;">
                        Your order has been confirmed and we're getting it ready for you. 
                        ${order.paymentMethod === 'cod' ? 'You have chosen Cash on Delivery as your payment method.' : 'Your payment has been successfully processed.'}
                    </p>
                </div>

                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                    <h3 style="margin: 0 0 15px 0; color: #333;">Order Details</h3>
                    <table style="width: 100%; margin-bottom: 15px;">
                        <tr>
                            <td style="padding: 5px 0;"><strong>Order Number:</strong></td>
                            <td style="padding: 5px 0; text-align: right;">${order.orderNumber || order._id}</td>
                        </tr>
                        <tr>
                            <td style="padding: 5px 0;"><strong>Order Date:</strong></td>
                            <td style="padding: 5px 0; text-align: right;">${new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                        </tr>
                        <tr>
                            <td style="padding: 5px 0;"><strong>Payment Method:</strong></td>
                            <td style="padding: 5px 0; text-align: right; text-transform: uppercase;">${order.paymentMethod}</td>
                        </tr>
                    </table>
                </div>

                <div style="margin-bottom: 30px;">
                    <h3 style="color: #333; margin-bottom: 20px;">Items Ordered</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        ${productsHTML}
                    </table>
                </div>

                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                    <h3 style="margin: 0 0 15px 0; color: #333;">Order Summary</h3>
                    <table style="width: 100%;">
                        <tr>
                            <td style="padding: 5px 0;">Subtotal:</td>
                            <td style="padding: 5px 0; text-align: right;">${formatCurrency(order.subtotal || order.totalAmount)}</td>
                        </tr>
                        ${order.tax ? `<tr><td style="padding: 5px 0;">Tax (18% GST):</td><td style="padding: 5px 0; text-align: right;">${formatCurrency(order.tax)}</td></tr>` : ''}
                        ${order.shipping ? `<tr><td style="padding: 5px 0;">Shipping:</td><td style="padding: 5px 0; text-align: right;">${order.shipping === 0 ? 'Free' : formatCurrency(order.shipping)}</td></tr>` : ''}
                        <tr style="border-top: 2px solid #333; font-size: 18px; font-weight: bold;">
                            <td style="padding: 15px 0 5px 0;">Total:</td>
                            <td style="padding: 15px 0 5px 0; text-align: right;">${formatCurrency(order.totalAmount)}</td>
                        </tr>
                    </table>
                </div>

                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                    <h3 style="margin: 0 0 15px 0; color: #333;">Delivery Address</h3>
                    <p style="margin: 0; line-height: 1.5;">
                        ${order.billingAddress.street}<br>
                        ${order.billingAddress.city}, ${order.billingAddress.state}<br>
                        ${order.billingAddress.zipCode}, ${order.billingAddress.country}
                    </p>
                </div>

                <div style="text-align: center; margin-top: 30px;">
                    <p style="color: #666; margin-bottom: 20px;">
                        We'll send you shipping confirmation when your items are on the way!
                    </p>
                    <div style="background: #667eea; color: white; padding: 15px 30px; border-radius: 25px; display: inline-block;">
                        <strong>Estimated Delivery: 3-5 Business Days</strong>
                    </div>
                </div>

                <div style="border-top: 1px solid #eee; padding-top: 30px; margin-top: 30px; text-align: center;">
                    <p style="color: #666; margin-bottom: 15px;">
                        Questions about your order? Contact us at <a href="mailto:support@example.com" style="color: #667eea; text-decoration: none;">support@example.com</a>
                    </p>
                    <p style="color: #999; font-size: 14px; margin: 0;">
                        This email was sent to ${order.user.email}. You're receiving this because you placed an order with us.
                    </p>
                </div>
            </div>
        </body>
        </html>
    `;
};

// Send order confirmation email
const sendOrderConfirmation = async (order) => {
    const transporter = createTransporter();
    
    if (!transporter) {
        console.log('Email service not configured. Skipping order confirmation email.');
        return { success: false, message: 'Email service not configured' };
    }

    try {
        const mailOptions = {
            from: `"${process.env.EMAIL_FROM_NAME || 'Your Store'}" <${process.env.EMAIL_USER}>`,
            to: order.user.email,
            subject: `Order Confirmation - #${order.orderNumber || order._id}`,
            html: getOrderConfirmationTemplate(order)
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Order confirmation email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending order confirmation email:', error);
        return { success: false, error: error.message };
    }
};

// Send order status update email
const sendOrderStatusUpdate = async (order, newStatus) => {
    const transporter = createTransporter();
    
    if (!transporter) {
        console.log('Email service not configured. Skipping status update email.');
        return { success: false, message: 'Email service not configured' };
    }

    const statusMessages = {
        processing: 'Your order is being processed',
        shipped: 'Your order has been shipped',
        delivered: 'Your order has been delivered',
        cancelled: 'Your order has been cancelled'
    };

    const statusColors = {
        processing: '#ffa726',
        shipped: '#42a5f5',
        delivered: '#66bb6a',
        cancelled: '#ef5350'
    };

    try {
        const mailOptions = {
            from: `"${process.env.EMAIL_FROM_NAME || 'Your Store'}" <${process.env.EMAIL_USER}>`,
            to: order.user.email,
            subject: `Order Update - #${order.orderNumber || order._id}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Order Status Update</title>
                </head>
                <body style="font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: ${statusColors[newStatus] || '#667eea'}; color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                        <h1 style="margin: 0; font-size: 28px;">Order Update</h1>
                        <p style="margin: 10px 0 0 0; opacity: 0.9;">${statusMessages[newStatus] || 'Order status updated'}</p>
                    </div>
                    
                    <div style="background: #fff; padding: 30px; border: 1px solid #eee; border-top: none; border-radius: 0 0 10px 10px;">
                        <div style="margin-bottom: 30px;">
                            <h2 style="color: #333; margin-bottom: 15px;">Hello ${order.user.firstName}!</h2>
                            <p style="margin: 0; color: #666; font-size: 16px;">
                                We wanted to update you on your recent order.
                            </p>
                        </div>

                        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                            <h3 style="margin: 0 0 15px 0; color: #333;">Order Information</h3>
                            <table style="width: 100%;">
                                <tr>
                                    <td style="padding: 5px 0;"><strong>Order Number:</strong></td>
                                    <td style="padding: 5px 0; text-align: right;">${order.orderNumber || order._id}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 5px 0;"><strong>Status:</strong></td>
                                    <td style="padding: 5px 0; text-align: right; color: ${statusColors[newStatus] || '#667eea'}; text-transform: uppercase; font-weight: bold;">${newStatus}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 5px 0;"><strong>Total Amount:</strong></td>
                                    <td style="padding: 5px 0; text-align: right;">₹${order.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                </tr>
                            </table>
                        </div>

                        <div style="text-align: center; margin-top: 30px;">
                            <p style="color: #666; margin-bottom: 15px;">
                                Questions about your order? Contact us at <a href="mailto:support@example.com" style="color: #667eea; text-decoration: none;">support@example.com</a>
                            </p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Order status update email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending order status update email:', error);
        return { success: false, error: error.message };
    }
};


module.exports = {
  generateOTP,
  sendOTPEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendOrderConfirmation,
  sendOrderStatusUpdate,
  getOrderConfirmationTemplate

  
};