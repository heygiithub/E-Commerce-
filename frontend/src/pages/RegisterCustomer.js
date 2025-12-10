import React, { useState } from "react";
import { useNavigate,Link } from "react-router-dom";
import api from "../api/axios";

export default function RegisterCustomer() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    phone: ""
  });

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      await api.post("/register/customer/", formData);
      alert("Customer registered successfully!");
      navigate("/login");

    } catch (error) {
      alert("Registration Failed");
      console.log(error.response?.data);
    } 
  };

  return (
     <div className="h-[80vh] flex justify-center items-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 shadow-md rounded-lg w-[350px]"
      >
        <h2 className="text-2xl font-bold text-center mb-6">Customer Register</h2>

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
          type="password"
          placeholder="Password"
          className="border w-full p-3 rounded mb-4"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
        />

         <input
          type="Email"
          placeholder="Email"
          className="border w-full p-3 rounded mb-4"
          value={formData.email}
          onChange={(e) =>
            setFormData({ ...formData, email: e.target.value })
          }
        />

         <input
          type="phone number "
          placeholder="Phone num"
          className="border w-full p-3 rounded mb-4"
          value={formData.phone}
          onChange={(e) =>
            setFormData({ ...formData, phone: e.target.value })
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

