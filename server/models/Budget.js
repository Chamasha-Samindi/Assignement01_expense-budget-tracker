const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      required: true,
      unique: true, // එක Category එකකට එක Budget limit එකක් පමණක් තබා ගැනීමට
      trim: true,
    },
    limit: {
      type: Number,
      required: true,
    },
    month: {
      type: String,
      default: () => new Date().toISOString().slice(0, 7), // උදා: "2026-10"
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Budget", budgetSchema);