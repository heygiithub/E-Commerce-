import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../../api/axios";

export default function AddProductImages() {
  const { product_id } = useParams();
  const [images, setImages] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const navigate = useNavigate();

  const fetchImages = async () => {
    try {
      const res = await api.get(`/product-images/?product=${product_id}`);
      setImages(res.data);
    } catch (error) {
      console.log("Fetch images error:", error.response?.data || error);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleImageUpload = async () => {
    if (!selectedFile) {
      alert("Please select an image first");
      return;
    }

    const formData = new FormData();
    formData.append("product", product_id);
    formData.append("image", selectedFile);

    try {
      await api.post("/product-images/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      fetchImages();
      setSelectedFile(null); 
      // Remove navigating away → allow multiple uploads
      // navigate("/vendor/products");

    } catch (error) {
      console.log("Upload error:", error.response?.data || error);
    }
  };

  const deleteImage = async (imgId) => {
    try {
      await api.delete(`/product-images/${imgId}/`);
      fetchImages();
    } catch (error) {
      console.log(error);
    }
  };

  const markAsPrimary = async (imgId) => {
    try {
      await api.patch(`/product-images/${imgId}/`, {
        is_primary: true,
      });
      fetchImages();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Upload Product Images</h2>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setSelectedFile(e.target.files[0])}
        style={{ marginBottom: "10px" }}
      />
      <button onClick={handleImageUpload}>Upload Image</button>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "15px", marginTop: "20px" }}>
        {images.map((img) => (
          <div
            key={img.id}
            style={{
              border: img.is_primary ? "3px solid green" : "1px solid #ccc",
              padding: "5px",
              width: "150px",
              textAlign: "center",
            }}
          >
            <img
              src={img.image}
              alt="Product"
              width="140"
              height="140"
              style={{ objectFit: "cover", borderRadius: "8px" }}
            />
            <div style={{ marginTop: "8px" }}>
              {!img.is_primary && (
                <button onClick={() => markAsPrimary(img.id)} style={{ marginRight: "5px" }}>
                  Primary
                </button>
              )}
              <button onClick={() => deleteImage(img.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      <button
        style={{ marginTop: "20px" }}
        onClick={() => navigate("/vendor/products")}
      >
        Done
      </button>
    </div>
  );
}
