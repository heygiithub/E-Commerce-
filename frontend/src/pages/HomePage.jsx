import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import api from "../api/axios";
import "../App.css";

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [page,setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("");


  const fetchProducts = async (reset = false) => {
    let url = `products/?page=${page}&`;

    if (search) url += `search=${search}&`;
    if (category) url += `category=${category}&`;
    if (minPrice) url += `price__gte=${minPrice}&`;
    if (maxPrice) url += `price__lte=${maxPrice}&`;
    if (sort) url += `ordering=${sort}&`;

    try {
      const response = await api.get(url);

      if (reset) {
        setProducts(response.data.results);
      } else {
        setProducts((prev) => {
          const existingIds = new Set(prev.map(p => p.id));
          const newProducts = response.data.results.filter(
            p => !existingIds.has(p.id)

          );
          return [...prev, ...newProducts];
        });
      }

      setHasMore(response.data.next !== null);
    } catch (error) {
      console.log("failed to fetch products:",error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get("categories/");
      setCategories(response.data);
    } catch (error) {
      console.log ("failed to fethc categories",error);
    }
  };

 

  useEffect(()=>{
    if (page > 1) fetchCategories();
    fetchProducts();
  },[page]);

  const handleFilter = () =>{ 
    setPage(1);
    fetchProducts(true);

  };




if (loading) return <h2 className="text-center mt-10">Loading products...</h2>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Latest Products</h2>

      {/* Search & Filters */}
      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <input
          type="text"
          placeholder="Search products..."
          className="border p-2 rounded w-48"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border p-2 rounded w-40"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Min Price"
          className="border p-2 rounded w-28"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        />

        <input
          type="number"
          placeholder="Max Price"
          className="border p-2 rounded w-28"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />

        <select
          className="border p-2 rounded w-40"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="">Sort</option>
          <option value="price">Price: Low to High</option>
          <option value="-price">Price: High to Low</option>
          <option value="-created_at">Newest First</option>
        </select>

        <button
          onClick={handleFilter}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Apply
        </button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map((p) => (
          <div
            key={p.id}
            onClick={() => navigate(`/product/${p.id}`)}
            className="bg-white shadow-md rounded-lg p-4 cursor-pointer hover:shadow-lg transition"
          >
            <img
              src={p.images?.[0]?.image}
              alt={p.name}
              className="w-full h-48 object-cover rounded-md"
            />

            <h3 className="font-semibold text-lg mt-3">{p.name}</h3>
            <p className="text-gray-600">₹{p.price}</p>

            <button className="mt-3 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
              View Details
            </button>

           
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <p className="text-center text-gray-600 mt-10">No products found</p>
      )}

       {
        hasMore && (
          <button
          onClick={()=> setPage(prev=> prev + 1)} className="block mx-auto mt-6 bg-gray-700 text-white px-6 py-2 rounded hover:bg-gray-900">
            Load More
          </button>
        )
      }
    </div>
)
};
