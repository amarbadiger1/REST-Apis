import { Router } from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  getme,
  login,
  logout,
  signup,
} from "../controllers/auth.controller.js";

const router = Router();

// Use POST for signup and login
router.get("/getme", protectRoute, getme);
router.post("/signup", signup);
router.post("/login", login);

// Logout can be GET or POST, depending on your preference
router.get("/logout", logout);

export default router;
