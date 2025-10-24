import express from "express";
import Cart from "../models/cart.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

//  Add to Cart 
router.post("/add", protect, async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user._id;

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, products: [{ productId }] });
    } else {
      // Prevent duplicate
      const exists = cart.products.some(
        (p) => p.productId.toString() === productId
      );
      if (!exists) {
        cart.products.push({ productId });
      }
    }

    await cart.save();
    cart = await cart.populate("products.productId");
    res.status(200).json(cart);
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

//  Get Cart
router.get("/", protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id }).populate(
      "products.productId"
    );
    if (!cart) return res.status(200).json({ products: [] });
    res.status(200).json(cart);
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

//  Remove Item
router.post("/remove", protect, async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user._id;

    let cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.products = cart.products.filter(
      (p) => p.productId.toString() !== productId
    );

    await cart.save();
    cart = await cart.populate("products.productId");
    res.status(200).json(cart);
  } catch (error) {
    console.error("Remove item error:", error);
    res.status(500).json({ message: "Server error while removing item" });
  }
});

//  Checkout
router.post("/checkout", protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart || cart.products.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }


    await cart.save();
    res.status(200).json({ message: "Checkout successful" });
  } catch (error) {
    console.error("Checkout error:", error);
    res.status(500).json({ message: "Server error during checkout" });
  }
});


export default router;
