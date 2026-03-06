import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import API from "../../api";
// import { firestore } from "../../firebaseConfig";
// import { doc, getDoc, updateDoc } from "firebase/firestore";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const productFromDashboard = location.state?.product;

  const [name, setName] = useState(productFromDashboard?.name || "");
  const [price, setPrice] = useState(productFromDashboard?.price || "");
  const [category, setCategory] = useState(productFromDashboard?.category || "");
  const [images, setImages] = useState(productFromDashboard?.imageUrls || (productFromDashboard?.imageUrl ? [productFromDashboard.imageUrl] : [""]));
  const [isOutOfStock, setIsOutOfStock] = useState(productFromDashboard?.isOutOfStock || false);
  const [description, setDescription] = useState(productFromDashboard?.description || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!productFromDashboard) {
      const fetchProduct = async () => {
        try {
          const res = await API.get("/products");
          const product = res.data.find((p) => p.id === id);

          if (product) {
            setName(product.name);
            setPrice(product.price);
            setCategory(product.category || "");
            setImages(product.imageUrls || (product.imageUrl ? [product.imageUrl] : [""]));
            setIsOutOfStock(product.isOutOfStock || false);
            setDescription(product.description || "");
          }
        } catch (error) {
          console.error("Error fetching product:", error);
        }
      };

      fetchProduct();
    }
  }, [id, productFromDashboard]);

  const handleAddImageField = () => {
    setImages([...images, ""]);
  };

  const handleImageChange = (index, value) => {
    const newImages = [...images];
    newImages[index] = value;
    setImages(newImages);
  };

  const handleRemoveImageField = (index) => {
    if (images.length === 1) return;
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };

  const handleFileUpload = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        handleImageChange(index, event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const filteredImages = images.filter(img => img.trim() !== "");
      
      await API.put(`/products/${id}`, {
        name,
        price: Number(price),
        category,
        imageUrls: filteredImages,
        imageUrl: filteredImages[0] || "", // Keep for legacy
        description,
        isOutOfStock,
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("Error updating product:", error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-10">
      <div className="bg-white p-6 sm:p-12 rounded-[3rem] shadow-2xl shadow-gray-200/50 w-full max-w-6xl border border-gray-100 italic">
        <div className="mb-10 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tighter uppercase mb-2">Refine <span className="text-blue-600">Product</span></h1>
          <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-[0.3em]">Modify Existing Collection Entry</p>
        </div>

        <form
          onSubmit={handleUpdate}
          className="flex flex-col lg:flex-row gap-10 sm:gap-16 items-start"
        >
          {/* Form inputs */}
          <div className="flex-[1.5] space-y-6 w-full">
             <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Product Designation</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Premium Wireless Audio"
                  className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold transition-all text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Price Unit (₹)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    placeholder="2999"
                    className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 no-spinner font-bold transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Catalog Tag</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Gadgets"
                    required
                    className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Product Description</label>
                <textarea
                  placeholder="Detailed product information..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold transition-all text-sm min-h-[120px] resize-none"
                />
              </div>

              {/* Status Toggle */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center justify-between group cursor-pointer hover:border-red-100 transition-all" onClick={() => setIsOutOfStock(!isOutOfStock)}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isOutOfStock ? 'bg-red-500 text-white' : 'bg-green-100 text-green-600'}`}>
                    {isOutOfStock ? '🚫' : '📦'}
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Inventory Status</label>
                    <p className={`text-xs font-black uppercase ${isOutOfStock ? 'text-red-500' : 'text-green-600'}`}>
                      {isOutOfStock ? 'Out of Stock' : 'In Stock'}
                    </p>
                  </div>
                </div>
                <div className={`w-12 h-6 rounded-full relative transition-all ${isOutOfStock ? 'bg-red-500' : 'bg-gray-200'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isOutOfStock ? 'left-7' : 'left-1'}`}></div>
                </div>
              </div>
            </div>

            {/* Multiple Images Support */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Visual Assets (URL or Upload)</label>
                <button 
                  type="button"
                  onClick={handleAddImageField}
                  className="text-[9px] font-black text-blue-600 uppercase tracking-widest hover:underline"
                >
                  + Add Another
                </button>
              </div>
              
              <div className="space-y-3">
                {images.map((img, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <div className="flex-grow space-y-2">
                      <input
                        type="text"
                        placeholder="Image URL..."
                        value={img && !img.startsWith('data:') ? img : ""}
                        onChange={(e) => handleImageChange(index, e.target.value)}
                        className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold text-xs"
                      />
                      <div className="flex items-center gap-2">
                        <label className="flex-shrink-0 bg-gray-100 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest cursor-pointer hover:bg-gray-200 transition-colors">
                          Upload File
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={(e) => handleFileUpload(index, e)}
                          />
                        </label>
                        {img && img.startsWith('data:') && (
                          <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest">Base64 Asset Loaded</span>
                        )}
                      </div>
                    </div>
                    {images.length > 1 && (
                      <button 
                        type="button"
                        onClick={() => handleRemoveImageField(index)}
                        className="bg-red-50 text-red-500 p-3 rounded-xl hover:bg-red-100"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl shadow-gray-200 hover:bg-gray-900 active:scale-95 transition-all mt-8"
            >
              {loading ? "Syncing State..." : "Commit Changes"}
            </button>
          </div>

          {/* Image Preview Grid */}
          <div className="flex-1 w-full space-y-4">
             <label className="block text-[10px] font-black text-center text-gray-400 uppercase tracking-widest">Live Gallery Preview</label>
             <div className="grid grid-cols-2 gap-3">
                {images.map((img, index) => (
                  <div key={index} className="relative aspect-square bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center overflow-hidden shadow-inner group p-2">
                    {img ? (
                      <img
                        src={img}
                        alt={`Preview ${index}`}
                        className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <span className="text-[15px] opacity-20">🖼️</span>
                    )}
                    {index === 0 && img && (
                      <span className="absolute top-1 left-1 bg-black text-white text-[6px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-widest z-10">Hero</span>
                    )}
                  </div>
                ))}
             </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;