import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser"; // Add cookie-parser
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
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Add cookie parser middleware

// Test Routes
app.get("/", (req, res) => res.send("Hello World!"));
app.get("/health", (req, res) => res.status(200).json({ status: "OK" }));

// Connect to DB
db();

// API Routes
app.use("/api/v1/users", userRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : "Server error",
    success: false
  });
});

// Handle 404 routes
app.use("*", (req, res) => {
  res.status(404).json({
    message: "Route not found",
    success: false
  });
});

// Start Server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});