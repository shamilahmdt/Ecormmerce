import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useWallet } from "../context/WalletContext";
import { FaBars } from "react-icons/fa";
import Sidebar from "./Sidebar";

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("loggedInUser")));
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const refreshUser = () => {
      setUser(JSON.parse(localStorage.getItem("loggedInUser")));
    };

    window.addEventListener("userUpdate", refreshUser);
    window.addEventListener("storage", refreshUser);
    
    return () => {
      window.removeEventListener("userUpdate", refreshUser);
      window.removeEventListener("storage", refreshUser);
    };
  }, []);

  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const { balance } = useWallet();

  const totalItems = cart.reduce(
    (acc, item) => acc + item.quantity,
    0
  );

  return (
    <>
      <nav className="bg-black text-white flex justify-between items-center p-4 sticky top-0 z-30">
        {/* Left: Menu Icon */}
        <div className="flex items-center">
          <button
            onMouseEnter={() => setIsSidebarOpen(true)}
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <FaBars className="text-2xl" />
          </button>
        </div>

        {/* Center: Logo (Optional but looks premium) */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <Link to={user?.role === "admin" ? "/dashboard" : "/"} className="text-xl font-black tracking-tighter">
            ECOMMERCE
          </Link>
        </div>

        {/* Right: Profile Icon or Login Button */}
        <div className="flex items-center space-x-6">
          {user ? (
            <Link
              to="/profile"
              className="group relative flex items-center justify-center"
              title="My Profile"
            >
              <div className="w-10 h-10 rounded-full border-2 border-white/20 group-hover:border-white transition-all overflow-hidden bg-gray-800 flex items-center justify-center">
                {user.profileImage ? (
                  <img
                    key={user.profileImage}
                    src={user.profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random&size=40`;
                    }}
                  />
                ) : (
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random&size=40`}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              
              {/* Tooltip on hover */}
              <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none tracking-widest font-bold">
                VIEW PROFILE
              </span>
            </Link>
          ) : (
            <Link
              to="/auth"
              className="bg-white text-black px-4 py-1.5 rounded-lg text-xs font-black tracking-widest hover:bg-gray-200 transition-all uppercase"
            >
              Login
            </Link>
          )}
        </div>
      </nav>

      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        user={user}
        cartCount={totalItems}
        wishlistCount={wishlist.length}
      />
    </>
  );
};

export default Navbar;