import React from "react";
import { Link } from "react-router-dom";
import { FaHome, FaHeart, FaShoppingCart, FaClipboardList, FaWallet, FaTachometerAlt, FaPlus, FaTicketAlt, FaTimes, FaSignOutAlt, FaChartBar } from "react-icons/fa";

const Sidebar = ({ isOpen, onClose, user, cartCount, wishlistCount }) => {
  const adminLinks = [
    { name: "Dashboard", path: "/dashboard", icon: <FaTachometerAlt /> },
    { name: "Add Product", path: "/add-product", icon: <FaPlus /> },
    { name: "All Orders", path: "/admin-orders", icon: <FaClipboardList /> },
    { name: "Coupons", path: "/coupons", icon: <FaTicketAlt /> },
    { name: "Report", path: "/report", icon: <FaChartBar /> },
  ];

  const userLinks = [
    { name: "Home", path: "/", icon: <FaHome /> },
    { name: `Wishlist (${wishlistCount})`, path: "/wishlist", icon: <FaHeart /> },
    { name: `Cart (${cartCount})`, path: "/cart", icon: <FaShoppingCart /> },
    { name: "My Orders", path: "/orders", icon: <FaClipboardList /> },
    { name: "Wallet", path: "/wallet", icon: <FaWallet /> },
  ];

  const links = user?.role === "admin" ? adminLinks : userLinks;

  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);

  React.useEffect(() => {
    if (!isOpen) setShowLogoutConfirm(false);
    
    // Body scroll lock
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("token");
    window.location.href = "/auth";
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        onMouseLeave={onClose}
      >
        <div className="p-6 h-full flex flex-col">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-2xl font-black tracking-tighter">ECOMMERCE</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-black transition-colors">
              <FaTimes className="text-xl" />
            </button>
          </div>

          <nav className="space-y-2 flex-grow overflow-y-auto">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={onClose}
                className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-600 font-bold hover:bg-gray-100 hover:text-black transition-all group"
              >
                <span className="text-xl group-hover:scale-110 transition-transform">{link.icon}</span>
                <span className="text-sm">{link.name}</span>
              </Link>
            ))}
          </nav>

          <div className="pt-6 border-t border-gray-100 mt-auto">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 mb-4">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Logged in as</p>
              <p className="font-bold text-gray-800 line-clamp-1">{user?.fullName || "Guest"}</p>
            </div>
            
            {!showLogoutConfirm ? (
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-red-500 font-bold hover:bg-red-50 transition-all border border-transparent hover:border-red-100 group"
              >
                <FaSignOutAlt className="text-xl group-hover:translate-x-1 transition-transform" />
                <span className="text-sm uppercase tracking-widest font-black">Logout</span>
              </button>
            ) : (
              <div className="bg-red-50 p-4 rounded-2xl border border-red-100 animate-in slide-in-from-bottom-2 duration-300">
                <p className="text-xs font-black text-red-600 uppercase tracking-widest text-center mb-3">Are you sure?</p>
                <div className="flex gap-2">
                  <button
                    onClick={handleLogout}
                    className="flex-1 bg-red-600 text-white py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                  >
                    Logout
                  </button>
                  <button
                    onClick={() => setShowLogoutConfirm(false)}
                    className="flex-1 bg-white text-gray-500 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
