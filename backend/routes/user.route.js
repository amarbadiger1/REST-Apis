import express from "express";
import {
  followUnfollowUser,
  getSuggestionUsers,
  getUserProfile,
  updateProfile,
} from "../controllers/user.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";
const router = express.Router();

router.get("/profile/:username", protectRoute, getUserProfile);
router.get("/suggested", protectRoute, getSuggestionUsers);
router.get("/follow/:id", protectRoute, followUnfollowUser);
router.post("/update", protectRoute, updateProfile);

export default router;
