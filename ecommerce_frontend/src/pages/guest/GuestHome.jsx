import React, { useEffect, useState } from "react";
import { GridLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { FaHeart, FaRegHeart, FaStar } from "react-icons/fa";
import API from "../../api";

const FILTER_TAGS = ["ALL", "NEW", "BEST SELLERS"];

const GuestHome = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("ALL");
  const navigate = useNavigate();

  const { cart, addToCart, updateQuantity } = useCart();
  const { wishlist, toggleWishlist } = useWishlist();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await API.get("/products");
        setProducts(res.data);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const getQuantity = (id) => {
    const item = cart.find((i) => i.id === id);
    return item ? item.quantity : 0;
  };

  const isInWishlist = (id) => {
    return wishlist.some((item) => item.productId === id);
  };

  const filteredProducts = products.filter((product) => {
    const matchesTag =
      activeTag === "ALL"
        ? true
        : product.category?.toLowerCase() === activeTag.toLowerCase();

    const searchLower = search.toLowerCase();
    const matchesSearch =
      product.name?.toLowerCase().includes(searchLower) ||
      product.category?.toLowerCase().includes(searchLower);

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
      {/* Guest Banner */}
      <div className="bg-indigo-600 text-white p-4 rounded-xl mb-6 flex justify-between items-center shadow-lg">
        <div>
          <h3 className="font-bold">Welcome, Guest! 👋</h3>
          <p className="text-sm opacity-90">Sign up or login to save your cart and wishlist across devices.</p>
        </div>
        <button 
          onClick={() => navigate("/auth")}
          className="bg-white text-indigo-600 px-6 py-2 rounded-lg font-bold hover:bg-opacity-90 transition shadow-md"
        >
          Login / Sign Up
        </button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/3 px-4 py-2 border rounded bg-gray-100 focus:outline-none focus:ring-1 focus:ring-black"
        />

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

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6">
        {filteredProducts.map((product) => {
          const quantity = getQuantity(product.id);

          return (
            <div
              key={product.id}
              className="bg-white rounded-xl sm:rounded-2xl shadow-sm sm:shadow-md hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden group border border-gray-100 sm:border-none"
            >
              <div className="relative bg-gray-50 h-40 sm:h-64 flex items-center justify-center p-2 sm:p-4 cursor-pointer overflow-hidden" onClick={() => navigate(`/product/${product.id}`)}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWishlist(product);
                  }}
                  className="absolute top-2 right-2 z-10 bg-white/80 backdrop-blur-sm p-1.5 sm:p-2 rounded-full shadow-sm hover:scale-110 transition"
                >
                  {isInWishlist(product.id) ? (
                    <FaHeart className="text-red-500 text-sm sm:text-lg" />
                  ) : (
                    <FaRegHeart className="text-gray-500 hover:text-red-500 text-sm sm:text-lg transition" />
                  )}
                </button>

                <img
                  src={product.imageUrl || "https://via.placeholder.com/300"}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              <div className="p-3 sm:p-5 flex flex-col flex-grow">
                <p className="text-[10px] sm:text-xs uppercase text-gray-400 tracking-wider">
                  {product.category}
                </p>

                <h2 
                  className="text-sm sm:text-lg font-bold mt-0.5 sm:mt-1 line-clamp-1 text-gray-800 cursor-pointer hover:text-indigo-600 transition-colors"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  {product.name}
                </h2>

                <div className="flex items-center gap-1.5 mt-0.5 sm:mt-1">
                  <div className="flex text-yellow-400 text-[8px] sm:text-[10px]">
                    <FaStar />
                  </div>
                  <span className="text-[7px] sm:text-[9px] font-black text-gray-400 uppercase tracking-widest">
                    {product.averageRating || "4.8"} ({product.reviewCount || 0})
                  </span>
                </div>

                <p className="text-base sm:text-lg font-black mt-1 sm:mt-2 text-black">
                  ₹{product.price}
                </p>

                <div className="mt-auto pt-3">
                  {quantity > 0 ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between border rounded-lg bg-gray-50 overflow-hidden">
                        <button
                          onClick={() =>
                            updateQuantity(product.id, quantity - 1)
                          }
                          className="px-2 sm:px-3 py-1 sm:py-1.5 hover:bg-gray-200 transition-colors text-sm sm:text-base font-bold"
                        >
                          -
                        </button>
                        <span className="text-xs sm:text-sm font-black">{quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity(product.id, quantity + 1)
                          }
                          className="px-2 sm:px-3 py-1 sm:py-1.5 hover:bg-gray-200 transition-colors text-sm sm:text-base font-bold"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => navigate("/guest-cart")}
                        className="text-[10px] sm:text-xs font-bold text-center text-indigo-600 hover:underline"
                      >
                        Checkout →
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(product)}
                      className="w-full bg-black text-white py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold hover:bg-gray-800 active:scale-95 transition-all shadow-sm"
                    >
                      Add to Cart
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GuestHome;
