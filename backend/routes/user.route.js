import express from "express";
import {
  followUnfollowUser,
  getSuggestionUsers,
  getUserProfile,
} from "../controllers/user.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";
const router = express.Router();

router.get("/profile/:username", protectRoute, getUserProfile);
router.get("/suggested", protectRoute, getSuggestionUsers);
router.get("/follow/:id", protectRoute, followUnfollowUser);
// router.get("/update",protectRoute,getUserProfile);

export default router;
