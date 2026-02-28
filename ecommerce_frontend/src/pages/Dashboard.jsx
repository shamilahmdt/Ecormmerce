import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import { FaSearch } from "react-icons/fa";
import { GridLoader } from "react-spinners";
// import { firestore } from "../firebaseConfig";
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
    <div className="min-h-screen bg-[#F2F2F2] p-8 font-sans">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold uppercase tracking-tight text-gray-900">
          PRODUCTS
        </h1>

        {/* <div className="space-x-3">
          <button
            onClick={() => navigate("/add-product")}
            className="bg-black text-white px-5 py-2 rounded-lg shadow hover:opacity-90 transition"
          >
            + Add Product
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-5 py-2 rounded-lg shadow hover:opacity-90 transition"
          >
            Logout
          </button>
        </div> */}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0 sm:space-x-4">
        {/* Search */}
        <div className="relative w-full sm:w-1/3">
          <FaSearch className="absolute top-3 left-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded bg-gray-100 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>

        {/* Filter Tags */}
        <div className="flex flex-wrap gap-2">
          {FILTER_TAGS.map((tag) => (
            <button
              key={tag.label || tag}
              onClick={() => setActiveTag(tag.label || tag)}
              className={`px-3 py-1 text-xs font-semibold tracking-wider border ${
                activeTag === (tag.label || tag)
                  ? "bg-black text-white"
                  : "text-gray-700 border-gray-400"
              } rounded transition`}
            >
              {tag.label || tag}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <GridLoader color="#000" size={25} />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white p-6 rounded-xl shadow text-center">
          <p className="text-gray-500">
            No products available. Start by adding one.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 lg:grid-cols-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group"
            >
              {/* Image Section */}
              <div className="bg-gray-100 h-64 flex items-center justify-center p-4">
                <img
                  src={product.imageUrl || "https://via.placeholder.com/300"}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              {/* Content Section */}
              <div className="p-5 flex flex-col flex-grow">
                <p className="text-xs uppercase text-gray-400 tracking-wide">
                  {product.category || "Uncategorized"}
                </p>

                <h2 className="text-lg font-semibold mt-1 line-clamp-1">
                  {product.name}
                </h2>

                <p className="text-lg font-bold mt-2">₹ {product.price}</p>

                {/* Variants */}
                {product.variants?.length > 0 && (
                  <div className="flex items-center gap-2 mt-3">
                    {product.variants.slice(0, 4).map((v, i) => (
                      <span
                        key={i}
                        className="w-5 h-5 rounded-full border"
                        style={{ backgroundColor: v }}
                      />
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-between mt-auto pt-4">
                  <button
                    onClick={() =>
                      navigate(`/edit-product/${product.id}`, {
                        state: { product },
                      })
                    }
                    className="text-sm bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-1 rounded-lg transition"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(product.id)}
                    className="text-sm bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded-lg transition"
                  >
                    Delete
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