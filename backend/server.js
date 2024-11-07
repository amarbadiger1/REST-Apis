import express from "express";
import dotenv from "dotenv";
import colors from "colors";
import cookieParser from "cookie-parser";

import userRoutes from "./routes/user.route.js";
import authRoutes from "./routes/auth.route.js";
import { connMongoDB } from "./config/db.js";

dotenv.config();
const app = express();

// Middleware for JSON parsing
app.use(express.json()); // Add this if you are working with JSON data in requests
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/auth/", authRoutes);
app.use("/api/user/", userRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is up and running on port ${PORT}`);
  connMongoDB();
});
