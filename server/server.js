const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB Database එකට සම්බන්ධ වීම
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully!"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

const transactionRoutes = require("./routes/transactionRoutes");
app.use("/api/transactions", transactionRoutes);

const budgetRoutes = require("./routes/budgetRoutes");
app.use("/api/budgets", budgetRoutes);

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

  app.get("/", (req, res) => {
  res.json({
    message: "Expense & Budget Tracker API is running",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});


/*const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Expense & Budget Tracker API is running",
  });
});

const PORT = process.env.PORT || 5000;/8

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
*/