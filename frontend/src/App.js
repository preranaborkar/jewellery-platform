// jewelry-ecommerce/frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { GlobalProvider } from './context/GlobalContext';
import { ProductProvider } from './context/ProductContext';
import Layout from './pages/layout/Layout';
import About from './pages/About'; 
// User Pages
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import VerifyOTP from './pages/VerifyOTP';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import GoogleAuthSuccess from './pages/GoogleAuthSuccess';
import CreateProductPage from './pages/admin/CreateProduct';
import ViewProductPage from './pages/admin/ViewAllProducts';
import UpdateProductPage from './pages/admin/UpdateProductPage';
import Orders from './pages/admin/Orders';

// Styles
import './styles/globals.css';


function App() {
  return (
    <div className="App">
      <GlobalProvider>
        <AuthProvider>
          <ProductProvider>
            <CartProvider>
              <Router>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/admindashboard" element={<AdminDashboard />} />
                    <Route path="/verify-otp" element={<VerifyOTP />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/auth/google/success" element={<GoogleAuthSuccess />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/create-product" element={<CreateProductPage/>}/>
                    <Route path="/view-all-products" element={<ViewProductPage/>}/>
                    <Route path="/edit-product/:productId" element={<UpdateProductPage />} />
                    {/* <Route path="/get-orders" element={<Orders/>}></Route> */}
                    <Route path="/about" element={<About/>}></Route>
                  </Routes>
                </Layout>
              </Router>
            </CartProvider>
          </ProductProvider>
        </AuthProvider>
      </GlobalProvider>
    </div>
  );
}

export default App;