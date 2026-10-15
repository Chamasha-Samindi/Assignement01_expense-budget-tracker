const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// 1. අලුත් පරිශීලකයෙක් ලියාපදිංචි කිරීම (Register)
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Email එක දැනටමත් තියෙනවාදැයි බැලීම
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    // Password එක Hash (encrypt) කිරීම
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // අලුත් User කෙනෙක් හැදීම
    user = new User({ name, email, password: hashedPassword });
    await user.save();

    // JWT Token එක හැදීම
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "30d" });

    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. පරිශීලකයා Login වීම (Login)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // User ව database එකෙන් සෙවීම
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    // Password එක ගැලපෙනවාදැයි බැලීම
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    // JWT Token එක හැදීම
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "30d" });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;