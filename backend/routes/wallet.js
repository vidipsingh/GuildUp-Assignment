const express = require("express");
const router = express.Router();
const mongoose = require("mongoose"); // Import mongoose for ObjectId
const User = require("../models/User");
const Transaction = require("../models/Transaction");

// Use a valid ObjectId for the dummy user
const DUMMY_USER_ID = new mongoose.Types.ObjectId("507f1f77bcf86cd799439011"); // Hardcoded valid ObjectId

// Get balance
router.get("/balance", async (req, res) => {
  try {
    let user = await User.findOne({ _id: DUMMY_USER_ID });
    if (!user) {
      user = await User.create({
        _id: DUMMY_USER_ID, // Explicitly set the _id
        username: "demo",
        email: "demo@example.com",
        balance: 1000, // Starting balance
      });
    }
    res.json({ balance: user.balance });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Deposit
router.post("/deposit", async (req, res) => {
  const { amount, description } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ message: "Invalid amount" });

  try {
    const user = await User.findById(DUMMY_USER_ID);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.balance += amount;
    await user.save();

    const transaction = await Transaction.create({
      senderId: DUMMY_USER_ID,
      amount,
      type: "deposit",
      description,
    });

    res.json({ balance: user.balance, transaction });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Withdraw
router.post("/withdraw", async (req, res) => {
  const { amount, description } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ message: "Invalid amount" });

  try {
    const user = await User.findById(DUMMY_USER_ID);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.balance < amount) return res.status(400).json({ message: "Insufficient funds" });

    user.balance -= amount;
    await user.save();

    const transaction = await Transaction.create({
      senderId: DUMMY_USER_ID,
      amount,
      type: "withdrawal",
      description,
    });

    res.json({ balance: user.balance, transaction });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Transfer (to self for demo)
router.post("/transfer", async (req, res) => {
  const { amount, description } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ message: "Invalid amount" });

  try {
    const user = await User.findById(DUMMY_USER_ID);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.balance < amount) return res.status(400).json({ message: "Insufficient funds" });

    user.balance -= amount;
    await user.save();

    const transaction = await Transaction.create({
      senderId: DUMMY_USER_ID,
      receiverId: DUMMY_USER_ID, // Self-transfer for demo
      amount,
      type: "transfer",
      description,
    });

    res.json({ balance: user.balance, transaction });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get transactions
router.get("/transactions", async (req, res) => {
  try {
    const transactions = await Transaction.find({
      $or: [{ senderId: DUMMY_USER_ID }, { receiverId: DUMMY_USER_ID }],
    });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;