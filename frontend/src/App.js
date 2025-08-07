// jewelry-ecommerce/frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './hooks/useCart';
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
import ProductsByCategory from './pages/user/ProductsByCategory';
import Orders from './pages/admin/Orders';
import NotFound from './pages/layout/NotFound';
import ProtectedRoute from './pages/layout/ProtectedRoute';
import Cart from './pages/user/Cart';
import SearchResults from './pages/user/SearchResult';
import ProfilePage from './pages/user/UserProfile';
import WishList from './pages/user/WishList';
import OrderCancelled from './pages/user/OrderCancle';
import OrderSuccess from './pages/user/OrderSuccess';
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
                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/verify-otp" element={<VerifyOTP />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/auth/google/success" element={<GoogleAuthSuccess />} />
                    <Route path="/about" element={<About />} />

                    <Route path="/products-categories" element={<ProductsByCategory />} />

                    {/* Protected Routes - User Must Be Authenticated */}
                    <Route path="/dashboard" element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    } /> 

                    <Route path="/search-results" element={
                      <ProtectedRoute>
                        <SearchResults />
                      </ProtectedRoute>
                    } />

                    <Route path="/cart" element={
                      <ProtectedRoute>
                        <Cart />
                      </ProtectedRoute>
                    } />  

                    <Route path="/wishlist" element={
                      <ProtectedRoute>
                        <WishList />
                      </ProtectedRoute>
                    } />  
                    
                     <Route path="/profile" element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    } /> 

                   

                     <Route path="/order-success" element={
                      <ProtectedRoute>
                        <OrderSuccess />
                      </ProtectedRoute>
                    } /> 

                    
                     <Route path="/order-cancelled" element={
                      <ProtectedRoute>
                        <OrderCancelled />
                      </ProtectedRoute>
                    } /> 


                    {/* Admin Only Routes */}
                    <Route path="/admindashboard" element={
                      <ProtectedRoute adminOnly={true}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    } />

                    <Route path="/view-all-products" element={
                      <ProtectedRoute adminOnly={true}>
                        <ViewProductPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/create-product" element={
                      <ProtectedRoute adminOnly={true}>
                        <CreateProductPage />
                      </ProtectedRoute>
                    } />

                    <Route path="/edit-product/:productId" element={
                      <ProtectedRoute adminOnly={true}>
                        <UpdateProductPage />
                      </ProtectedRoute>
                    } />

                   
                    <Route path="*" element={<NotFound />} />
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