import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("loggedInUser"));

  // ✅ Correct way to use context
  const { cart } = useCart();

  // Calculate total items
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    navigate("/auth");
  };

  return (
    <nav className="bg-black text-white flex justify-between items-center p-4">
      <div className="flex space-x-4">
        {user?.role === "admin" && (
          <>
            <Link to="/dashboard" className="hover:underline">
              Dashboard
            </Link>
            <Link to="/add-product" className="hover:underline">
              Add Product
            </Link>
            <Link to="/admin-orders" className="hover:underline">
              All Orders
            </Link>
          </>
        )}

        {user?.role === "user" && (
          <>
            <Link to="/" className="hover:underline">
              Home
            </Link>
            <Link to="/cart" className="hover:underline">
              Cart ({totalItems})
            </Link>
            <Link to="/orders" className="hover:underline">
              My Orders
            </Link>
          </>
        )}
      </div>

      {user && (
        <button
          onClick={handleLogout}
          className="bg-white text-black px-3 py-1 rounded hover:opacity-90"
        >
          Logout
        </button>
      )}
    </nav>
  );
};

export default Navbar;