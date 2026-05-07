import React, { useState } from "react";
import { useWallet } from "../../context/WalletContext";
import { ScaleLoader } from "react-spinners";
import toast from "react-hot-toast";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import StripePaymentForm from "../../components/StripePaymentForm";
import API from "../../api";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowDown, FaArrowUp, FaUndo, FaStar, FaSearch, FaFilter, FaHistory, FaCheckCircle, FaFileInvoice } from "react-icons/fa";

const stripePromise = loadStripe("pk_test_51T8B300RRLfV2lf2WlmhAXONTdX3zuDP234y2H52YPdAcppz9y22MDQXvddiQRt0YNNkwU9AUrCVmt6ifindUFbb00jyFPyGku");


const Wallet = () => {
  const { balance, loading, transactions, fetchingTransactions, fetchTransactions, addFunds, withdrawFunds } = useWallet();
  const [amount, setAmount] = useState("");
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("deposit"); // deposit | withdraw
  const [clientSecret, setClientSecret] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return toast.error("Enter a valid amount");

    setProcessing(true);
    try {
      if (activeTab === "deposit") {
        try {
          const res = await API.post("/payment/create-intent", { amount: Number(amount) });
          setClientSecret(res.data.clientSecret);
        } catch (err) {
          toast.error("Failed to initiate payment");
        }
      } else {
        try {
          if (Number(amount) > balance) {
            toast.error("Insufficient balance");
            return;
          }
          await withdrawFunds(Number(amount));
          setAmount("");
        } catch (err) {
          // toast shown in context
        }
      }
    } catch (err) {
      console.error("Wallet Action Error:", err);
    } finally {
      setProcessing(false);
    }
  };

  const handleStripeSuccess = async () => {
    try {
      setProcessing(true);
      await addFunds(Number(amount));
      setAmount("");
      setClientSecret(null);
    } catch (err) {
      toast.error("Success confirmed but sync failed. Please refresh.");
    } finally {
      setProcessing(false);
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          tx.id.toLowerCase().includes(searchQuery.toLowerCase());
    const txType = tx.type?.toLowerCase();
    const isCredit = ['deposit', 'refund', 'cashback', 'credit'].includes(txType);
    const isDebit = ['withdraw', 'debit'].includes(txType);
    
    if (filterType === "credits") return matchesSearch && isCredit;
    if (filterType === "debits") return matchesSearch && isDebit;
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <ScaleLoader color="#4F46E5" />
        <p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Loading Secure Ledger...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 lg:py-16 bg-white min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
        <div>
          <h1 className="text-4xl sm:text-6xl font-black mb-2 tracking-tighter uppercase italic leading-none">Wallet</h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] ml-1 flex items-center gap-2">
            <span className="w-2 h-2 bg-indigo-500 rounded-full"></span> 
            Secure Financial Archive
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 mb-16">
        {/* Balance Card */}
        <div className="lg:col-span-12 xl:col-span-5">
          <div className="bg-black text-white p-8 sm:p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden h-full flex flex-col justify-between">
            {/* Background patterns */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-600/10 rounded-full -ml-24 -mb-24 blur-3xl"></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-12">
                <div>
                  <p className="text-gray-500 uppercase tracking-widest text-[10px] font-black mb-3 italic">Account Balance</p>
                  <h2 className="text-5xl sm:text-7xl font-black italic tracking-tighter uppercase leading-none">₹ {balance.toLocaleString()}</h2>
                </div>
                <div className="w-12 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-md shadow-lg shadow-indigo-500/20"></div>
              </div>
              
              <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
                <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400">
                  <FaStar className="text-sm" />
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-white">Elite Rewards Active</p>
                  <p className="text-[9px] font-bold text-gray-500 uppercase tracking-tighter">Earn 2% instant cashback on all terminal acquisitions</p>
                </div>
              </div>
            </div>

            <div className="mt-12 flex items-center gap-2 text-[8px] font-black text-gray-500 uppercase tracking-widest italic">
              <FaCheckCircle className="text-green-500" /> System Synchronized • Live
            </div>
          </div>
        </div>

        {/* Transaction Form Card */}
        <div className="lg:col-span-12 xl:col-span-7">
          <div className="bg-white p-8 sm:p-12 rounded-[2.5rem] shadow-xl border border-gray-100 flex flex-col h-full">
            <div className="flex p-1.5 bg-gray-50 rounded-2xl mb-10 text-center border border-gray-100">
              <button 
                onClick={() => { setActiveTab("deposit"); setAmount(""); }}
                className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'deposit' ? 'bg-white text-black shadow-lg ring-1 ring-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Deposit Funds
              </button>
              <button 
                onClick={() => { setActiveTab("withdraw"); setAmount(""); }}
                className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'withdraw' ? 'bg-white text-black shadow-lg ring-1 ring-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Withdrawal
              </button>
            </div>
            
            <AnimatePresence mode="wait">
              {clientSecret ? (
                <motion.div 
                  key="stripe"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex-grow"
                >
                   <div className="flex items-center gap-3 mb-8">
                     <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                        <FaHistory />
                     </div>
                     <div>
                       <h2 className="text-2xl font-black uppercase italic tracking-tighter leading-none">Gateway</h2>
                       <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Stripe Secure Endpoint</p>
                     </div>
                   </div>
                   
                   <Elements stripe={stripePromise} options={{ clientSecret }}>
                     <StripePaymentForm 
                       amount={amount} 
                       onCancel={() => setClientSecret(null)} 
                       onSuccess={handleStripeSuccess}
                     />
                   </Elements>
                </motion.div>
              ) : (
                <motion.form 
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onSubmit={handleSubmit} 
                  className="space-y-8 flex-grow flex flex-col justify-center"
                >
                  <div>
                    <div className="flex justify-between items-end mb-4">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest italic">Amount Selection (INR)</label>
                      <span className="text-[10px] font-bold text-gray-300">0.0% Processing Fee</span>
                    </div>
                    <div className="relative group">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-gray-300 text-2xl group-focus-within:text-black transition-colors">₹</span>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-12 pr-6 py-6 bg-gray-50 border-2 border-transparent rounded-[2rem] focus:outline-none focus:border-black/5 focus:bg-white transition-all font-black text-3xl placeholder-gray-200"
                      />
                    </div>
                  </div>

                  {activeTab === 'deposit' && (
                    <div className="flex overflow-x-auto gap-3 pb-2 custom-scrollbar no-scrollbar">
                      {[500, 1000, 2000, 5000].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setAmount(amt)}
                          className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest border-2 rounded-xl transition-all shrink-0 ${amount == amt ? 'bg-black text-white border-black shadow-lg shadow-black/10 scale-105' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'}`}
                        >
                          +₹{amt}
                        </button>
                      ))}
                    </div>
                  )}

                  <button
                    disabled={processing}
                    className={`w-full py-6 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] transition-all shadow-xl active:scale-[0.98] ${
                      processing 
                        ? "bg-gray-100 text-gray-400" 
                        : activeTab === 'deposit' 
                          ? "bg-black text-white hover:shadow-black/20"
                          : "bg-red-600 text-white hover:bg-red-700 shadow-red-100"
                    }`}
                  >
                    {processing ? "Executing Transaction..." : activeTab === 'deposit' ? "Initiate Deposit" : "Confirm Withdrawal"}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Transaction History Section */}
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tighter leading-tight flex items-center gap-2">
               Transaction Ledger
               <span className="inline-block w-2 H-2 bg-indigo-500 rounded-full"></span>
            </h3>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">{transactions.length} verified records in archive</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-grow sm:flex-grow-0">
               <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-sm" />
               <input 
                 type="text" 
                 placeholder="SEARCH HASH / DESC..." 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="pl-10 pr-6 py-3 bg-gray-50 border border-gray-100 rounded-full text-[9px] font-black uppercase tracking-[0.15em] focus:outline-none focus:ring-4 focus:ring-indigo-50 transition-all min-w-[240px] w-full"
               />
            </div>
            <button 
              onClick={fetchTransactions} 
              className="p-3 bg-white border border-gray-100 rounded-full text-gray-400 hover:text-black hover:bg-gray-50 transition-all hover:rotate-180 duration-500"
            >
              <FaHistory className="text-sm" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 p-1 bg-gray-50 rounded-2xl w-fit border border-gray-100">
           {['all', 'credits', 'debits'].map((type) => (
             <button
               key={type}
               onClick={() => setFilterType(type)}
               className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${filterType === type ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
             >
               {type}
             </button>
           ))}
        </div>

        {/* Improved Ledger UI */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
          {/* Header for Desktop */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-10 py-6 bg-gray-50/50 border-b border-gray-100 italic">
             <div className="col-span-5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Transaction Metadata</div>
             <div className="col-span-2 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Status</div>
             <div className="col-span-3 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">Reference Date</div>
             <div className="col-span-2 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">Net Value</div>
          </div>

          <div className="divide-y divide-gray-50">
            {fetchingTransactions ? (
               <div className="py-32 flex flex-col items-center justify-center">
                 <ScaleLoader color="#E5E7EB" height={20} />
                 <p className="mt-4 text-[9px] font-black text-gray-300 uppercase tracking-[0.3em] italic">Synchronizing Logs...</p>
               </div>
            ) : filteredTransactions.length === 0 ? (
               <div className="py-40 flex flex-col items-center justify-center text-center px-4">
                 <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 mb-6">
                    <FaFileInvoice className="text-3xl" />
                 </div>
                 <h4 className="text-lg font-black uppercase italic tracking-tighter text-gray-300">Archive Nullified</h4>
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">No matching records found in this vector</p>
               </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {filteredTransactions.map((tx, idx) => {
                  const txType = tx.type?.toLowerCase();
                  const isCredit = ['deposit', 'refund', 'cashback', 'credit'].includes(txType);
                  const iconColor = isCredit ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100';
                  const TxIcon = isCredit ? FaArrowDown : FaArrowUp;
                  const Icon = txType === 'refund' ? FaUndo : (txType === 'cashback' ? FaStar : TxIcon);
                  
                  return (
                    <motion.div 
                      key={tx.id} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group p-6 sm:p-10 flex flex-col md:grid md:grid-cols-12 md:items-center gap-6 md:gap-4 hover:bg-gray-50/80 transition-all"
                    >
                      {/* Desc and Icon */}
                      <div className="col-span-5 flex items-center gap-5 sm:gap-8">
                        <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-[1.25rem] flex items-center justify-center shrink-0 border-2 transition-transform group-hover:scale-110 group-hover:rotate-3 ${iconColor}`}>
                          <Icon className="text-base sm:text-xl" />
                        </div>
                        <div className="min-w-0">
                          <p className={`text-[8px] sm:text-[9px] font-black uppercase tracking-[0.25em] mb-1.5 ${isCredit ? 'text-green-600' : 'text-red-500'}`}>
                            {txType} 
                          </p>
                          <h4 className="text-gray-900 font-extrabold text-sm sm:text-lg leading-none uppercase tracking-tight truncate group-hover:text-black transition-colors">{tx.description}</h4>
                          <p className="text-[7px] sm:text-[8px] font-black text-gray-300 uppercase tracking-widest mt-2 font-mono truncate">HASH: {tx.id.substring(0, 16).toUpperCase()}...</p>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="col-span-2 md:text-center order-3 md:order-2">
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50/50 text-indigo-600 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest border border-indigo-100 shadow-sm">
                           <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-[0_0_8px_indigo]"></span>
                           Confirmed
                        </span>
                      </div>

                      {/* Date */}
                      <div className="col-span-3 md:text-right order-2 md:order-3">
                        <p className="text-[10px] sm:text-[12px] text-gray-800 font-black uppercase leading-tight italic">
                           {new Date(tx.date).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                        <p className="text-[8px] sm:text-[9px] text-gray-400 font-bold mt-1 uppercase tracking-widest leading-none">
                           {new Date(tx.date).toLocaleTimeString("en-GB", { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </p>
                      </div>

                      {/* Amount */}
                      <div className="col-span-2 text-right order-1 md:order-4">
                        <p className={`text-xl sm:text-3xl font-black italic tracking-tighter leading-none ${isCredit ? 'text-black' : 'text-gray-400'}`}>
                          {isCredit ? '+' : '-'}₹{tx.amount.toLocaleString()}
                        </p>
                        <p className={`text-[7px] sm:text-[8px] font-black uppercase tracking-widest mt-2 ${isCredit ? 'text-green-500' : 'text-gray-300'}`}>
                           {isCredit ? 'Verified Deposit' : 'Admin Approved'}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Security Footer */}
      <div className="mt-16 pt-12 border-t border-gray-100 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
         <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-black italic">Security Protocol</h4>
            <p className="text-[11px] font-bold text-gray-400 uppercase leading-relaxed">All ledger entries are immutable and cryptographically logged in the terminal database. Terminal logs are synced in real-time with central archives.</p>
         </div>
         <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-black italic">Cashback Logic</h4>
            <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
               <p className="text-[11px] font-black text-indigo-700 uppercase leading-tight">Elite Tier: 2.0% Automatic Credit</p>
               <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest mt-1">Applied on every wallet acquisition.</p>
            </div>
         </div>
         <div className="space-y-4 md:col-span-2 lg:col-span-1">
            <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-black italic">System Node</h4>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
               <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
               </div>
               <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Connection Status</p>
                  <p className="text-[10px] font-black text-black uppercase tracking-tight">Node 001 • Stable • Secured</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Wallet;
