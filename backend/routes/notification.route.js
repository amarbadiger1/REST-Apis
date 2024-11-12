import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  deleteNotification,
  deleteOneNotification,
  getNotification,
} from "../controllers/notification.controller.js";
const router = express.Router();

router.get("/", protectRoute, getNotification);
router.delete("/", protectRoute, deleteNotification);
router.delete("/:id", protectRoute, deleteOneNotification);

export default router;
