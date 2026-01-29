import React, { useState } from "react";
import api from "../api/axios";
import { Navigate,Link, useNavigate } from "react-router-dom";

export default function RegisterVendor() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    shop_name:"",
    description:"",
    password: ""
  });
  
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      await api.post("/register/vendor/", formData);
      alert("Vendor registered successfully!");
      navigate("/login");

  } catch (error) {
  console.error("Vendor register error:", error.response?.data);
  alert(JSON.stringify(error.response?.data, null, 2));
   }

  };


  return (
    <div className="h-[80vh] flex justify-center items-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 shadow-md rounded-lg w-[350px]"
      >
        <h2 className="text-2xl font-bold text-center mb-6">Vendor Register</h2>

        <input
          type="text"
          placeholder="Username"
          className="border w-full p-3 rounded mb-3"
          value={formData.username}
          onChange={(e) =>
            setFormData({ ...formData, username: e.target.value })
          }
        />

         <input
          type="email"
          placeholder="Email"
          className="border w-full p-3 rounded mb-3"
          value={formData.email}
          onChange={(e) =>
            setFormData({ ...formData, email: e.target.value })
          }
        />

         <input
          type="text"
          placeholder="Shop-Name"
          className="border w-full p-3 rounded mb-3"
          value={formData.shop_name}
          onChange={(e) =>
            setFormData({ ...formData, shop_name: e.target.value })
          }
        />

         <input
          type="text"
          placeholder="Description"
          className="border w-full p-3 rounded mb-3"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
        />

        <input
          type="password"
          placeholder="Password"
          className="border w-full p-3 rounded mb-4"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
        />

        <button className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700">
          Register
        </button>

        <p className="text-sm text-center mt-3">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
