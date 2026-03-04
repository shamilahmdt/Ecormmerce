import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api";
import { FaSearch } from "react-icons/fa";
import { GridLoader } from "react-spinners";
// import { firestore } from "../../firebaseConfig";
// import { collection, addDoc } from "firebase/firestore";

const FILTER_TAGS = [
  { label: "NEW", active: true },
  { label: "BEST SELLERS" },

];

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("NEW");

  const navigate = useNavigate();
  // const productsCollection = collection(firestore, "products");

  const fetchProducts = async () => {
    try {
      const res = await API.get("/products");
      setProducts(res.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    try {
      await API.delete(`/products/${id}`);
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  // const handleLogout = () => {
  //   localStorage.removeItem("loggedInUser");
  //   navigate("/login");
  // };

  // Filter and search logic
  const filteredProducts = products.filter((product) => {
    const matchesTag =
      activeTag === "NEW" ? true : product.category === activeTag;
    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchesTag && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F2F2F2] py-6 sm:py-8 px-4 sm:px-8 font-sans overflow-x-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 px-1">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tighter uppercase text-gray-900 italic">
          Admin <span className="text-indigo-600">Inventory</span>
        </h1>
        
        <button
          onClick={() => navigate("/add-product")}
          className="bg-black text-white px-4 py-2 rounded-xl shadow-lg hover:shadow-indigo-100 transition-all font-black text-[10px] sm:text-xs uppercase tracking-widest active:scale-95"
        >
          + Add New
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-1/3">
          <FaSearch className="absolute top-3 left-3 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-sm font-bold shadow-sm"
          />
        </div>

        {/* Filter Tags */}
        <div className="flex flex-wrap gap-2">
          {FILTER_TAGS.map((tag) => (
            <button
              key={tag.label || tag}
              onClick={() => setActiveTag(tag.label || tag)}
              className={`px-4 py-1.5 text-[10px] font-black tracking-widest uppercase border-2 ${
                activeTag === (tag.label || tag)
                  ? "bg-black text-white border-black"
                  : "text-gray-400 border-gray-100 bg-white hover:border-gray-300"
              } rounded-xl transition-all shadow-sm`}
            >
              {tag.label || tag}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <GridLoader color="#4F46E5" size={15} />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white p-12 rounded-[32px] shadow-sm border border-gray-100 text-center">
          <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaSearch className="text-gray-300 text-2xl" />
          </div>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">
            No products match your search.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl sm:rounded-[32px] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group border border-gray-100"
            >
              {/* Image Section */}
              <div className="bg-gray-50 h-40 sm:h-64 flex items-center justify-center p-3 sm:p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/5 transition-colors duration-500"></div>
                <img
                  src={product.imageUrl || "https://via.placeholder.com/300"}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-110 z-10"
                />
              </div>

              {/* Content Section */}
              <div className="p-4 sm:p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-1">
                  <p className="text-[8px] sm:text-[10px] font-black uppercase text-gray-400 tracking-widest">
                    {product.category || "General"}
                  </p>
                  <p className={`text-[8px] sm:text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${product.isOutOfStock ? 'text-red-500 bg-red-50' : 'text-green-500 bg-green-50'}`}>
                    {product.isOutOfStock ? 'Out of Stock' : 'In Stock'}
                  </p>
                </div>

                <h2 className="text-xs sm:text-lg font-black mt-1 line-clamp-1 text-gray-800 uppercase tracking-tight">
                  {product.name}
                </h2>

                <p className="text-sm sm:text-xl font-black mt-1 sm:mt-2 text-indigo-600">₹{product.price.toLocaleString()}</p>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2 mt-auto pt-4 sm:pt-6">
                  <button
                    onClick={() =>
                      navigate(`/edit-product/${product.id}`, {
                        state: { product },
                      })
                    }
                    className="text-[10px] sm:text-xs font-black uppercase tracking-widest bg-gray-900 border border-gray-900 text-white px-3 py-2 rounded-xl hover:bg-black transition-all active:scale-95"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(product.id)}
                    className="text-[10px] sm:text-xs font-black uppercase tracking-widest bg-white border-2 border-red-50 text-red-500 px-3 py-2 rounded-xl hover:bg-red-50 transition-all active:scale-95"
                  >
                    Del
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;