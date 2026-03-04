import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AuthenticationForm from "./pages/auth/AuthenticationForm";
import Dashboard from "./pages/admin/Dashboard";
import AddProduct from "./pages/admin/AddProduct";
import EditProduct from "./pages/admin/EditProduct";
import AdminOrderList from "./pages/admin/AdminOrderList";
import AdminCoupons from "./pages/admin/AdminCoupons";
import AdminReport from "./pages/admin/AdminReport";
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

function App() {
  return (

    <>
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
        {/* User Routes */}
        <Route path="/" element={<ProtectedRoute role="user"><ProductList /></ProtectedRoute>} />
        <Route path="/cart" element={<ProtectedRoute role="user"><Cart /></ProtectedRoute>} />
        <Route path="/wishlist" element={<ProtectedRoute role="user"><Wishlist /></ProtectedRoute>} />
        <Route path="/wallet" element={<ProtectedRoute role="user"><Wallet /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute role="user"><CheckOut /></ProtectedRoute>} />
        <Route path="/order-placed"element={<ProtectedRoute role="user"><OrderPlaced /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute role="user"><OrderList /></ProtectedRoute>}/>
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        {/* Not authorized */}
        <Route path="/not-authorized" element={<NotAuthorized />} />
    </Routes>
    </>
  );
}

export default App;