import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import api from "../api/axios";

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`products/${id}/`)
      .then(res => setProduct(res.data))
      .catch(err => console.error(err));
  }, [id]);

  if (!product) return <h2 className="text-center mt-10">Loading...</h2>;

  const handleAddToCart = async () => {
    if (!user || user.role !== "customer") {
      return navigate("/login");
    }

    try {
      await api.post("customer/cart/", {
        product_id: product.id,
        quantity: 1
      });
      alert("Added to cart");
    } catch (err) {
      console.log("Cart error:", err.response?.data);
    }
  };

  const handleBuyNow = () => {
    if (!user || user.role !== "customer") {
      return navigate("/login");
    }
    navigate(`/order?product=${product.id}`);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Product Image */}
      <div>
        <img
          src={product.images?.[0]?.image}
          alt="product"
          className="w-full h-96 object-cover rounded-lg shadow-lg"
        />
      </div>

      {/* Product Info */}
      <div>
        <h2 className="text-3xl font-bold mb-3">{product.name}</h2>
        <p className="text-gray-700 mb-3 text-lg">{product.description}</p>
        <p className="text-2xl font-semibold text-green-600 mb-3">₹{product.price}</p>
        <p className="text-gray-500 mb-4">Stock: {product.stock}</p>

        <div className="flex gap-4">
          <button
            onClick={handleAddToCart}
            className="bg-yellow-500 text-black px-6 py-2 rounded-lg hover:bg-yellow-600 font-semibold"
          >
            Add to Cart
          </button>

          <button
            onClick={handleBuyNow}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
