import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

export default function CustomerDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const {user} = useAuth();
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      const res = await api.get("customer/orders/");
      setOrders(res.data);
    } catch (error) {
      console.log("Failed to load orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancle = async(orderId) =>{
    try {
      await api.delete(`customer/orders/${orderId}/`);
      alert("Order Cancelled Successfully!");
      fetchOrders();
    } catch (error) {
      alert("Cannot Cancel this order!");
      console.log(error.res?.data);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

if (loading) return <h2 className="text-center mt-10">Loading...</h2>;

return (
  <div className="max-w-6xl mx-auto p-6">
    <h1 className="text-2xl font-bold mb-6">My Orders</h1>

    {orders.length === 0 ? (
      <p className="text-gray-600">You have not placed any orders yet.</p>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse shadow-md rounded-lg overflow-hidden">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="p-3">Product</th>
              <th className="p-3">Qty</th>
              <th className="p-3">Price</th>
              <th className="p-3">Status</th>
              <th className="p-3">Details</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b hover:bg-gray-100">
                <td className="p-3 flex items-center gap-3">
                  <img
                    src={o.product?.images?.[0]?.image}
                    alt={o.product?.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  {o.product?.name}
                </td>

                <td className="p-3">{o.quantity}</td>
                <td className="p-3 font-semibold">₹{o.subtotal}</td>

                <td className="p-3">
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

                <td className="p-3">
                  <button
                    onClick={() => navigate(`/customer/orders/${o.id}`)}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    View
                  </button>

                  {(o.status==="PLACED" || o.status==="PENDING")&&(
                    <button onClick={()=> handleCancle(o.order_id)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">Cancle</button>
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
      onClick={() => navigate("/")}
    >
      Back to Shopping
    </button>
  </div>
);
}
