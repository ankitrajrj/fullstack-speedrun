// routes/user.routes.js
import express from "express";
import {
  registerUser,
  loginUser,
  verifyUser,
} from "../controllers/user.controller.js";

const router = express.Router();

router.post("/register", registerUser);
router.get("/verify/:token", verifyUser);
router.get("/login", loginUser);

export default router;
