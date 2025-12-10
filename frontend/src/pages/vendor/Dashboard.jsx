import React, {useEffect,useState,} from "react";
import { getVendorDashboard } from "../../api/vendor";
import { Navigate, useNavigate } from "react-router-dom";
const Dashboard = () => {
    const [data, setData] = useState(null);
    const [loading,setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadDashboard();
    },[]);

    const loadDashboard = async () => {
        try {
            const response = await getVendorDashboard();
            console.log("Dashboard api response:",response);
            setData(response.data);
        } catch (error) {
            console.error("Dashboard api error:",error);
        } finally {
            setLoading(false);
        }
    };
    if (loading || !data) return <h2 className="text-center mt-10">Loading...</h2>;

    return (
       <div className="max-w-7xl mx-auto p-6">
    <h1 className="text-2xl font-bold mb-6">Vendor Dashboard</h1>

    {/* Manage Buttons */}
    <div className="flex gap-4 mb-6">
      <button
        onClick={() => navigate("/vendor/products")}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Manage Products
      </button>

      <button
        onClick={() => navigate("/vendor/orders")}
        className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
      >
        Manage Orders
      </button>
    </div>

    {/* Stats */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-blue-600 text-white rounded-lg p-4 shadow text-center">
        <p className="text-xl font-bold">{data.stats.total_products}</p>
        <p>Products</p>
      </div>

      <div className="bg-indigo-600 text-white rounded-lg p-4 shadow text-center">
        <p className="text-xl font-bold">{data.stats.total_orders}</p>
        <p>Total Orders</p>
      </div>

      <div className="bg-yellow-400 text-black rounded-lg p-4 shadow text-center">
        <p className="text-xl font-bold">{data.stats.pending_orders}</p>
        <p>Pending</p>
      </div>

      <div className="bg-green-600 text-white rounded-lg p-4 shadow text-center">
        <p className="text-xl font-bold">{data.stats.completed_orders}</p>
        <p>Completed</p>
      </div>
    </div>

    {/* Recent Products */}
    <h2 className="text-xl font-semibold mb-3">Recent Products</h2>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {data.recent_products.map((p) => (
        <div
          key={p.id}
          className="bg-white shadow rounded-lg p-3 text-center"
        >
          <img
            src={p.images?.[0]?.image}
            alt={p.name}
            className="w-20 h-20 object-cover rounded mx-auto"
          />
          <p className="font-semibold mt-2">{p.name}</p>
          <p className="text-sm text-gray-600">₹{p.price}</p>
        </div>
      ))}
    </div>

    {/* Recent Orders */}
    <h2 className="text-xl font-semibold mb-3">Recent Orders</h2>
    <div className="bg-white rounded-lg shadow p-4 mb-8">
      {data.recent_orders.length === 0 ? (
        <p className="text-gray-600">No recent orders</p>
      ) : (
        data.recent_orders.map((o) => (
          <div
            key={o.id}
            className="flex justify-between border-b py-2 items-center"
          >
            <p>{o.product?.name}</p>
            <p className="font-medium">Qty: {o.quantity}</p>
            <span
              className={`px-3 py-1 rounded text-sm font-bold ${
                o.status === "DELIVERD"
                  ? "bg-green-600 text-white"
                  : "bg-yellow-500 text-black"
              }`}
            >
              {o.status}
            </span>
          </div>
        ))
      )}
    </div>

    {/* Pending Orders */}
    <h3 className="text-lg font-semibold text-orange-500 mb-2">Pending Orders</h3>
    <ul className="space-y-2 mb-8">
      {data.pending_orders.length > 0 ? (
        data.pending_orders.map((o) => (
          <li key={o.id} className="flex gap-2">
            <span>{o.product?.name}</span>
            <span>Qty: {o.quantity}</span>
            <strong className="text-orange-500">{o.status}</strong>
          </li>
        ))
      ) : (
        <li className="text-gray-600">No pending orders</li>
      )}
    </ul>

    {/* Completed Orders */}
    <h3 className="text-lg font-semibold text-green-600 mb-2">Completed Orders</h3>
    <ul className="space-y-2">
      {data.completed_orders.length > 0 ? (
        data.completed_orders.map((o) => (
          <li key={o.id} className="flex gap-2">
            <span>{o.product?.name}</span>
            <span>Qty: {o.quantity}</span>
            <strong className="text-green-600">{o.status}</strong>
          </li>
        ))
      ) : (
        <li className="text-gray-600">No completed orders</li>
      )}
    </ul>

  </div>
  );
    
};
export default Dashboard;