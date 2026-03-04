import React, { useEffect, useState } from "react";
import API from "../../api";
// import { firestore } from "../../firebaseConfig";
// import { doc, getDoc, setDoc } from "firebase/firestore";
import { GridLoader } from "react-spinners";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const formatDate = (dateInput) => {
  if (!dateInput) return "-";
  let date;
  if (dateInput.seconds) date = new Date(dateInput.seconds * 1000);
  else if (dateInput._seconds) date = new Date(dateInput._seconds * 1000);
  else date = new Date(dateInput);

  return isNaN(date.getTime()) ? "-" : date.toLocaleString();
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
                    : "ReturnRequested",
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
      toast.error("Failed to process action.");
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
        <div className="p-6 max-w-3xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <h1 className="text-3xl font-black tracking-tighter uppercase">My Order Receipts</h1>
              <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">Total Receipts: {totalCount}</p>
            </div>
            
            <div className="flex gap-2 items-center w-full sm:w-auto">
              <input
                type="date"
                value={filterDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="flex-grow sm:flex-none px-4 py-2 rounded-xl bg-white border border-gray-100 text-xs font-black outline-none focus:ring-2 focus:ring-black shadow-sm"
              />
              {filterDate && (
                <button 
                  onClick={clearFilters}
                  className="px-4 py-2 rounded-xl bg-gray-50 border border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black hover:border-black transition-all"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {orders.map((order) => {
            const item = order.items[0]; // Each order is now 1 item
            return (
              <div
                key={order.id}
                className="bg-white rounded-[32px] border border-gray-100 shadow-xl overflow-hidden group transition-all hover:shadow-2xl"
              >
                <div className="p-6">
                  {/* Header: ID & Status */}
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Receipt ID</p>
                      <p className="font-black text-lg">#{order.displayOrderId || order.orderId}</p>
                      <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">{formatDate(order.date || order.CREATED_AT)}</p>
                    </div>
                    <span
                      className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        order.status === "Cancelled" ? "bg-red-100 text-red-500" :
                        order.status === "ReturnRequested" ? "bg-orange-100 text-orange-500" :
                        order.status === "Delivered" ? "bg-green-100 text-green-600" :
                        order.status === "Dispatched" ? "bg-blue-100 text-blue-600" :
                        "bg-yellow-100 text-yellow-600"
                      }`}
                    >
                      {order.status || "Pending"}
                    </span>
                  </div>

                  {/* Product Info */}
                  <div className="flex gap-6 items-center bg-gray-50 p-4 rounded-2xl mb-6">
                    <div className="w-20 h-20 bg-white rounded-xl border p-2 flex items-center justify-center">
                      <img src={item.imageUrl} alt={item.name} className="max-h-full max-w-full object-contain" />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-black text-gray-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{item.name}</h3>
                      <p className="text-sm font-bold text-gray-500">Quantity: {item.quantity}</p>
                      <p className="text-lg font-black text-gray-900">₹{order.total.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="grid grid-cols-3 gap-2 mb-6 text-[9px] font-black uppercase tracking-tight">
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <p className="text-gray-400 mb-1">Method</p>
                      <p className="text-gray-900 line-clamp-1 truncate">{order.paymentMethod}</p>
                    </div>
                    <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                      <p className="text-indigo-400 mb-1">Wallet</p>
                      <p className="text-indigo-600">₹{order.walletAmountUsed || 0}</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-xl border border-green-100">
                      <p className="text-green-600 mb-1">Cashback</p>
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
                        className="flex-1 bg-red-600 text-white py-3 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-red-700 transition-all shadow-lg shadow-red-100"
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
                        className="flex-1 bg-indigo-600 text-white py-3 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                      >
                        Request Return
                      </button>
                    ) : null}
                  </div>

                  {/* Reasons */}
                  {order.cancelReason && (
                    <div className="mt-4 p-4 bg-red-50 rounded-2xl border border-red-100 italic text-xs text-red-600 font-bold">
                       Cancellation Reason: {order.cancelReason}
                    </div>
                  )}
                  {order.returnReason && (
                    <div className="mt-4 p-4 bg-orange-50 rounded-2xl border border-orange-100 italic text-xs text-orange-600 font-bold">
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