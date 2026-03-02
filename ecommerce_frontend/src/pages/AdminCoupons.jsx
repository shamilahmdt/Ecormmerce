import React, { useState, useEffect } from "react";
import API from "../api";
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
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg">
                        <FaTicketAlt className="text-2xl" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900">Coupon Manager</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Create Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 sticky top-6">
                            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                                <FaPlus className="text-indigo-600" /> New Coupon
                            </h2>
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Coupon Code</label>
                                    <input
                                        name="code"
                                        placeholder="E.g. SUMMER50"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all font-bold"
                                        value={formData.code}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Discount (%)</label>
                                    <div className="relative">
                                        <FaPercentage className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            name="discountPercentage"
                                            type="number"
                                            placeholder="10"
                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                                            value={formData.discountPercentage}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Expiry Date</label>
                                    <div className="relative">
                                        <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            name="expiryDate"
                                            type="date"
                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                                            value={formData.expiryDate}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Min order (₹)</label>
                                    <div className="relative">
                                        <FaShoppingCart className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            name="minPurchase"
                                            type="number"
                                            placeholder="500"
                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                                            value={formData.minPurchase}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <button className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-indigo-700 active:scale-95 transition-all mt-4">
                                    Create Coupon
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Coupons List */}
                    <div className="lg:col-span-2 space-y-4">
                        <h2 className="text-lg font-bold mb-4 px-2">Active Coupons</h2>
                        {loading ? (
                            <div className="p-12 text-center text-gray-500">Loading coupons...</div>
                        ) : coupons.length === 0 ? (
                            <div className="bg-white p-12 rounded-3xl text-center border-2 border-dashed border-gray-200 text-gray-400">
                                No active coupons found.
                            </div>
                        ) : (
                            coupons.map((coupon) => (
                                <div key={coupon.id} className="bg-white p-6 rounded-3xl shadow-md border border-gray-100 flex items-center justify-between group hover:shadow-xl transition-all">
                                    <div className="flex items-center gap-6">
                                        <div className="bg-indigo-50 text-indigo-600 w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-black">
                                            <span className="text-xl">{coupon.discountPercentage}</span>
                                            <span className="text-[10px] uppercase">%</span>
                                        </div>
                                        <div>
                                            <h3 className="font-black text-xl tracking-tight">{coupon.code}</h3>
                                            <div className="flex items-center gap-4 mt-1">
                                                <p className="text-xs font-bold text-gray-400 flex items-center gap-1">
                                                    <FaCalendarAlt /> Expires: {new Date(coupon.expiryDate._seconds * 1000).toLocaleDateString()}
                                                </p>
                                                <p className="text-xs font-bold text-green-600 flex items-center gap-1">
                                                    <FaShoppingCart /> Min: ₹{coupon.minPurchase}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    {/* <button className="p-3 text-red-100 group-hover:text-red-500 transition-colors">
                                        <FaTrash />
                                    </button> */}
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
