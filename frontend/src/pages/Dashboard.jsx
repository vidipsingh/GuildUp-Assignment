import React, { useState, useEffect } from "react";
import axios from "axios";

const Dashboard = () => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  // Backend API URL (replace with your deployed backend URL later)
  const API_URL = "http://localhost:5000/api/wallet";

  // Fetch balance and transactions on mount
  useEffect(() => {
    fetchBalance();
    fetchTransactions();
  }, []);

  const fetchBalance = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/balance`);
      setBalance(res.data.balance);
    } catch (err) {
      alert("Error fetching balance: " + (err.response?.data?.message || err.message));
    }
    setLoading(false);
  };

  const fetchTransactions = async () => {
    try {
      const res = await axios.get(`${API_URL}/transactions`);
      setTransactions(res.data);
    } catch (err) {
      alert("Error fetching transactions: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDeposit = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/deposit`, { amount: Number(amount), description });
      setBalance(res.data.balance);
      fetchTransactions();
      alert("Deposit successful!");
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || err.message));
    }
    setLoading(false);
    setAmount("");
    setDescription("");
  };

  const handleWithdraw = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/withdraw`, { amount: Number(amount), description });
      setBalance(res.data.balance);
      fetchTransactions();
      alert("Withdrawal successful!");
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || err.message));
    }
    setLoading(false);
    setAmount("");
    setDescription("");
  };

  const handleTransfer = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/transfer`, { amount: Number(amount), description });
      setBalance(res.data.balance);
      fetchTransactions();
      alert("Transfer successful!");
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || err.message));
    }
    setLoading(false);
    setAmount("");
    setDescription("");
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">E-Wallet Dashboard</h1>

      {/* Balance */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold">Current Balance</h2>
        <p className="text-2xl text-green-600">${loading ? "Loading..." : balance.toFixed(2)}</p>
      </div>

      {/* Transaction Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Manage Funds</h2>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          className="w-full p-2 mb-4 border rounded"
        />
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="w-full p-2 mb-4 border rounded"
        />
        <div className="flex space-x-4">
          <button
            onClick={handleDeposit}
            disabled={loading}
            className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
          >
            {loading ? "Processing..." : "Deposit"}
          </button>
          <button
            onClick={handleWithdraw}
            disabled={loading}
            className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
          >
            {loading ? "Processing..." : "Withdraw"}
          </button>
          <button
            onClick={handleTransfer}
            disabled={loading}
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            {loading ? "Processing..." : "Transfer"}
          </button>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
        {transactions.length === 0 ? (
          <p>No transactions yet.</p>
        ) : (
          <ul>
            {transactions.map((tx) => (
              <li key={tx._id} className="border-b py-2">
                <p>
                  <strong>{tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}</strong> - ${tx.amount.toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">{tx.description || "No description"}</p>
                <p className="text-sm text-gray-500">{new Date(tx.timestamp).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Dashboard;