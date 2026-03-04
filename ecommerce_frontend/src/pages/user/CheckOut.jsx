import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useWallet } from "../../context/WalletContext";
import toast from "react-hot-toast";
import API from "../../api";
import { FaTicketAlt, FaWallet, FaCheckCircle, FaTrashAlt, FaTag, FaShoppingCart } from "react-icons/fa";

const Checkout = () => {
    const navigate = useNavigate();
    const { cart, clearCart } = useCart();
    const { balance, fetchBalance } = useWallet();
    
    // Summary states
    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const [discount, setDiscount] = useState(0);
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponCode, setCouponCode] = useState("");
    
    const total = subtotal - discount;
    const cashback = Math.floor(total * 0.02);

    const [modalOpen, setModalOpen] = useState(false);
    const [isWalletChecked, setIsWalletChecked] = useState(false);
    const [walletAmount, setWalletAmount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [redeemLoading, setRedeemLoading] = useState(false);
    const [liveProducts, setLiveProducts] = useState([]);

    // Fetch live product data for final stock check
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

    // Update wallet amount ONLY when checkbox is toggled or when total/balance changes IF NOT ALREADY MAXED
    useEffect(() => {
        if (!isWalletChecked) {
            setWalletAmount(0);
        } else {
            // Only auto-update if the user hasn't manually set a value yet or if balance/total changed and we need to clamp it
            setWalletAmount(prev => Math.min(prev || balance, balance, total));
        }
    }, [isWalletChecked, balance, total]);

    const remainingAmount = Math.max(0, total - walletAmount);

    const handleApplyCoupon = async () => {
        if (!couponCode) return;
        setRedeemLoading(true);
        try {
            const { data } = await API.post("/coupons/redeem", {
                code: couponCode,
                cartTotal: subtotal
            });
            const discountAmt = Math.floor(subtotal * (data.discountPercentage / 100));
            setDiscount(discountAmt);
            setAppliedCoupon(data);
            toast.success(`${data.message} (${data.discountPercentage}% OFF)`);
        } catch (err) {
            toast.error(err.response?.data?.error || "Invalid coupon");
            setDiscount(0);
            setAppliedCoupon(null);
        } finally {
            setRedeemLoading(false);
            setCouponCode("");
        }
    };

    const removeCoupon = () => {
        setDiscount(0);
        setAppliedCoupon(null);
        toast.success("Coupon removed");
    };

    const handlePlaceOrder = async () => {
        // 🔥 Final Verification: Check if items are in stock in live data
        for (let item of cart) {
            const liveItem = liveProducts.find(p => p.id === item.id);
            if (liveItem && liveItem.isOutOfStock) {
                return toast.error(`Item '${item.name}' is out of stock. Please return to cart.`);
            }
        }

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
                couponCode: appliedCoupon?.code || null,
                discountAmount: discount
            });

            toast.success(`Order placed! Earned ₹${cashback} cashback.`);
            clearCart();
            fetchBalance();
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
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-gray-100 p-8 rounded-full mb-6">
                    <FaShoppingCart className="text-6xl text-gray-300" />
                </div>
                <h2 className="text-2xl font-black mb-2">Checkout is empty</h2>
                <p className="text-gray-500 mb-8 max-w-xs">You haven't added any products to your cart yet. Go back and explore!</p>
                <button onClick={() => navigate("/")} className="bg-black text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-gray-200">
                    Back to Shop
                </button>
            </div>
        );

    return (
        <div className="min-h-screen bg-gray-50 py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-3 mb-8 sm:mb-10 text-center sm:text-left">
                    <div className="bg-black p-3 rounded-2xl text-white shadow-lg shrink-0">
                        <FaCheckCircle className="text-2xl" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Checkout Summary</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10">
                    
                    {/* LEFT COLUMN: Order Items & Coupons */}
                    <div className="space-y-6 sm:space-y-8">
                        <div className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 h-fit">
                            <h2 className="text-lg sm:text-xl font-black mb-6 flex items-center gap-2">
                                <FaShoppingCart className="text-black" /> Your Items
                            </h2>
                            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 sm:pr-4 scrollbar-hide">
                                {cart.map((item) => (
                                    <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-100 group transition-all hover:bg-white hover:shadow-md">
                                        <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
                                            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-lg sm:rounded-xl border p-1 sm:p-2 flex items-center justify-center shrink-0">
                                                <img src={item.imageUrl || item.image} alt={item.name} className="max-w-full max-h-full object-contain" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-gray-800 text-sm sm:text-base truncate">{item.name || item.title}</p>
                                                <p className="text-[10px] sm:text-xs font-bold text-gray-400">Qty: {item.quantity} × ₹{item.price}</p>
                                            </div>
                                        </div>
                                        <p className="font-black text-gray-900 text-sm sm:text-base shrink-0 ml-2">₹{item.price * item.quantity}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Coupon Section */}
                        <div className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100">
                            <h2 className="text-lg sm:text-xl font-black mb-6 flex items-center gap-2">
                                <FaTicketAlt className="text-indigo-600" /> Apply Coupon
                            </h2>
                            {appliedCoupon ? (
                                <div className="bg-green-50 border-2 border-dashed border-green-500 p-4 sm:p-5 rounded-2xl flex items-center justify-between animate-in slide-in-from-top-4 duration-300">
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        <div className="bg-green-500 text-white p-2 sm:p-3 rounded-xl shadow-lg shadow-green-200">
                                            <FaTag className="text-base sm:text-xl" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] sm:text-xs font-black text-green-700 uppercase tracking-widest">Active Coupon</p>
                                            <h3 className="font-black text-lg sm:text-2xl text-green-900 tracking-tight">{appliedCoupon.code}</h3>
                                            <p className="text-[10px] sm:text-xs font-bold text-green-600">{appliedCoupon.discountPercentage}% Discount Applied</p>
                                        </div>
                                    </div>
                                    <button onClick={removeCoupon} className="bg-white p-2 sm:p-3 rounded-xl shadow-xl text-red-500 hover:text-red-700 transition-colors">
                                        <FaTrashAlt />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <input 
                                        type="text" 
                                        placeholder="CODE..." 
                                        className="flex-grow px-4 sm:px-5 py-3 sm:py-4 bg-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-black focus:bg-white outline-none font-bold uppercase tracking-widest transition-all text-sm sm:text-base"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                    />
                                    <button 
                                        disabled={redeemLoading || !couponCode}
                                        onClick={handleApplyCoupon}
                                        className={`px-6 sm:px-8 py-3 sm:py-0 rounded-xl sm:rounded-2xl font-black shadow-lg transition-all text-sm sm:text-base ${redeemLoading || !couponCode ? 'bg-gray-200 text-gray-400' : 'bg-black text-white hover:bg-gray-800 active:scale-95 shadow-gray-300'}`}
                                    >
                                        {redeemLoading ? '...' : 'APPLY'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Bills & Payment */}
                    <div className="space-y-6 sm:space-y-8">
                        {/* Summary Card */}
                        <div className="bg-black text-white p-6 sm:p-8 rounded-[30px] sm:rounded-[40px] shadow-2xl relative overflow-hidden group">
                            {/* Decorations */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12 group-hover:scale-150 transition-transform duration-1000 delay-100"></div>
                            
                            <h2 className="text-xl sm:text-2xl font-black mb-6 sm:mb-8 border-b border-white/10 pb-4">Bill Details</h2>
                            
                            <div className="space-y-4 sm:space-y-5 text-gray-300 font-bold mb-8 sm:mb-10">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs sm:text-sm">Subtotal</span>
                                    <span className="text-base sm:text-lg">₹{subtotal}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between items-center text-green-400">
                                        <span className="text-xs sm:text-sm">Coupon Discount</span>
                                        <span className="text-base sm:text-lg">- ₹{discount}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center border-t border-white/10 pt-6 mt-6">
                                    <span className="text-base sm:text-lg font-black text-white">Grand Total</span>
                                    <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">₹{total}</span>
                                </div>
                                <div className="bg-white/10 p-3 rounded-xl flex justify-between items-center text-[10px] sm:text-xs">
                                    <span className="text-green-400">✨ Potential Cashback</span>
                                    <span className="text-white">+ ₹{cashback}</span>
                                </div>
                            </div>

                            {/* Wallet Usage in Bill */}
                            <div className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl transition-all duration-300 ${isWalletChecked ? 'bg-indigo-600/20 border-2 border-indigo-400/30' : 'bg-white/5 border border-white/10'}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <input 
                                            type="checkbox" 
                                            checked={isWalletChecked} 
                                            onChange={(e) => setIsWalletChecked(e.target.checked)}
                                            className="w-4 h-4 sm:w-5 sm:h-5 accent-indigo-500 cursor-pointer"
                                        />
                                        <div>
                                            <p className="font-black text-white text-sm sm:text-base">Use Wallet Balance</p>
                                            <p className="text-[8px] sm:text-[10px] text-gray-400 uppercase tracking-widest">Available: ₹{balance}</p>
                                        </div>
                                    </div>
                                    <FaWallet className={`text-lg sm:text-xl ${isWalletChecked ? 'text-indigo-400' : 'text-gray-600'}`} />
                                </div>

                                {isWalletChecked && (
                                    <div className="animate-in slide-in-from-top-2 duration-300 space-y-4">
                                        <div className="flex flex-col sm:flex-row items-center gap-2">
                                            <input 
                                                type="number"
                                                value={walletAmount || ""}
                                                onChange={(e) => {
                                                    const val = e.target.value === "" ? 0 : Number(e.target.value);
                                                    setWalletAmount(Math.min(val, balance, total));
                                                }}
                                                className="w-full sm:flex-grow bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white font-black outline-none focus:ring-1 focus:ring-indigo-400 placeholder-white/30 text-sm"
                                                placeholder="0"
                                            />
                                            <button onClick={() => setWalletAmount(Math.min(balance, total))} className="w-full sm:w-auto text-[10px] bg-white/20 px-4 py-2 rounded-xl hover:bg-white/30 transition-colors uppercase tracking-widest font-black">Max</button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Payment Breakdown Card */}
                            <div className="mt-6 sm:mt-8 bg-white text-black p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl flex flex-col gap-2">
                                <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    <span>Method</span>
                                    <span>Amount</span>
                                </div>
                                {walletAmount > 0 && (
                                    <div className="flex justify-between items-center font-black">
                                        <span className="text-xs sm:text-sm">Wallet Pay</span>
                                        <span className="text-indigo-600 text-sm sm:text-base">- ₹{walletAmount}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center border-t pt-3 mt-1">
                                    <span className="font-black text-xs sm:text-sm uppercase">Remaining (COD)</span>
                                    <span className="text-xl sm:text-2xl font-black tracking-tight text-red-600">₹{remainingAmount}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => setModalOpen(true)}
                                className="w-full bg-white text-black text-lg sm:text-xl font-black py-4 sm:py-5 rounded-2xl sm:rounded-3xl shadow-2xl mt-8 sm:mt-10 hover:bg-gray-50 active:scale-95 transition-all shadow-white/5 tracking-tighter"
                            >
                                PLACE ORDER
                            </button>
                        </div>
                    </div>
                </div>

                {/* Confirm Modal */}
                {modalOpen && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
                        <div className="bg-white p-6 sm:p-10 rounded-[30px] sm:rounded-[40px] shadow-2xl max-w-sm w-full text-center animate-in zoom-in duration-300 border-t-8 border-indigo-600">
                            <h2 className="text-2xl sm:text-3xl font-black mb-2 tracking-tighter">Final Step!</h2>
                            <p className="text-sm sm:text-base text-gray-400 font-bold mb-6 sm:mb-8">Confirm your payment split</p>
                            
                            <div className="bg-gray-50 p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-3 text-left mb-6 sm:mb-8 border border-gray-100">
                                {walletAmount > 0 && (
                                    <div className="flex justify-between items-center pb-2 border-b border-gray-200 border-dashed">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase">Wallet</span>
                                        <span className="font-black text-indigo-600">₹{walletAmount}</span>
                                    </div>
                                )}
                                {remainingAmount > 0 && (
                                    <div className="flex justify-between items-center pb-2 border-b border-gray-200 border-dashed">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase">COD Pay</span>
                                        <span className="font-black">₹{remainingAmount}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-[10px] font-bold text-green-600 uppercase">Cashback</span>
                                    <span className="font-black text-green-600">+ ₹{cashback}</span>
                                </div>
                            </div>
                            
                            <div className="flex flex-col gap-3">
                                <button
                                    disabled={loading}
                                    onClick={handlePlaceOrder}
                                    className={`py-4 sm:py-5 rounded-2xl text-white text-lg sm:text-xl font-black tracking-tighter shadow-xl shadow-indigo-100 transition-all active:scale-95 ${loading ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                                >
                                    {loading ? 'PROCESSING...' : 'CONFIRM NOW'}
                                </button>
                                <button
                                    disabled={loading}
                                    onClick={() => setModalOpen(false)}
                                    className="py-3 sm:py-4 rounded-xl sm:rounded-2xl border-2 border-gray-100 font-black text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-all uppercase tracking-widest text-[10px]"
                                >
                                    Go Back
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Checkout;