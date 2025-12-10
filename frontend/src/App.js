import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import PrivateRoute from "./auth/PrivateRoute";

import Login from "./pages/login";
import RegisterCustomer from "./pages/RegisterCustomer";
import RegisterVendor from "./pages/RegisterVendor";
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import HomePage from "./pages/HomePage";
import CartPage from "./pages/customer/CartPage";
import OrderPage from "./pages/customer/OrderPage";
import AddressPage from "./pages/customer/AddressPage";
import Dashboard from "./pages/vendor/Dashboard"; 
import VendorProducts from "./pages/vendor/Products";
import AddProduct from "./pages/vendor/AddProducts";
import EditProduct from "./pages/vendor/EditProduct";
import VendorOrders from "./pages/vendor/Orders";
import AddProductImages from "./pages/vendor/AddProductImages";
import ProductDetail from "./pages/ProductDetail";
import Navbar from "./componants/Navbar";

export default function App() {
  return (
    <BrowserRouter>
      <AuthPr


        <Routes>
        
          <Route path="/login" element={<Login />} />
          <Route path="/register/customer" element={<RegisterCustomer />} />
          <Route path="/register/vendor" element={<RegisterVendor />} />
          <Route path="/" element={<HomePage/>} />
          <Route path="/product/:id" element={<ProductDetail/>}/>
          <Route path="/vendor/products/:product_id/images" element={<AddProductImages/>} />
        

          {/* Protected Routes */}
          <Route path="/customer" element={
            <PrivateRoute role="customer">
              <CustomerDashboard />
            </PrivateRoute>
          }/>

          <Route path="/vendor/dashboard" element={
            <PrivateRoute role="vendor">
              <Dashboard />
            </PrivateRoute>
          }/>

          <Route path="/cart" element={
            <PrivateRoute role="customer">
                <CartPage/>
            </PrivateRoute>
          }/>

          <Route path="/order" element={
            <PrivateRoute role="customer">
              <OrderPage/>
            </PrivateRoute>
          }/>

          <Route path="/order/:id" element={
            <PrivateRoute role="customer">
              <OrderPage/>
            </PrivateRoute>
          }/>

          <Route path="/address" element={
            <PrivateRoute role="customer">
              <AddressPage/>
            </PrivateRoute>
          }/>

          <Route path="/vendor/products" element={
            <PrivateRoute role ="vendor">
              <VendorProducts/>
            </PrivateRoute>
          }
          />

          <Route path="/vendor/products/add" element={
            <PrivateRoute role="vendor">
              <AddProduct/>
            </PrivateRoute>
          }
          />

          <Route path="/vendor/products/:id/edit" element={
            <PrivateRoute role="vendor">
              <EditProduct/>
            </PrivateRoute>
          }
          />

          <Route path="/vendor/orders" element={
            <PrivateRoute role= "vendor">
              <VendorOrders/>
            </PrivateRoute>
          }
          />


        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
