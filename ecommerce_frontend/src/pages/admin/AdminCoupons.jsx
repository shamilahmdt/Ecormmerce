import React, { useState, useEffect } from "react";
import API from "../../api";
import toast from "react-hot-toast";
import { FaTicketAlt, FaTrash, FaPlus, FaCalendarAlt, FaPercentage, FaShoppingCart } from "react-icons/fa";

const CouponManager = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        code: "",
        discountPercentage: "",
        expiryDate: "",
        minPurchase: ""
    });

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            const { data } = await API.get("/coupons");
            setCoupons(data);
        } catch (err) {
            toast.error("Failed to fetch coupons");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await API.post("/coupons", formData);
            toast.success("Coupon created!");
            setFormData({ code: "", discountPercentage: "", expiryDate: "", minPurchase: "" });
            fetchCoupons();
        } catch (err) {
            toast.error(err.response?.data?.error || "Error creating coupon");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-6 sm:py-10 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-8 px-1">
                    <div className="bg-indigo-600 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl text-white shadow-lg shadow-indigo-100">
                        <FaTicketAlt className="text-xl sm:text-2xl" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tighter uppercase italic">Coupon <span className="text-indigo-600">Engine</span></h1>
                        <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">Manage Reward Discounts</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 lg:grid-cols-3 gap-6 sm:gap-8">
                    {/* Create Form */}
                    <div className="md:col-span-12 lg:col-span-1">
                        <div className="bg-white p-5 sm:p-6 rounded-[2rem] shadow-xl border border-gray-100 lg:sticky lg:top-6">
                            <h2 className="text-sm sm:text-lg font-black mb-6 flex items-center gap-2 uppercase tracking-tight text-gray-800">
                                <FaPlus className="text-indigo-600 text-xs" /> New Reward
                            </h2>
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div>
                                    <label className="block text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 px-0.5">Coupon Code</label>
                                    <input
                                        name="code"
                                        placeholder="E.g. WELCOME100"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all font-bold text-sm uppercase"
                                        value={formData.code}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                
                                <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                                    <div>
                                        <label className="block text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 px-0.5">Discount (%)</label>
                                        <div className="relative">
                                            <FaPercentage className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                                            <input
                                                name="discountPercentage"
                                                type="number"
                                                placeholder="10"
                                                className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all font-bold text-sm"
                                                value={formData.discountPercentage}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 px-0.5">Min Order (₹)</label>
                                        <div className="relative">
                                            <FaShoppingCart className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                                            <input
                                                name="minPurchase"
                                                type="number"
                                                placeholder="1000"
                                                className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all font-bold text-sm"
                                                value={formData.minPurchase}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 px-0.5">Expires On</label>
                                    <div className="relative">
                                        <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                                        <input
                                            name="expiryDate"
                                            type="date"
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all font-bold text-sm uppercase"
                                            value={formData.expiryDate}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <button className="w-full bg-indigo-600 text-white font-black py-4 rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all mt-6 uppercase tracking-widest text-[10px] sm:text-xs">
                                    Broadcast Coupon
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Coupons List */}
                    <div className="md:col-span-12 lg:col-span-2 space-y-4 sm:space-y-6">
                        <div className="flex items-center justify-between px-2 mb-2">
                            <h2 className="text-sm sm:text-lg font-black uppercase tracking-tight text-gray-800">Active Rewards</h2>
                            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-widest">{coupons.length} Active</span>
                        </div>
                        
                        {loading ? (
                            <div className="p-12 text-center text-gray-400 font-bold text-sm uppercase tracking-widest">Warming Engines...</div>
                        ) : coupons.length === 0 ? (
                            <div className="bg-white p-16 rounded-[2.5rem] text-center border-2 border-dashed border-gray-100 text-gray-400 font-bold uppercase tracking-widest text-xs">
                                No active coupons found.
                            </div>
                        ) : (
                            coupons.map((coupon) => (
                                <div key={coupon.id} className="bg-white p-4 sm:p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-xl hover:border-indigo-100 transition-all">
                                    <div className="flex items-center gap-4 sm:gap-6">
                                        <div className="bg-indigo-50 text-indigo-600 w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex flex-col items-center justify-center font-black shrink-0 relative overflow-hidden group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                                            <span className="text-base sm:text-xl relative z-10">{coupon.discountPercentage}</span>
                                            <span className="text-[8px] sm:text-[10px] uppercase font-black relative z-10">%</span>
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-black text-base sm:text-xl tracking-tighter uppercase truncate text-gray-800 italic">{coupon.code}</h3>
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                            </div>
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1">
                                                <p className="text-[9px] sm:text-xs font-bold text-gray-400 flex items-center gap-1.5">
                                                    <FaCalendarAlt className="text-[10px]" /> {new Date(coupon.expiryDate._seconds * 1000).toLocaleDateString()}
                                                </p>
                                                <p className="text-[9px] sm:text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg inline-flex items-center gap-1.5 w-fit">
                                                    <FaShoppingCart className="text-[10px]" /> Min: ₹{coupon.minPurchase}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CouponManager;
