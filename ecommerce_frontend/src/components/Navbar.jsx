import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useWallet } from "../context/WalletContext";

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("loggedInUser"));

  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const { balance } = useWallet();

  const totalItems = cart.reduce(
    (acc, item) => acc + item.quantity,
    0
  );

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("token");
    window.location.href = "/auth";
  };

  return (
    <nav className="bg-black text-white flex justify-between items-center p-4">
      <div className="flex space-x-4 items-center">
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

            <Link to="/wishlist" className="hover:underline">
              Wishlist ({wishlist.length})
            </Link>

            <Link to="/cart" className="hover:underline">
              Cart ({totalItems})
            </Link>

            <Link to="/orders" className="hover:underline">
              My Orders
            </Link>

            <Link to="/wallet" className="hover:underline">
              Wallet
            </Link>
          </>
        )}
      </div>

      {user && (
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-300">
            Hi, {user.fullName}
          </span>

          <button
            onClick={handleLogout}
            className="bg-white text-black px-3 py-1 rounded hover:opacity-90"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;