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
      // Guest mode: load from localStorage
      const guestWishlist = JSON.parse(localStorage.getItem("guestWishlist")) || [];
      setWishlist(guestWishlist);
      setLoading(false);
      return;
    }

    try {
      const res = await API.get("/wishlist");
      setWishlist(res.data.items || []);
    } catch (err) {
      if (err.response?.status !== 401) {
        console.error("Wishlist fetch error:", err);
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
    const pid = product.id || product.productId;
    const isCurrentlyIn = wishlist.some(item => item.productId === pid);
    
    let updatedItems;
    if (isCurrentlyIn) {
      updatedItems = wishlist.filter(item => item.productId !== pid);
    } else {
      updatedItems = [...wishlist, { 
        productId: pid, 
        title: product.name || product.title, 
        price: product.price, 
        image: product.imageUrl || product.image 
      }];
    }

    if (!token) {
      // Guest mode
      setWishlist(updatedItems);
      localStorage.setItem("guestWishlist", JSON.stringify(updatedItems));
      toast.success(isCurrentlyIn ? "Removed from wishlist" : "Added to wishlist");
      return;
    }

    // AUTH MODE
    setWishlist(updatedItems); // Optimistic

    try {
      const res = await API.post("/wishlist", {
        productId: pid,
        title: product.name || product.title,
        price: product.price,
        image: product.imageUrl || product.image,
      });
      setWishlist(res.data.items);
      toast.success(res.data.items.some(item => item.productId === pid) ? "Added to wishlist" : "Removed from wishlist");
    } catch (err) {
      fetchWishlist();
      if (err.response?.status !== 401) {
        toast.error("Failed to update wishlist");
      }
    }
  };

  const mergeWishlist = async () => {
    const guestWishlist = JSON.parse(localStorage.getItem("guestWishlist")) || [];
    if (guestWishlist.length === 0) {
      fetchWishlist();
      return;
    }

    try {
      // Fetch user wishlist
      const res = await API.get("/wishlist");
      const userWishlist = res.data.items || [];
      
      // Merge logic: Combine and avoid duplicates
      let merged = [...userWishlist];
      guestWishlist.forEach(gItem => {
        if (!merged.some(uItem => uItem.productId === gItem.productId)) {
          merged.push(gItem);
        }
      });

      // Update backend one by one or if there's a bulk endpoint (currently backend handles one by one toggle, but let's assume we can push items)
      // Actually, looking at index.js, /api/wishlist POST toggles.
      // We might need a bulk update or just call them sequentially.
      // For now, let's just update the local state and try to sync.
      // Since current backend POST is a toggle, merge is tricky.
      // I'll assume we can use a bulk update if I add it, but for now I'll just sync the merged state if I can.
      // Wait, let's check index.js again for wishlist implementation.
      
      setWishlist(merged);
      // To properly sync with current backend, we'd need to only POST items NOT in userWishlist.
      for (const item of guestWishlist) {
        if (!userWishlist.some(u => u.productId === item.productId)) {
          await API.post("/wishlist", item);
        }
      }
      
      localStorage.removeItem("guestWishlist");
      fetchWishlist(); // Final sync
    } catch (err) {
      console.error("Error merging wishlist:", err);
      fetchWishlist();
    }
  };

  const removeFromWishlist = async (productId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      const updated = wishlist.filter(item => item.productId !== productId);
      setWishlist(updated);
      localStorage.setItem("guestWishlist", JSON.stringify(updated));
      toast.success("Removed from wishlist");
      return;
    }

    setWishlist(prev => prev.filter(item => item.productId !== productId));
    try {
      const res = await API.delete(`/wishlist/${productId}`);
      setWishlist(res.data.items);
      toast.success("Removed from wishlist");
    } catch (err) {
      fetchWishlist();
      toast.error("Failed to remove item");
    }
  };

  const clearWishlist = async () => {
    const token = localStorage.getItem("token");
    setWishlist([]);
    if (!token) {
      localStorage.removeItem("guestWishlist");
      toast.success("Wishlist cleared");
      return;
    }

    try {
      const res = await API.delete("/wishlist");
      setWishlist(res.data.items);
      toast.success("Wishlist cleared");
    } catch (err) {
      fetchWishlist();
      toast.error("Failed to clear wishlist");
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
        mergeWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);