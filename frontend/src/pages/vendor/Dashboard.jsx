import { useEffect, useState } from "react";
import { getVendorDashboard } from "../../api/vendor";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await getVendorDashboard();
      setData(res.data);
    } catch (err) {
      console.error("Dashboard error", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-gray-600">Loading dashboard…</div>;
  }

  return (
    <div className="space-y-10">

      {/* ===== HEADER ===== */}
      <div>
        <h1 className="text-2xl font-bold">Vendor Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Overview of your store performance
        </p>
      </div>

      {/* ===== STATS ===== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard title="Products" value={data.stats.total_products} />
        <StatCard title="Total Orders" value={data.stats.total_orders} />
        <StatCard title="Pending Orders" value={data.stats.pending_orders} />
        <StatCard title="Completed Orders" value={data.stats.completed_orders} />
      </div>

      {/* ===== QUICK ACTIONS ===== */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>

        <div className="flex flex-wrap gap-4">
          <PrimaryButton
            label="Add Product"
            onClick={() => navigate("/vendor/products/add")}
          />
          <SecondaryButton
            label="Manage Products"
            onClick={() => navigate("/vendor/products")}
          />
          <SecondaryButton
            label="View Orders"
            onClick={() => navigate("/vendor/orders")}
          />
        </div>
      </div>

      {/* ===== RECENT ORDERS ===== */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Recent Orders</h2>
          <button
            onClick={() => navigate("/vendor/orders")}
            className="text-sm text-blue-600 hover:underline"
          >
            View all
          </button>
        </div>

        {data.recent_orders.length === 0 ? (
          <p className="text-gray-500">No recent orders</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b text-gray-600">
                <tr>
                  <th className="py-2">Product</th>
                  <th>Qty</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_orders.map(order => (
                  <tr key={order.id} className="border-b last:border-0">
                    <td className="py-3">{order.product?.name}</td>
                    <td>{order.quantity}</td>
                    <td>
                      <StatusBadge status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

/* ===== UI COMPONENTS ===== */

function StatCard({ title, value }) {
  return (
    <div className="bg-white shadow rounded-lg p-5 text-center">
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{title}</p>
    </div>
  );
}

function PrimaryButton({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-black text-white px-5 py-2 rounded hover:bg-gray-800"
    >
      {label}
    </button>
  );
}

function SecondaryButton({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="border border-gray-300 px-5 py-2 rounded hover:bg-gray-100"
    >
      {label}
    </button>
  );
}

function StatusBadge({ status }) {
  const colors = {
    PENDING: "bg-yellow-100 text-yellow-800",
    PROCESSING: "bg-blue-100 text-blue-800",
    DELIVERD: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  };

  return (
    <span
      className={`px-2 py-1 rounded text-xs font-medium ${
        colors[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}
