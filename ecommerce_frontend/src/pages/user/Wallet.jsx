import React, { useState } from "react";
import { useWallet } from "../../context/WalletContext";
import { ScaleLoader } from "react-spinners";
import toast from "react-hot-toast";

const Wallet = () => {
  const { balance, loading, addFunds, withdrawFunds } = useWallet();
  const [amount, setAmount] = useState("");
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("deposit"); // deposit | withdraw

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return toast.error("Enter a valid amount");

    setProcessing(true);
    try {
      if (activeTab === "deposit") {
        await addFunds(Number(amount));
      } else {
        if (Number(amount) > balance) {
          toast.error("Insufficient balance");
          return;
        }
        await withdrawFunds(Number(amount));
      }
      setAmount("");
    } catch (err) {
      // toast shown in context
    } finally {
      setProcessing(false);
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
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:py-12">
      <h1 className="text-3xl sm:text-4xl font-black mb-8 tracking-tighter uppercase italic">Wallet Hub</h1>

      <div className="grid lg:grid-cols-2 gap-8 lg:items-start">
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-gray-900 to-black text-white p-8 sm:p-10 rounded-[32px] shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-150 transition-transform duration-700">
             <div className="w-32 h-32 border-4 border-white rounded-full"></div>
          </div>
          
          <div className="relative z-10">
            <p className="text-gray-400 uppercase tracking-widest text-[10px] sm:text-xs font-black mb-2 italic">Current Wealth</p>
            <h2 className="text-5xl sm:text-6xl font-black italic tracking-tighter">₹ {balance.toLocaleString()}</h2>
            
            <div className="mt-12">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
                 <p className="text-xs sm:text-sm font-bold flex items-center gap-2">
                   <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                   ✨ 2% Instant Cashback Active
                 </p>
                 <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-wider">Applied to every purchase</p>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Form Card */}
        <div className="bg-white p-6 sm:p-10 rounded-[32px] shadow-sm border border-gray-100">
          {/* Custom Tabs */}
          <div className="flex p-1 bg-gray-100 rounded-2xl mb-8">
            <button 
              onClick={() => { setActiveTab("deposit"); setAmount(""); }}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'deposit' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Deposit
            </button>
            <button 
              onClick={() => { setActiveTab("withdraw"); setAmount(""); }}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'withdraw' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Withdraw
            </button>
          </div>

          <p className="text-xs font-bold text-gray-400 mb-6 uppercase tracking-widest leading-loose">
            {activeTab === 'deposit' 
              ? "Top up your balance for lightning fast checkouts." 
              : "Withdraw your funds back to your original source."}
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-2 italic">Transfer Amount (₹)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-gray-400">₹</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-black/5 transition font-black text-lg"
                />
              </div>
            </div>

            {activeTab === 'deposit' && (
              <div className="flex flex-wrap gap-2">
                {[500, 1000, 2000, 5000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAmount(amt)}
                    className="px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-gray-50 border border-gray-100 rounded-xl hover:bg-black hover:text-white transition-all active:scale-90"
                  >
                    +₹{amt}
                  </button>
                ))}
              </div>
            )}

            <button
              disabled={processing}
              className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl ${
                processing 
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                  : activeTab === 'deposit' 
                    ? "bg-black text-white hover:opacity-90 active:scale-95 shadow-black/10"
                    : "bg-red-600 text-white hover:bg-red-700 active:scale-95 shadow-red-100"
              }`}
            >
              {processing ? "Processing..." : activeTab === 'deposit' ? "Confirm Deposit" : "Confirm Withdrawal"}
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
