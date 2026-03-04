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
    });

    navigate("/dashboard");
  } catch (error) {
    console.error("Error updating product:", error);
  }

  setLoading(false);
};

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-4xl">
        <h1 className="text-2xl font-bold mb-6 text-center">Edit Product</h1>

        <form
          onSubmit={handleUpdate}
          className="flex flex-col md:flex-row gap-6 items-start"
        >
          {/* Form inputs */}
          <div className="flex-1 space-y-5 w-full">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Product Name"
              className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              placeholder="Price"
              className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 no-spinner"
            />

            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Category"
              required
              className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Image URL"
              required
              className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg shadow mt-3"
            >
              {loading ? "Updating..." : "Update Product"}
            </button>
          </div>

          {/* Image Preview */}
          <div className="flex-1 w-full max-w-sm">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Preview"
                className="w-full h-full object-contain rounded-lg border"
              />
            ) : (
              <div className="w-full h-64 flex items-center justify-center border rounded-lg text-gray-400">
                Image preview
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;