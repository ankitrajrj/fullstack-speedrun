import User from "../models/User.model.js";
import crypto from "crypto";
import { sendVerificationEmail, sendPasswordResetEmail } from "../utils/emailService.js";
import jwt from "jsonwebtoken";

/**
 * Create and send JWT token in response with cookie
 */
const createSendToken = (user, statusCode, res) => {
  // Generate JWT token
  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );

  // Set cookie options
  const cookieOptions = {
    expires: new Date(
      Date.now() + (process.env.COOKIE_EXPIRES_IN || 1) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, // Cannot be accessed or modified by browser
    secure: process.env.NODE_ENV === "production", // Only sent on HTTPS in production
  };

  // Set JWT as cookie
  res.cookie("token", token, cookieOptions);

  // Return response
  res.status(statusCode).json({
    message: "Success",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    success: true
  });
};

/**
 * Register a new user
 * @route POST /api/v1/users/register
 */
const registerUser = async (req, res) => {
  // Get User Data
  const { name, email, password } = req.body;

  // Validate
  if (!name || !email || !password) {
    return res.status(400).json({
      message: "All fields are required",
      success: false
    });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
        success: false
      });
    }

    // Create a user in database
    const user = await User.create({
      name,
      email,
      password,
    });

    if (!user) {
      return res.status(400).json({
        message: "User registration failed",
        success: false
      });
    }

    // Create a verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    user.verificationToken = verificationToken;
    await user.save();

    try {
      // Send verification email
      await sendVerificationEmail(user.email, verificationToken);
      
      res.status(201).json({
        message: "User registered successfully. Please check your email to verify your account.",
        verificationToken:verificationToken,
        success: true,
      });
    } catch (emailError) {
      console.error("Email sending error:", emailError);
      
      // Still return success for registration, but with a different message
      res.status(201).json({
        message: "User registered successfully, but email verification failed. Please contact support.",
        verificationUrl: `${process.env.BASE_URL}/api/v1/users/verify/${verificationToken}`, // Include this for testing only
        success: true,
      });
    }
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      message: "User registration failed",
      error: error.message,
      success: false
    });
  }
};

/**
 * Login user
 * @route POST /api/v1/users/login
 */
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Validate
  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required",
      success: false
    });
  }

  try {
    // Find user
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
        success: false
      });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(401).json({
        message: "Please verify your email before logging in",
        success: false
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid credentials",
        success: false
      });
    }

    // Send token
    createSendToken(user, 200, res);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Login failed",
      error: error.message,
      success: false
    });
  }
};

/**
 * Logout user
 * @route GET /api/v1/users/logout
 */
const logoutUser = (req, res) => {
  res.cookie("token", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000), // 10 seconds
    httpOnly: true
  });

  res.status(200).json({
    message: "Logged out successfully",
    success: true
  });
};

/**
 * Get current user
 * @route GET /api/v1/users/me
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false
      });
    }

    res.status(200).json({
      message: "User fetched successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt
      },
      success: true
    });
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({
      message: "Failed to fetch user",
      error: error.message,
      success: false
    });
  }
};

/**
 * Forgot password
 * @route POST /api/v1/users/forgot-password
 */
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      message: "Email is required",
      success: false
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      // For security reasons, don't reveal that the user doesn't exist
      return res.status(200).json({
        message: "If a user with that email exists, a password reset link has been sent",
        success: true
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    try {
      // Send password reset email
      await sendPasswordResetEmail(user.email, resetToken);

      res.status(200).json({
        message: "Password reset link sent to your email",
        success: true
      });
    } catch (emailError) {
      console.error("Reset email sending error:", emailError);
      
      // Reset the token if email fails
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      
      res.status(500).json({
        message: "Failed to send password reset email",
        error: emailError.message,
        success: false
      });
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      message: "Failed to process password reset request",
      error: error.message,
      success: false
    });
  }
};

/**
 * Reset password
 * @route POST /api/v1/users/reset-password/:token
 */
const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!token || !password) {
    return res.status(400).json({
      message: "Token and new password are required",
      success: false
    });
  }

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        message: "Password reset token is invalid or has expired",
        success: false
      });
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Auto login after password reset (optional)
    createSendToken(user, 200, res);
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      message: "Failed to reset password",
      error: error.message,
      success: false
    });
  }
};

/**
 * Update user profile
 * @route PATCH /api/v1/users/update-profile
 */
const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;

    // Check if fields to update are allowed
    const allowedFields = { name: name || req.user.name };

    const user = await User.findByIdAndUpdate(
      req.user.id,
      allowedFields,
      {
        new: true,
        runValidators: true
      }
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false
      });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      success: true
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      message: "Failed to update profile",
      error: error.message,
      success: false
    });
  }
};

/**
 * Verify user email
 * @route GET /api/v1/users/verify/:token
 */
const verifyUser = async (req, res) => {
  const { token } = req.params;

  if (!token) {
    return res.status(400).json({
      message: "Verification token is required",
      success: false
    });
  }

  try {
    // Find user by verification token
    const user = await User.findOne({
      verificationToken: token
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid verification token",
        success: false
      });
    }

    // Mark user as verified and clear the token
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({
      message: "Your email has been successfully verified",
      success: true
    });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({
      message: "Email verification failed",
      error: error.message,
      success: false
    });
  }
};

export { 
  registerUser, 
  loginUser, 
  logoutUser,
  getMe, 
  verifyUser, 
  forgotPassword, 
  resetPassword,
  updateProfile
};