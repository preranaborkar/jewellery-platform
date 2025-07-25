import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { GlobalProvider } from './context/GlobalContext';
import Layout from './components/layout/Layout';
// import ProtectedRoute from './components/common/ProtectedRoute';

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
// import ProductDetails from './pages/user/ProductDetails';
// import Cart from './pages/user/Cart';
// import Checkout from './pages/user/Checkout';
// import Orders from './pages/user/Orders';
// import Profile from './pages/user/Profile';
// import Wishlist from './pages/user/Wishlist';

// // Admin Pages
// import AdminDashboard from './pages/admin/Dashboard';
// import AdminProducts from './pages/admin/Products';
// import AdminOrders from './pages/admin/Orders';
// import AdminInventory from './pages/admin/Inventory';
// import AdminCustomers from './pages/admin/Customers';

// Styles
import './styles/globals.css';

function App() {
  return (
    <div className="App">
      <GlobalProvider>
        <AuthProvider>
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
                </Routes>
              </Layout>
            </Router>
          </CartProvider>
        </AuthProvider>
      </GlobalProvider>
    </div>
  );
}

export default App;