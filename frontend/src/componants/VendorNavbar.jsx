import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function VendorNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="w-full bg-gray-900 text-white px-6 py-4 flex items-center justify-between shadow">
      
      {/* Left: Brand */}
      <h2 className="text-lg font-semibold tracking-wide">
        Dashboard
      </h2>

      {/* Center: Links */}
      <nav className="flex gap-6 items-center">
        <NavLink
          to="/vendor/dashboard"
          className={({ isActive }) =>
            isActive ? "text-blue-400" : "hover:text-blue-400"
          }
        >
          Home
        </NavLink>

        <NavLink
          to="/vendor/products"
          className={({ isActive }) =>
            isActive ? "text-blue-400" : "hover:text-blue-400"
          }
        >
          Products
        </NavLink>

        <NavLink
          to="/vendor/orders"
          className={({ isActive }) =>
            isActive ? "text-blue-400" : "hover:text-blue-400"
          }
        >
          Orders
        </NavLink>
      </nav>

      {/* Right: User + Logout */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-300">
          {user?.username}
        </span>

        <button
          onClick={handleLogout}
          className="bg-red-600 px-3 py-1.5 rounded text-sm hover:bg-red-700"
        >
          Logout
        </button>
      </div>

    </header>
  );
}
