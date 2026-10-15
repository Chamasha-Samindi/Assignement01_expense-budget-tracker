const express = require("express");
const router = express.Router();
const Budget = require("../models/Budget");
const auth = require("../middleware/auth");

// 1. තමන්ගේ Budgets පමණක් ලබාගැනීම
router.get("/", auth, async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.user.id });
    res.json(budgets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. තමන්ගේ Budget එකක් දැමීම හෝ Update කිරීම
router.post("/", auth, async (req, res) => {
  try {
    const { category, limit, month } = req.body;
    const budget = await Budget.findOneAndUpdate(
      { category, userId: req.user.id }, // User ID එකෙන් සෙවීම
      { limit, month, userId: req.user.id },
      { new: true, upsert: true }
    );
    res.status(201).json(budget);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 3. තමන්ගේ Budget එකක් මකා දැමීම
router.delete("/:id", auth, async (req, res) => {
  try {
    await Budget.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: "Budget deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;