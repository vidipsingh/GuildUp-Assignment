import { useState, useEffect } from "react";
import axios from "axios";

const Dashboard = () => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState("");
  const [receiverEmail, setReceiverEmail] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/wallet";
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchBalance();
    fetchTransactions();
  }, []);

  const fetchBalance = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}api/wallet/balance`, { headers: { Authorization: `Bearer ${token}` } });
      setBalance(res.data.balance);
    } catch (err) {
      alert("Error fetching balance: " + (err.response?.data?.message || err.message));
    }
    setLoading(false);
  };

  const fetchTransactions = async () => {
    try {
      const res = await axios.get(`${API_URL}api/wallet/transactions`, { headers: { Authorization: `Bearer ${token}` } });
      setTransactions(res.data);
    } catch (err) {
      alert("Error fetching transactions: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDeposit = async () => {
    if (!amount || amount <= 0) return alert("Please enter a valid amount");
    setLoading(true);
    try {
      const res = await axios.post(
        `${API_URL}api/wallet/deposit`,
        { amount: Number(amount), description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
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
    if (!amount || amount <= 0) return alert("Please enter a valid amount");
    setLoading(true);
    try {
      const res = await axios.post(
        `${API_URL}api/wallet/withdraw`,
        { amount: Number(amount), description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
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
    if (!amount || amount <= 0 || !receiverEmail) return alert("Please enter a valid amount and receiver email");
    setLoading(true);
    try {
      const res = await axios.post(
        `${API_URL}api/wallet/transfer`,
        { amount: Number(amount), receiverEmail, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBalance(res.data.balance);
      fetchTransactions();
      alert("Transfer successful!");
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || err.message));
    }
    setLoading(false);
    setAmount("");
    setReceiverEmail("");
    setDescription("");
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8 text-center">E-Wallet Dashboard</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-2">Current Balance</h2>
        <p className="text-3xl text-green-600">${loading ? "Loading..." : balance.toFixed(2)}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Deposit / Withdraw</h2>
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
              className="bg-green-500 text-white p-2 rounded hover:bg-green-600 flex-1"
            >
              {loading ? "Processing..." : "Deposit"}
            </button>
            <button
              onClick={handleWithdraw}
              disabled={loading}
              className="bg-red-500 text-white p-2 rounded hover:bg-red-600 flex-1"
            >
              {loading ? "Processing..." : "Withdraw"}
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Transfer Money</h2>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
            className="w-full p-2 mb-4 border rounded"
          />
          <input
            type="email"
            value={receiverEmail}
            onChange={(e) => setReceiverEmail(e.target.value)}
            placeholder="Receiver Email"
            className="w-full p-2 mb-4 border rounded"
          />
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="w-full p-2 mb-4 border rounded"
          />
          <button
            onClick={handleTransfer}
            disabled={loading}
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            {loading ? "Processing..." : "Transfer"}
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
        {transactions.length === 0 ? (
          <p className="text-gray-600">No transactions yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="py-2">Type</th>
                  <th className="py-2">Amount</th>
                  <th className="py-2">Description</th>
                  <th className="py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx._id} className="border-b">
                    <td className="py-2">{tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}</td>
                    <td className="py-2">${tx.amount.toFixed(2)}</td>
                    <td className="py-2">{tx.description || "N/A"}</td>
                    <td className="py-2 text-sm text-gray-500">{new Date(tx.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;