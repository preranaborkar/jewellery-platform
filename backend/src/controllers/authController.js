// backend/src/controllers/authController.js
const { validationResult } = require('express-validator');
const User = require('../models/User');
const { generateOTP, sendOTPEmail, sendWelcomeEmail ,sendPasswordResetEmail} = require('../utils/emailService');
const { generateToken } = require('../utils/tokenService');
const { verifyGoogleToken } = require('../utils/googleAuth');
const crypto = require('crypto');

// Register new user
const register = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { firstName, lastName, email, password, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create new user
    const newUser = new User({
      firstName,
      lastName,
      email,
      password,
      phone,
      otp,
      otpExpiry,
      isVerified: false
    });

    await newUser.save();

    // Send OTP email
    try {
      await sendOTPEmail(email, otp, firstName);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Delete user if email fails
      await User.findByIdAndDelete(newUser._id);
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again.'
      });
    }

    // Generate token for the user (optional - for immediate login after verification)
    const token = generateToken(newUser._id, newUser.role);

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email for OTP verification.',
      data: {
        userId: newUser._id,
        email: newUser.email,
        fullName: newUser.fullName,
        isVerified: newUser.isVerified
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};



// Verify OTP
const verifyOTP = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, otp } = req.body;

    // Find user with email and include OTP fields
    const user = await User.findOne({ email }).select('+otp +otpExpiry');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email'
      });
    }

    // Check if user is already verified
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'User is already verified'
      });
    }

    // Check if OTP exists
    if (!user.otp) {
      return res.status(400).json({
        success: false,
        message: 'No OTP found. Please request a new OTP.'
      });
    }

    // Check if OTP is expired
    if (user.otpExpiry < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new OTP.'
      });
    }

    // Verify OTP
    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please check and try again.'
      });
    }

    // Update user as verified and clear OTP fields
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    user.lastLogin = new Date();
    
    await user.save();

    // Send welcome email
    try {
      await sendWelcomeEmail(user.email, user.firstName);
    } catch (emailError) {
      console.error('Welcome email sending failed:', emailError);
      // Don't fail the verification if welcome email fails
    }

    // Generate new token
    const token = generateToken(user._id,user.role);

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.status(200).json({
      success: true,
      message: 'Email verified successfully. Welcome to Jewelry Store!',
      data: {
        userId: user._id,
        email: user.email,
        fullName: user.fullName,
        isVerified: user.isVerified,
        role: user.role
      }
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};


const login = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password, rememberMe } = req.body;

    // Find user with email and include password field
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in.'
      });
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      // Increment login attempts
      await user.incLoginAttempts();
      
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    

    // Generate token
    const tokenExpiry = rememberMe ? '7d' : '1d';
    console.log(user.role);
    const token = generateToken(user._id, user.role,tokenExpiry);

    // Set cookie
    const cookieMaxAge = rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: cookieMaxAge
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        userId: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isVerified: user.isVerified,
        lastLogin: user.lastLogin,
        avatar: user.avatar,
        token: token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};


const googleLogin = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { token } = req.body;

    // Verify Google token
    const googleVerification = await verifyGoogleToken(token);
    
    if (!googleVerification.success) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Google token'
      });
    }

    const { googleId, email, firstName, lastName, avatar, emailVerified } = googleVerification.data;

    // Check if user exists with this email
    let user = await User.findOne({ email });

    if (user) {
      // User exists - Link Google account if not already linked
      if (!user.googleId) {
        user.googleId = googleId;
        user.avatar = avatar || user.avatar;
        user.isVerified = emailVerified || user.isVerified;
        user.lastLogin = new Date();
        await user.save();
      } else if (user.googleId !== googleId) {
        return res.status(400).json({
          success: false,
          message: 'This email is already associated with a different Google account'
        });
      } else {
        // Update last login and avatar
        user.lastLogin = new Date();
        user.avatar = avatar || user.avatar;
        await user.save();
      }
    } else {
      // Create new user with Google account
      user = new User({
        firstName,
        lastName,
        email,
        googleId,
        avatar,
        isVerified: emailVerified,
        isActive: true,
        lastLogin: new Date()
      });

      await user.save();

      // Send welcome email
      try {
        await sendWelcomeEmail(user.email, user.firstName);
      } catch (emailError) {
        console.error('Welcome email sending failed:', emailError);
        // Don't fail the login if welcome email fails
      }
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Generate token
    const jwtToken = generateToken(user._id,user.role);

    // Set cookie
    res.cookie('token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.status(200).json({
      success: true,
      message: user.isNew ? 'Account created and logged in successfully' : 'Login successful',
      data: {
        userId: user._id,
        email: user.email,
        fullName: user.fullName,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
        lastLogin: user.lastLogin,
        avatar: user.avatar,
        loginMethod: 'google'
      }
    });

  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Add this function to link Google account to existing user
const linkGoogleAccount = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { token } = req.body;
    const userId = req.user.id; // From auth middleware

    // Verify Google token
    const googleVerification = await verifyGoogleToken(token);
    
    if (!googleVerification.success) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Google token'
      });
    }

    const { googleId, email, avatar } = googleVerification.data;

    // Get current user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if Google account is already linked to another user
    const existingGoogleUser = await User.findOne({ googleId });
    
    if (existingGoogleUser && existingGoogleUser._id.toString() !== userId) {
      return res.status(400).json({
        success: false,
        message: 'This Google account is already linked to another user'
      });
    }

    // Check if the Google email matches the user's email
    if (email !== user.email) {
      return res.status(400).json({
        success: false,
        message: 'Google account email does not match your account email'
      });
    }

    // Link Google account
    user.googleId = googleId;
    user.avatar = avatar || user.avatar;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Google account linked successfully',
      data: {
        userId: user._id,
        email: user.email,
        fullName: user.fullName,
        avatar: user.avatar,
        hasGoogleAccount: true
      }
    });

  } catch (error) {
    console.error('Link Google account error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Add this function to unlink Google account
const unlinkGoogleAccount = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware

    // Get current user
    const user = await User.findById(userId).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user has a password (prevent unlinking if no password set)
    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: 'Cannot unlink Google account. Please set a password first.'
      });
    }

    // Check if Google account is linked
    if (!user.googleId) {
      return res.status(400).json({
        success: false,
        message: 'No Google account is linked to this user'
      });
    }

    // Unlink Google account
    user.googleId = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Google account unlinked successfully',
      data: {
        userId: user._id,
        email: user.email,
        fullName: user.fullName,
        hasGoogleAccount: false
      }
    });

  } catch (error) {
    console.error('Unlink Google account error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Forgot Password
const forgotPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email } = req.body;

    // Find user
    const user = await User.findOne({ email });
    
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.status(200).json({
        success: true,
        message: 'If an account with this email exists, a password reset OTP has been sent.'
      });
    }


    // Generate OTP and reset token
    const otp = generateOTP();
    const resetToken = crypto.randomBytes(32).toString('hex');
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save reset token and OTP
    user.passwordResetToken = resetToken;
    user.passwordResetExpiry = otpExpiry;
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    
    await user.save();

    // Send OTP email
    try {
      await sendPasswordResetEmail(email, otp, user.firstName);
    } catch (emailError) {
      console.error('Password reset email sending failed:', emailError);
      
      // Clear reset fields if email fails
      user.passwordResetToken = undefined;
      user.passwordResetExpiry = undefined;
      user.otp = undefined;
      user.otpExpiry = undefined;
      await user.save();
      
      return res.status(500).json({
        success: false,
        message: 'Failed to send password reset email. Please try again.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Password reset OTP sent to your email address.',
      data: {
        resetToken: resetToken // Send this to frontend for next step
      }
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { resetToken, otp, newPassword } = req.body;

    // Find user with reset token
    const user = await User.findOne({
      passwordResetToken: resetToken,
      passwordResetExpiry: { $gt: Date.now() }
    }).select('+passwordResetToken +passwordResetExpiry +otp +otpExpiry');

    console.log(user);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Verify OTP
    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // Check if OTP is expired
    if (user.otpExpiry < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new password reset.'
      });
    }

    // Update password and clear reset fields
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpiry = undefined;
    user.otp = undefined;
    user.otpExpiry = undefined;
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now login with your new password.'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Change Password (for logged-in users)
const changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Find user and include password
    const user = await User.findById(userId).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user has a password (Google OAuth users might not have password)
    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: 'No password is set for this account. Please use "Set Password" instead.'
      });
    }

    // Verify current password
    const isCurrentPasswordCorrect = await user.comparePassword(currentPassword);
    
    if (!isCurrentPasswordCorrect) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Check if new password is different from current
    const isSamePassword = await user.comparePassword(newPassword);
    
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from current password'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Logout
const logout = async (req, res) => {
  try {
    // Clear the token cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};


const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find user and populate addresses and wishlist
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prepare response data
    const responseData = {
      userId: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role,
      isVerified: user.isVerified,
     address: user.address,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      hasPassword: !!user.password,
      wishlist: user.wishlist || [],
      
    };

    res.status(200).json({
      success: true,
      message: 'Profile fetched successfully',
      data: responseData
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
// Update your module.exports to include all functions
module.exports = {
  register,
  verifyOTP,
  login,
  googleLogin,
  linkGoogleAccount,
  unlinkGoogleAccount,
  forgotPassword,
  resetPassword,
  changePassword,
  logout,
  getProfile
};


