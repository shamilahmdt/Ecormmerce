import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";
import axios from "axios";

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const [modalOpen, setModalOpen] = useState(false); // ✅ modal state

  const handlePlaceOrder = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await axios.post(
        "http://localhost:5000/api/orders",
        {
          items: cart,
          total,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Order placed successfully!");
      clearCart();
      navigate("/order-placed");
    } catch (err) {
      console.error("Error placing order:", err);
      toast.error("Failed to place order.");
    }
  };

  if (cart.length === 0)
    return <p className="text-center mt-20 text-gray-500">No items in checkout.</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      {cart.map((item) => (
        <div key={item.id} className="flex justify-between mb-2">
          <p>{item.name} x {item.quantity}</p>
          <p>₹{item.price * item.quantity}</p>
        </div>
      ))}

      <div className="text-right mt-4">
        <p className="text-xl font-bold">Total: ₹{total}</p>
        <button
          onClick={() => setModalOpen(true)} // ✅ open modal instead
          className="mt-2 bg-green-600 text-white px-4 py-2 rounded hover:opacity-90 transition"
        >
          Place Order
        </button>
      </div>

      {/* ================= Modal ================= */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full text-center">
            <h2 className="text-xl font-bold mb-4">
              Confirm Order?
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to place this order? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handlePlaceOrder}
                className="px-4 py-2 rounded bg-green-600 text-white hover:opacity-90"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;