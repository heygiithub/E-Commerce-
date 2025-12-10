import { useContext, useState } from "react";
import api from "../api/axios";
import { AuthContext } from "../auth/AuthContext";
import { useNavigate, useLocation, Link } from "react-router-dom";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("login/", {
        username,
        password,
      });

      login(res.data);

      const backendRole = res.data.user_role;
      if (!backendRole) {
        alert("Login failed: user role missing");
        return;
      }

      // If came from a protected route → return there
      if (location.state?.from) {
        navigate(location.state.from);
        return;
      }

      if (backendRole === "customer") {
        navigate("/");
      } else if (backendRole === "vendor") {
        navigate("/vendor/dashboard");
      } else {
        navigate("/");
      }

    } catch (error) {
      console.error("Login failed:", error.response?.data);
      alert("Invalid username or password");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white px-8 py-10 shadow-lg rounded-lg max-w-md w-full">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-700">
          Login
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            className="border p-3 w-full rounded"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="border p-3 w-full rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
            Login
          </button>
        </form>

        <p className="text-center mt-4 text-gray-700">Don’t have an account?</p>

        <div className="flex justify-center gap-4 mt-2">
          <Link className="text-blue-600 hover:underline" to="/register/customer">
            Register as Customer
          </Link>
          <Link className="text-green-600 hover:underline" to="/register/vendor">
            Register as Vendor
          </Link>
        </div>
      </div>
    </div>
  );
}
