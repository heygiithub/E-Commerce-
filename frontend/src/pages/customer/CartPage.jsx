import { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function CartPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [cartItems,setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0)

//   load cart from backend
useEffect(()=> {
  if (!user) {
    navigate("/login", { state: { from: "/cart" } });
    return ;
  }
  const fetchCart = async () => {
    try{
        const response = await api.get("customer/cart/");
        setCartItems(response.data.items|| []);
        setTotal(response.data.total_price);
    } catch (error) {
        console.error("Error loading cart:",error);
    }finally{
        setLoading(false);
    }
}; fetchCart();

}, [user]);

// remove items from cart 
  const handleRemove = async (id) => {
    try {
        await api.delete(`customer/cart/${id}/`);
        setCartItems((prev) => prev.filter((item) => item.id !==id));
        
    }catch (error) {
        console.error("failed to remove item:",error);
    }
  };
   
//   go to order  page 

  const handleCheckout = () => {
    navigate("/order");
  };

 if (loading)
    return <h3>Loading Cart...</h3>;

 if (!user) 
    return null; 


  return (
    <div className="max-w-5xl mx-auto p-6">
    <h2 className="text-2xl font-bold mb-6">My Cart</h2>

    {cartItems.length === 0 ? (
      <p className="text-gray-600">Your cart is empty.</p>
    ) : (
      <div className="space-y-4">
        {cartItems.map((item) => (
          <div
            key={item.id}
            className="bg-white shadow-md rounded-lg p-4 flex justify-between items-center"
          >
            <div className="flex items-center gap-4">
              <img
                src={item.product?.images?.[0]?.image}
                alt={item.product?.name}
                className="w-20 h-20 object-cover rounded"
              />

              <div>
                <h3 className="font-semibold text-lg">{item.product?.name}</h3>
                <p className="text-gray-500 text-sm">₹{item.product?.price}</p>
                <p className="text-sm text-gray-700">Qty: {item.quantity}</p>
              </div>
            </div>

            <button
              onClick={() => handleRemove(item.id)}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
            >
              Remove
            </button>
          </div>
        ))}

        <div className="bg-gray-100 p-4 rounded-lg mt-4 shadow-inner flex justify-between items-center">
          <h3 className="text-xl font-semibold">Total: ₹{total}</h3>

          <button
            onClick={() => navigate("/order")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    )}
  </div>
  
  );
}
