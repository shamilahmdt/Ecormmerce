import React, { useEffect, useState } from "react";
import API from "../api";
// import { firestore } from "../firebaseConfig";
// import { doc, getDoc, setDoc } from "firebase/firestore";
import { GridLoader } from "react-spinners";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const OrderList = () => {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionModal, setActionModal] = useState({
    open: false,
    orderId: null,
    type: "", // "cancel" or "return"
  });
  const [actionReason, setActionReason] = useState("");

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await API.get("/orders");
        setOrders(res.data.orders || []);
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

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
          o.orderId === actionModal.orderId
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
        <div className="p-6 max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">My Orders</h1>

          {orders.map((order) => (
            <div
              key={order.orderId}
              className="border p-4 rounded mb-4 bg-white shadow-sm"
            >
              <p className="text-gray-500 text-sm mb-2">
                Order ID: {order.orderId} | Date:{" "}
                {new Date(order.date).toLocaleString()} | Status:{" "}
                <span
                  className={`font-semibold ${
                    order.status === "Cancelled"
                      ? "text-red-500"
                      : order.status === "ReturnRequested"
                      ? "text-orange-500"
                      : order.status === "Delivered"
                      ? "text-blue-600"
                      : "text-green-600"
                  }`}
                >
                  {order.status || "Pending"}
                </span>
              </p>

              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between mt-2">
                  <p>
                    {item.name} x {item.quantity}
                  </p>
                  <p>₹{item.price * item.quantity}</p>
                </div>
              ))}

              <p className="text-right font-bold mt-2">
                Total: ₹{order.total.toFixed(2)}
              </p>

              {/* Action Buttons */}
              {order.status === "Pending" || order.status === "Processing" ? (
                <button
                  onClick={() =>
                    setActionModal({
                      open: true,
                      orderId: order.orderId,
                      type: "cancel",
                    })
                  }
                  className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:opacity-90"
                >
                  Cancel Order
                </button>
              ) : order.status === "Delivered" ? (
                <button
                  onClick={() =>
                    setActionModal({
                      open: true,
                      orderId: order.orderId,
                      type: "return",
                    })
                  }
                  className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:opacity-90"
                >
                  Request Return
                </button>
              ) : null}

              {order.cancelReason && (
                <p className="text-red-500 text-sm mt-1">
                  Reason: {order.cancelReason}
                </p>
              )}
              {order.returnReason && (
                <p className="text-orange-500 text-sm mt-1">
                  Return Reason: {order.returnReason}
                </p>
              )}
            </div>
          ))}
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