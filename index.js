// const express = require("express");
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import db from "./utils/db.js";

// import all routes

import userRoutes from "./routes/user.routes.js";

dotenv.config();

const app = express();
const port = process.env.port || 3000;

app.use(
  cors({
    origin: process.env.BASE_URL,
    credentials: true,
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json()); // hamne ishe bola ki json accept krlo
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/hitesh/ai", (req, res) => {
  res.send("Running Hitesh.ai");
});

app.get("/cohort", (req, res) => {
  res.send("Running Ankit.ai !");
});

// Connect to db
db();

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
