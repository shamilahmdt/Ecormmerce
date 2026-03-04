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
  const [imageUrl, setImageUrl] = useState(productFromDashboard?.imageUrl || "");
  const [isOutOfStock, setIsOutOfStock] = useState(productFromDashboard?.isOutOfStock || false);
  const [loading, setLoading] = useState(false);

  // const productDoc = doc(firestore, "products", id);

  // Fetch from Firestore if state not available
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
            setImageUrl(product.imageUrl || "");
            setIsOutOfStock(product.isOutOfStock || false);
          }
        } catch (error) {
          console.error("Error fetching product:", error);
        }
      };

      fetchProduct();
    }
  }, [id, productFromDashboard]);

const handleUpdate = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    await API.put(`/products/${id}`, {
      name,
      price: Number(price),
      category,
      imageUrl,
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
      <div className="bg-white p-6 sm:p-12 rounded-[3rem] shadow-2xl shadow-gray-200/50 w-full max-w-5xl border border-gray-100 italic">
        <div className="mb-10 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tighter uppercase mb-2">Refine <span className="text-blue-600">Product</span></h1>
          <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-[0.3em]">Modify Existing Collection Entry</p>
        </div>

        <form
          onSubmit={handleUpdate}
          className="flex flex-col lg:flex-row gap-10 sm:gap-16 items-start"
        >
          {/* Form inputs */}
          <div className="flex-1 space-y-6 w-full">
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
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Visual Asset URL</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  required
                  className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold transition-all text-sm"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl shadow-gray-200 hover:bg-gray-900 active:scale-95 transition-all mt-8"
            >
              {loading ? "Syncing State..." : "Commit Changes"}
            </button>
          </div>

          {/* Image Preview */}
          <div className="flex-1 w-full lg:max-w-md">
            <div className="relative aspect-square sm:aspect-auto sm:h-[400px] w-full bg-gray-50 rounded-[3rem] border border-gray-100 flex items-center justify-center overflow-hidden shadow-inner group">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full h-full object-contain p-8 group-hover:scale-110 transition-transform duration-700"
                />
              ) : (
                 <div className="text-center p-10">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl text-gray-300">🖼️</span>
                  </div>
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Awaiting Visual Input</p>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;