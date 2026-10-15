const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");
const auth = require("../middleware/auth"); // Middleware එක එකතු කිරීම

// 1. තමන්ගේ transactions පමණක් ලබාගැනීම
router.get("/", auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. අලුත් transaction එකක් තමන්ගේ නමට save කිරීම
router.post("/", auth, async (req, res) => {
  try {
    const { title, amount, type, category, date, note } = req.body;
    const newTransaction = new Transaction({
      userId: req.user.id, // User ID එක ඇතුළත් කිරීම
      title,
      amount,
      type,
      category,
      date,
      note,
    });
    const savedTransaction = await newTransaction.save();
    res.status(201).json(savedTransaction);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 3. තමන්ගේ transaction එකක් මකා දැමීම
router.delete("/:id", auth, async (req, res) => {
  try {
    await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: "Transaction deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;