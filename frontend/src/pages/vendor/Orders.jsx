import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";

export default function VendorOrders() {
  const [orders, setOrders] = useState([]);
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
    try {
      await api.patch(`vendor/orders/${id}/`, { status });
      fetchOrders(); // refresh list
    } catch (error) {
      console.log("Status update error:", error.response?.data);
    }
  };

  const nextStatus = {
    PLACED: "ACCEPTED",
    ACCEPTED: "PACKED",
    PACKED: "SHIPPED",
    SHIPPED: "DELIVERED",
  };

return (
  <div className="max-w-6xl mx-auto p-6">
    <h2 className="text-2xl font-bold mb-6">Order Management</h2>

    {orders.length === 0 ? (
      <p className="text-gray-600">No orders yet.</p>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse shadow-md rounded-lg overflow-hidden">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="p-3">Product</th>
              <th className="p-3">Qty</th>
              <th className="p-3">Price (₹)</th>
              <th className="p-3">Status</th>
              <th className="p-3">Update</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b hover:bg-gray-100">
                {/* Product */}
                <td className="p-3 flex items-center gap-2">
                  <img
                    src={o.product?.images?.[0]?.image}
                    alt={o.product?.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <span>{o.product?.name}</span>
                </td>

                {/* Qty */}
                <td className="p-3 text-center">{o.quantity}</td>

                {/* Price */}
                <td className="p-3 font-semibold text-center">₹{o.price}</td>

                {/* Status */}
                <td className="p-3 text-center">
                  <span
                    className={`px-3 py-1 rounded text-white font-semibold ${
                      o.status === "DELIVERD"
                        ? "bg-green-600"
                        : o.status === "CANCELLED"
                        ? "bg-red-600"
                        : "bg-yellow-500 text-black"
                    }`}
                  >
                    {o.status}
                  </span>
                </td>

                {/* Buttons */}
                <td className="p-3 flex gap-2 justify-center">
                  {nextStatus[o.status] ? (
                    <button
                      onClick={() => updateStatus(o.id, nextStatus[o.status])}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Mark {nextStatus[o.status]}
                    </button>
                  ) : null}

                  {o.status !== "CANCELLED" && o.status !== "DELIVERD" && (
                    <button
                      onClick={() => updateStatus(o.id, "CANCELLED")}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
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

    <button
      className="mt-6 bg-gray-800 text-white px-6 py-2 rounded hover:bg-black transition"
      onClick={() => navigate("/vendor/dashboard")}
    >
      Back to Dashboard
    </button>
  </div>
);

}
