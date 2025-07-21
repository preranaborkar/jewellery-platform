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

module.exports = {
  generateOTP,
  sendOTPEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail
  
};