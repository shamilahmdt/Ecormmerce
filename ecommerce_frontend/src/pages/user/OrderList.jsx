import React, { useEffect, useState } from "react";
import API from "../../api";
import { GridLoader } from "react-spinners";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { SOCKET_URL } from "../../api";
import { FaDownload, FaCheckCircle, FaTruck, FaBox, FaTimesCircle, FaInfoCircle, FaExclamationCircle } from "react-icons/fa";
import { generateInvoice } from "../../utils/invoiceGenerator";
import { motion, AnimatePresence } from "framer-motion";

const formatDate = (dateInput) => {
  if (!dateInput) return "-";
  let date;
  if (dateInput.seconds) date = new Date(dateInput.seconds * 1000);
  else if (dateInput._seconds) date = new Date(dateInput._seconds * 1000);
  else date = new Date(dateInput);

  return isNaN(date.getTime()) ? "-" : date.toLocaleDateString("en-GB");
};

const checkReturnLimit = (order) => {
  if (order.status !== "Delivered") return false;
  
  const referenceDate = order.deliveredAt ? 
    (order.deliveredAt.seconds ? new Date(order.deliveredAt.seconds * 1000) : new Date(order.deliveredAt)) :
    (order.date ? new Date(order.date) : (order.CREATED_AT?.seconds ? new Date(order.CREATED_AT.seconds * 1000) : new Date()));

  const diffTime = Math.abs(new Date() - referenceDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 5;
};

const OrderList = () => {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [filterDate, setFilterDate] = useState("");
  
  const [actionModal, setActionModal] = useState({
    open: false,
    orderId: null,
    type: "", // "cancel" or "return"
  });
  const [actionReason, setActionReason] = useState("");
  const [activeTracking, setActiveTracking] = useState(null); // Stores displayOrderId

  const fetchOrders = async (page = 1, date = filterDate) => {
    setLoading(true);
    try {
      let url = `/orders?page=${page}&limit=${itemsPerPage}`;
      if (date) url += `&date=${date}`;
      const res = await API.get(url);
      const fetchedItems = res.data.orders || [];
      
      setOrders(fetchedItems);
      setTotalCount(res.data.totalCount || 0);
      setCurrentPage(page);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(1);

    const socket = io(SOCKET_URL);

    socket.on("order-status-updated", (data) => {
      const { orderId, displayOrderId, status } = data;
      
      setOrders((prevOrders) => {
        const orderExists = prevOrders.some(o => 
          o.id === orderId || (o.displayOrderId || o.orderId) === displayOrderId
        );

        if (orderExists) {
            if (status === "Refunded") {
              toast.success(`RECEIVED: ₹${data.total} Refunded to Wallet`, {
                icon: '💰',
                duration: 6000,
                style: {
                  borderRadius: '12px',
                  background: '#1e1b4b',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: '900',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  border: '1px solid #4338ca'
                }
              });
            } else {
              toast.success(`Order #${displayOrderId} updated to ${status}`, {
                  icon: '📦',
                  duration: 4000
              });
            }
            return prevOrders.map(o => 
                (o.id === orderId || (o.displayOrderId || o.orderId) === displayOrderId)
                ? { ...o, status }
                : o
            );
        }
        return prevOrders;
      });
    });

    socket.on("new-order", (newOrder) => {
      const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
      if (loggedInUser && newOrder.userPhone === loggedInUser.phone) {
          setOrders(prev => [newOrder, ...prev]);
          toast.success("New order placed successfully!", { icon: "🆕" });
      }
    });

    return () => socket.disconnect();
  }, []);

  const handlePageChange = (newPage) => {
    const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;
    if (newPage < 1 || newPage > totalPages) return;
    fetchOrders(newPage);
  };

  const handleDateChange = (date) => {
    setFilterDate(date);
    fetchOrders(1, date);
  };

  const clearFilters = () => {
    setFilterDate("");
    fetchOrders(1, "");
  };

  // Handle Cancel or Return
  const handleAction = async () => {
    if (!actionModal.orderId || !actionReason.trim()) {
      toast.error("Please provide a reason.");
      return;
    }

    try {
      await API.post("/orders/action", {
        orderId: actionModal.orderId,
        type: actionModal.type,
        reason: actionReason,
      });

      setOrders((prev) =>
        prev.map((o) =>
          (o.displayOrderId || o.orderId) === (actionModal.displayOrderId || actionModal.orderId)
            ? {
                ...o,
                status:
                  actionModal.type === "cancel"
                    ? "Cancelled"
                    : "ReturnProduct",
                cancelReason:
                  actionModal.type === "cancel" ? actionReason : o.cancelReason,
                returnReason:
                  actionModal.type === "return" ? actionReason : o.returnReason,
              }
            : o
        )
      );

      toast.success("Order updated successfully!");
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Failed to process action.";
      toast.error(errorMsg);
    } finally {
      setActionModal({ open: false, orderId: null, type: "" });
      setActionReason("");
    }
  };

  return (
    <>
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <GridLoader color="#000" size={25} />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white p-6 rounded-xl shadow text-center mt-20 max-w-md mx-auto">
          <p className="text-gray-500 text-lg">You have no past orders.</p>
          <Link
            to="/"
            className="mt-4 inline-block text-blue-500 hover:underline"
          >
            ← Start Shopping
          </Link>
        </div>
      ) : (
        <div className="p-3 sm:p-6 max-w-3xl mx-auto space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 px-1">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tighter uppercase">My Orders</h1>
              <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">Total Receipts: {totalCount}</p>
            </div>
            
            <div className="flex gap-2 items-center w-full sm:w-auto">
              <input
                type="date"
                value={filterDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="flex-grow sm:flex-none px-3 sm:px-4 py-2 rounded-xl bg-white border border-gray-100 text-[10px] sm:text-xs font-black outline-none focus:ring-2 focus:ring-black shadow-sm"
              />
              {filterDate && (
                <button 
                  onClick={clearFilters}
                  className="px-3 sm:px-4 py-2 rounded-xl bg-gray-50 border border-gray-100 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black hover:border-black transition-all"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {orders.map((order) => {
            const item = order.items[0]; 
            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl sm:rounded-[32px] border border-gray-100 shadow-lg sm:shadow-xl overflow-hidden group transition-all hover:shadow-2xl"
              >
                <div className="p-4 sm:p-6">
                  {/* Header: ID & Status */}
                  <div className="flex justify-between items-start mb-4 sm:mb-6">
                    <div>
                      <p className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">Receipt ID</p>
                      <p className="font-black text-sm sm:text-lg">#{order.displayOrderId || order.orderId}</p>
                      <p className="text-[8px] sm:text-[10px] font-bold text-gray-400 mt-0.5 sm:mt-1 uppercase">{formatDate(order.date || order.CREATED_AT)}</p>
                    </div>
                    <div className="relative group/status">
                      <button
                        onClick={() => setActiveTracking(activeTracking === (order.displayOrderId || order.orderId) ? null : (order.displayOrderId || order.orderId))}
                        className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest shrink-0 transition-all flex items-center gap-2 group hover:scale-105 active:scale-95 ${
                          order.status === "Cancelled" ? "bg-red-100 text-red-500 hover:bg-red-200" :
                          order.status === "ReturnProduct" ? "bg-orange-100 text-orange-500 hover:bg-orange-200" :
                          order.status === "Refund Proceed" ? "bg-purple-100 text-purple-600 hover:bg-purple-200" :
                          order.status === "Refunded" ? "bg-indigo-100 text-indigo-600 hover:bg-indigo-200" :
                          order.status === "Delivered" ? "bg-green-100 text-green-600 hover:bg-green-200" :
                          order.status === "Dispatched" ? "bg-blue-100 text-blue-600 hover:bg-blue-200" :
                          "bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
                        }`}
                      >
                        {order.status || "Pending"}
                        <FaInfoCircle className="text-[7px] opacity-40 group-hover:opacity-100" />
                      </button>
                    </div>
                  </div>

                  {/* Visual Tracking Bar */}
                  <AnimatePresence>
                    {activeTracking === (order.displayOrderId || order.orderId) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                        animate={{ height: "auto", opacity: 1, marginBottom: 24 }}
                        exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                        className="overflow-hidden"
                      >
                        {order.status === "Cancelled" ? (
                          <div className="p-8 sm:p-12 bg-white rounded-[32px] border-2 border-red-500/10 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden group/void">
                            {/* Watermark */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] rotate-12 pointer-events-none">
                                <FaTimesCircle className="text-[200px] text-red-600" />
                            </div>
                            
                            <div className="relative z-10 w-full">
                                <motion.div 
                                  initial={{ scale: 0.8, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-100"
                                >
                                  <FaExclamationCircle className="text-red-500 text-2xl" />
                                </motion.div>
                                
                                <h4 className="text-lg sm:text-xl font-black uppercase tracking-[0.4em] text-red-600 mb-2 italic">Official Void Notice</h4>
                                <div className="h-[2px] w-16 bg-red-100 mx-auto mb-6" />
                                
                                <p className="text-[10px] sm:text-xs text-gray-400 uppercase font-bold tracking-widest leading-relaxed max-w-sm mx-auto mb-8">
                                    The acquisition protocol for receipt <span className="text-red-500 font-black">#{order.displayOrderId || order.orderId}</span> has been formally terminated and moved to administrative archives.
                                </p>

                                {order.cancelReason && (
                                    <div className="p-5 sm:p-6 bg-red-50/50 rounded-2xl border border-red-100/50 inline-block w-full max-w-sm">
                                        <span className="text-[7px] font-black uppercase tracking-widest text-red-300 block mb-2 underline decoration-red-200">Termination Cause Logged</span>
                                        <p className="text-[11px] sm:text-[13px] font-black text-red-700 italic leading-snug">"{order.cancelReason}"</p>
                                    </div>
                                )}

                                <div className="mt-10 pt-8 border-t border-gray-100 grid grid-cols-2 gap-8">
                                    <div className="text-center group/item transition-transform hover:scale-105">
                                        <p className="text-[7px] font-black text-gray-300 uppercase tracking-widest mb-1">Log Status</p>
                                        <p className="text-[10px] font-black text-red-500 uppercase italic">Voided Archive</p>
                                    </div>
                                    <div className="text-center group/item transition-transform hover:scale-105">
                                        <p className="text-[7px] font-black text-gray-300 uppercase tracking-widest mb-1">Financial State</p>
                                        <p className="text-[10px] font-black text-indigo-600 uppercase italic">Wallet Restored</p>
                                    </div>
                                </div>
                                
                                <button 
                                  onClick={() => setActiveTracking(null)}
                                  className="mt-10 text-[8px] font-black uppercase tracking-[0.3em] text-gray-300 hover:text-black transition-colors"
                                >
                                  Dismiss Record
                                </button>
                            </div>
                          </div>
                        ) : (
                          <div className="px-4 py-8 bg-gray-50/50 rounded-2xl border border-gray-100 relative shadow-inner">
                            <div className="relative flex justify-between items-center max-w-sm mx-auto">
                              {/* Background Line */}
                              <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gray-200 -translate-y-1/2 z-0" />
                              
                              {/* Active Progress Line */}
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ 
                                  width: order.status === "Delivered" ? "100%" : 
                                         order.status === "Dispatched" ? "50%" : "0%" 
                                }}
                                transition={{ duration: 0.8, ease: "circOut" }}
                                className="absolute top-1/2 left-0 h-[2px] bg-black -translate-y-1/2 z-0 shadow-[0_0_10px_rgba(0,0,0,0.1)]"
                              />

                              {/* Stages */}
                              {[
                                { label: "Ordered", icon: <FaBox />, statusKey: "Pending" },
                                { label: "Dispatched", icon: <FaTruck />, statusKey: "Dispatched" },
                                { label: "Delivered", icon: <FaCheckCircle />, statusKey: "Delivered" }
                              ].map((stage, idx) => {
                                const isCompleted = (idx === 0) || 
                                                   (idx === 1 && ["Dispatched", "Delivered", "Ready to Deliver"].includes(order.status)) || 
                                                   (idx === 2 && order.status === "Delivered");
                                
                                const isCurrent = (idx === 0 && ["Pending", "Processing"].includes(order.status)) ||
                                                  (idx === 1 && order.status === "Dispatched") ||
                                                  (idx === 2 && order.status === "Delivered");

                                return (
                                  <div key={idx} className="relative z-10 flex flex-col items-center">
                                    <div 
                                      className={`w-8 h-8 rounded-full border-2 bg-white flex items-center justify-center transition-all duration-700 ${
                                        isCompleted ? "border-black text-black" : "border-gray-200 text-gray-300"
                                      } ${isCurrent ? "scale-110 shadow-lg ring-4 ring-gray-100" : ""}`}
                                    >
                                      <span className="text-[10px]">{stage.icon}</span>
                                    </div>
                                    <span className={`absolute -bottom-6 text-[7px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-colors duration-500 ${
                                      isCompleted ? "text-black" : "text-gray-400"
                                    }`}>
                                      {stage.label}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Product Info */}
                  <div className="flex gap-3 sm:gap-6 items-center bg-gray-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl mb-4 sm:mb-6">
                    <div className="w-14 h-14 sm:w-20 sm:h-20 bg-white rounded-lg sm:rounded-xl border p-1 sm:p-2 flex items-center justify-center shrink-0">
                      <img src={item.imageUrl} alt={item.name} className="max-h-full max-w-full object-contain" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h3 className="font-black text-gray-900 text-xs sm:text-base group-hover:text-indigo-600 transition-colors uppercase tracking-tight truncate">{item.name}</h3>
                      <p className="text-[10px] sm:text-sm font-bold text-gray-500">Qty: {item.quantity}</p>
                      <p className="text-sm sm:text-lg font-black text-gray-900 mt-0.5">₹{order.total.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-4 sm:mb-6 text-[8px] sm:text-[9px] font-black uppercase tracking-tight">
                    <div className="bg-gray-50 p-2 sm:p-3 rounded-lg sm:rounded-xl border border-gray-100">
                      <p className="text-gray-400 mb-0.5 sm:mb-1">Method</p>
                      <p className="text-gray-900 truncate">{order.paymentMethod}</p>
                    </div>
                    <div className="bg-indigo-50 p-2 sm:p-3 rounded-lg sm:rounded-xl border border-indigo-100">
                      <p className="text-indigo-400 mb-0.5 sm:mb-1">Wallet</p>
                      <p className="text-indigo-600">₹{order.walletAmountUsed || 0}</p>
                    </div>
                    <div className="bg-green-50 p-2 sm:p-3 rounded-lg sm:rounded-xl border border-green-100">
                      <p className="text-green-600 mb-0.5 sm:mb-1">Cashback</p>
                      <p className="text-green-700">₹{order.cashbackEarned}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    {["Pending", "Processing"].includes(order.status) ? (
                      <button
                        onClick={() =>
                          setActionModal({
                            open: true,
                            orderId: order.displayOrderId || order.orderId,
                            displayOrderId: order.displayOrderId || order.orderId,
                            type: "cancel",
                          })
                        }
                        className="flex-1 bg-red-600 text-white py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs hover:bg-red-700 transition-all shadow-md active:scale-95"
                      >
                        Cancel Item
                      </button>
                    ) : order.status === "Delivered" ? (
                      <button
                        onClick={() =>
                          setActionModal({
                            open: true,
                            orderId: order.displayOrderId || order.orderId,
                            displayOrderId: order.displayOrderId || order.orderId,
                            type: "return",
                          })
                        }
                        className="flex-1 bg-indigo-600 text-white py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs hover:bg-indigo-700 transition-all shadow-md active:scale-95"
                      >
                        Request Return
                      </button>
                    ) : null}
                    
                    <button
                      onClick={() => generateInvoice([order])}
                      className="flex-1 border-2 border-gray-100 text-gray-400 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs hover:bg-gray-50 hover:text-black hover:border-black transition-all flex items-center justify-center gap-2"
                    >
                      <FaDownload className="text-[10px]" /> Invoice
                    </button>
                  </div>

                  {/* Reasons */}
                  {order.cancelReason && (
                    <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-red-50 rounded-xl sm:rounded-2xl border border-red-100 italic text-[10px] sm:text-xs text-red-600 font-bold">
                       Cancellation Reason: {order.cancelReason}
                    </div>
                  )}
                  {order.returnReason && (
                    <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-orange-50 rounded-xl sm:rounded-2xl border border-orange-100 italic text-[10px] sm:text-xs text-orange-600 font-bold">
                       Return Reason: {order.returnReason}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Pagination */}
          {Math.ceil(totalCount / itemsPerPage) > 1 && (
            <div className="flex justify-center items-center gap-3 mt-10">
              <button
                disabled={currentPage === 1 || loading}
                onClick={() => handlePageChange(currentPage - 1)}
                className="px-6 py-3 rounded-2xl bg-white border border-gray-100 font-black uppercase tracking-widest text-[10px] disabled:opacity-30 shadow-sm"
              >
                Prev
              </button>
              
              <div className="flex gap-2">
                {[...Array(Math.ceil(totalCount / itemsPerPage))].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i + 1)}
                    className={`w-10 h-10 rounded-xl font-black text-xs transition-all ${
                      currentPage === i + 1 
                        ? "bg-black text-white shadow-xl" 
                        : "bg-white text-gray-400 border border-gray-50"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                disabled={currentPage === Math.ceil(totalCount / itemsPerPage) || loading}
                onClick={() => handlePageChange(currentPage + 1)}
                className="px-6 py-3 rounded-2xl bg-white border border-gray-100 font-black uppercase tracking-widest text-[10px] disabled:opacity-30 shadow-sm"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* ================= Action Modal ================= */}
      {actionModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full text-center">
            <h2 className="text-xl font-bold mb-4">
              {actionModal.type === "cancel" ? "Cancel Order" : "Request Return"}
            </h2>
            <p className="text-gray-600 mb-4">
              Please provide a reason for{" "}
              {actionModal.type === "cancel" ? "cancelling" : "returning"} your
              order:
            </p>
            {actionModal.type === "cancel" && (
              <p className="text-[10px] text-red-500 font-bold mb-4 uppercase tracking-widest italic">
                Note: 2% of the total product price will be deducted from your wallet refund.
              </p>
            )}
            <textarea
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded mb-4 resize-none"
              rows={3}
            />
            <div className="flex justify-center gap-4">
              <button
                onClick={() =>
                  setActionModal({ open: false, orderId: null, type: "" })
                }
                className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                className="px-4 py-2 rounded bg-red-500 text-white hover:opacity-90"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderList;