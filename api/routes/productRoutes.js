import express from "express";
import multer from "multer";
import {
  addProduct,
  getAllProducts,
  getUserProducts,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { getProductById } from "../controllers/productController.js";


const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Routes
// router.get("/all", protect, getAllProducts);
router.get("/all", getAllProducts);
router.get("/", protect, getUserProducts);
router.post("/add", protect, upload.array("images", 5), addProduct);
router.put("/update/:id", protect, upload.array("images", 5), updateProduct);
router.delete("/delete/:id", protect, deleteProduct);
router.get("/:id", getProductById);


export default router;
