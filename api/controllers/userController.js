import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ==================== Signup ====================
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ msg: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const isAdmin = email === "developers@gmail.com";

    const newUser = new User({ name, email, password: hashedPassword, isAdmin });
    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, isAdmin: newUser.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    //  Send full avatar URL (if any)
    const userWithFullAvatar = {
      ...newUser._doc,
      avatar: newUser.avatar
        ? `${req.protocol}://${req.get("host")}/${newUser.avatar.replace(/\\/g, "/")}`
        : null,
    };

    res.status(201).json({
      msg: "User created successfully",
      token,
      user: userWithFullAvatar,
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// ==================== Login ====================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, email: user.email, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    //  Include full avatar URL
    const userWithFullAvatar = {
      ...user._doc,
      avatar: user.avatar
        ? `${req.protocol}://${req.get("host")}/${user.avatar.replace(/\\/g, "/")}`
        : null,
    };

    res.json({ msg: "Login successful", token, user: userWithFullAvatar });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// ==================== Get Profile ====================
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    //  Always send complete avatar URL
    const userWithFullAvatar = {
      ...user._doc,
      avatar: user.avatar
        ? `${req.protocol}://${req.get("host")}/${user.avatar.replace(/\\/g, "/")}`
        : null,
    };

    res.json(userWithFullAvatar);
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==================== Update Profile ====================
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.username = req.body.username || user.username;

    //  Update image if provided
    if (req.file) {
      user.avatar = req.file.path;
    }

    const updatedUser = await user.save();

    //  Return full avatar URL
    const userWithFullAvatar = {
      ...updatedUser._doc,
      avatar: updatedUser.avatar
        ? `${req.protocol}://${req.get("host")}/${updatedUser.avatar.replace(/\\/g, "/")}`
        : null,
    };

    res.json(userWithFullAvatar);
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
