import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {useAuth} from "../auth/AuthContext";
import api from "../api/axios";
import "../App.css";

export default function HomePage() {
  const navigate = useNavigate();
  const {user} = useAuth();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("");

  // block access for vendors
  useEffect(()=> {
    if (user?.role === "vendor"){
      navigate("/vendor/dashboard",{replace:true});
    }
  }, [user, navigate]);

  //Debounce Search Input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); 
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);


  //Fetch Categories (runs only ONCE)
  useEffect(() => {
    if (user?.role === "vendor") return; 

    async function loadCategories() {
      try {
        const res = await api.get("categories/");
        setCategories(res.data);
      } catch (err) {
        console.log("Failed to fetch categories", err);
      }
    }
    loadCategories();
  }, [user]);


  //Build URL (NOT in dependencies!)
  const buildUrl = () => {
    const params = new URLSearchParams();
    params.append("page", page);

    if (debouncedSearch) params.append("search", debouncedSearch);
    if (category) params.append("category", category);
    if (minPrice) params.append("price__gte", minPrice);
    if (maxPrice) params.append("price__lte", maxPrice);
    if (sort) params.append("ordering", sort);

    return `products/?${params.toString()}`;
  };


  //Fetch Products (NO infinite loop)
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const url = buildUrl();
      const res = await api.get(url);

      if (page === 1) {
        setProducts(res.data.results);
      } else {
        setProducts(prev => {
          const merged = [...prev, ...res.data.results];
          const unique = Array.from(new Map(merged.map(p => [p.id, p])).values());
          return unique;
        });
      }

      setHasMore(res.data.next !== null);
    } catch (err) {
      if (err.response?.status ===404) {
        setHasMore(false); // stop scroll when no more pages
      } else {
        console.log("Failed to fetch products:", err);

      } 
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, category, minPrice, maxPrice, sort]);


  //Auto fetch when filters or page change
  useEffect(() => {
    if (user?.role === "vendor") return;
    fetchProducts();
  }, [fetchProducts,user]);


  //Reset infinite scroll when filters change
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    }, [debouncedSearch, category, minPrice, maxPrice, sort]);


  //Infinite Scroll
  useEffect(() => {
    const handleScroll = () => {
      if (!hasMore || loading) return;

      if (
        window.innerHeight + document.documentElement.scrollTop + 200 >=
        document.documentElement.offsetHeight
      ) {
        setPage(prev => prev + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, loading]);


  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Latest Products</h2>

      {/* Filters */}
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
            <option key={c.id} value={c.id}>{c.name}</option>
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
          <option value="price">Price: Low → High</option>
          <option value="-price">Price: High → Low</option>
          <option value="-created_at">Newest First</option>
        </select>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map((p) => (
          <div
            key={p.id}
            onClick={() => navigate(`/product/${p.slug}`)}
            className="bg-white shadow-md rounded-lg p-4 cursor-pointer hover:shadow-lg transition"
          >
            <img
              src={p.image || "/placeholder.png"}
              alt={p.name}
              className="w-full h-48 object-cover rounded-md"
            />
            <h3 className="font-semibold text-lg mt-3">{p.name}</h3>
            <p className="text-gray-600">₹{p.price}</p>
          </div>
        ))}
      </div>

      {loading && <p className="text-center mt-5">Loading more...</p>}
    </div>
  );
}
