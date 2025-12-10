import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function VendorProducts() {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      const res = await api.get("vendor/products/");
      setProducts(res.data);
    } catch (error) {
      console.error("Error loading products", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await api.delete(`vendor/products/${id}/`);
      fetchProducts();
    } catch (error) {
      console.error("Delete failed", error);
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
          const primaryImage =
            p.images?.find((img) => img.is_primary)?.image ||
            (p.images?.length > 0 ? p.images[0].image : null);

          return (
            <div
              key={p.id}
              className="bg-white shadow-md rounded-lg p-4 flex flex-col items-center hover:shadow-lg transition"
            >
              <img
                src={primaryImage || "/placeholder.jpg"}
                alt={p.name}
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