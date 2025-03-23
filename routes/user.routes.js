import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  verifyUser,
  forgotPassword,
  resetPassword,
  updateProfile
} from "../controllers/user.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logoutUser);
router.get("/verify/:token", verifyUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Protected routes
router.use(protect); // All routes after this middleware will be protected
router.get("/me", getMe);
router.patch("/update-profile", updateProfile);

export default router;