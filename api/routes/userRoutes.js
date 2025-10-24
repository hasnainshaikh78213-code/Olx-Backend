import express from "express";
import multer from "multer";
import {
  signup,
  login,
  getProfile,
  updateProfile,
} from "../controllers/userController.js";
import User from "../models/User.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ==================== Multer setup for profile image ====================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// ==================== Auth Routes ====================
router.post("/signup", signup);
router.post("/login", login);

// ==================== Profile Routes ====================
router.get("/profile", protect, getProfile);
router.put("/profile", protect, upload.single("avatar"), updateProfile);

// ==================== Admin Protected (All Users) ====================
router.get("/", protect, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ msg: "Access denied, admin only" });
    }

    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err.message);
    res.status(500).json({ msg: "Error fetching users", error: err.message });
  }
});

export default router;
