import { useAuth } from "../../auth/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../api/axios";


export default function OrderPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
   // handling query parameters 
  const productId = new URLSearchParams(location.search).get("product");
  
  const [product, setProduct] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Redirect to login if not logged in
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    const loadData = async () => {
      try {
        // load saved address
        const addressResponse = await api.get("customer/addresses/")
        if (addressResponse.data.length===0) {
          navigate("/address");
          return;
        }
        setAddress(addressResponse.data[0]);

        // order now 
        if (productId) {
          const productResponse = await api.get(`products/${productId}/`);
          setProduct(productResponse.data);
          setTotal(productResponse.data.price);
        }
        // cart checkout 
          
        else {
          const cartResponse = await api.get ("customer/cart/");
          setCartItems(cartResponse.data.items);
          setTotal(cartResponse.data.total_price);
        }
      } 
      catch (error) {
        console.error(error);

      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);
    

const handlePlaceOrder = async () => {
  try {
    // order now 
    if (productId) {
      const response = await api.post("customer/orders/", {
        address_id : address.id,
        items:[
          { 
            product_id:product.id,
            quantity:1
          },
        ],
      });
      console.log("Order Placed:",response.data);
      alert("Order placed successfully..");
      navigate("/customer");
    }
    else {
      // cart order 
      await api.post("customer/orders/",{
        address_id:address.id
      });
    }
    alert("Order placed successfully");
    navigate("/customer");
  }
  catch (error) {
    console.error("Order failed:",error);
    console.log(error.response?.data);
    alert("Order Failed.Try Again!!")
  }
};
 
 const handleEditAddress = () => {
  navigate("/address");
 }
 if (loading) 
  return <h3 className="text-center mt-10">Loading...</h3>;

 if (!user) 
    return null; 

return (
  <div className="max-w-4xl mx-auto p-6">
    <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

    {/* ORDER NOW PRODUCT */}
    {productId && product && (
      <div className="bg-white shadow-md p-4 rounded-lg flex items-center gap-4 mb-4">
        <img
          src={product.images?.[0]?.image}
          alt={product.name}
          className="w-20 h-20 object-cover rounded"
        />
        <div>
          <h3 className="text-lg font-semibold">{product.name}</h3>
          <p>Qty: 1</p>
          <p className="font-semibold">₹{product.price}</p>
        </div>
      </div>
    )}

    {/* CART PRODUCTS CHECKOUT */}
    {!productId && cartItems.length > 0 && (
      <div className="space-y-3">
        {cartItems.map((item) => (
          <div
            key={item.id}
            className="bg-white shadow-md p-4 rounded-lg flex justify-between items-center"
          >
            <div className="flex gap-3 items-center">
              <img
                src={item.product?.images?.[0]?.image}
                alt={item.product.name}
                className="w-20 h-20 object-cover rounded"
              />
              <div>
                <h3 className="font-semibold text-lg">{item.product.name}</h3>
                <p>Qty: {item.quantity}</p>
                <p className="font-semibold">₹{item.product.price}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}

    {/* TOTAL */}
    <div className="bg-gray-100 p-4 rounded-lg mt-4 shadow-inner">
      <h3 className="text-xl font-semibold">Total: ₹{total}</h3>
    </div>

    {/* ADDRESS */}
    <div className="mt-6">
      <h2 className="text-lg font-semibold mb-2">Delivery Address</h2>

      {address && (
        <div className="bg-white shadow-md p-4 rounded-lg text-gray-700">
          {address.line}, {address.city}, {address.state} - {address.pincode}
        </div>
      )}

      <button
        className="mt-3 text-blue-600 hover:underline"
        onClick={() => navigate("/address")}
      >
        Edit Address
      </button>
    </div>

    {/* PLACE ORDER BTN */}
    <button
      onClick={handlePlaceOrder}
      className="bg-green-600 hover:bg-green-700 text-white w-full py-3 mt-6 rounded-lg font-semibold"
    >
      Place Order
    </button>
  </div>

  );
}