import React, { useState } from "react";
import { useWallet } from "../context/WalletContext";
import { ScaleLoader } from "react-spinners";
import toast from "react-hot-toast";

const Wallet = () => {
  const { balance, loading, addFunds } = useWallet();
  const [amount, setAmount] = useState("");
  const [adding, setAdding] = useState(false);

  const handleAddFunds = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return toast.error("Enter a valid amount");

    setAdding(true);
    try {
      await addFunds(Number(amount));
      setAmount("");
    } catch (err) {
      // toast shown in context
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ScaleLoader color="#000" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">My Wallet</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Balance Card */}
        <div className="bg-black text-white p-8 rounded-3xl shadow-xl flex flex-col justify-between">
          <div>
            <p className="text-gray-400 uppercase tracking-widest text-xs mb-2">Current Balance</p>
            <h2 className="text-5xl font-black italic">₹ {balance.toLocaleString()}</h2>
          </div>
          <div className="mt-8">
             <div className="bg-white/10 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
                <p className="text-sm font-medium">✨ 2% Cashback Active</p>
                <p className="text-xs text-gray-400 mt-1">Earn cashback on every purchase automatically!</p>
             </div>
          </div>
        </div>

        {/* Add Funds Form */}
        <div className="bg-white p-8 rounded-3xl shadow-md border border-gray-100">
          <h3 className="text-xl font-bold mb-4">Add Funds</h3>
          <p className="text-sm text-gray-500 mb-6">Top up your wallet balance instantly.</p>
          
          <form onSubmit={handleAddFunds} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Amount (₹)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount to add"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {[500, 1000, 2000, 5000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAmount(amt)}
                  className="px-3 py-1 text-sm border border-gray-200 rounded-full hover:bg-black hover:text-white transition"
                >
                  +₹{amt}
                </button>
              ))}
            </div>

            <button
              disabled={adding}
              className={`w-full py-4 rounded-xl font-bold text-white transition ${
                adding ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:opacity-90 active:scale-95"
              }`}
            >
              {adding ? "Adding Funds..." : "Add to Wallet"}
            </button>
          </form>
        </div>
      </div>

      <div className="mt-12 bg-gray-50 p-6 rounded-2xl border border-dashed border-gray-300">
        <h4 className="font-bold mb-2">Wallet Benefits</h4>
        <ul className="text-sm text-gray-600 space-y-2">
          <li className="flex items-center gap-2">
            <span className="text-green-500 font-bold">✓</span>
            Get 2% cashback as wallet balance on every order.
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-500 font-bold">✓</span>
            Faster checkout without entering payment details.
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-500 font-bold">✓</span>
            Easy refunds for cancelled orders (coming soon).
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Wallet;
