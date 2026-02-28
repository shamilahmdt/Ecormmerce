import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AuthenticationForm from "./pages/auth/AuthenticationForm";
import Dashboard from "./pages/Dashboard";
import AddProduct from "./pages/AddProduct";
import EditProduct from "./pages/EditProduct";
import AdminOrderList from "./pages/AdminOrderList";
import ProtectedRoute from "./Routes/ProtectedRoute";
import ProductList from "./pages/ProductList";
import Cart from "./pages/Cart";
import CheckOut from "./pages/CheckOut";
import OrderPlaced from "./pages/OrderPlaced";
import OrderList from "./pages/OrderList ";
import NotAuthorized from "./pages/auth/NotAuthorized";
import Navbar from "./components/Navbar";


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
      <Route path="/admin-orders" element={<ProtectedRoute role="admin"><AdminOrderList /></ProtectedRoute>} 
      />
        {/* User Routes */}
        <Route path="/" element={<ProtectedRoute role="user"><ProductList /></ProtectedRoute>} />
        <Route path="/cart" element={<ProtectedRoute role="user"><Cart /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute role="user"><CheckOut /></ProtectedRoute>} />
        <Route path="/order-placed"element={<ProtectedRoute role="user"><OrderPlaced /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute role="user"><OrderList /></ProtectedRoute>}/>

        {/* Not authorized */}
        <Route path="/not-authorized" element={<NotAuthorized />} />
    </Routes>
    </>
  );
}

export default App;