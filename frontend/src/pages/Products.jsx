import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { 
  Filter, 
  Grid, 
  List, 
  Heart, 
  ShoppingCart, 
  Star, 
  Eye,
  ChevronDown,
  X,
  Search,
  SlidersHorizontal
} from 'lucide-react';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();
  
  // State management
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);
  const [wishlist, setWishlist] = useState(new Set());

  // Filter states
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    priceRange: searchParams.get('priceRange') || '',
    material: searchParams.get('material') || '',
    brand: searchParams.get('brand') || '',
    rating: searchParams.get('rating') || '',
    search: searchParams.get('search') || ''
  });

  // Mock product data (replace with API call)
  const mockProducts = [
    {
      id: 1,
      name: "Diamond Solitaire Ring",
      price: 45000,
      originalPrice: 50000,
      category: "rings",
      material: "gold",
      brand: "LuxeGems",
      rating: 4.8,
      reviews: 124,
      image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop"
      ],
      description: "Elegant diamond solitaire ring in 18k gold",
      inStock: true,
      featured: true,
      discount: 10
    },
    {
      id: 2,
      name: "Pearl Drop Earrings",
      price: 8500,
      originalPrice: 10000,
      category: "earrings",
      material: "silver",
      brand: "LuxeGems",
      rating: 4.6,
      reviews: 89,
      image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop"
      ],
      description: "Classic pearl drop earrings in sterling silver",
      inStock: true,
      featured: false,
      discount: 15
    },
    {
      id: 3,
      name: "Gold Chain Necklace",
      price: 25000,
      originalPrice: 28000,
      category: "necklaces",
      material: "gold",
      brand: "LuxeGems",
      rating: 4.9,
      reviews: 156,
      image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop"
      ],
      description: "Elegant 22k gold chain necklace",
      inStock: true,
      featured: true,
      discount: 11
    },
    {
      id: 4,
      name: "Diamond Tennis Bracelet",
      price: 35000,
      originalPrice: 40000,
      category: "bracelets",
      material: "platinum",
      brand: "LuxeGems",
      rating: 4.7,
      reviews: 78,
      image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=400&h=400&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=400&h=400&fit=crop"
      ],
      description: "Stunning diamond tennis bracelet in platinum",
      inStock: false,
      featured: true,
      discount: 12
    },
    {
      id: 5,
      name: "Emerald Pendant",
      price: 15000,
      originalPrice: 18000,
      category: "necklaces",
      material: "gold",
      brand: "LuxeGems",
      rating: 4.5,
      reviews: 92,
      image: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&h=400&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&h=400&fit=crop"
      ],
      description: "Beautiful emerald pendant with gold chain",
      inStock: true,
      featured: false,
      discount: 17
    },
    {
      id: 6,
      name: "Silver Cuff Bracelet",
      price: 6500,
      originalPrice: 7500,
      category: "bracelets",
      material: "silver",
      brand: "LuxeGems",
      rating: 4.4,
      reviews: 63,
      image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=400&h=400&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=400&h=400&fit=crop"
      ],
      description: "Modern silver cuff bracelet with geometric design",
      inStock: true,
      featured: false,
      discount: 13
    }
  ];

  // Filter options
  const filterOptions = {
    category: [
      { value: '', label: 'All Categories' },
      { value: 'rings', label: 'Rings' },
      { value: 'necklaces', label: 'Necklaces' },
      { value: 'earrings', label: 'Earrings' },
      { value: 'bracelets', label: 'Bracelets' }
    ],
    material: [
      { value: '', label: 'All Materials' },
      { value: 'gold', label: 'Gold' },
      { value: 'silver', label: 'Silver' },
      { value: 'platinum', label: 'Platinum' }
    ],
    priceRange: [
      { value: '', label: 'All Prices' },
      { value: '0-10000', label: 'Under ₹10,000' },
      { value: '10000-25000', label: '₹10,000 - ₹25,000' },
      { value: '25000-50000', label: '₹25,000 - ₹50,000' },
      { value: '50000+', label: 'Above ₹50,000' }
    ],
    rating: [
      { value: '', label: 'All Ratings' },
      { value: '4+', label: '4+ Stars' },
      { value: '4.5+', label: '4.5+ Stars' }
    ]
  };

  const sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Customer Rating' },
    { value: 'newest', label: 'Newest First' }
  ];

  // Load products
  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setProducts(mockProducts);
      setLoading(false);
    }, 1000);
  }, []);

  // Apply filters and search
  useEffect(() => {
    let filtered = [...products];

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        product.description.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(product => product.category === filters.category);
    }

    // Material filter
    if (filters.material) {
      filtered = filtered.filter(product => product.material === filters.material);
    }

    // Price range filter
    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split('-');
      if (max) {
        filtered = filtered.filter(product => 
          product.price >= parseInt(min) && product.price <= parseInt(max)
        );
      } else if (filters.priceRange.endsWith('+')) {
        const minPrice = parseInt(filters.priceRange.replace('+', ''));
        filtered = filtered.filter(product => product.price >= minPrice);
      }
    }

    // Rating filter
    if (filters.rating) {
      const minRating = parseFloat(filters.rating.replace('+', ''));
      filtered = filtered.filter(product => product.rating >= minRating);
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'featured':
        filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
      default:
        break;
    }

    setFilteredProducts(filtered);
  }, [products, filters, sortBy]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Update URL params
    const newParams = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) newParams.set(k, v);
    });
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      priceRange: '',
      material: '',
      brand: '',
      rating: '',
      search: ''
    });
    setSearchParams({});
  };

  const toggleWishlist = (productId) => {
    const newWishlist = new Set(wishlist);
    if (newWishlist.has(productId)) {
      newWishlist.delete(productId);
    } else {
      newWishlist.add(productId);
    }
    setWishlist(newWishlist);
  };

  const handleAddToCart = (product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E4D4C8] to-[#D0B49F] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A47551] mx-auto mb-4"></div>
          <p className="text-[#523A28] text-lg">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E4D4C8] to-[#D0B49F]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#523A28] mb-4">
            {filters.category ? `${filters.category.charAt(0).toUpperCase() + filters.category.slice(1)}` : 'All Jewelry'}
          </h1>
          <p className="text-[#A47551] mb-6">
            Discover our exquisite collection of handcrafted jewelry
          </p>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-lg">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center space-x-2 bg-[#A47551] text-white px-4 py-2 rounded-full"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filters</span>
            </button>

            {/* Search */}
            <div className="relative w-full lg:w-auto">
              <input
                type="text"
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full lg:w-64 pl-10 pr-4 py-2 border border-[#D0B49F] rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-[#A47551] focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#A47551]" />
            </div>

            {/* View Mode and Sort */}
            <div className="flex items-center space-x-4">
              <div className="flex bg-[#E4D4C8] rounded-full p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-full transition-colors ${
                    viewMode === 'grid' ? 'bg-[#A47551] text-white' : 'text-[#A47551]'
                  }`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-full transition-colors ${
                    viewMode === 'list' ? 'bg-[#A47551] text-white' : 'text-[#A47551]'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-[#D0B49F] rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#A47551] text-[#523A28]"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Desktop Filters */}
          <div className={`mt-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 ${showFilters ? 'block' : 'hidden lg:grid'}`}>
            {Object.entries(filterOptions).map(([key, options]) => (
              <select
                key={key}
                value={filters[key]}
                onChange={(e) => handleFilterChange(key, e.target.value)}
                className="bg-white border border-[#D0B49F] rounded-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#A47551] text-[#523A28]"
              >
                {options.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ))}
            
            <button
              onClick={clearFilters}
              className="bg-[#A47551] hover:bg-[#523A28] text-white px-4 py-2 rounded-full text-sm transition-colors flex items-center justify-center space-x-2"
            >
              <X className="h-4 w-4" />
              <span>Clear</span>
            </button>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-[#A47551]">
            Showing {filteredProducts.length} of {products.length} products
          </div>
        </div>

        {/* Products Grid/List */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-[#A47551] mb-4">No products found matching your criteria</p>
            <button
              onClick={clearFilters}
              className="bg-[#A47551] hover:bg-[#523A28] text-white px-6 py-2 rounded-full transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {filteredProducts.map(product => (
              <div
                key={product.id}
                className={`group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden ${
                  viewMode === 'list' ? 'flex' : ''
                }`}
              >
                <div className={`relative ${viewMode === 'list' ? 'w-64 flex-shrink-0' : 'aspect-square'}`}>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 space-y-2">
                    {product.discount > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                        -{product.discount}%
                      </span>
                    )}
                    {product.featured && (
                      <span className="bg-[#A47551] text-white text-xs px-2 py-1 rounded-full font-semibold">
                        Featured
                      </span>
                    )}
                    {!product.inStock && (
                      <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                        Out of Stock
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="absolute top-3 right-3 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
                        wishlist.has(product.id) 
                          ? 'bg-red-500 text-white' 
                          : 'bg-white/80 text-[#A47551] hover:bg-[#A47551] hover:text-white'
                      }`}
                    >
                      <Heart className="h-4 w-4" fill={wishlist.has(product.id) ? 'currentColor' : 'none'} />
                    </button>
                    <Link
                      to={`/product/${product.id}`}
                      className="p-2 bg-white/80 text-[#A47551] hover:bg-[#A47551] hover:text-white rounded-full backdrop-blur-sm transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                  </div>
                </div>

                <div className={`p-6 ${viewMode === 'list' ? 'flex-1 flex flex-col justify-between' : ''}`}>
                  <div>
                    <h3 className="font-semibold text-[#523A28] mb-2 group-hover:text-[#A47551] transition-colors">
                      <Link to={`/product/${product.id}`}>
                        {product.name}
                      </Link>
                    </h3>
                    
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(product.rating) 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-[#A47551]">
                        {product.rating} ({product.reviews})
                      </span>
                    </div>

                    <p className="text-sm text-[#A47551] mb-4 line-clamp-2">
                      {product.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold text-[#523A28]">
                        ₹{product.price.toLocaleString('en-IN')}
                      </span>
                      {product.originalPrice > product.price && (
                        <span className="text-sm text-gray-500 line-through ml-2">
                          ₹{product.originalPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={!product.inStock}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                        product.inStock
                          ? 'bg-[#A47551] hover:bg-[#523A28] text-white hover:scale-105'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      <span>{product.inStock ? 'Add to Cart' : 'Out of Stock'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;