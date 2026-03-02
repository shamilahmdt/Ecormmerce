import { createContext, useContext, useEffect, useState } from "react";
import API from "../api";
import toast from "react-hot-toast";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setWishlist([]);
      setLoading(false);
      return;
    }

    try {
      const res = await API.get("/wishlist");
      setWishlist(res.data.items || []);
    } catch (err) {
      if (err.response?.status !== 401) {
        console.error("Wishlist fetch error:", err);
        // toast.error("Failed to fetch wishlist");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const toggleWishlist = async (product) => {
    const token = localStorage.getItem("token");
    if (!token) return toast.error("Login first");

    const pid = product.id || product.productId;
    const isCurrentlyIn = wishlist.some(item => item.productId === pid);
    
    // --- OPTIMISTIC UI ---
    let optimisticItems;
    if (isCurrentlyIn) {
      optimisticItems = wishlist.filter(item => item.productId !== pid);
    } else {
      optimisticItems = [...wishlist, { 
        productId: pid, 
        title: product.name || product.title, 
        price: product.price, 
        image: product.imageUrl || product.image 
      }];
    }
    setWishlist(optimisticItems);

    try {
      const res = await API.post("/wishlist", {
        productId: pid,
        title: product.name || product.title,
        price: product.price,
        image: product.imageUrl || product.image,
      });
      
      setWishlist(res.data.items);
      
      const actuallyAdded = res.data.items.some(item => item.productId === pid);
      if (actuallyAdded) {
        toast.success("Added to wishlist");
      } else {
        toast.success("Removed from wishlist");
      }
    } catch (err) {
      // Revert on error
      fetchWishlist();
      if (err.response?.status !== 401) {
        toast.error("Failed to update wishlist");
      }
    }
  };

  const removeFromWishlist = async (productId) => {
    // Optimistic remove
    setWishlist(prev => prev.filter(item => item.productId !== productId));

    try {
      const res = await API.delete(`/wishlist/${productId}`);
      setWishlist(res.data.items);
      toast.success("Removed from wishlist");
    } catch (err) {
      fetchWishlist();
      if (err.response?.status !== 401) {
        toast.error("Failed to remove item");
      }
    }
  };

  const clearWishlist = async () => {
    setWishlist([]);
    try {
      const res = await API.delete("/wishlist");
      setWishlist(res.data.items);
      toast.success("Wishlist cleared");
    } catch (err) {
      fetchWishlist();
      if (err.response?.status !== 401) {
        toast.error("Failed to clear wishlist");
      }
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        loading,
        fetchWishlist,
        toggleWishlist,
        removeFromWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);