import { useEffect } from "react";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";

export default function WishlistPage() {
  const { wishlist, toggleWishlist, clearWishlist, loading } = useWishlist();
  const { addToCart } = useCart();

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl font-medium">Loading your wishlist...</p>
      </div>
    );

  if (wishlist.length === 0)
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-semibold mb-4">Wishlist is empty 💔</h2>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Wishlist ({wishlist.length})</h1>
        <button onClick={clearWishlist} className="text-red-500 hover:underline">
          Clear All
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {wishlist.map((item) => (
          <div
            key={item.productId}
            className="border rounded-lg p-4 shadow flex flex-col hover:shadow-lg transition"
          >
            <div className="bg-gray-100 h-48 rounded mb-4 overflow-hidden flex items-center justify-center">
              <img
                src={item.image || "https://via.placeholder.com/300"}
                alt={item.title}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <h2 className="text-lg font-semibold mb-2 line-clamp-1">
              {item.title}
            </h2>
            <p className="text-gray-600 mb-4 font-bold">₹{item.price}</p>
            <div className="flex gap-2 mt-auto">
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
                className="flex-1 bg-black text-white py-2 rounded hover:opacity-90 transition"
              >
                Move to Cart
              </button>
              <button
                onClick={() => toggleWishlist(item)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300 transition"
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