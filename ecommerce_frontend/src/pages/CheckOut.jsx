import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useWallet } from "../context/WalletContext";
import toast from "react-hot-toast";
import API from "../api";

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const { balance, fetchBalance } = useWallet();
  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const cashback = Math.floor(total * 0.02);

  const [modalOpen, setModalOpen] = useState(false);
  const [isWalletChecked, setIsWalletChecked] = useState(false);
  const [walletAmount, setWalletAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Default wallet amount to balance or total when toggled
  useEffect(() => {
    if (isWalletChecked) {
      setWalletAmount(Math.min(balance, total));
    } else {
      setWalletAmount(0);
    }
  }, [isWalletChecked, balance, total]);

  const remainingAmount = total - walletAmount;

  const handlePlaceOrder = async () => {
    if (walletAmount > balance) {
      return toast.error("Entered wallet amount exceeds your balance!");
    }
    if (walletAmount > total) {
      return toast.error("Wallet amount cannot exceed order total!");
    }

    setLoading(true);
    try {
      await API.post("/orders", {
        items: cart,
        total,
        walletAmountUsed: walletAmount,
      });

      toast.success(
        `Order placed! Earned ₹${cashback} cashback.`
      );
      clearCart();
      fetchBalance(); // Refresh wallet balance
      navigate("/order-placed");
    } catch (err) {
      console.error("Error placing order:", err);
      toast.error(err.response?.data?.error || "Failed to place order.");
    } finally {
      setLoading(false);
      setModalOpen(false);
    }
  };

  if (cart.length === 0)
    return <p className="text-center mt-20 text-gray-500">No items in checkout.</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      {/* Order Summary */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <h2 className="text-lg font-bold mb-4 border-b pb-2">Order Summary</h2>
        {cart.map((item) => (
          <div key={item.id} className="flex justify-between mb-3 text-gray-700">
            <p className="font-medium">{item.name} <span className="text-gray-400 text-sm">x {item.quantity}</span></p>
            <p className="font-bold">₹{item.price * item.quantity}</p>
          </div>
        ))}
        
        <div className="mt-6 pt-4 border-t border-dashed border-gray-200">
          <div className="flex justify-between items-center text-xl font-black">
            <span>Total Amount</span>
            <span>₹{total}</span>
          </div>
          <div className="flex justify-between items-center text-sm text-green-600 font-bold mt-2">
            <span>✨ Cashback to Earn</span>
            <span>+ ₹{cashback}</span>
          </div>
        </div>
      </div>

      {/* Split Payment Section */}
      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 mb-8">
        <h2 className="text-lg font-bold mb-4">Payment Method</h2>
        
        <div className="space-y-4">
          {/* Wallet Toggle */}
          <div className={`p-4 rounded-xl border-2 transition ${isWalletChecked ? 'border-black bg-white' : 'border-gray-200 bg-gray-100'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  checked={isWalletChecked} 
                  onChange={(e) => setIsWalletChecked(e.target.checked)}
                  className="w-5 h-5 accent-black cursor-pointer"
                />
                <div>
                  <p className="font-bold">Use Wallet Balance</p>
                  <p className="text-xs text-gray-500">Available: ₹{balance}</p>
                </div>
              </div>
            </div>

            {isWalletChecked && (
              <div className="pl-8 animate-in slide-in-from-top-2 duration-200">
                <label className="text-xs font-bold text-gray-400 uppercase block mb-1">How much to use? (₹)</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="number"
                    value={walletAmount}
                    onChange={(e) => setWalletAmount(Math.min(Number(e.target.value), balance, total))}
                    className="flex-grow px-3 py-2 border rounded-lg focus:ring-1 focus:ring-black outline-none font-bold"
                  />
                  <button 
                    onClick={() => setWalletAmount(Math.min(balance, total))}
                    className="text-xs font-bold underline hover:text-blue-600"
                  >
                    Max
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Combined Breakdown */}
          <div className="p-4 rounded-xl border-2 border-dashed border-gray-300">
             <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-500">Paid from Wallet:</span>
                <span className="font-bold">- ₹{walletAmount}</span>
             </div>
             <div className="flex justify-between items-center">
                <span className="text-sm font-bold">Remaining to pay (COD):</span>
                <span className="text-lg font-black italic">₹{remainingAmount}</span>
             </div>
          </div>
        </div>
      </div>

      <div className="text-right">
        <button
          onClick={() => setModalOpen(true)}
          className="w-full md:w-auto bg-black text-white px-12 py-4 rounded-xl font-bold hover:opacity-90 active:scale-95 transition shadow-lg"
        >
          Confirm Order
        </button>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center animate-in zoom-in duration-300">
            <h2 className="text-2xl font-black mb-2">Place Order?</h2>
            <div className="text-gray-500 mb-8 space-y-1">
              {walletAmount > 0 && <p>Wallet: <b>₹{walletAmount}</b></p>}
              {remainingAmount > 0 && <p>Remaining (COD): <b>₹{remainingAmount}</b></p>}
              <p className="pt-2 text-green-600 font-bold">Earn ₹{cashback} Cashback!</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                disabled={loading}
                onClick={() => setModalOpen(false)}
                className="py-3 rounded-xl border border-gray-200 font-bold hover:bg-gray-50"
              >
                Go Back
              </button>
              <button
                disabled={loading}
                onClick={handlePlaceOrder}
                className={`py-3 rounded-xl text-white font-bold ${loading ? 'bg-gray-400' : 'bg-black hover:opacity-95'}`}
              >
                {loading ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;