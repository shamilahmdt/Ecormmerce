import { useEffect, useState } from "react";
import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";
import toast from "react-hot-toast";
import API from "../../api";

export default function WishlistPage() {
  const { wishlist, toggleWishlist, clearWishlist, loading: wishlistLoading } = useWishlist();
  const { addToCart } = useCart();
  const [liveProducts, setLiveProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    const fetchLiveProducts = async () => {
      try {
        const res = await API.get("/products");
        setLiveProducts(res.data);
      } catch (err) {
        console.error("Error checking stock status:", err);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchLiveProducts();
  }, []);

  if (wishlistLoading || loadingProducts)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl font-medium">Synchronizing your selection...</p>
      </div>
    );

  if (wishlist.length === 0)
    return (
      <div className="text-center py-20 italic">
        <h2 className="text-3xl font-black mb-2 opacity-20 uppercase tracking-tighter">Wishlist Vacant</h2>
        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">No assets marked for reservation</p>
      </div>
    );

  const isItemOutOfStock = (productId) => {
    const liveItem = liveProducts.find(p => p.id === productId);
    return liveItem ? liveItem.isOutOfStock : false;
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-10 italic">
      <div className="flex justify-between items-center mb-10 border-b border-gray-100 pb-6">
        <div>
           <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter italic">Reserved <span className="text-red-500">Assets</span></h1>
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Total Count: {wishlist.length} units</p>
        </div>
        <button onClick={clearWishlist} className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-red-500 transition-colors">
          Total Purge
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {wishlist.map((item) => {
          const outOfStock = isItemOutOfStock(item.productId);
          return (
            <div
              key={item.productId}
              className={`bg-white border border-gray-100 rounded-[2.5rem] p-4 sm:p-5 shadow-sm hover:shadow-2xl transition-all flex flex-col group relative overflow-hidden ${outOfStock ? 'opacity-80' : ''}`}
            >
              <div className="bg-gray-50 h-32 sm:h-48 rounded-3xl mb-4 overflow-hidden flex items-center justify-center p-4 relative group-hover:scale-105 transition-transform duration-500">
                <img
                  src={item.image || "https://via.placeholder.com/300"}
                  alt={item.title}
                  className={`max-h-full max-w-full object-contain ${outOfStock ? 'grayscale opacity-50' : ''}`}
                />
                {outOfStock && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                    <span className="bg-red-500 text-white text-[8px] sm:text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-xl">Out of Stock</span>
                  </div>
                )}
              </div>
              
              <h2 className="text-sm sm:text-lg font-black mb-1 line-clamp-1 text-gray-900 uppercase tracking-tight">
                {item.title}
              </h2>
              <p className="text-base sm:text-lg text-red-500 font-black mb-6 italic tracking-widest">₹{item.price.toLocaleString()}</p>
              
              <div className="flex flex-col gap-2 mt-auto">
                <button
                  disabled={outOfStock}
                  onClick={() => {
                    addToCart({
                      id: item.productId,
                      name: item.title,
                      price: item.price,
                      imageUrl: item.image,
                    });
                    toggleWishlist(item);
                    toast.success("Deployed to bag");
                  }}
                  className={`w-full py-3 sm:py-4 rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 ${outOfStock ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' : 'bg-black text-white hover:bg-gray-900 shadow-gray-200'}`}
                >
                  {outOfStock ? 'Restock Required' : 'Deploy to Bag'}
                </button>
                <button
                  onClick={() => toggleWishlist(item)}
                  className="w-full bg-gray-50 text-gray-400 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-500 transition-all"
                >
                  Abandon Asset
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
