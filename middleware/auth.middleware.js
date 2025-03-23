// /middleware/auth.middleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

/**
 * Authentication middleware to protect routes
 */
export const protect = async (req, res, next) => {
  try {
    let token;
    
    // Get token from header or cookies
    if (
      req.headers.authorization && 
      req.headers.authorization.startsWith("Bearer")
    ) {
      // Token from header
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.token) {
      // Token from cookie
      token = req.cookies.token;
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        message: "You are not logged in. Please log in to access this resource",
        success: false
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by id
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        message: "The user for this token no longer exists",
        success: false
      });
    }

    // Set user in request
    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        message: "Invalid token. Please log in again",
        success: false
      });
    }
    
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Your token has expired. Please log in again",
        success: false
      });
    }
    
    res.status(500).json({
      message: "Authentication failed",
      error: error.message,
      success: false
    });
  }
};

/**
 * Role-based authorization middleware
 * @param  {...string} roles - Allowed roles
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "You do not have permission to perform this action",
        success: false
      });
    }
    next();
  };
};