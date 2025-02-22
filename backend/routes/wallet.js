const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const authMiddleware = require("../middleware/authMiddleware");

// Get balance
router.get("/balance", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ balance: user.balance });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Deposit
router.post("/deposit", authMiddleware, async (req, res) => {
  const { amount, description } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ message: "Invalid amount" });

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.balance += amount;
    await user.save();

    const transaction = await Transaction.create({
      senderId: req.user.id,
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
router.post("/withdraw", authMiddleware, async (req, res) => {
  const { amount, description } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ message: "Invalid amount" });

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.balance < amount) return res.status(400).json({ message: "Insufficient funds" });

    user.balance -= amount;
    await user.save();

    const transaction = await Transaction.create({
      senderId: req.user.id,
      amount,
      type: "withdrawal",
      description,
    });

    res.json({ balance: user.balance, transaction });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Transfer
router.post("/transfer", authMiddleware, async (req, res) => {
  const { amount, receiverEmail, description } = req.body;
  if (!amount || amount <= 0 || !receiverEmail) {
    return res.status(400).json({ message: "Amount and receiver email are required" });
  }

  try {
    const sender = await User.findById(req.user.id);
    const receiver = await User.findOne({ email: receiverEmail });
    if (!sender || !receiver) return res.status(404).json({ message: "User not found" });
    if (sender.balance < amount) return res.status(400).json({ message: "Insufficient funds" });
    if (sender._id.equals(receiver._id)) return res.status(400).json({ message: "Cannot transfer to yourself" });

    sender.balance -= amount;
    receiver.balance += amount;
    await sender.save();
    await receiver.save();

    const transaction = await Transaction.create({
      senderId: req.user.id,
      receiverId: receiver._id,
      amount,
      type: "transfer",
      description,
    });

    res.json({ balance: sender.balance, transaction });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all transactions
router.get("/transactions", authMiddleware, async (req, res) => {
  try {
    const transactions = await Transaction.find({
      $or: [{ senderId: req.user.id }, { receiverId: req.user.id }],
    });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get transaction by ID
router.get("/transactions/:id", authMiddleware, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ message: "Transaction not found" });
    if (!transaction.senderId.equals(req.user.id) && !transaction.receiverId?.equals(req.user.id)) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;