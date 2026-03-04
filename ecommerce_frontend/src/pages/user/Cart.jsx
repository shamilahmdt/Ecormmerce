import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";

const Cart = () => {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart, total, clearCart } = useCart();

  const [modalOpen, setModalOpen] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);
  const [clearAll, setClearAll] = useState(false);

  if (cart.length === 0)
    return (
      <p className="text-center mt-20 text-gray-500 text-lg">
        Your cart is empty.
        <br />
        <Link
          to="/"
          className="mt-4 inline-block text-blue-500 hover:underline"
        >
          ← Continue Shopping
        </Link>
      </p>
    );

  const openRemoveModal = (id) => {
    setItemToRemove(id);
    setClearAll(false);
    setModalOpen(true);
  };

  const openClearModal = () => {
    setClearAll(true);
    setModalOpen(true);
  };

  const handleConfirm = () => {
    if (clearAll) clearCart();
    else if (itemToRemove) removeFromCart(itemToRemove);

    setModalOpen(false);
    setItemToRemove(null);
    setClearAll(false);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>

      {cart.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between mb-4 border-b pb-4"
        >
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-24 h-24 object-cover rounded"
          />

          <div className="flex-1 mx-4">
            <h2 className="font-semibold">{item.name}</h2>
            <p className="text-gray-600">₹{item.price}</p>

            <div className="flex items-center mt-1">
              <button
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                className="bg-gray-200 px-2 py-1 rounded-l hover:bg-gray-300"
              >
                -
              </button>

              <input
                type="text"
                value={item.quantity}
                readOnly
                className="w-12 text-center border-t border-b border-gray-200"
              />

              <button
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="bg-gray-200 px-2 py-1 rounded-r hover:bg-gray-300"
              >
                +
              </button>
            </div>
          </div>

          <button
            onClick={() => openRemoveModal(item.id)}
            className="text-red-500 font-semibold hover:underline"
          >
            Remove
          </button>
        </div>
      ))}

      <div className="text-right mt-6">
        <p className="text-xl font-bold">
          Total: ₹{total.toFixed(2)}
        </p>

        <button
          onClick={() => navigate("/checkout")}
          className="mt-2 bg-black text-white px-4 py-2 rounded hover:opacity-90 transition"
        >
          Proceed to Checkout
        </button>

        <button
          onClick={openClearModal}
          className="mt-2 ml-4 bg-red-500 text-white px-4 py-2 rounded hover:opacity-90 transition"
        >
          Clear Cart
        </button>
      </div>

      <Link
        to="/"
        className="mt-4 inline-block text-blue-500 hover:underline"
      >
        ← Continue Shopping
      </Link>

      {/* ================= Modal ================= */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full text-center">
            <h2 className="text-xl font-bold mb-4">
              {clearAll
                ? "Clear Entire Cart?"
                : "Remove this item from cart?"}
            </h2>
            <p className="text-gray-600 mb-6">
              {clearAll
                ? "This action cannot be undone."
                : "Are you sure you want to remove this item?"}
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 rounded bg-red-500 text-white hover:opacity-90"
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

export default Cart;