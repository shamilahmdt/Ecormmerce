import React, { useEffect, useState } from "react";
// import { getDocs, collection } from "firebase/firestore";
// import { firestore } from "../firebaseConfig";
import { GridLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import axios from "axios";

// ✅ Filter Tags
const FILTER_TAGS = [
  "ALL",
  "NEW",
  "BEST SELLERS",

];

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("ALL");

  const navigate = useNavigate();

  // ✅ Cart Context
  const { cart, addToCart, updateQuantity } = useCart();

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/products"
        );
        setProducts(response.data);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Get quantity from cart
  const getQuantity = (id) => {
    const item = cart.find((i) => i.id === id);
    return item ? item.quantity : 0;
  };

  // ✅ Filter Logic
  const filteredProducts = products.filter((product) => {
    const matchesTag = 
      activeTag === "ALL"
        ? true
        : product.category?.toLowerCase() === activeTag.toLowerCase();

    const matchesSearch = product.name
      ?.toLowerCase()
      .includes(search.toLowerCase());

    return matchesTag && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <GridLoader color="#000" size={25} />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* 🔎 Search + Filter Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        {/* Search */}
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/3 px-4 py-2 border rounded bg-gray-100 focus:outline-none focus:ring-1 focus:ring-black"
        />

        {/* Filter Tags */}
        <div className="flex flex-wrap gap-2">
          {FILTER_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`px-3 py-1 text-xs font-semibold border rounded transition ${
                activeTag === tag
                  ? "bg-black text-white"
                  : "text-gray-700 border-gray-400"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* 🛍 Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white p-6 rounded-xl shadow text-center">
          <p className="text-gray-500">No products found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 lg:grid-cols-5">
          {filteredProducts.map((product) => {
            const quantity = getQuantity(product.id);

            return (
            <div
              key={product.id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group"
            >
              {/* Image Section */}
              <div className="bg-gray-100 h-64 flex items-center justify-center p-4">
                <img
                  src={product.imageUrl || "https://via.placeholder.com/300"}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              {/* Content Section */}
              <div className="p-5 flex flex-col flex-grow">
                <p className="text-xs uppercase text-gray-400 tracking-wider">
                  {product.category}
                </p>

                <h2 className="text-lg font-semibold mt-1 line-clamp-1">
                  {product.name}
                </h2>

                <p className="text-lg font-bold mt-2">₹ {product.price}</p>

                {/* Cart Section */}
                {quantity > 0 ? (
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border rounded">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="px-3 py-1 hover:bg-gray-100"
                      >
                        -
                      </button>

                      <span className="px-4">{quantity}</span>

                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        className="px-3 py-1 hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => navigate("/cart")}
                      className="text-sm font-medium text-black underline"
                    >
                      Go to Cart →                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => addToCart(product)}
                    className="mt-auto bg-black text-white py-2 rounded-lg hover:opacity-90 transition"
                  >
                    Add to Cart
                  </button>
                )}
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProductList;