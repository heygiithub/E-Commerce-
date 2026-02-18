import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import placeholder from "../../assets/placeholder.png";

export default function VendorProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();


  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get("vendor/products/");
      console.log("Fetched products:", res.data);
      console.log("first product", res.data.results[0] || res.data[0]);
      setProducts(res.data.results || res.data);
    } catch (error) {
      console.error("Error loading products", error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) return <h2 className="text-center mt-10">Loading...</h2>;

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    setProducts(prev => prev.filter(p => p.id !== id));
    try {
      await api.delete(`vendor/products/${id}/`);
    } catch (error) {
      console.error("Delete failed", error);
       fetchProducts();
    }
  };

  if (!products) return <h2 className="text-center mt-10">Loading...</h2>;

return (
  <div className="max-w-6xl mx-auto p-6">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold">My Products</h2>

      <button
        onClick={() => navigate("/vendor/products/add")}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        + Add Product
      </button>
    </div>

    {products.length === 0 ? (
      <p className="text-gray-500">No products found. Start adding!</p>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {products.map((p) => {
          // for debugging image field
          console.log("product data:",p);
          console.log("Image field:",p.image);

          const primaryImage = p.image;

          return (
            <div
              key={p.id}
              className="bg-white shadow-md rounded-lg p-4 flex flex-col items-center hover:shadow-lg transition"
            >
              <img
                src={primaryImage|| placeholder}
                alt={p.name}
                loading="lazy"
                onError={(e)=>{
                  // image load debugging
                  console.log("image failed to load for product:",primaryImage);
      
                  e.target.onerror = null;
                  e.target.src = placeholder;
                }}
                className="w-28 h-28 object-cover rounded-md mb-3"
              />

              <h3 className="font-semibold text-lg">{p.name}</h3>
              <p className="text-gray-600">₹{p.price}</p>
              <p className="text-gray-500 text-sm">Stock: {p.stock}</p>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => navigate(`/vendor/products/${p.id}/edit`)}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  Edit
                </button>

                <button
                  onClick={() => navigate(`/vendor/products/${p.id}/images`)}
                  className="px-3 py-1 bg-yellow-500 text-black rounded hover:bg-yellow-600 text-sm"
                >
                  Images
                </button>

                <button
                  onClick={() => handleDelete(p.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
);
}