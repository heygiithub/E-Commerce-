import React, { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function AddProduct() {
  const [categories, setCatgories] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    description: "",
    
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async() => {
      const res = await api.get("categories/");
      setCatgories(res.data);
    };
    fetchCategories();
  }, []);


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
        name:formData.name,
        price:parseFloat(formData.price),
        stock:parseInt(formData.stock),
        description:formData.description,
        category:formData.category ? parseInt(formData.category):null,
        
    };

    try {
      const response = await api.post("vendor/products/", payload);
      alert("Product added successfully!");
      navigate(`/vendor/products/${response.data.id}/images`);
    } catch (error) {
      console.error("Add Error:", error.response?.data || error);
      alert(error.response?.data?.detail || "Something went wrong!");
    }
  };

  return (
  <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-md mt-10">
    <h2 className="text-xl font-bold mb-5 text-center">Add New Product</h2>

    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div>
        <label className="font-semibold text-sm">Product Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-2 border rounded mt-1"
          placeholder="Enter product name"
          required
        />
      </div>

      {/* Price */}
      <div>
        <label className="font-semibold text-sm">Price (₹)</label>
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          className="w-full p-2 border rounded mt-1"
          placeholder="Enter product price"
          required
        />
      </div>

      {/* Stock */}
      <div>
        <label className="font-semibold text-sm">Stock</label>
        <input
          type="number"
          name="stock"
          value={formData.stock}
          onChange={handleChange}
          className="w-full p-2 border rounded mt-1"
          placeholder="Enter stock quantity"
          required
        />
      </div>

      {/* Category */}
      <div>
        <label className="font-semibold text-sm">Category</label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full p-2 border rounded mt-1"
          required
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div>
        <label className="font-semibold text-sm">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="3"
          className="w-full p-2 border rounded mt-1"
          placeholder="Short description..."
          required
        ></textarea>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        Save Product
      </button>
    </form>
  </div>
);

}
