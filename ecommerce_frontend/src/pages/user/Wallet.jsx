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
    <div className="max-w-4xl mx-auto p-3 sm:p-6 lg:py-12">
      <h1 className="text-2xl sm:text-4xl font-black mb-6 sm:mb-8 tracking-tighter uppercase italic">Wallet Hub</h1>

      <div className="grid lg:grid-cols-2 gap-4 lg:gap-8 lg:items-start">
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-gray-900 to-black text-white p-6 sm:p-10 rounded-[2rem] sm:rounded-[32px] shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 sm:p-8 opacity-10 group-hover:scale-150 transition-transform duration-700">
             <div className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-white rounded-full"></div>
          </div>
          
          <div className="relative z-10">
            <p className="text-gray-400 uppercase tracking-widest text-[8px] sm:text-xs font-black mb-1 sm:mb-2 italic">Current Wealth</p>
            <h2 className="text-3xl sm:text-6xl font-black italic tracking-tighter uppercase">₹ {balance.toLocaleString()}</h2>
            
            <div className="mt-8 sm:mt-12">
              <div className="bg-white/5 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-white/10 backdrop-blur-md">
                 <p className="text-[10px] sm:text-sm font-bold flex items-center gap-2">
                   <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                   ✨ 2% Instant Cashback
                 </p>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Form Card */}
        <div className="bg-white p-5 sm:p-10 rounded-[2rem] sm:rounded-[32px] shadow-sm border border-gray-100">
          {/* Custom Tabs */}
          <div className="flex p-1 bg-gray-100 rounded-xl sm:rounded-2xl mb-6 sm:mb-8 text-center">
            <button 
              onClick={() => { setActiveTab("deposit"); setAmount(""); }}
              className={`flex-1 py-2 sm:py-3 text-[9px] sm:text-xs font-black uppercase tracking-widest rounded-lg sm:rounded-xl transition-all ${activeTab === 'deposit' ? 'bg-white text-black shadow-sm' : 'text-gray-400'}`}
            >
              Deposit
            </button>
            <button 
              onClick={() => { setActiveTab("withdraw"); setAmount(""); }}
              className={`flex-1 py-2 sm:py-3 text-[9px] sm:text-xs font-black uppercase tracking-widest rounded-lg sm:rounded-xl transition-all ${activeTab === 'withdraw' ? 'bg-white text-black shadow-sm' : 'text-gray-400'}`}
            >
              Withdraw
            </button>
          </div>

          <p className="text-[10px] sm:text-xs font-bold text-gray-400 mb-5 sm:mb-6 uppercase tracking-widest leading-loose">
            {activeTab === 'deposit' 
              ? "Top up your balance for transactions." 
              : "Withdraw funds to original source."}
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-1.5 sm:mb-2 italic">Transfer Amount (₹)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-gray-400 text-sm">₹</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-3 sm:py-4 bg-gray-50 border border-gray-100 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-4 focus:ring-black/5 transition font-black text-sm sm:text-lg"
                />
              </div>
            </div>

            {activeTab === 'deposit' && (
              <div className="flex flex-wrap gap-1.5">
                {[500, 1000, 2000, 5000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAmount(amt)}
                    className="px-3 py-1.5 text-[8px] sm:text-[10px] font-black uppercase tracking-widest bg-gray-50 border border-gray-100 rounded-lg hover:bg-black hover:text-white transition-all active:scale-90"
                  >
                    +₹{amt}
                  </button>
                ))}
              </div>
            )}

            <button
              disabled={processing}
              className={`w-full py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] transition-all shadow-xl ${
                processing 
                  ? "bg-gray-100 text-gray-400" 
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

      <div className="mt-8 sm:mt-12 bg-gray-50 p-4 sm:p-6 rounded-2xl border border-dashed border-gray-300">
        <h4 className="font-black text-xs sm:text-sm uppercase tracking-widest mb-3">Wallet Benefits</h4>
        <ul className="text-[10px] sm:text-sm text-gray-500 space-y-2 font-bold">
          <li className="flex items-center gap-2">
             ✨ 2% cashback as credit on every order instantly.
          </li>
          <li className="flex items-center gap-2">
             ⚡ Lightning fast checkouts with one-tap payment.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Wallet;
