import React, { useEffect, useState } from "react";
import { GridLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import toast from "react-hot-toast";
import API from "../../api";

const FILTER_TAGS = ["ALL", "NEW", "BEST SELLERS"];

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("ALL");
  const navigate = useNavigate();

  const { cart, addToCart, updateQuantity } = useCart();
  const { wishlist, toggleWishlist } = useWishlist();

  // ===============================
  // FETCH PRODUCTS
  // ===============================
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

  // ===============================
  // CART HELPERS
  // ===============================
  const getQuantity = (id) => {
    const item = cart.find((i) => i.id === id);
    return item ? item.quantity : 0;
  };

  // ===============================
  // WISHLIST HELPERS
  // ===============================
  const isInWishlist = (id) => {
    return wishlist.some((item) => item.productId === id);
  };

  // ===============================
  // FILTER LOGIC
  // ===============================
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
    <div className="p-3 sm:p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
        <input
          type="text"
          placeholder="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/3 px-3 py-2 text-xs border rounded-xl bg-gray-50 focus:outline-none focus:ring-1 focus:ring-black shadow-sm"
        />

        <div className="flex flex-wrap gap-1.5">
          {FILTER_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`px-3 py-1 text-[9px] sm:text-xs font-black uppercase tracking-widest border rounded-full transition ${
                activeTag === tag
                  ? "bg-black text-white border-black"
                  : "text-gray-400 border-gray-100 bg-white"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="bg-white p-6 rounded-2xl shadow-sm text-center border border-gray-100">
          <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">No results found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-6">
          {filteredProducts.map((product) => {
            const quantity = getQuantity(product.id);

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl sm:rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group border border-gray-50"
              >
                {/* IMAGE + WISHLIST */}
                <div className="relative bg-gray-50 h-32 sm:h-64 flex items-center justify-center p-2 sm:p-6">
                  {/* ❤️ Wishlist Icon */}
                  <button
                    onClick={() => toggleWishlist(product)}
                    className="absolute top-1.5 right-1.5 z-10 bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-sm hover:scale-110 transition"
                  >
                    {isInWishlist(product.id) ? (
                      <FaHeart className="text-red-500 text-[10px] sm:text-lg" />
                    ) : (
                      <FaRegHeart className="text-gray-400 hover:text-red-500 text-[10px] sm:text-lg transition" />
                    )}
                  </button>

                  <img
                    src={product.imageUrl || "https://via.placeholder.com/300"}
                    alt={product.name}
                    className={`max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-110 ${product.isOutOfStock ? 'opacity-40 grayscale' : ''}`}
                  />
                  
                  {product.isOutOfStock && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/5">
                      <span className="bg-red-600 text-white text-[7px] sm:text-xs font-black px-2 py-0.5 rounded-full uppercase tracking-widest shadow-xl">Out of Stock</span>
                    </div>
                  )}
                </div>

                {/* CONTENT */}
                <div className="p-2 sm:p-5 flex flex-col flex-grow">
                  <p className="text-[8px] sm:text-[10px] uppercase text-gray-400 font-black tracking-widest">
                    {product.category || "General"}
                  </p>

                  <h2 className="text-[10px] sm:text-lg font-black mt-0.5 sm:mt-1 line-clamp-1 text-gray-800 uppercase tracking-tight">
                    {product.name}
                  </h2>

                  <p className="text-xs sm:text-xl font-black mt-1 sm:mt-2 text-black italic">
                    ₹{product.price.toLocaleString()}
                  </p>

                  <div className="mt-auto pt-2 sm:pt-4">
                    {product.isOutOfStock ? (
                       <button
                        disabled
                        className="w-full bg-gray-50 text-gray-400 py-1.5 sm:py-3 rounded-xl text-[9px] sm:text-xs font-black cursor-not-allowed uppercase tracking-widest"
                      >
                        Unavailable
                      </button>
                    ) : quantity > 0 ? (
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between border border-gray-100 rounded-xl bg-gray-50 overflow-hidden">
                          <button
                            onClick={() =>
                              updateQuantity(product.id, quantity - 1)
                            }
                            className="px-2 sm:px-4 py-1 sm:py-2 hover:bg-gray-200 transition-colors text-xs sm:text-base font-black"
                          >
                            -
                          </button>
                          <span className="text-[10px] sm:text-sm font-black text-gray-900">{quantity}</span>
                          <button
                            onClick={() =>
                              updateQuantity(product.id, quantity + 1)
                            }
                            className="px-2 sm:px-4 py-1 sm:py-2 hover:bg-gray-200 transition-colors text-xs sm:text-base font-black"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => navigate("/cart")}
                          className="text-[8px] sm:text-[10px] font-black uppercase text-center text-indigo-600 tracking-widest hover:underline"
                        >
                          Checkout →
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(product)}
                        className="w-full bg-black text-white py-1.5 sm:py-3 rounded-xl text-[9px] sm:text-xs font-black hover:bg-gray-800 active:scale-95 transition-all shadow-lg shadow-gray-200 uppercase tracking-widest"
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
      )}
    </div>
  );
};

export default ProductList;