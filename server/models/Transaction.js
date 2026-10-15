const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    
    title: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["income", "expense"], // ආදායමක්ද වියදමක්ද යන්න
      required: true,
    },
    category: {
      type: String,
      required: true, // උදා: Food, Transport, Salary, Bills
    },
    date: {
      type: Date,
      default: Date.now,
    },
    note: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);