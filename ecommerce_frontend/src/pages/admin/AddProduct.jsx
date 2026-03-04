import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api";
// import { firestore } from "../../firebaseConfig";
// import { collection, addDoc } from "firebase/firestore";
import { PulseLoader  } from "react-spinners";

const AddProduct = () => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  // const productsCollection = collection(firestore, "products");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await API.post("/products", {
        name,
        price: Number(price),
        category,
        imageUrl,
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("Error adding product:", error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-4xl">
        <h1 className="text-2xl font-bold mb-6 text-center">Add Product</h1>

        {/* Form + Image Preview */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col md:flex-row gap-6 items-start"
        >
          {/* Form inputs */}
          <div className="flex-1 space-y-5 w-full">
            <input
              type="text" 
              placeholder="Product Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="number"
              placeholder="Price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 no-spinner"
            />

            <input
              type="text"
              placeholder="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="text"
              placeholder="Image URL"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              required
              className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg shadow mt-3 flex items-center justify-center"
            >
              {loading ? (
                <PulseLoader  size={10} color="#ffffff" />
              ) : (
                "Add Product"
              )}
            </button>
          </div>

          {/* Image preview */}
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

export default AddProduct;