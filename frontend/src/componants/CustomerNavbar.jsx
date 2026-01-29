import { Link,useNavigate} from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function CustomerNavbar() {
  const { user,logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  
  return (
    <nav className="bg-black text-white px-6 py-4 flex gap-6 items-center">
      
      {/* HOME (PRODUCT LISTING) */}
      <Link to="/">Home</Link>

      {/* CUSTOMER ONLY LINKS */}
      {user?.role === "customer" && (
        <>
          <Link to="/orders">Orders</Link>
          <Link to="/cart">Cart</Link>
        </>
      )}

      {/* AUTH LINKS */}
      <div className="ml-auto flex gap-4">
        {!user && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register/customer">Register</Link>
          </>
        )}

        {user && user.role === "customer" && (
          <button
            onClick={handleLogout}
            className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
