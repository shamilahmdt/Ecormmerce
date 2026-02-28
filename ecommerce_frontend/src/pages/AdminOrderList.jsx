import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { GridLoader } from "react-spinners";

const AdminOrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [cancelReason, setCancelReason] = useState("");

  // Fetch all orders
  useEffect(() => {
    const fetchAllOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/admin/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(Array.isArray(response.data.orders) ? response.data.orders : []);
      } catch (err) {
        console.error("Error fetching all orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllOrders();
  }, []);

  // Open modal
  const openModal = (order) => {
    if (!order || order.status === "Delivered") return;
    setCurrentOrder(order);
    setNewStatus(order.status || "Pending");
    setCancelReason(order.cancelReason || "");
    setModalOpen(true);
  };

  // Update status
  const handleUpdateStatus = async () => {
    if (!currentOrder) return;

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/orders/${currentOrder.orderId}`,
        {
          status: newStatus,
          cancelReason: newStatus === "Cancelled" ? cancelReason : "",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOrders((prev) =>
        prev.map((o) =>
          o.orderId === currentOrder.orderId
            ? { ...o, status: newStatus, cancelReason }
            : o
        )
      );
      setModalOpen(false);
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  // Export to Excel
  const exportToExcel = () => {
    const data = [];
    orders.forEach((order, orderIdx) => {
      const items = Array.isArray(order.items) ? order.items : [];
      items.forEach((item, itemIdx) => {
        data.push({
          "User Name": order.userName || "-",
          Phone: order.userPhone || "-",
          "Order ID": order.orderId || `unknown-${orderIdx}`,
          Date: order.date ? new Date(order.date).toLocaleString() : "-",
          "Product Name": item.name || "-",
          Quantity: item.quantity || 0,
          Price: item.price || 0,
          Total: order.total || 0,
          Status: order.status || "Pending",
          "Cancel Reason": order.cancelReason || "",
        });
      });
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "orders.xlsx");
  };

  return (
    <>
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <GridLoader color="#000" size={25} />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white p-6 rounded-xl shadow text-center mt-20 max-w-md mx-auto">
          <p className="text-gray-500 text-lg">No orders placed yet.</p>
        </div>
      ) : (
        <div className="p-6 max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold mb-6 flex justify-between items-center">
            All User Orders
            <button
              onClick={exportToExcel}
              className="bg-green-600 text-white px-4 py-2 rounded hover:opacity-90 transition"
            >
              Download Excel
            </button>
          </h1>

          {orders.map((order, orderIdx) => {
            const items = Array.isArray(order.items) ? order.items : [];
            return (
              <div
                key={order.orderId || `unknown-${orderIdx}`}
                className="border p-4 rounded mb-4 bg-white shadow-sm"
              >
                <p className="text-gray-500 text-sm mb-2">
                  User: {order.userName || "-"} ({order.userPhone || "-"}) | Order ID:{" "}
                  {order.orderId || `unknown-${orderIdx}`} | Date:{" "}
                  {order.date ? new Date(order.date).toLocaleString() : "-"} | Status:{" "}
                  <span
                    className={`font-semibold ${
                      order.status === "Cancelled"
                        ? "text-red-500"
                        : order.status === "Delivered"
                        ? "text-green-600"
                        : "text-yellow-500"
                    }`}
                  >
                    {order.status || "Pending"}
                  </span>
                </p>

                {items.map((item, itemIdx) => (
                  <div
                    key={item.id || `${order.orderId || "unknown"}-${itemIdx}`}
                    className="flex justify-between mt-2"
                  >
                    <p>
                      {item.name || "-"} x {item.quantity || 0}
                    </p>
                    <p>₹{(item.price || 0) * (item.quantity || 0)}</p>
                  </div>
                ))}

                <p className="text-right font-bold mt-2">
                  Total: ₹{order.total ? order.total.toFixed(2) : "0.00"}
                </p>

                <button
                  onClick={() => openModal(order)}
                  className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:opacity-90"
                >
                  Update Status
                </button>

                {order.cancelReason && (
                  <p className="text-red-500 text-sm mt-1">Reason: {order.cancelReason}</p>
                )}
              </div>
            );
          })}

          {/* Modal */}
          {modalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Update Order Status</h2>

                <label className="block mb-2">
                  Status:
                  <select
                    className="w-full border p-2 rounded mt-1"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </label>

                {newStatus === "Cancelled" && (
                  <label className="block mb-2">
                    Cancel Reason:
                    <input
                      type="text"
                      className="w-full border p-2 rounded mt-1"
                      placeholder="Enter reason for cancellation"
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                    />
                  </label>
                )}

                <div className="flex justify-end mt-4 space-x-2">
                  <button
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateStatus}
                    className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Save
                  </button>
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