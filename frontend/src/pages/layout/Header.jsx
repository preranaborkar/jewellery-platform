import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../hooks/useCart';
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
import { useGetProfileData } from '../../hooks/useAuth';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  const { user, logout, isAdmin } = useAuth();
  const { cartItems, cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const {profileData}=useGetProfileData();

  // Updated admin page detection - include all your admin routes
  const adminRoutes = [
    '/admindashboard',
    '/dashboard', 
    '/create-product',
    '/view-all-products',
    '/edit-product',
    '/admin/orders',
    '/admin/customers',
    '/get-orders'
  ];
  
  const isAdminPage = adminRoutes.some(route => 
    location.pathname === route || location.pathname.startsWith(route)
  );

  // Debounced search with 4 second delay
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    const debounceTimer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/products/search?q=${encodeURIComponent(searchQuery.trim())}&limit=5`);
        const data = await response.json();
        
        if (data.success) {
          setSearchResults(data.data.products);
          setShowSearchResults(true);
        }
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 4000); // 4 second delay

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search-results?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowSearchResults(false);
      setIsMenuOpen(false);
    }
  };

  const handleSearchResultClick = (productId) => {
    navigate(`/product/${productId}`);
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  // Regular user navigation
  const userNavLinks = [
    { path: '/', label: 'Home' },
    { path: '/products-categories', label: 'Collections' },
    { path: '/about', label: 'About' },
  ];

  // Admin navigation - updated with your actual routes
  const adminNavLinks = [
    { path: '/admindashboard', label: 'Dashboard' },
    { path: '/view-all-products', label: 'Products' },
    { path: '/create-product', label: 'Add Product' },
    { path: '/get-orders', label: 'Orders' },
    { path: '/', label: 'Visit Store' }, // Link to go back to user view
  ];

  // Show admin navigation if user is admin AND (on admin page OR user chooses to stay in admin mode)
  const shouldShowAdminNav = user && isAdmin() && isAdminPage;
  const currentNavLinks = shouldShowAdminNav ? adminNavLinks : userNavLinks;

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
            to={shouldShowAdminNav ? "/admindashboard" : "/"} 
            className="flex items-center space-x-2 text-[#523A28] hover:text-[#A47551] transition-colors duration-300"
          >
            <span className="text-xl lg:text-3xl font-bold tracking-wide">
              {shouldShowAdminNav ? 'Admin Panel' : 'SváRIN'}
            </span>
          </Link>

          {/* Desktop Search Bar (Hide on admin pages) */}
          {!shouldShowAdminNav && (
            <div className="hidden lg:flex flex-1 max-w-md mx-8 relative">
              <form onSubmit={handleSearchSubmit} className="w-full relative">
                <input
                  type="text"
                  placeholder="Search jewelry..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-[#D0B49F] rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-[#A47551] focus:border-transparent text-[#523A28] placeholder-[#A47551]/60"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#A47551]" />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#A47551]"></div>
                  </div>
                )}
              </form>

              {/* Search Results Dropdown */}
              {showSearchResults && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-[#D0B49F]/20 max-h-96 overflow-y-auto z-50">
                  {searchResults.length > 0 ? (
                    <>
                      {searchResults.map((product) => (
                        <div
                          key={product._id}
                          onClick={() => handleSearchResultClick(product._id)}
                          className="flex items-center p-3 hover:bg-[#E4D4C8] cursor-pointer border-b border-[#D0B49F]/10 last:border-b-0"
                        >
                          <div className="w-12 h-12 bg-gray-100 rounded-lg mr-3 flex-shrink-0">
                            {product.image && product.image.length > 0 ? (
                              <img
                                src={product.image[0]?.url || product.image[0]}
                                alt={product.name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package size={20} style={{ color: '#A47551' }} />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-[#523A28] line-clamp-1">{product.name}</h4>
                            <p className="text-xs text-[#A47551]">₹{product.price}</p>
                          </div>
                        </div>
                      ))}
                      <div className="p-3 border-t border-[#D0B49F]/20">
                        <button
                          onClick={handleSearchSubmit}
                          className="w-full text-center text-sm text-[#A47551] hover:text-[#523A28] font-medium"
                        >
                          View all results for "{searchQuery}"
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="p-4 text-center text-[#A47551]">
                      <p className="text-sm">No products found for "{searchQuery}"</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

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

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            
            {/* Admin Dashboard Link (when user is admin but not on admin page) */}
            {user && isAdmin() && !shouldShowAdminNav && (
              <Link
                to="/admindashboard"
                className="relative p-2 text-[#523A28] hover:text-[#A47551] transition-colors duration-300 hover:bg-[#E4D4C8] rounded-full"
                title="Admin Dashboard"
              >
                <BarChart3 className="h-5 w-5" />
              </Link>
            )}

            {/* Wishlist (Hide on admin pages) */}
            {user && !shouldShowAdminNav && (
              <Link
                to="/wishlist"
                className="relative p-2 text-[#523A28] hover:text-[#A47551] transition-colors duration-300 hover:bg-[#E4D4C8] rounded-full"
              >
                <Heart className="h-5 w-5" />
              </Link>
            )}

            {/* Cart (Hide on admin pages) */}
            {!shouldShowAdminNav && (
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
                      {profileData.fullName?.charAt(0)?.toUpperCase() || profileData.firstName?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div> 
                  <span className="hidden md:block text-sm font-medium">
                    {profileData.fullName || profileData.firstName}
                  </span>
                </button>

                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-[#D0B49F]/20 py-2 z-50">
                    <div className="px-4 py-2 border-b border-[#D0B49F]/20">
                      <p className="text-sm font-medium text-[#523A28]">
                        {profileData.fullName || `${profileData.firstName} ${profileData.lastName}`}
                      </p>
                      <p className="text-xs text-[#A47551]">{user.email}</p>
                      {isAdmin() && <span className="text-xs text-[#A47551] bg-[#E4D4C8] px-2 py-1 rounded-full mt-1 inline-block">Admin</span>}
                    </div>
                    
                    {!shouldShowAdminNav && (
                      <>
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
                          <span>My Orders</span>
                        </Link>
                      </>
                    )}

                    {isAdmin() && (
                      <Link
                        to={shouldShowAdminNav ? "/" : "/admindashboard"}
                        className="flex items-center space-x-2 px-4 py-2 text-[#523A28] hover:bg-[#E4D4C8] transition-colors duration-200"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <BarChart3 className="h-4 w-4" />
                        <span>{shouldShowAdminNav ? 'Visit Store' : 'Admin Dashboard'}</span>
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
              {!shouldShowAdminNav && (
                <form onSubmit={handleSearchSubmit} className="relative">
                  <input
                    type="text"
                    placeholder="Search jewelry..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-[#D0B49F] rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-[#A47551] focus:border-transparent text-[#523A28] placeholder-[#A47551]/60"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#A47551]" />
                  {isSearching && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#A47551]"></div>
                    </div>
                  )}
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
                  {/* Admin toggle for mobile */}
                  {isAdmin() && (
                    <Link
                      to={shouldShowAdminNav ? "/" : "/admindashboard"}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-center space-x-2 w-full px-4 py-3 text-[#523A28] hover:bg-[#E4D4C8] transition-colors duration-300 rounded-lg font-medium mb-2"
                    >
                      <BarChart3 className="h-4 w-4" />
                      <span>{shouldShowAdminNav ? 'Visit Store' : 'Admin Panel'}</span>
                    </Link>
                  )}
                  
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