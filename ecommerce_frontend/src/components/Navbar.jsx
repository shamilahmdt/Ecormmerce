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
            <Link to="/coupons" className="hover:underline">
              Coupons
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
        <div className="flex items-center space-x-6">
          <Link
            to="/profile"
            className="group relative flex items-center justify-center"
            title="My Profile"
          >
            <div className="w-10 h-10 rounded-full border-2 border-transparent group-hover:border-white transition-all overflow-hidden bg-white/10 flex items-center justify-center p-[2px]">
              <img
                src={user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user.fullName
                )}&background=random&size=40&rounded=true`}
                alt="Profile"
                className="w-full h-full rounded-full object-cover shadow-lg group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            
            {/* Tooltip on hover */}
            <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              View Profile
            </span>
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;