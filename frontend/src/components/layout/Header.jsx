import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { 
  Search, 
  ShoppingCart, 
  User, 
  Menu, 
  X, 
  Heart,
  LogOut,
  Package,
  Settings,
  BarChart3
} from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { user, logout, isAdmin } = useAuth();
  const { cartItems, cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we're on admin pages
  const isAdminPage = location.pathname.startsWith('/admin') || location.pathname === '/dashboard';

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/products', label: 'Collections' },
    { path: '/products?category=rings', label: 'Rings' },
    { path: '/products?category=necklaces', label: 'Necklaces' },
    { path: '/products?category=earrings', label: 'Earrings' },
    { path: '/products?category=bracelets', label: 'Bracelets' },
  ];

  // Admin-specific navigation
  const adminNavLinks = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/admin/products', label: 'Products' },
    { path: '/admin/orders', label: 'Orders' },
    { path: '/admin/customers', label: 'Customers' },
    { path: '/', label: 'Back to Store' },
  ];

  const currentNavLinks = isAdminPage && isAdmin ? adminNavLinks : navLinks;

  const isActiveLink = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-[#D0B49F]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          
          {/* Logo */}
          <Link 
            to={isAdminPage ? "/dashboard" : "/"} 
            className="flex items-center space-x-2 text-[#523A28] hover:text-[#A47551] transition-colors duration-300"
          >
            
            <span className="text-xl lg:text-3xl font-bold tracking-wide">
              {isAdminPage ? 'Admin Panel' : 'SváRIN  '}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {currentNavLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-3 py-2 text-sm font-medium transition-all duration-300 hover:text-[#A47551] ${
                  isActiveLink(link.path) 
                    ? 'text-[#A47551]' 
                    : 'text-[#523A28]'
                }`}
              >
                {link.label}
                {isActiveLink(link.path) && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#A47551] transform scale-x-100 transition-transform duration-300" />
                )}
              </Link>
            ))}
          </nav>

          {/* Search Bar - Desktop (Hide on admin pages) */}
          {!isAdminPage && (
            <form onSubmit={handleSearch} className="hidden md:flex items-center relative">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search jewelry..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-10 pr-4 py-2 border border-[#D0B49F] rounded-full bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#A47551] focus:border-transparent transition-all duration-300 text-[#523A28] placeholder-[#A47551]/60"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#A47551]" />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#A47551] hover:bg-[#523A28] text-white rounded-full p-1.5 transition-colors duration-300"
                >
                  <Search className="h-3 w-3" />
                </button>
              </div>
            </form>
          )}

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            
            {/* Admin Dashboard Link (when not on admin page) */}
            {user && isAdmin && !isAdminPage && (
              <Link
                to="/dashboard"
                className="relative p-2 text-[#523A28] hover:text-[#A47551] transition-colors duration-300 hover:bg-[#E4D4C8] rounded-full"
                title="Admin Dashboard"
              >
                <BarChart3 className="h-5 w-5" />
              </Link>
            )}

            {/* Wishlist (Hide on admin pages) */}
            {user && !isAdminPage && (
              <Link
                to="/wishlist"
                className="relative p-2 text-[#523A28] hover:text-[#A47551] transition-colors duration-300 hover:bg-[#E4D4C8] rounded-full"
              >
                <Heart className="h-5 w-5" />
              </Link>
            )}

            {/* Cart (Hide on admin pages) */}
            {!isAdminPage && (
              <Link
                to="/cart"
                className="relative p-2 text-[#523A28] hover:text-[#A47551] transition-colors duration-300 hover:bg-[#E4D4C8] rounded-full"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#A47551] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
            )}

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-1 text-[#523A28] hover:text-[#A47551] transition-colors duration-300 hover:bg-[#E4D4C8] rounded-full"
                >
                  {/* User Profile Picture */}
                  <div className="w-8 h-8 bg-[#A47551] rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {user.firstName?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="hidden md:block text-sm font-medium">
                    {user.firstName}
                  </span>
                </button>

                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-[#D0B49F]/20 py-2 z-50">
                    <div className="px-4 py-2 border-b border-[#D0B49F]/20">
                      <p className="text-sm font-medium text-[#523A28]">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-[#A47551]">{user.email}</p>
                      {isAdmin && <span className="text-xs text-[#A47551] bg-[#E4D4C8] px-2 py-1 rounded-full mt-1 inline-block">Admin</span>}
                    </div>
                    
                    <Link
                      to="/profile"
                      className="flex items-center space-x-2 px-4 py-2 text-[#523A28] hover:bg-[#E4D4C8] transition-colors duration-200"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                    
                    <Link
                      to="/orders"
                      className="flex items-center space-x-2 px-4 py-2 text-[#523A28] hover:bg-[#E4D4C8] transition-colors duration-200"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Package className="h-4 w-4" />
                      <span>Orders</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/dashboard"
                        className="flex items-center space-x-2 px-4 py-2 text-[#523A28] hover:bg-[#E4D4C8] transition-colors duration-200"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <BarChart3 className="h-4 w-4" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-[#523A28] hover:bg-[#E4D4C8] transition-colors duration-200 border-t border-[#D0B49F]/20 mt-2"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Only show login/register when not logged in
              <div className="hidden md:flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-[#523A28] hover:text-[#A47551] transition-colors duration-300 font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2 bg-[#A47551] hover:bg-[#523A28] text-white rounded-full transition-all duration-300 transform hover:scale-105 font-medium"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-[#523A28] hover:text-[#A47551] transition-colors duration-300"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md border-b border-[#D0B49F]/20 shadow-lg">
            <div className="px-4 py-4 space-y-4">
              
              {/* Mobile Search (Hide on admin pages) */}
              {!isAdminPage && (
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    placeholder="Search jewelry..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-[#D0B49F] rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-[#A47551] focus:border-transparent text-[#523A28] placeholder-[#A47551]/60"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#A47551]" />
                </form>
              )}

              {/* Mobile Navigation */}
              <nav className="space-y-2">
                {currentNavLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block px-4 py-3 text-base font-medium transition-colors duration-300 rounded-lg ${
                      isActiveLink(link.path)
                        ? 'bg-[#E4D4C8] text-[#A47551]'
                        : 'text-[#523A28] hover:bg-[#E4D4C8] hover:text-[#A47551]'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              {/* Mobile Auth Links (Only show when not logged in) */}
              {!user && (
                <div className="flex flex-col space-y-2 pt-4 border-t border-[#D0B49F]/20">
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="px-4 py-3 text-center text-[#523A28] hover:bg-[#E4D4C8] transition-colors duration-300 rounded-lg font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="px-4 py-3 text-center bg-[#A47551] hover:bg-[#523A28] text-white rounded-lg transition-colors duration-300 font-medium"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile Logout for logged-in users */}
              {user && (
                <div className="pt-4 border-t border-[#D0B49F]/20">
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center justify-center space-x-2 w-full px-4 py-3 text-[#523A28] hover:bg-[#E4D4C8] transition-colors duration-300 rounded-lg font-medium"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;