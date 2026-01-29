import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import api from "../api/axios";

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch product (single API call)
  useEffect(() => {
    let isMounted = true;

    const fetchProduct = async () => {
      try {
        const res = await api.get(`products/${slug}/`);
        if (isMounted) setProduct(res.data);
      } catch (err) {
        if (isMounted) setError("Failed to load product");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProduct();
    return () => { isMounted = false; };
  }, [slug]);

  //Auth guard
  const requireCustomer = useCallback(() => {
    if (!user || user.role !== "customer") {
      navigate("/login");
      return false;
    }
    return true;
  }, [user, navigate]);

  // 🔹 Add to cart
  const handleAddToCart = async () => {
    if (!requireCustomer()) return;

    try {
      await api.post("customer/cart/", {
        product_id: product.id,
        quantity: 1,
      });
      alert("Added to cart");
    } catch (err) {
      alert("Failed to add product to cart");
    }
  };

  // 🔹 Buy now
  const handleBuyNow = () => {
    if (!requireCustomer()) return;
    navigate(`/order?product=${product.slug}`);
  };

  // 🔹 UI states
  if (loading) {
    return <h2 className="text-center mt-10">Loading product...</h2>;
  }

  if (error) {
    return <h2 className="text-center mt-10 text-red-600">{error}</h2>;
  }

  const mainImage =
    product.images?.[0]?.image || "/placeholder.png";

  return (
    <div className="max-w-5xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
      
      {/* Product Images */}
      <div>
        <img
          src={mainImage}
          alt={product.name}
          className="w-full h-96 object-cover rounded-lg shadow-lg"
          loading="lazy"
        />
      </div>

      {/* Product Info */}
      <div>
        <h2 className="text-3xl font-bold mb-3">{product.name}</h2>

        <p className="text-gray-700 mb-4 text-lg leading-relaxed">
          {product.description}
        </p>

        <p className="text-2xl font-semibold text-green-600 mb-2">
          ₹{product.price}
        </p>

        <p className="text-gray-500 mb-6">
          Stock: {product.stock > 0 ? product.stock : "Out of stock"}
        </p>

        <div className="flex gap-4">
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="bg-yellow-500 text-black px-6 py-2 rounded-lg
                       hover:bg-yellow-600 font-semibold disabled:opacity-50"
          >
            Add to Cart
          </button>

          <button
            onClick={handleBuyNow}
            disabled={product.stock === 0}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg
                       hover:bg-blue-700 font-semibold disabled:opacity-50"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
