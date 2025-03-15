// const express = require("express");
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import db from "./utils/db.js";
//import all routes
import userRoutes from "./routes/user.routes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(
  cors({
    origin: process.env.BASE_URL,
    credentials: true,
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test Routes
app.get("/", (req, res) => res.send("Hello World!"));
app.get("/hitesh", (req, res) => res.send("Running Hitesh.ai"));
app.get("/cohort", (req, res) => res.send("Running Ankit.ai !"));

// Connect to DB
db();

// API Routes
app.use("/api/v1/users/", userRoutes);

// Start Server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
