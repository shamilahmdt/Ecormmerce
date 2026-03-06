import React, { useEffect, useState } from "react";
import API, { SOCKET_URL } from "../../api";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { GridLoader } from "react-spinners";
import Select from "react-select";
import { GrPowerReset } from "react-icons/gr";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import { FaDownload } from "react-icons/fa";
import { generateInvoice } from "../../utils/invoiceGenerator";

const formatDate = (dateInput) => {
  if (!dateInput) return "-";
  try {
    let date;
    if (dateInput.seconds) date = new Date(dateInput.seconds * 1000);
    else if (dateInput._seconds) date = new Date(dateInput._seconds * 1000);
    else date = new Date(dateInput);

    if (isNaN(date.getTime())) return "-";
    
    return date.toLocaleDateString("en-GB");
  } catch (e) {
    return "-";
  }
};

const AdminOrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterDate, setFilterDate] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [refundConfirmOpen, setRefundConfirmOpen] = useState(false);

  const fetchOrders = async (page = 1, search = searchTerm, status = filterStatus, date = filterDate) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: itemsPerPage,
      });
      if (search.trim()) params.append("search", search);
      if (status !== "ALL") params.append("status", status);
      if (date) params.append("date", date);

      const response = await API.get(`/admin/orders?${params.toString()}`);
      const fetchedItems = Array.isArray(response.data.orders) ? response.data.orders : [];
      
      setOrders(fetchedItems);
      setTotalCount(response.data.totalCount || 0);
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
      setOrders(prev => [newOrder, ...prev]);
      toast.success(`New order received: #${newOrder.displayOrderId || newOrder.orderId}`, {
        icon: '🔔',
        duration: 5000
      });
    });

    return () => socket.disconnect();
  }, []);

  const handleSearch = () => {
    fetchOrders(1);
  };

  const handleStatusChange = (status) => {
    setFilterStatus(status);
    fetchOrders(1, searchTerm, status, filterDate);
  };

  const handleDateChange = (date) => {
    setFilterDate(date);
    fetchOrders(1, searchTerm, filterStatus, date);
  };

  const handleReset = () => {
    setSearchTerm("");
    setFilterStatus("ALL");
    setFilterDate("");
    fetchOrders(1, "", "ALL", "");
  };

  const handlePageChange = (newPage) => {
    const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;
    if (newPage < 1 || newPage > totalPages) return;
    fetchOrders(newPage);
  };


  // Open modal
  const openModal = (order) => {
    if (!order || order.status === "Delivered" || order.status === "Cancelled") return;
    setCurrentOrder(order);
    setNewStatus(order.status || "Pending");
    setCancelReason(order.cancelReason || "");
    setModalOpen(true);
  };

  // Update status
  const handleUpdateStatus = async () => {
    if (!currentOrder) return;

    if (newStatus === "Refunded") {
      setRefundConfirmOpen(true);
      return;
    }

    await proceedStatusUpdate();
  };

  const proceedStatusUpdate = async () => {
    try {
      await API.put(
        `/orders/${currentOrder.displayOrderId || currentOrder.orderId}`,
        {
          status: newStatus,
          cancelReason: newStatus === "Cancelled" ? cancelReason : "",
        }
      );

      if (newStatus === "Refunded") {
        toast.success(`SUCCESS: ₹${currentOrder.total} Refunded to Wallet`, {
          icon: '💰',
          style: {
            borderRadius: '10px',
            background: '#000',
            color: '#fff',
            fontSize: '10px',
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: '0.1em'
          }
        });
      } else {
        toast.success(`Status updated to ${newStatus}`);
      }

      setOrders((prev) =>
        prev.map((o) =>
          (o.displayOrderId || o.orderId) === (currentOrder.displayOrderId || currentOrder.orderId)
            ? { ...o, status: newStatus, cancelReason }
            : o
        )
      );
      setModalOpen(false);
      setRefundConfirmOpen(false);
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Update Failed");
    }
  };

  // Export to Excel (Export current view)
  const exportToExcel = () => {
    const data = orders.map((order) => {
      const item = order.items?.[0] || {};
      return {
        "User Name": order.userName || "-",
        Phone: order.userPhone || "-",
        "Order ID": order.displayOrderId || order.orderId,
        Date: formatDate(order.date || order.createdAt || order.CREATED_AT),
        "Product": item.name || "-",
        Total: (order.total || 0).toFixed(2),
        Status: order.status || "Pending",
        "Payment Method": order.paymentMethod,
        "Cancel Reason": order.cancelReason || "",
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Items_List");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "admin_items_list.xlsx");
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;

  return (
    <div className="p-3 sm:p-10 max-w-7xl mx-auto min-h-screen bg-transparent">
      {loading && orders.length === 0 ? (
        <div className="flex items-center justify-center min-h-screen">
          <GridLoader color="#000" size={25} />
        </div>
      ) : (
        <>
          {/* HEADER SECTION */}
          <div className="mb-6 sm:mb-10">
            <div className="flex items-center gap-2 text-[8px] sm:text-[10px] font-black text-gray-400 mb-1 sm:mb-2 uppercase tracking-[0.3em]">
               <span>Admin</span>
               <span>/</span>
               <span className="text-black">Order Control</span>
            </div>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6">
              <div>
                <h1 className="text-2xl sm:text-5xl font-black text-gray-900 tracking-tighter uppercase leading-none">
                  Admin <span className="text-indigo-600">Control</span>
                </h1>
                <p className="text-[9px] sm:text-xs font-bold text-gray-400 mt-2 uppercase tracking-widest">Total Management ({totalCount} items)</p>
              </div>
              <button
                onClick={exportToExcel}
                className="bg-black text-white px-6 sm:px-8 py-3 rounded-xl sm:rounded-2xl font-black uppercase tracking-[0.2em] text-[8px] sm:text-[10px] hover:bg-indigo-600 transition-all shadow-xl shadow-black/10 active:scale-95 flex items-center gap-2 justify-center"
              >
                Export Excel
              </button>
            </div>
          </div>

          {/* TOOLBAR SECTION */}
          <div className="bg-white border border-gray-100 p-3 sm:p-6 rounded-2xl sm:rounded-[2.5rem] shadow-sm mb-6 sm:mb-8">
            <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                  </span>
                  <input
                    type="text"
                    placeholder="Search receipt, name, Catalog Tag..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-10 pr-4 py-3 sm:py-3.5 bg-gray-50 border border-gray-100 rounded-xl sm:rounded-2xl text-[10px] sm:text-[11px] font-bold outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <select 
                  value={filterStatus}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="w-full px-4 py-3 sm:py-3.5 bg-gray-50 border border-gray-100 rounded-xl sm:rounded-2xl text-[10px] sm:text-[11px] font-bold outline-none focus:ring-2 focus:ring-black appearance-none"
                >
                   <option value="ALL">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Dispatched">Dispatched</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="ReturnProduct">ReturnProduct</option>
                  <option value="Refund Proceed">Refund Proceed</option>
                  <option value="Refunded">Refunded</option>
                </select>

                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="w-full px-4 py-3 sm:py-3.5 bg-gray-50 border border-gray-100 rounded-xl sm:rounded-2xl text-[10px] sm:text-[11px] font-bold outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={handleSearch}
                  className="flex-1 lg:flex-none bg-indigo-600 text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl text-[10px] sm:text-[11px] font-black uppercase tracking-widest hover:bg-indigo-700 active:scale-95"
                >
                  Apply
                </button>
                <div 
                  onClick={handleReset}
                  className="bg-gray-50 border border-gray-100 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl cursor-pointer text-gray-400 hover:text-black hover:bg-gray-100 transition-all flex items-center justify-center shrink-0"
                >
                  <GrPowerReset size={16} />
                </div>
              </div>
            </div>
          </div>

          {/* LIST SECTION */}
          <div className="space-y-3 sm:space-y-4">
            {orders.map((order) => {
              const item = order.items?.[0] || {}; 
              return (
                <div
                  key={order.id}
                  className="bg-white border border-gray-50 rounded-2xl sm:rounded-[2rem] p-3 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 hover:shadow-xl hover:shadow-indigo-100/20 transition-all duration-500 group relative"
                >
                  <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1/2 rounded-r-full ${
                    order.status === "Cancelled" ? "bg-red-500" :
                    order.status === "ReturnProduct" ? "bg-orange-500" :
                    order.status === "Refund Proceed" ? "bg-purple-600" :
                    order.status === "Refunded" ? "bg-indigo-600" :
                    order.status === "Delivered" ? "bg-green-500" :
                    order.status === "Dispatched" ? "bg-blue-500" :
                    "bg-yellow-500"
                  }`} />

                  <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-50 rounded-xl sm:rounded-2xl p-2 flex-shrink-0 border border-gray-50 relative group-hover:scale-105 transition-transform">
                    <img src={item.imageUrl} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                  </div>

                  <div className="flex-grow grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 w-full text-left">
                    <div className="flex flex-col justify-center">
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">Receipt ID</p>
                      <p className="font-black text-[10px] sm:text-xs text-gray-900 leading-none mb-1">#{order.displayOrderId}</p>
                      <p className="text-[8px] sm:text-[10px] font-bold text-gray-400">{formatDate(order.date || order.createdAt || order.CREATED_AT)}</p>
                    </div>

                    <div className="flex flex-col justify-center">
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">Product</p>
                      <p className="font-bold text-[10px] sm:text-xs text-gray-900 truncate uppercase tracking-tight group-hover:text-indigo-600">{item.name}</p>
                      <p className="text-[8px] sm:text-[10px] font-black text-indigo-500 uppercase mt-0.5 tracking-wider">₹{(order.total || 0).toLocaleString()}</p>
                    </div>

                    <div className="hidden sm:flex flex-col justify-center">
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">Customer</p>
                      <p className="font-bold text-[10px] sm:text-xs text-gray-900 truncate uppercase">{order.userName}</p>
                      <p className="text-[8px] sm:text-[10px] font-bold text-gray-400">{order.userPhone}</p>
                    </div>

                    <div className="flex flex-col justify-center">
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">Status</p>
                      <p className={`text-[8px] sm:text-[9px] font-black uppercase tracking-[0.1em] ${
                        order.status === "Cancelled" ? "text-red-500" :
                        order.status === "ReturnProduct" ? "text-orange-500" :
                        order.status === "Refund Proceed" ? "text-purple-600" :
                        order.status === "Refunded" ? "text-indigo-600" :
                        order.status === "Delivered" ? "text-green-600" :
                        order.status === "Dispatched" ? "text-blue-600" :
                        "text-yellow-600"
                      }`}>
                        {order.status || "Pending"}
                      </p>
                    </div>

                    <div className="col-span-2 md:col-span-1 flex items-center justify-start sm:justify-end gap-2 mt-1 sm:mt-0">
                       <button
                         onClick={() => generateInvoice([order])}
                         className="p-2.5 sm:p-3.5 rounded-lg sm:rounded-2xl border-2 border-gray-100 text-gray-400 hover:text-black hover:border-black transition-all active:scale-95 flex items-center justify-center shrink-0"
                         title="Download Invoice"
                       >
                         <FaDownload className="text-xs sm:text-sm" />
                       </button>
                       <button
                        onClick={() => openModal(order)}
                        disabled={order.status === "Refunded" || (order.status === "Cancelled" && !(order.walletAmountUsed > 0))}
                        className={`px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-lg sm:rounded-2xl font-black uppercase tracking-widest text-[8px] sm:text-[10px] transition-all ${
                          order.status === "Refunded" || (order.status === "Cancelled" && !(order.walletAmountUsed > 0))
                            ? "bg-gray-50 text-gray-300 cursor-not-allowed"
                            : "bg-black text-white hover:bg-indigo-600 shadow-lg active:scale-95"
                        }`}
                      >
                        Update
                      </button>

                      {/* Dedicated Refund Button for Wallet Orders */}
                      {((order.status === "Cancelled" && order.walletAmountUsed > 0) || 
                        (["ReturnProduct", "Refund Proceed"].includes(order.status) && order.walletAmountUsed > 0)) && (
                        <button
                          onClick={() => {
                            setCurrentOrder(order);
                            setNewStatus("Refunded");
                            setRefundConfirmOpen(true);
                          }}
                          className="px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-lg sm:rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-widest text-[8px] sm:text-[10px] hover:bg-indigo-700 shadow-lg shadow-indigo-100 active:scale-95 animate-in fade-in zoom-in duration-300 transition-all"
                        >
                          Refund
                        </button>
                      )}
                      <div className="sm:hidden text-[8px] font-bold text-gray-400 italic">
                        Node: {order.userName?.split(' ')[0]}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
            
            {orders.length === 0 && !loading && (
              <div className="py-24 text-center bg-white rounded-[3rem] border border-dashed border-gray-200">
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No items found matching your criteria</p>
              </div>
            )}

          {/* PAGINATION SECTION */}
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center items-center gap-2">
              <button
                disabled={currentPage === 1 || loading}
                onClick={() => handlePageChange(currentPage - 1)}
                className="px-6 py-3 rounded-2xl border border-gray-100 bg-white text-gray-400 disabled:opacity-30 hover:text-black transition-all font-black text-[10px] uppercase tracking-widest"
              >
                Previous
              </button>
              
              <div className="flex items-center gap-1.5 mx-2">
                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  if (totalPages > 7 && Math.abs(pageNum - currentPage) > 2 && pageNum !== 1 && pageNum !== totalPages) {
                    if (Math.abs(pageNum - currentPage) === 3) return <span key={pageNum} className="text-gray-200 font-bold">...</span>
                    return null;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-11 h-11 rounded-2xl font-black text-[11px] transition-all ${
                        currentPage === pageNum 
                          ? "bg-black text-white shadow-xl shadow-gray-200" 
                          : "bg-white border border-gray-50 text-gray-400 hover:text-black"
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>

              <button
                disabled={currentPage === totalPages || loading}
                onClick={() => handlePageChange(currentPage + 1)}
                className="px-6 py-3 rounded-2xl border border-gray-100 bg-white text-gray-400 disabled:opacity-30 hover:text-black transition-all font-black text-[10px] uppercase tracking-widest"
              >
                Next
              </button>
            </div>
          )}

          {/* MODAL SYSTEM */}
          {modalOpen && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xl flex items-center justify-center z-50 p-4">
              <div className="bg-white p-8 sm:p-12 rounded-[3rem] shadow-2xl w-full max-w-md border border-gray-100">
                <div className="mb-8">
                  <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase mb-1">Update Status</h2>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Manage this specific item receipt</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5 block px-1">Choose New State</label>
                    <Select
                      value={{ value: newStatus, label: newStatus }}
                      onChange={(selected) => setNewStatus(selected.value)}
                      options={[
                        { value: "Pending", label: "Pending" },
                        { value: "Processing", label: "Processing" },
                        { value: "Dispatched", label: "Dispatched" },
                        { value: "Out for Delivery", label: "Out for Delivery" },
                        { value: "Delivered", label: "Delivered" },
                        { value: "Cancelled", label: "Cancelled" },
                        ...(currentOrder && ["ReturnProduct", "Refund Proceed", "Refunded"].includes(currentOrder.status) 
                          ? [
                              { value: "ReturnProduct", label: "ReturnProduct" },
                              { value: "Refund Proceed", label: "Refund Proceed" },
                              { value: "Refunded", label: "Refunded" },
                            ] 
                          : []
                        )
                      ].filter(opt => {
                        const isReturnFlow = currentOrder && ["ReturnProduct", "Refund Proceed", "Refunded"].includes(currentOrder.status);
                        const isCancelledWallet = currentOrder && currentOrder.status === "Cancelled" && currentOrder.walletAmountUsed > 0;

                        if (isReturnFlow) {
                          return ["ReturnProduct", "Refund Proceed", "Refunded"].includes(opt.value);
                        }
                        
                        if (isCancelledWallet) {
                          // Allow transitioning from Cancelled to Refunded for wallet orders
                          return ["Cancelled", "Refunded"].includes(opt.value);
                        }

                        // Otherwise show standard states
                        return !["ReturnProduct", "Refund Proceed", "Refunded"].includes(opt.value);
                      })}
                      styles={{
                        control: (base) => ({
                          ...base,
                          borderRadius: '20px',
                          borderColor: '#f3f4f6',
                          backgroundColor: '#f9fafb',
                          padding: '8px 12px',
                          boxShadow: 'none',
                          fontWeight: '800',
                          fontSize: '12px',
                          textTransform: 'uppercase',
                        })
                      }}
                    />
                  </div>

                  {newStatus === "Cancelled" && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5 block px-1">Cancellation Reason</label>
                      <textarea
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 font-bold text-xs outline-none focus:ring-2 focus:ring-red-500 transition-all min-h-[100px] resize-none"
                        placeholder="Reason for stock out / user req..."
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                      />
                    </div>
                  )}

                  <div className="flex flex-col gap-3 pt-6">
                    <button
                      onClick={handleUpdateStatus}
                      className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black uppercase tracking-widest text-[11px] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"
                    >
                      Confirm Changes
                    </button>
                    <button
                      onClick={() => setModalOpen(false)}
                      className="w-full bg-white text-gray-400 py-4 rounded-3xl font-black uppercase tracking-widest text-[10px] hover:text-black transition-all"
                    >
                      Go Back
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* REFUND CONFIRMATION MODAL */}
          {refundConfirmOpen && currentOrder && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-2xl flex items-center justify-center z-[60] p-4">
              <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-2xl w-full max-w-sm border border-gray-100 text-center">
                <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl">💰</span>
                </div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase mb-2">Automated Refund</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed mb-8">
                  You are about to credit <span className="text-indigo-600">₹{currentOrder.total}</span> directly to <span className="text-black">{currentOrder.userName}'s</span> digital wallet. This action is final.
                </p>
                
                <div className="flex flex-col gap-3">
                  <button
                    onClick={proceedStatusUpdate}
                    className="w-full bg-black text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-100/50"
                  >
                    Confirm & Refund
                  </button>
                  <button
                    onClick={() => setRefundConfirmOpen(false)}
                    className="w-full bg-gray-50 text-gray-400 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:text-black transition-all"
                  >
                    Abort Action
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminOrderList;