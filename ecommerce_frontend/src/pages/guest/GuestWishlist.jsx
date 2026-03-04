import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function GuestWishlist() {
  const { wishlist, toggleWishlist, clearWishlist, loading } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl font-medium">Loading wishlist...</p>
      </div>
    );

  if (wishlist.length === 0)
    return (
      <div className="text-center py-20 bg-gray-50 min-h-screen">
        <h2 className="text-4xl font-black mb-4">Wishlist is empty 💔</h2>
        <p className="text-gray-500 mb-8">Items you like as a guest will show up here!</p>
        <button 
            onClick={() => navigate("/guest-home")}
            className="bg-black text-white px-8 py-3 rounded-xl font-bold"
        >
            Start Shopping
        </button>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-indigo-600 text-white p-6 rounded-2xl mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black tracking-tighter">Guest Wishlist</h2>
          <p className="text-sm opacity-80">Login to save these items forever!</p>
        </div>
        <button 
           onClick={() => navigate("/auth")}
           className="bg-white text-indigo-600 px-6 py-2 rounded-xl font-black hover:scale-105 transition"
        >
          JOIN NOW
        </button>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-black tracking-tight">My Picks ({wishlist.length})</h1>
        <button onClick={clearWishlist} className="text-red-500 font-bold hover:underline">
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {wishlist.map((item) => (
          <div
            key={item.productId}
            className="bg-white border rounded-2xl sm:rounded-[2rem] p-3 sm:p-6 shadow-sm flex flex-col hover:shadow-xl transition-all duration-300 group"
          >
            <div className="bg-gray-50 h-32 sm:h-52 rounded-xl sm:rounded-2xl mb-3 sm:mb-4 overflow-hidden flex items-center justify-center p-2 sm:p-4 relative">
              <img
                src={item.image || "https://via.placeholder.com/300"}
                alt={item.title}
                className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <h2 className="text-sm sm:text-lg font-bold mb-1 line-clamp-1 text-gray-800">
              {item.title}
            </h2>
            <p className="text-indigo-600 mb-4 sm:mb-6 font-black text-base sm:text-xl">₹{item.price}</p>
            <div className="flex flex-col gap-2 mt-auto">
              <button
                onClick={() => {
                  addToCart({
                    id: item.productId,
                    name: item.title,
                    price: item.price,
                    imageUrl: item.image,
                  });
                  toggleWishlist(item);
                  toast.success("Moved to cart");
                }}
                className="w-full bg-black text-white py-2 sm:py-3 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold hover:bg-gray-800 transition shadow-sm"
              >
                Add to Cart
              </button>
              <button
                onClick={() => toggleWishlist(item)}
                className="w-full bg-gray-50 text-gray-400 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold hover:bg-red-50 hover:text-red-500 transition"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
