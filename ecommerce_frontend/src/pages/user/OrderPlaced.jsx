import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaDownload, FaHome, FaCheckCircle } from "react-icons/fa";
import { generateInvoice } from "../../utils/invoiceGenerator";

const OrderPlaced = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { orders } = location.state || {};

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 sm:p-10 font-sans italic selection:bg-indigo-600 selection:text-white">
            <div className="bg-white p-10 sm:p-16 rounded-[3rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-100 text-center max-w-lg w-full relative overflow-hidden group">
                {/* Decorative gradients */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500/5 rounded-full -ml-12 -mb-12 group-hover:scale-150 transition-transform duration-1000 delay-100"></div>

                <div className="relative z-10">
                    <div className="bg-emerald-50 w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner shadow-emerald-200/50 scale-animation">
                        <FaCheckCircle className="text-4xl sm:text-5xl text-emerald-500 drop-shadow-lg" />
                    </div>

                    <h1 className="text-2xl sm:text-4xl font-black mb-4 tracking-tighter uppercase italic">
                        Order <span className="text-indigo-600">Sync Success!</span>
                    </h1>
                    
                    <p className="text-[10px] sm:text-[12px] font-black text-gray-400 uppercase tracking-[0.3em] mb-8 leading-relaxed">
                        Your business unit acquisition is complete. <br/> Check your stream for live updates.
                    </p>

                    <div className="space-y-4">
                        <button
                            onClick={() => generateInvoice(orders)}
                            disabled={!orders}
                            className={`w-full flex items-center justify-center gap-3 py-4 sm:py-5 rounded-2xl sm:rounded-[2rem] text-sm sm:text-base font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 ${!orders ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-800 shadow-gray-200'}`}
                        >
                            <FaDownload className="text-sm" /> 
                            {orders ? "Download Invoice" : "No Invoice Found"}
                        </button>

                        <button
                            onClick={() => navigate("/")}
                            className="w-full flex items-center justify-center gap-3 py-4 sm:py-5 rounded-2xl sm:rounded-[2rem] text-sm sm:text-base font-black uppercase tracking-widest bg-white text-gray-400 border border-gray-100 hover:bg-gray-50 hover:text-gray-900 transition-all active:scale-95"
                        >
                            <FaHome className="text-sm" /> Return to HQ
                        </button>
                    </div>

                    <p className="text-[9px] font-bold text-gray-300 mt-10 uppercase tracking-widest opacity-60">
                        Acquisition ID: <span className="text-indigo-300">#{orders?.[0]?.orderId.split('-')[0] || Date.now()}</span>
                    </p>
                </div>
            </div>
            
            <style>{`
                .scale-animation {
                    animation: scaleUp 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
                }
                @keyframes scaleUp {
                    0% { transform: scale(0.5); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default OrderPlaced;