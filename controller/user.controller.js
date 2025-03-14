// controllers/user.controller.js
import User from "../models/User.model.js";

const registerUser = async (req, res) => {
  res.send("User registered successfully");
};

const loginUser = async (req, res) => {
  res.send("User logged in successfully");
};

export { registerUser, loginUser };