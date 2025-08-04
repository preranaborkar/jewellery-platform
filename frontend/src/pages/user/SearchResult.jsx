import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, SlidersHorizontal } from 'lucide-react';
import ProductCard from './ProductCard'; // Your existing ProductCard component

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    sort: '-createdAt',
    category: '',
    metalType: '',
    minPrice: '',
    maxPrice: '',
    minRating: '',
    inStock: false
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Get search query from URL params
  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchQuery(query);
      fetchSearchResults(query, currentPage, filters);
    } else {
      navigate('/');
    }
  }, [searchParams, currentPage, filters]);

  const fetchSearchResults = async (query, page = 1, filterOptions = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: query,
        page: page.toString(),
        limit: '12',
        ...filterOptions
      });

      // Remove empty filter values
      Object.keys(filterOptions).forEach(key => {
        if (!filterOptions[key] || filterOptions[key] === '') {
          params.delete(key);
        }
      });

      const response = await fetch(`/api/products/search?${params}`);
      const data = await response.json();

      if (data.success) {
        setProducts(data.data.products);
        setPagination(data.data.pagination);
      } else {
        setProducts([]);
        setPagination({});
      }
    } catch (error) {
      console.error('Search error:', error);
      setProducts([]);
      setPagination({});
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterName, value) => {
    const newFilters = { ...filters, [filterName]: value };
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    const defaultFilters = {
      sort: '-createdAt',
      category: '',
      metalType: '',
      minPrice: '',
      maxPrice: '',
      minRating: '',
      inStock: false
    };
    setFilters(defaultFilters);
    setCurrentPage(1);
  };

  if (!searchQuery) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E4D4C8] to-[#D0B49F] pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-[#523A28] hover:text-[#A47551] transition-colors duration-300 mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </button>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-[#523A28] mb-2">
                Search Results
              </h1>
              <p className="text-[#A47551]">
                {loading ? 'Searching...' : (
                  pagination.totalProducts > 0 
                    ? `Found ${pagination.totalProducts} result${pagination.totalProducts !== 1 ? 's' : ''} for "${searchQuery}"`
                    : `No products found for "${searchQuery}"`
                )}
              </p>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 bg-white text-[#523A28] rounded-lg border border-[#D0B49F] hover:bg-[#E4D4C8] transition-colors duration-300 lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Filters Sidebar */}
          <div className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[#523A28]">Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-[#A47551] hover:text-[#523A28] transition-colors duration-300"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-4">
               
                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-[#523A28] mb-2">Price Range</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      className="w-1/2 p-2 border border-[#D0B49F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A47551]"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      className="w-1/2 p-2 border border-[#D0B49F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A47551]"
                    />
                  </div>
                </div>

                {/* Metal Type */}
                <div>
                  <label className="block text-sm font-medium text-[#523A28] mb-2">Metal Type</label>
                  <select
                    value={filters.metalType}
                    onChange={(e) => handleFilterChange('metalType', e.target.value)}
                    className="w-full p-2 border border-[#D0B49F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A47551]"
                  >
                    <option value="">All Metals</option>
                    <option value="gold">Gold</option>
                    <option value="silver">Silver</option>
                    <option value="platinum">Platinum</option>
                    <option value="diamond">Diamond</option>
                  </select>
                </div>

                {/* Minimum Rating */}
                <div>
                  <label className="block text-sm font-medium text-[#523A28] mb-2">Minimum Rating</label>
                  <select
                    value={filters.minRating}
                    onChange={(e) => handleFilterChange('minRating', e.target.value)}
                    className="w-full p-2 border border-[#D0B49F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A47551]"
                  >
                    <option value="">Any Rating</option>
                    <option value="1">1+ Stars</option>
                    <option value="2">2+ Stars</option>
                    <option value="3">3+ Stars</option>
                    <option value="4">4+ Stars</option>
                    <option value="5">5 Stars</option>
                  </select>
                </div>

                {/* In Stock */}
                <div>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.inStock}
                      onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                      className="rounded border-[#D0B49F] text-[#A47551] focus:ring-[#A47551]"
                    />
                    <span className="text-sm text-[#523A28]">In Stock Only</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Results Content */}
          <div className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A47551]"></div>
              </div>
            ) : products.length > 0 ? (
              <>
                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                  {products.map((product) => (
                    <ProductCard 
                      key={product._id} 
                      product={product} 
                      isCompact={false}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={!pagination.hasPrevPage}
                      className="px-4 py-2 text-[#523A28] bg-white border border-[#D0B49F] rounded-lg hover:bg-[#E4D4C8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
                    >
                      Previous
                    </button>

                    {/* Page Numbers */}
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => {
                      // Show only a few pages around current page
                      if (
                        page === 1 ||
                        page === pagination.totalPages ||
                        (page >= currentPage - 2 && page <= currentPage + 2)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-4 py-2 rounded-lg transition-colors duration-300 ${
                              page === currentPage
                                ? 'bg-[#A47551] text-white'
                                : 'text-[#523A28] bg-white border border-[#D0B49F] hover:bg-[#E4D4C8]'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (
                        page === currentPage - 3 ||
                        page === currentPage + 3
                      ) {
                        return (
                          <span key={page} className="px-2 text-[#A47551]">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={!pagination.hasNextPage}
                      className="px-4 py-2 text-[#523A28] bg-white border border-[#D0B49F] rounded-lg hover:bg-[#E4D4C8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 bg-[#E4D4C8] rounded-full flex items-center justify-center">
                  <Search className="h-12 w-12 text-[#A47551]" />
                </div>
                <h3 className="text-xl font-semibold text-[#523A28] mb-2">
                  No Products Found
                </h3>
                <p className="text-[#A47551] mb-6">
                  We couldn't find any products matching "{searchQuery}". Try adjusting your search or filters.
                </p>
                <div className="space-y-3">
                  <button
                    onClick={clearFilters}
                    className="block mx-auto px-6 py-2 bg-[#A47551] text-white rounded-lg hover:bg-[#523A28] transition-colors duration-300"
                  >
                    Clear Filters
                  </button>
                  <button
                    onClick={() => navigate('/products-categories')}
                    className="block mx-auto px-6 py-2 text-[#523A28] border border-[#D0B49F] rounded-lg hover:bg-[#E4D4C8] transition-colors duration-300"
                  >
                    Browse All Products
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;