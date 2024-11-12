import express from "express";
import {
  CommentOnPost,
  createPost,
  deletePost,
  getAllPosts,
  getFollowingPosts,
  getLikedPosts,
  getUserPost,
  likeUnlike,
} from "../controllers/post.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";
const router = express.Router();

//Routes
router.get("/all", protectRoute, getAllPosts);
router.get("/liked/:id", protectRoute, getLikedPosts);
router.get("following", protectRoute, getFollowingPosts);
router.get("user/:username", protectRoute, getUserPost);
router.get("/create", protectRoute, createPost);
router.get("/delete/:id", protectRoute, deletePost);
router.get("/comment/:id", protectRoute, CommentOnPost);
router.get("/like/:id", protectRoute, likeUnlike);

export default router;
