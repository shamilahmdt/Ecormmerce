import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { FaShoppingCart, FaTrashAlt, FaArrowRight } from "react-icons/fa";
import API from "../../api";

const GuestCart = () => {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart, total, clearCart } = useCart();

  const [modalOpen, setModalOpen] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);
  const [clearAll, setClearAll] = useState(false);
  const [liveProducts, setLiveProducts] = useState([]);

  // Fetch live product data to check stock status
  useEffect(() => {
    const fetchLiveProducts = async () => {
      try {
        const res = await API.get("/products");
        setLiveProducts(res.data);
      } catch (err) {
        console.error("Error checking stock status:", err);
      }
    };
    fetchLiveProducts();
  }, []);

  if (cart.length === 0)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gray-50">
        <div className="bg-white p-8 rounded-full shadow-xl mb-6">
            <FaShoppingCart className="text-6xl text-gray-200" />
        </div>
        <h2 className="text-3xl font-black mb-2">Your guest cart is empty</h2>
        <p className="text-gray-500 mb-8 max-w-xs">Items added here will stay for your session. Login to save them!</p>
        <button 
            onClick={() => navigate("/guest-home")}
            className="bg-black text-white px-10 py-4 rounded-2xl font-black shadow-lg hover:scale-105 transition"
        >
            Explore Products
        </button>
      </div>
    );

  const openRemoveModal = (id) => {
    setItemToRemove(id);
    setClearAll(false);
    setModalOpen(true);
  };

  const openClearModal = () => {
    setClearAll(true);
    setModalOpen(true);
  };

  const handleConfirm = () => {
    if (clearAll) clearCart();
    else if (itemToRemove) removeFromCart(itemToRemove);

    setModalOpen(false);
    setItemToRemove(null);
    setClearAll(false);
  };

  // Check if any item in cart is out of stock in live data
  const isItemOutOfStock = (itemId) => {
    const liveItem = liveProducts.find(p => p.id === itemId);
    return liveItem ? liveItem.isOutOfStock : false;
  };

  const hasOutOfStockItems = cart.some(item => isItemOutOfStock(item.id));

  return (
    <div className="p-4 sm:p-10 max-w-4xl mx-auto italic min-h-screen">
      <div className="bg-gray-900 text-white p-6 sm:p-10 rounded-[2.5rem] sm:rounded-[3.5rem] mb-8 sm:mb-12 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-8 border border-indigo-500/10 relative overflow-hidden">
          <div className="text-center md:text-left relative z-10">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tighter mb-3 uppercase italic">Guest <span className="text-indigo-400">Voyage</span></h1>
            <p className="text-gray-400 font-bold text-xs sm:text-sm max-w-sm mx-auto md:mx-0">Active session browsing. <button onClick={() => navigate("/auth")} className="text-indigo-400 underline hover:text-white transition-colors uppercase tracking-widest text-[10px]">Login to persist</button></p>
          </div>
          <div className="bg-white/5 px-8 py-5 rounded-3xl backdrop-blur-xl border border-white/10 w-full md:w-auto text-center md:text-left relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-1">Session Total</p>
              <p className="text-3xl sm:text-4xl font-black italic tracking-tighter">₹{total.toLocaleString()}</p>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 blur-[100px] rounded-full -mr-20 -mt-20"></div>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {cart.map((item) => {
          const outOfStock = isItemOutOfStock(item.id);
          return (
            <div
              key={item.id}
              className={`flex flex-col sm:flex-row items-center gap-6 p-5 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all group relative overflow-hidden ${outOfStock ? 'opacity-80' : ''}`}
            >
              <div className="w-full sm:w-32 h-48 sm:h-32 bg-gray-50 rounded-2xl flex items-center justify-center p-4 overflow-hidden border border-gray-50 group-hover:scale-105 transition-transform duration-500 relative">
                  <img
                  src={item.imageUrl || item.image}
                  alt={item.name}
                  className={`max-h-full max-w-full object-contain ${outOfStock ? 'grayscale opacity-50' : ''}`}
                  />
                  {outOfStock && (
                    <div className="absolute inset-0 flex items-center justify-center p-2 text-center bg-black/40 backdrop-blur-[2px]">
                      <span className="text-[10px] font-black text-white uppercase tracking-tighter leading-none">Restocking Required</span>
                    </div>
                  )}
              </div>

              <div className="flex-1 w-full text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                  <h2 className="font-black text-xl text-gray-900 uppercase tracking-tight line-clamp-1">{item.name}</h2>
                  {outOfStock && (
                    <span className="inline-block px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-black rounded-full uppercase self-center sm:self-auto italic">Out of Stock</span>
                  )}
                </div>
                <p className="text-indigo-600 font-black text-sm tracking-widest mt-0.5 uppercase mb-4 sm:mb-2">₹{item.price.toLocaleString()}</p>

                <div className="flex items-center justify-center sm:justify-start gap-4">
                  <div className="flex items-center bg-gray-50 rounded-2xl p-1 gap-1 border border-gray-100">
                      <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-9 h-9 flex items-center justify-center bg-white hover:bg-black hover:text-white rounded-xl transition-all font-black shadow-sm text-gray-400"
                      >
                          -
                      </button>
                      <span className="w-10 text-center font-black text-gray-900 text-sm">{item.quantity}</span>
                      <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={outOfStock}
                          className={`w-9 h-9 flex items-center justify-center bg-white rounded-xl font-black shadow-sm transition-all text-gray-400 ${outOfStock ? 'opacity-30 cursor-not-allowed' : 'hover:bg-black hover:text-white'}`}
                      >
                          +
                      </button>
                  </div>
                </div>
              </div>

              <button
                onClick={() => openRemoveModal(item.id)}
                className="absolute top-4 right-4 sm:relative sm:top-0 sm:right-0 p-4 text-gray-200 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
              >
                <FaTrashAlt size={18} />
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-12 flex flex-col-reverse sm:flex-row gap-6 justify-between items-center px-2">
        <Link
            to="/guest-home"
            className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest hover:text-black transition-colors flex items-center gap-2"
        >
            ← Back to Exploration
        </Link>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            {hasOutOfStockItems && (
              <div className="mb-4 sm:mb-0 sm:mr-4 bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3">
                <span className="text-xl">⚠️</span>
                <p className="text-[10px] font-black text-red-500 uppercase tracking-widest leading-relaxed">Remove unavailable items to proceed.</p>
              </div>
            )}
            <button
                onClick={openClearModal}
                className="w-full sm:w-auto px-10 py-4 rounded-3xl bg-gray-100 text-gray-400 font-black uppercase tracking-widest text-[10px] hover:bg-gray-200 hover:text-gray-600 transition-all active:scale-95 text-center"
            >
                Purge All
            </button>
            <button
                onClick={() => navigate("/auth")}
                disabled={hasOutOfStockItems}
                className={`w-full sm:w-auto px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-2xl transition-all flex items-center justify-center gap-3 ${hasOutOfStockItems ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-indigo-600 text-white shadow-indigo-100 hover:bg-indigo-700 active:scale-95'}`}
            >
                {hasOutOfStockItems ? "Clear Stock Errors" : "Checkout Now"} <FaArrowRight className="text-[10px]" />
            </button>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl max-w-sm w-full text-center animate-in zoom-in duration-300">
            <h2 className="text-2xl font-black mb-2">
              {clearAll ? "Empty Cart?" : "Remove Item?"}
            </h2>
            <p className="text-gray-500 font-bold mb-8">
              {clearAll
                ? "Are you sure you want to clear all guest items?"
                : "Remove this product from your guest session?"}
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleConfirm}
                className="w-full py-4 rounded-2xl bg-red-500 text-white font-black hover:bg-red-600 transition shadow-lg shadow-red-100"
              >
                Yes, Remove
              </button>
              <button
                onClick={() => setModalOpen(false)}
                className="w-full py-4 rounded-2xl bg-gray-50 text-gray-400 font-black hover:bg-gray-100 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestCart;
