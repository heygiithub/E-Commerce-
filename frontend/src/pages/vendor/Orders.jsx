import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";

export default function VendorOrders() {
  const [orders, setOrders] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      const res = await api.get("vendor/orders/");
      setOrders(res.data);
    } catch (error) {
      console.error("Order loading error:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await api.patch(`vendor/orders/${id}/`, { status });
      fetchOrders();
    } catch (error) {
      console.log("Status update error:", error.response?.data);
    } finally {
      setUpdatingId(null);
    }
  };

  const nextStatus = {
    PLACED: "ACCEPTED",
    ACCEPTED: "PACKED",
    PACKED: "SHIPPED",
    SHIPPED: "DELIVERED",
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">Order Management</h1>
        <p className="text-gray-500">
          Track and update orders for your products
        </p>
      </div>

      {/* ORDERS TABLE */}
      {orders.length === 0 ? (
        <div className="bg-white p-6 rounded shadow text-gray-600">
          No orders yet.
        </div>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-900 text-white">
              <tr>
                <th className="p-3 text-left">Product</th>
                <th className="p-3 text-center">Qty</th>
                <th className="p-3 text-center">Price</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((o) => (
                <tr
                  key={o.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  {/* PRODUCT */}
                  <td className="p-3 flex items-center gap-3">
                    <img
                      src={o.image || "/placeholder.png"}
                      alt={o.product}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <span className="font-medium">
                      {o.product}
                    </span>
                  </td>

                  {/* QTY */}
                  <td className="p-3 text-center">{o.quantity}</td>

                  {/* PRICE */}
                  <td className="p-3 text-center font-semibold">
                    ₹{o.price}
                  </td>

                  {/* STATUS */}
                  <td className="p-3 text-center">
                    <StatusBadge status={o.status} />
                  </td>

                  {/* ACTIONS */}
                  <td className="p-3 flex gap-2 justify-center">
                    {nextStatus[o.status] && (
                      <button
                        disabled={updatingId === o.id}
                        onClick={() =>
                          updateStatus(o.id, nextStatus[o.status])
                        }
                        className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        {nextStatus[o.status]}
                      </button>
                    )}

                    {o.status !== "CANCELLED" &&
                      o.status !== "DELIVERED" && (
                        <button
                          disabled={updatingId === o.id}
                          onClick={() =>
                            updateStatus(o.id, "CANCELLED")
                          }
                          className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* BACK */}
      <button
        onClick={() => navigate("/vendor/dashboard")}
        className="inline-flex items-center text-sm text-blue-600 hover:underline"
      >
        ← Back to Dashboard
      </button>
    </div>
  );
}

/* ===== STATUS BADGE ===== */

function StatusBadge({ status }) {
  const styles = {
    PLACED: "bg-gray-100 text-gray-800",
    ACCEPTED: "bg-blue-100 text-blue-800",
    PACKED: "bg-indigo-100 text-indigo-800",
    SHIPPED: "bg-yellow-100 text-yellow-800",
    DELIVERED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${
        styles[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}
