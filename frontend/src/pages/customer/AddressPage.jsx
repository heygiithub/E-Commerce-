import { useAuth } from "../../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../../api/axios";

export default function AddressPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [line, setLine] = useState("");
  const [city, setCity] = useState("");
  const [state, setStateLocal] = useState("");
  const [pincode, setPincode] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchAddress = async () => {
      try {
        const res = await api.get("customer/addresses/");
        if (res.data.length > 0) {
          const address = res.data[0];
          setLine(address.line);
          setCity(address.city);
          setStateLocal(address.state);
          setPincode(address.pincode);
        }
      } catch (err) {
        console.log("Failed to load address:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAddress();
  }, [user]);

  const handleSaveAddress = async () => {
    if (!line || !city || !state || !pincode) {
      alert("All fields required!");
      return;
    }

    try {
      await api.post("customer/addresses/", {
        line,
        city,
        state,
        pincode,
        is_default: true,
      });

      alert("Address saved successfully!");
      navigate("/order");
    } catch (err) {
      console.log("Save failed:", err);
      alert("Unable to save address");
    }
  };

  if (loading) return <h2 className="text-center mt-10">Loading...</h2>;

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md mt-10">
      <h2 className="text-xl font-bold mb-5 text-center">Delivery Address</h2>

      <div className="space-y-4">
        <div>
          <label className="font-semibold text-sm">Address Line</label>
          <input
            value={line}
            onChange={(e) => setLine(e.target.value)}
            placeholder="House No, Road, Area"
            className="w-full p-2 border rounded mt-1"
            required
          />
        </div>

        <div>
          <label className="font-semibold text-sm">City</label>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city"
            className="w-full p-2 border rounded mt-1"
            required
          />
        </div>

        <div>
          <label className="font-semibold text-sm">State</label>
          <input
            value={state}
            onChange={(e) => setStateLocal(e.target.value)}
            placeholder="Enter state"
            className="w-full p-2 border rounded mt-1"
            required
          />
        </div>

        <div>
          <label className="font-semibold text-sm">Pincode</label>
          <input
            type="number"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            placeholder="Enter pincode"
            className="w-full p-2 border rounded mt-1"
            required
          />
        </div>

        <button
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          onClick={handleSaveAddress}
        >
          Save Address & Continue
        </button>

        <button
          className="w-full bg-gray-600 text-white py-2 rounded hover:bg-gray-700"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
      </div>
    </div>
  );
}
