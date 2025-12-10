import { Link,useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold">
          YES-MART
        </Link>

        {/* Links */}
        <div className="flex gap-5 items-center">
          
          <Link to="/" className="hover:underline">
            Home
          </Link>

          {/* Customer Links */}
          {user?.role === "customer" && (
            <>
              <Link to="/cart" className="hover:underline">
                Cart
              </Link>
              <Link to="/customer" className="hover:underline">
                Orders
              </Link>
            </>
          )}

          {/* Vendor Links */}
          {user?.role === "vendor" && (
            <Link to="/vendor/dashboard" className="hover:underline">
              Vendor Dashboard
            </Link>
          )}

          {/* Auth Buttons */}
          {!user ? (
            <Link to="/login" className="hover:underline">
              Login
            </Link>
          ) : (
            <button
              onClick={handleLogout}
              className="bg-red-500 px-3 py-1 rounded hover:bg-red-700"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
 
}
