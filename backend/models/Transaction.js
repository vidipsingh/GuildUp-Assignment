const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  amount: { type: Number, required: true },
  type: { type: String, enum: ["deposit", "withdrawal", "transfer"], required: true },
  status: { type: String, default: "completed" },
  timestamp: { type: Date, default: Date.now },
  description: { type: String },
});

module.exports = mongoose.model("Transaction", transactionSchema);