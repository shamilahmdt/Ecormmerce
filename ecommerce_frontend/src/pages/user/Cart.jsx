import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import API from "../../api";

const Cart = () => {
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
      <p className="text-center mt-20 text-gray-500 text-lg">
        Your cart is empty.
        <br />
        <Link
          to="/"
          className="mt-4 inline-block text-blue-500 hover:underline"
        >
          ← Continue Shopping
        </Link>
      </p>
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
    <div className="p-3 sm:p-10 max-w-5xl mx-auto min-h-screen bg-gray-50/50">
      {/* breadcrumb header */}
      <div className="mb-8 px-2">
        <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">
           <Link to="/" className="hover:text-black transition-colors">Home</Link>
           <span>/</span>
           <span className="text-black">Shopping Bag</span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tighter uppercase">
            Your <span className="text-indigo-600">Selection</span>
          </h1>
          <div className="bg-black text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
            {cart.length} Units
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ITEMS LIST */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => {
            const outOfStock = isItemOutOfStock(item.id);
            return (
              <div
                key={item.id}
                className={`flex items-center gap-4 bg-white border border-gray-100 p-3 sm:p-5 rounded-3xl shadow-sm hover:shadow-md transition-all relative overflow-hidden ${outOfStock ? 'bg-gray-50/50' : ''}`}
              >
                {/* Image Section */}
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-50 rounded-2xl p-2 flex-shrink-0 border border-gray-100 overflow-hidden relative">
                   <img
                    src={item.imageUrl}
                    alt={item.name}
                    className={`w-full h-full object-contain mix-blend-multiply ${outOfStock ? 'grayscale opacity-30' : ''}`}
                  />
                  {outOfStock && (
                    <div className="absolute inset-0 flex items-center justify-center p-2 text-center bg-black/60 backdrop-blur-[2px]">
                      <span className="text-[8px] font-black text-white uppercase tracking-tighter border border-white/20 p-1 rounded">Unavailable</span>
                    </div>
                  )}
                </div>

                {/* Details Section */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col mb-1">
                    <h2 className="font-black text-sm sm:text-lg text-gray-900 uppercase tracking-tight truncate leading-tight">{item.name}</h2>
                    <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Unit Price: ₹{item.price.toLocaleString()}</p>
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50/50 p-1">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-black hover:text-white rounded-lg transition-all font-black"
                      >
                        -
                      </button>
                      <input
                        type="text"
                        value={item.quantity}
                        readOnly
                        className="w-8 text-center font-black text-sm text-gray-900 bg-transparent"
                      />
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={outOfStock}
                        className={`w-8 h-8 flex items-center justify-center text-gray-500 font-black rounded-lg transition-all ${outOfStock ? 'opacity-20 cursor-not-allowed' : 'hover:bg-black hover:text-white'}`}
                      >
                        +
                      </button>
                    </div>
                    
                    <button
                      onClick={() => openRemoveModal(item.id)}
                      className="ml-auto p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {outOfStock && (
                  <div className="absolute top-0 right-0 p-3">
                    <span className="text-[8px] font-black text-red-500 bg-red-50 px-2 py-1 rounded-full uppercase tracking-widest">Stock Issue</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* SUMMARY SECTION */}
        <div className="lg:col-span-1">
          <div className={`sticky top-24 bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xl shadow-indigo-100/20 ${hasOutOfStockItems ? 'border-red-200' : ''}`}>
            <h3 className="font-black text-xl text-gray-900 mb-6 uppercase tracking-tighter">Summary</h3>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400 font-bold uppercase tracking-widest">Subtotal</span>
                <span className="font-black text-gray-900">₹{total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm pb-4 border-b border-gray-50">
                <span className="text-gray-400 font-bold uppercase tracking-widest">Shipping</span>
                <span className="text-green-500 font-black uppercase tracking-widest text-[10px]">Free</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-lg font-black text-gray-900 uppercase">Estimated Total</span>
                <span className="text-2xl font-black text-indigo-600 tracking-tight">₹{total.toLocaleString()}</span>
              </div>
            </div>

            {hasOutOfStockItems && (
              <div className="mb-6 bg-red-50 border border-red-100 p-4 rounded-2xl flex items-start gap-3">
                <span className="mt-0.5">⚠️</span>
                <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest leading-relaxed">Please resolve stock errors before proceeding.</p>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={() => navigate("/checkout")}
                disabled={hasOutOfStockItems}
                className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl transition-all ${hasOutOfStockItems ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' : 'bg-black text-white hover:bg-indigo-600 shadow-black/10 active:scale-95'}`}
              >
                {hasOutOfStockItems ? "Fix Stock Errors" : "Proceed to Checkout"}
              </button>
              
              <button
                onClick={openClearModal}
                className="w-full bg-white border-2 border-gray-100 text-gray-400 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-50 transition-all text-center"
              >
                Clear Entire Bag
              </button>
            </div>

            <p className="mt-6 text-[9px] text-gray-400 text-center font-bold uppercase tracking-widest italic">
              ✨ 2% cashback will be credited to your wallet 
            </p>
          </div>
          
          <div className="mt-8 px-4">
             <Link
              to="/"
              className="group flex items-center justify-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-black transition-all"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span> 
              <span>Back to Marketplace</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ================= Modal ================= */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 sm:p-12 rounded-[3.5rem] shadow-2xl max-w-md w-full text-center border-t-8 border-red-500">
            <h2 className="text-2xl sm:text-3xl font-black mb-3 tracking-tighter uppercase italic">
              {clearAll
                ? "Total Purge?"
                : "Remove Unit?"}
            </h2>
            <p className="text-gray-400 font-bold mb-8 text-sm sm:text-base">
              {clearAll
                ? "This will incinerate your entire selection. Procedural note: this is irreversible."
                : "Remove this asset from your bag?"}
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleConfirm}
                className="w-full bg-red-500 text-white py-4 rounded-3xl font-black uppercase tracking-widest text-[10px] sm:text-xs hover:bg-red-600 shadow-lg shadow-red-100 active:scale-95 transition-all"
              >
                Confirm Deletion
              </button>
              <button
                onClick={() => setModalOpen(false)}
                className="w-full bg-gray-50 text-gray-400 py-4 rounded-3xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-100 transition-all"
              >
                Retain Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
