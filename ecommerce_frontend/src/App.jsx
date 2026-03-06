import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AuthenticationForm from "./pages/auth/AuthenticationForm";
import Dashboard from "./pages/admin/Dashboard";
import AddProduct from "./pages/admin/AddProduct";
import EditProduct from "./pages/admin/EditProduct";
import AdminOrderList from "./pages/admin/AdminOrderList";
import AdminCoupons from "./pages/admin/AdminCoupons";
import AdminReport from "./pages/admin/AdminReport";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import ProtectedRoute from "./Routes/ProtectedRoute";
import ProductList from "./pages/user/ProductList";
import Cart from "./pages/user/Cart";
import CheckOut from "./pages/user/CheckOut";
import OrderPlaced from "./pages/user/OrderPlaced";
import OrderList from "./pages/user/OrderList";
import Wishlist from "./pages/user/Wishlist";
import Wallet from "./pages/user/Wallet";
import NotAuthorized from "./pages/auth/NotAuthorized";
import Navbar from "./components/Navbar";
import Profile from "./pages/user/Profile";

import GuestHome from "./pages/guest/GuestHome";
import GuestCart from "./pages/guest/GuestCart";
import GuestWishlist from "./pages/guest/GuestWishlist";
import ProductDetail from "./pages/guest/ProductDetail";

import { useState, useEffect } from "react";

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("loggedInUser")));

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

  return (

    <div className="min-h-screen w-full overflow-x-hidden relative">
      <Toaster position="top-center" />
      <Navbar />
      <Routes>
        {/* Unified Auth Page */}
        <Route path="/auth" element={<AuthenticationForm />} />

        {/* Admin page: Dashboard + Products */}
        <Route
          path="/dashboard"
          element={<ProtectedRoute role="admin"><Dashboard /></ProtectedRoute>}
        />
        <Route
          path="/add-product"
          element={<ProtectedRoute role="admin"><AddProduct /></ProtectedRoute>}
        />
        <Route
          path="/edit-product/:id"
          element={<ProtectedRoute role="admin"><EditProduct /></ProtectedRoute>}
        />
         <Route path="/admin-orders" element={<ProtectedRoute role="admin"><AdminOrderList /></ProtectedRoute>} />
         <Route path="/coupons" element={<ProtectedRoute role="admin"><AdminCoupons /></ProtectedRoute>} />
         <Route path="/report" element={<ProtectedRoute role="admin"><AdminReport /></ProtectedRoute>} />
         <Route path="/analytics" element={<ProtectedRoute role="admin"><AdminAnalytics /></ProtectedRoute>} />
          
          {/* Guest Routes */}
          <Route path="/guest-home" element={<GuestHome />} />
          <Route path="/guest-cart" element={<GuestCart />} />
          <Route path="/guest-wishlist" element={<GuestWishlist />} />
          <Route path="/product/:id" element={<ProductDetail />} />

          {/* User Routes (Now handle guest state or redirect internally if needed) */}
          {/* We'll make / public but it will show ProductList which now works with Guest Contexts */}
          <Route 
            path="/" 
            element={
              user?.role === "admin" 
              ? <Navigate to="/dashboard" replace /> 
              : (user ? <ProductList /> : <GuestHome />)
            } 
          />
          <Route path="/cart" element={user ? <Cart /> : <GuestCart />} />
          <Route path="/wishlist" element={user ? <Wishlist /> : <GuestWishlist />} />
          
          {/* Strictly Protected User Routes */}
          <Route path="/wallet" element={<ProtectedRoute role="user"><Wallet /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute role="user"><CheckOut /></ProtectedRoute>} />
          <Route path="/order-placed"element={<ProtectedRoute role="user"><OrderPlaced /></ProtectedRoute>} />
          <Route path="/order-placed" element={<ProtectedRoute role="user"><OrderPlaced /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute role="user"><OrderList /></ProtectedRoute>}/>
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          {/* Not authorized */}
          <Route path="/not-authorized" element={<NotAuthorized />} />
      </Routes>
    </div>
  );
}

export default App;