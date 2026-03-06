import React, { useEffect, useState, forwardRef } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { GridLoader, PulseLoader } from "react-spinners";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { toast } from "react-hot-toast";
import { 
  FaHeart, 
  FaRegHeart, 
  FaArrowLeft, 
  FaShoppingCart, 
  FaStar, 
  FaShieldAlt, 
  FaTruck, 
  FaSyncAlt,
  FaCheckCircle,
  FaUserCircle,
  FaPaperPlane,
  FaTrashAlt,
  FaChevronLeft,
  FaChevronRight
} from "react-icons/fa";
import { motion, AnimatePresence, usePresenceData } from "motion/react";
import API from "../../api";

const Slide = forwardRef(({ src, alt, className }, ref) => {
  const direction = usePresenceData();
  return (
    <motion.img
      ref={ref}
      src={src}
      alt={alt}
      initial={{ opacity: 0, x: direction * 100 }}
      animate={{ 
        opacity: 1, 
        x: 0,
        transition: {
          delay: 0.2,
          type: "spring",
          visualDuration: 0.3,
          bounce: 0.4,
        }
      }}
      exit={{ opacity: 0, x: direction * -100 }}
      className={className}
    />
  );
});

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const [activeImage, setActiveImage] = useState(0);
  const [direction, setDirection] = useState(0);

  // Review Form State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [reviewReason, setReviewReason] = useState("");

  const { cart, addToCart, updateQuantity } = useCart();
  const { wishlist, toggleWishlist } = useWishlist();
  
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
  const homePath = loggedInUser?.role === "admin" ? "/dashboard" : "/";

  const fetchData = async () => {
    try {
      const productRes = await API.get(`/products/${id}`);
      const currentProduct = productRes.data;
      setProduct(currentProduct);

      // Fetch related products based on multiple categories
      const allRes = await API.get("/products");
      const currentCategories = (currentProduct.category || "").split(/[|,&]/).map(c => c.trim().toLowerCase());
      
      const filtered = allRes.data.filter((p) => {
        if (p.id === id) return false;
        const pCategories = (p.category || "").split(/[|,&]/).map(c => c.trim().toLowerCase());
        return currentCategories.some(cat => pCategories.includes(cat));
      }).slice(0, 4);
      
      setRelatedProducts(filtered);

      // Check review permission for logged in user
      if (loggedInUser) {
        try {
          const checkRes = await API.get(`/products/${id}/check-review`);
          setCanReview(checkRes.data.canReview);
          setReviewReason(checkRes.data.reason);
        } catch (err) {
          console.error("Check review error:", err);
        }
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchData();
  }, [id]);

  const getQuantity = (productId) => {
    const item = cart.find((i) => (i.id === productId || i.productId === productId));
    return item ? item.quantity : 0;
  };

  const isInWishlist = (productId) => {
    return wishlist.some((item) => item.productId === productId);
  };

  const handleAddToCart = async () => {
    setAddingToCart(true);
    await addToCart(product);
    setTimeout(() => setAddingToCart(false), 500);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return toast.error("Please add a comment");
    
    setSubmittingReview(true);
    try {
      await API.post(`/products/${id}/reviews`, { rating, comment });
      toast.success("Review published");
      setComment("");
      setRating(5);
      // Refresh product to show new review
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || "Error publishing review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Archiving this perspective permanently... Proceed?")) return;
    
    try {
      await API.delete(`/products/${id}/reviews/${reviewId}`);
      toast.success("Perspective archived");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || "Error archiving perspective");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <GridLoader color="#000" size={10} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6 text-center italic">
        <FaArrowLeft className="mb-4 text-gray-200 text-xl" />
        <h2 className="text-base font-bold uppercase tracking-widest text-gray-900 border-b border-black pb-1 mb-3">Product Missing</h2>
        <p className="text-gray-400 text-[8px] mb-6 uppercase tracking-widest font-black">Archive entry not located.</p>
        <button onClick={() => navigate(homePath)} className="text-[8px] font-black uppercase tracking-[0.2em] hover:text-indigo-600 transition-colors underline">Return to Shop</button>
      </div>
    );
  }

  const quantity = getQuantity(product.id);
  const isGuest = location.pathname.includes('guest');
  const reviews = product.reviews || [];
  const hasReviews = reviews.length > 0;
  const productImages = product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls : [product.imageUrl];

  return (
    <div className="min-h-screen bg-white font-sans italic selection:bg-black selection:text-white">
      {/* Navigation Top Bar */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-50 px-4 md:px-8 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-[7px] font-black uppercase tracking-[0.2em] hover:text-indigo-600 transition-all">
            <FaArrowLeft /> Back
          </button>
          <div className="hidden md:flex items-center gap-1 text-[7px] font-black uppercase tracking-widest text-gray-300">
            <Link to={homePath} className="hover:text-black transition-colors">Home</Link>
            <span>/</span>
            <span className="text-gray-400">{product.category}</span>
            <span>/</span>
            <span className="text-black">{product.name}</span>
          </div>
          <div className="flex items-center gap-2">
              <span className="text-[7px] font-black text-gray-950 uppercase tracking-widest">₹{product.price}</span>
              <button 
                onClick={handleAddToCart}
                className="bg-black text-white px-2 py-1 rounded-full text-[7px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-sm"
              >
                Acquire
              </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-4 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-14 items-start">
          
          {/* LEFT COLUMN: VISUALS (Sticky on Desktop) */}
          <div className="lg:sticky lg:top-14 space-y-4">
            <div className="relative aspect-square bg-gray-50/20 rounded-lg border border-gray-50/50 overflow-hidden group flex items-center justify-center">
              <button
                onClick={() => toggleWishlist(product)}
                className="absolute top-2 right-2 z-20 bg-white/95 backdrop-blur shadow-sm p-2 rounded-full hover:scale-110 active:scale-90 transition-all"
              >
                {isInWishlist(product.id) ? (
                  <FaHeart className="text-red-500 text-[9px]" />
                ) : (
                  <FaRegHeart className="text-gray-300 text-[9px]" />
                )}
              </button>

              {product.isOutOfStock && (
                <div className="absolute top-2 left-2 z-20 bg-black text-white text-[6px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-widest shadow-sm">
                  Sold Out
                </div>
              )}

              <AnimatePresence custom={direction} mode="popLayout">
                <Slide
                  key={activeImage}
                  src={productImages[activeImage] || "https://via.placeholder.com/800"}
                  alt={product.name}
                  className="w-full h-full object-contain p-12 md:p-20"
                />
              </AnimatePresence>

              {/* Navigation Arrows for Images */}
              {productImages.length > 1 && (
                <>
                  <button 
                    onClick={() => {
                      const nextIndex = (activeImage - 1 + productImages.length) % productImages.length;
                      setDirection(-1);
                      setActiveImage(nextIndex);
                    }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/80 backdrop-blur p-2 rounded-full shadow-sm hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                  >
                    <FaChevronLeft className="text-[8px] text-gray-800" />
                  </button>
                  <button 
                    onClick={() => {
                      const nextIndex = (activeImage + 1) % productImages.length;
                      setDirection(1);
                      setActiveImage(nextIndex);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white/80 backdrop-blur p-2 rounded-full shadow-sm hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                  >
                    <FaChevronRight className="text-[8px] text-gray-800" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {productImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {productImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setDirection(idx > activeImage ? 1 : -1);
                      setActiveImage(idx);
                    }}
                    className={`relative w-16 h-16 rounded-lg border-2 overflow-hidden flex-shrink-0 transition-all ${activeImage === idx ? 'border-black' : 'border-transparent bg-gray-50 opacity-60 hover:opacity-100'}`}
                  >
                    <img src={img} alt={`${product.name} ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: DETAILS */}
          <div className="flex flex-col space-y-5">
            <div className="space-y-2">
              <p className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.4em] mb-0.5">
                {product.category || "Curated Series"}
              </p>
              <h1 className="text-2xl md:text-3xl font-black text-gray-950 tracking-tighter uppercase leading-tight italic">
                {product.name}
              </h1>
              <div className="flex items-center gap-2">
                <div className="flex text-yellow-400 text-[6px]">
                  {[1,2,3,4,5].map(i => <FaStar key={i} />)}
                </div>
                <span className="text-[7px] font-bold text-gray-200 uppercase tracking-[0.2em]">({product.averageRating || 4.8} Score)</span>
              </div>
            </div>

            <div className="space-y-1 border-t border-gray-50 pt-5">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-gray-950 italic tracking-tight">₹{product.price.toLocaleString()}</span>
                <span className="text-[10px] text-gray-300 line-through font-bold tracking-tighter decoration-1">₹{Math.round(product.price * 1.3).toLocaleString()}</span>
              </div>
              <p className="text-[7px] font-black text-green-600 uppercase tracking-widest bg-green-50 w-fit px-1.5 py-0.5 rounded">Reserve Pricing Active</p>
            </div>

            {/* Action Area */}
            <div className="space-y-2.5 bg-gray-50/10 p-4 rounded-lg border border-gray-50">
              {quantity > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="flex items-center justify-between bg-white rounded-md p-1 border border-gray-50">
                    <button
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="w-7 h-7 flex items-center justify-center hover:bg-gray-50 rounded transition-all font-black text-xs"
                    >
                      -
                    </button>
                    <span className="font-black text-[9px] uppercase tracking-tighter">{quantity} Units</span>
                    <button
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      className="w-7 h-7 flex items-center justify-center hover:bg-gray-50 rounded transition-all font-black text-xs"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => navigate(isGuest ? "/guest-cart" : "/cart")}
                    className="w-full bg-black text-white py-2.5 rounded-md font-black uppercase tracking-widest text-[8px] hover:bg-gray-800 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    Checkout <FaShoppingCart className="text-[9px]" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAddToCart}
                  disabled={product.isOutOfStock}
                  className={`w-full py-3.5 rounded-md font-black uppercase tracking-widest text-[8px] transition-all flex items-center justify-center gap-1.5 shadow-sm ${
                    product.isOutOfStock 
                    ? "bg-gray-50 text-gray-300 cursor-not-allowed border border-gray-50" 
                    : "bg-black text-white hover:bg-gray-900"
                  }`}
                >
                  {addingToCart ? <PulseLoader size={3} color="#fff" /> : (
                      <>
                        {product.isOutOfStock ? "Sold Out" : "Reserve Piece"}
                        {!product.isOutOfStock && <FaCheckCircle className="text-white opacity-40 text-[9px]" />}
                      </>
                  )}
                </button>
              )}
              <p className="text-[6px] text-center font-bold text-gray-400 uppercase tracking-[0.2em] pt-0.5 italic">Express Dispatch Active</p>
            </div>

            {/* Info Tabs */}
            <div className="space-y-4 pt-2">
               <div className="flex gap-6 border-b border-gray-50 text-[9px] font-black uppercase tracking-[0.1em] font-bold">
                  {['description', 'specs'].map(tab => (
                    <button 
                      key={tab}
                      className={`pb-2 relative transition-all ${activeTab === tab ? 'text-gray-950' : 'text-gray-300'}`}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab}
                      {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-[1.5px] bg-black" />}
                    </button>
                  ))}
               </div>
               
               <div className="text-[10px] text-gray-500 leading-relaxed font-medium italic">
                  {activeTab === 'description' ? (
                    product.description || "Crafted for excellence, this piece seamlessly integrates modern design with unparalleled functionality."
                  ) : (
                    <div className="grid grid-cols-2 gap-y-3">
                      <div>
                        <p className="text-[7px] uppercase tracking-widest text-gray-300 font-bold mb-0.5">Series</p>
                        <p className="text-black font-black uppercase text-[8px]">{product.category || "Standard"}</p>
                      </div>
                      <div>
                        <p className="text-[7px] uppercase tracking-widest text-gray-300 font-bold mb-0.5">Origin</p>
                        <p className="text-black font-black uppercase text-[8px]">Global Production</p>
                      </div>
                    </div>
                  )}
               </div>
            </div>

            <div className="grid grid-cols-3 gap-1.5 pt-4">
                {[
                  { icon: <FaShieldAlt />, label: "Secured" },
                  { icon: <FaTruck />, label: "Express" },
                  { icon: <FaSyncAlt />, label: "30D Returns" }
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center gap-1 p-2 bg-gray-50/5 rounded-md border border-gray-50/50">
                    <div className="text-gray-300 text-[9px]">{item.icon}</div>
                    <span className="text-[6px] font-black uppercase tracking-widest text-gray-400 text-center font-bold">{item.label}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* REVIEWS SECTION */}
        {(hasReviews || loggedInUser) && (
          <div className="mt-14 border-t border-gray-50 pt-10">
            <div className="flex flex-col md:flex-row justify-between items-start gap-8">
              
              {/* Summary & Form (Sticky-ish) */}
              <div className="w-full md:w-1/3 space-y-6">
                <div>
                  <h3 className="text-[11px] font-black uppercase tracking-tighter italic text-gray-950">Client Logs</h3>
                  <p className="text-[7px] font-black text-gray-300 uppercase tracking-widest font-bold">Verified Production Feedback</p>
                  
                  {hasReviews && (
                    <div className="flex items-center gap-3 bg-gray-50/50 px-4 py-2 rounded-lg border border-gray-50 mt-4 w-fit">
                      <span className="text-xl font-black italic">{product.averageRating || "4.8"}</span>
                      <div className="flex text-yellow-500 text-[7px]">
                        {[1, 2, 3, 4, 5].map(i => (
                          <FaStar key={i} className={i <= (product.averageRating || 5) ? "text-yellow-500" : "text-gray-200"} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {loggedInUser ? (
                  canReview ? (
                    <form onSubmit={handleReviewSubmit} className="space-y-3 bg-gray-50/20 p-4 rounded-xl border border-gray-50 animate-in fade-in slide-in-from-top-4 duration-500">
                      <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">Add Perspective</p>
                      <div className="flex gap-2">
                         {[1,2,3,4,5].map(num => (
                           <button 
                              key={num} 
                              type="button" 
                              onClick={() => setRating(num)}
                              className={`text-xs transition-colors ${num <= rating ? 'text-yellow-400' : 'text-gray-200'}`}
                           >
                             <FaStar />
                           </button>
                         ))}
                      </div>
                      <textarea 
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Commentary..."
                        className="w-full bg-white border border-gray-100 rounded-lg p-3 text-[10px] italic focus:outline-none focus:border-black min-h-[100px] resize-none"
                      />
                      <button 
                        disabled={submittingReview}
                        className="w-full bg-black text-white py-2 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                      >
                        {submittingReview ? <PulseLoader size={3} color="#fff" /> : <><FaPaperPlane /> Publish</>}
                      </button>
                    </form>
                  ) : (
                    <div className="p-6 bg-gray-50/30 rounded-xl border border-dashed border-gray-100 text-center">
                       <p className="text-[9px] text-gray-400 italic font-bold uppercase tracking-widest">
                          {reviewReason === 'already_reviewed' ? "Perspective already recorded in archive." : "Verification required: Delivered clients only."}
                       </p>
                    </div>
                  )
                ) : !hasReviews && (
                  <div className="p-4 bg-gray-50/30 rounded-xl border border-dashed border-gray-100 text-center">
                    <p className="text-[9px] text-gray-400 italic">Authenticate to add the first perspective.</p>
                  </div>
                )}
              </div>

              {/* Reviews List */}
              <div className="w-full md:w-2/3">
                {hasReviews ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {reviews.map((rev, i) => (
                      <div key={i} className="p-4 bg-gray-50/5 rounded-lg border border-gray-50 hover:border-gray-100 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <FaUserCircle className="text-gray-200 text-base" />
                            <div className="flex-grow">
                              <p className="text-[9px] font-black uppercase tracking-tight italic text-gray-950 flex items-center gap-2">
                                {rev.userName}
                                {(loggedInUser?.role === 'admin' || loggedInUser?.phone === rev.userPhone) && (
                                  <button 
                                    onClick={() => handleDeleteReview(rev.id)}
                                    className="text-red-400 hover:text-red-600 transition-colors"
                                    title="Archive Perspective"
                                  >
                                    <FaTrashAlt className="text-[7px]" />
                                  </button>
                                )}
                              </p>
                              <p className="text-[6px] text-gray-300 font-bold uppercase tracking-widest">
                                {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString("en-GB") : 'Recent'}
                              </p>
                            </div>
                          </div>
                          <div className="flex text-yellow-400 text-[6px]">
                            {[...Array(5)].map((_, j) => (
                              <FaStar key={j} className={j < rev.rating ? "text-yellow-400" : "text-gray-200"} />
                            ))}
                          </div>
                        </div>
                        <p className="text-[10px] text-gray-500 font-medium leading-normal italic line-clamp-3">"{rev.comment}"</p>
                      </div>
                    ))}
                  </div>
                ) : (
                   <div className="h-full flex flex-col items-center justify-center py-10 opacity-20">
                      <FaUserCircle className="text-4xl mb-2" />
                      <p className="text-[10px] font-black uppercase tracking-widest">No Logs Found</p>
                   </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* RECOMMENDATION ENSEMBLE */}
        {relatedProducts.length > 0 && (
          <div className="mt-14 bg-gray-950 text-white rounded-xl p-6 md:p-10 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 blur-[60px] rounded-full -mr-16 -mt-16" />
              <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-white/5 pb-8 mb-8">
                  <div>
                     <p className="text-[8px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-2 font-bold">Category Ensemble</p>
                     <h2 className="text-xl font-black uppercase tracking-tighter italic leading-none max-w-xs">Curated Selection</h2>
                     <p className="text-[10px] text-gray-500 mt-2 font-medium italic">Based on your current aesthetic preference.</p>
                  </div>
                  <button onClick={() => navigate(homePath)} className="bg-white text-black px-6 py-2.5 rounded-full text-[8px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all active:scale-95 shadow-sm">Explore All</button>
              </div>
              
              <div className="flex overflow-x-auto scrollbar-hide gap-4 pb-2 md:grid md:grid-cols-4 md:gap-6">
                 {relatedProducts.map((p) => (
                   <div key={p.id} onClick={() => navigate(`/product/${p.id}`)} className="group cursor-pointer w-[110px] md:w-auto flex-shrink-0">
                      <div className="aspect-[4/5] bg-white/5 border border-white/5 rounded-lg mb-2 flex items-center justify-center p-4 group-hover:bg-white/10 transition-all duration-500">
                         <img src={p.imageUrl} alt={p.name} className="max-h-12 w-auto object-contain opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 mx-auto" />
                      </div>
                      <h4 className="text-[8px] font-black uppercase tracking-tighter italic text-gray-400 group-hover:text-white transition-colors truncate w-full mb-0.5">
                        {p.name}
                      </h4>
                      <p className="text-[7px] text-indigo-400 font-black">₹{p.price}</p>
                   </div>
                 ))}
              </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
