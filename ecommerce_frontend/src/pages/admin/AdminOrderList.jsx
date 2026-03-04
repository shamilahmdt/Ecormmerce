import React, { useEffect, useState } from "react";
import API from "../../api";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { GridLoader } from "react-spinners";
import Select from "react-select";
import { GrPowerReset } from "react-icons/gr";

const formatDate = (dateInput) => {
  if (!dateInput) return "-";
  let date;
  if (dateInput.seconds) date = new Date(dateInput.seconds * 1000);
  else if (dateInput._seconds) date = new Date(dateInput._seconds * 1000);
  else date = new Date(dateInput);

  return isNaN(date.getTime()) ? "-" : date.toLocaleDateString();
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

    try {
      await API.put(
        `/orders/${currentOrder.displayOrderId || currentOrder.orderId}`,
        {
          status: newStatus,
          cancelReason: newStatus === "Cancelled" ? cancelReason : "",
        }
      );

      setOrders((prev) =>
        prev.map((o) =>
          (o.displayOrderId || o.orderId) === (currentOrder.displayOrderId || currentOrder.orderId)
            ? { ...o, status: newStatus, cancelReason }
            : o
        )
      );
      setModalOpen(false);
    } catch (err) {
      console.error("Error updating status:", err);
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
        Date: order.date ? new Date(order.date).toLocaleString() : "-",
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
    <>
      {loading && orders.length === 0 ? (
        <div className="flex items-center justify-center min-h-screen">
          <GridLoader color="#000" size={25} />
        </div>
      ) : (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-gray-900 uppercase">Item Management</h1>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">One entry per physical item (Total: {totalCount})</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              {/* Date Filter */}
              <input
                type="date"
                value={filterDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-black"
              />

              {/* Status Filter */}
              <select 
                value={filterStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-black"
              >
                <option value="ALL">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Dispatched">Dispatched</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              {/* Search Field */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search Category, Product, ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-black flex-grow sm:w-64"
                />
                <button 
                  onClick={handleSearch}
                  className="bg-black text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase"
                >
                  Apply
                </button>

                <div 
                  onClick={handleReset}
                  className="bg-gray-50 border border-gray-100 p-2 rounded-xl cursor-pointer text-gray-400 hover:text-black hover:border-black transition-all flex items-center justify-center"
                >
                  <GrPowerReset size={16} />
                </div>
              </div>

              <button
                onClick={exportToExcel}
                className="bg-indigo-50 text-indigo-600 border border-indigo-100 px-6 py-2 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-100 transition-all flex-shrink-0"
              >
                Export Page
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {orders.map((order) => {
              const item = order.items?.[0] || {}; 
              return (
                <div
                  key={order.id}
                  className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 hover:shadow-md transition-all group"
                >
                  {/* Product Image */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 rounded-xl p-2 flex-shrink-0 border border-gray-100">
                    <img src={item.imageUrl} alt="" className="w-full h-full object-contain" />
                  </div>

                  {/* Info Blocks */}
                  <div className="flex-grow grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Receipt / Date</p>
                      <p className="font-black text-xs text-gray-900">#{order.displayOrderId}</p>
                      <p className="text-[9px] font-bold text-gray-400 mt-0.5">{formatDate(order.date || order.CREATED_AT)}</p>
                    </div>

                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Item Detail</p>
                      <p className="font-bold text-xs text-gray-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">{item.name}</p>
                      <p className="text-[9px] font-bold text-indigo-500 uppercase mt-0.5">₹{(order.total || 0).toLocaleString()}</p>
                    </div>

                    <div className="hidden lg:block">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Customer</p>
                      <p className="font-bold text-xs text-gray-800 truncate">{order.userName}</p>
                      <p className="text-[9px] font-bold text-gray-400 mt-0.5">{order.userPhone}</p>
                    </div>

                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                          order.status === "Cancelled" ? "bg-red-50 text-red-500" :
                          order.status === "Delivered" ? "bg-green-50 text-green-600" :
                          order.status === "Dispatched" ? "bg-blue-50 text-blue-600" :
                          "bg-yellow-50 text-yellow-600"
                        }`}
                      >
                        {order.status || "Pending"}
                      </span>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => openModal(order)}
                      disabled={order.status === "Delivered" || order.status === "Cancelled"}
                      className={`flex-1 sm:flex-none px-5 py-3 rounded-xl font-black uppercase tracking-widest text-[9px] transition-all ${
                        order.status === "Delivered" || order.status === "Cancelled"
                          ? "bg-gray-50 text-gray-300 cursor-not-allowed border border-gray-100"
                          : "bg-gray-900 text-white hover:bg-black active:scale-95 shadow-sm"
                      }`}
                    >
                      Update
                    </button>
                  </div>
                </div>
              );
            })}
            {orders.length === 0 && !loading && (
              <div className="py-20 text-center">
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No items found matching your criteria</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-10 flex justify-center items-center gap-2">
              <button
                disabled={currentPage === 1 || loading}
                onClick={() => handlePageChange(currentPage - 1)}
                className="px-4 py-2 rounded-xl border border-gray-100 disabled:opacity-30 hover:bg-gray-50 transition-all font-black text-[10px] uppercase"
              >
                Prev
              </button>
              
              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                // Simple logic to show only near pages if too many
                if (totalPages > 7 && Math.abs(pageNum - currentPage) > 2 && pageNum !== 1 && pageNum !== totalPages) {
                  if (Math.abs(pageNum - currentPage) === 3) return <span key={pageNum} className="text-gray-300">...</span>
                  return null;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-10 h-10 rounded-xl font-black text-xs transition-all ${
                      currentPage === pageNum ? "bg-black text-white shadow-lg shadow-gray-200" : "border border-gray-50 hover:bg-gray-50 text-gray-400"
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}

              <button
                disabled={currentPage === totalPages || loading}
                onClick={() => handlePageChange(currentPage + 1)}
                className="px-4 py-2 rounded-xl border border-gray-100 disabled:opacity-30 hover:bg-gray-50 transition-all font-black text-[10px] uppercase"
              >
                Next
              </button>
            </div>
          )}


          {/* Modal */}
          {modalOpen && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
              <div className="bg-white p-10 rounded-[40px] shadow-2xl w-full max-w-md border-t-8 border-indigo-600">
                <h2 className="text-3xl font-black mb-2 tracking-tighter">Update Status</h2>
                <p className="text-gray-400 font-bold mb-8">Manage this specific item receipt</p>

                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Choose New State</label>
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
                      ]}
                      styles={{
                        control: (base) => ({
                          ...base,
                          borderRadius: '16px',
                          borderColor: '#f3f4f6',
                          padding: '8px',
                          boxShadow: 'none',
                          fontWeight: 'bold',
                        })
                      }}
                    />
                  </div>

                  {newStatus === "Cancelled" && (
                    <div className="animate-in slide-in-from-top-2 duration-300">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Cancellation Reason</label>
                      <input
                        type="text"
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 font-bold outline-none focus:ring-2 focus:ring-red-500 transition-all"
                        placeholder="Reason for stock out / user req..."
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                      />
                    </div>
                  )}

                  <div className="flex flex-col gap-3 pt-4">
                    <button
                      onClick={handleUpdateStatus}
                      className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"
                    >
                      Confirm Changes
                    </button>
                    <button
                      onClick={() => setModalOpen(false)}
                      className="w-full bg-gray-50 text-gray-400 py-4 rounded-3xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-100 transition-all"
                    >
                      Go Back
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default AdminOrderList;