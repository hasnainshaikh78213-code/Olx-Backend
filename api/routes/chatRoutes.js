import express from "express";
import {
  startChat,
  getAllChats,
  sendMessage,
  getChatById,
  getAllChatsForAdmin,
} from "../controllers/chatController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/start", protect, startChat);
router.get("/all", protect, getAllChats);
router.post("/send", protect, sendMessage);
router.get("/:id", protect, getChatById);
router.get("/admin/all", getAllChatsForAdmin);



export default router;
