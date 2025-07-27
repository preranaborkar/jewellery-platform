import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  AlertCircle,
  CheckCircle,
  X,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Package,
  DollarSign,
  Tag,
  Calendar,
  RefreshCw
} from 'lucide-react';


import { useProductList ,useProduct } from '../../hooks/userProduct';

const ViewAllProducts = () => {


  const { categories}=useProduct();
  const {
    products,
    loading,
    error,
    currentPage,
    totalPages,
    totalProducts,
    loadProducts,
    deleteProduct,
    
    clearError,
    editProduct,
    createNewProduct,
   
  } = useProductList();

  // Local state
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    metalType: '',
    minPrice: '',
    maxPrice: '',
    stockStatus: ''
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

const metalTypes = [
    { value: 'gold', label: 'Gold' },
    { value: 'silver', label: 'Silver' },
    { value: 'platinum', label: 'Platinum' },
    { value: 'diamond', label: 'Diamond' },
    { value: 'other', label: 'Other' }
  ];

  // Handle search
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Debounced search
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      // Pass search term with current filters
      const searchFilters = { ...filters, search: value };
      loadProducts(1, 10, searchFilters); // Pass filters to loadProducts
    }, 500);
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    // Include search term in filters
    const filtersWithSearch = { ...newFilters, search: searchTerm };
    loadProducts(1, 10, filtersWithSearch); // Pass complete filters
  };

  // Clear all filters
  const clearAllFilters = () => {
    const emptyFilters = {
      category: '',
      metalType: '',
      minPrice: '',
      maxPrice: '',
      stockStatus: '',
      search: '' 
    };
    setFilters(emptyFilters);
    setSearchTerm('');
    loadProducts(1, 10, emptyFilters); // Pass empty filters
  };

  // Initial load with current filters
  useEffect(() => {
    const initialFilters = { ...filters, search: searchTerm };
    loadProducts(1, 10, initialFilters);
  }, []); // Only run on mount

  // Update the pagination buttons to maintain filters
  const handlePageChange = (page) => {
    const currentFilters = { ...filters, search: searchTerm };
    loadProducts(page, 10, currentFilters);
  };

  // Update the refresh button
  const handleRefresh = () => {
    const currentFilters = { ...filters, search: searchTerm };
    loadProducts(currentPage, 10, currentFilters);
  };

  // Handle delete product
  const handleDeleteProduct = async (productId) => {
    try {
      await deleteProduct(productId);
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get stock status
  const getStockStatus = (stock) => {
    if (stock === 0) return { text: 'Out of Stock', color: 'text-red-600', bg: 'bg-red-100' };
    if (stock < 10) return { text: 'Low Stock', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { text: 'In Stock', color: 'text-green-600', bg: 'bg-green-100' };
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#E4D4C8' }}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>

              <p style={{ color: '#A47551' }}>
                {totalProducts} products found
              </p>
            </div>
            <button
              onClick={createNewProduct}
              className="px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
              style={{
                backgroundColor: '#523A28',
                color: '#E4D4C8'
              }}
            >
              <Plus size={20} />
              Add New Product
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-lg border border-red-300 bg-red-50 flex items-center gap-3">
            <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
            <p className="text-red-700">{error}</p>
            <button
              onClick={clearError}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-6 p-6 rounded-lg shadow-lg" style={{ backgroundColor: '#D0B49F' }}>
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#A47551' }} size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Search products by name, description, or category..."
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors"
                style={{
                  borderColor: '#A47551',
                  focusRingColor: '#A47551'
                }}
              />
            </div>
          </div>

          {/* Filter Toggle */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors"
              style={{
                borderColor: '#A47551',
                color: '#523A28',
                backgroundColor: showFilters ? '#A47551' : 'transparent'
              }}
            >
              <Filter size={16} />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>

            <div className="flex items-center gap-4">
              {/* View Mode Toggle */}
              <div className="flex border rounded-lg overflow-hidden" style={{ borderColor: '#A47551' }}>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 text-sm transition-colors ${viewMode === 'grid' ? 'text-white' : ''
                    }`}
                  style={{
                    backgroundColor: viewMode === 'grid' ? '#A47551' : 'transparent',
                    color: viewMode === 'grid' ? 'white' : '#523A28'
                  }}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 text-sm transition-colors ${viewMode === 'list' ? 'text-white' : ''
                    }`}
                  style={{
                    backgroundColor: viewMode === 'list' ? '#A47551' : 'transparent',
                    color: viewMode === 'list' ? 'white' : '#523A28'
                  }}
                >
                  List
                </button>
              </div>

              {/* Refresh Button */}
              <button
                onClick={() => loadProducts()}
                disabled={loading}
                className="p-2 rounded-lg border transition-colors disabled:opacity-50"
                style={{ borderColor: '#A47551', color: '#523A28' }}
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t" style={{ borderColor: '#A47551' }}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#523A28' }}>
                    Category
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ borderColor: '#A47551' }}
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Metal Type Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#523A28' }}>
                    Metal Type
                  </label>
                  <select
                    value={filters.metalType}
                    onChange={(e) => handleFilterChange('metalType', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ borderColor: '#A47551' }}
                  >
                    <option value="">All Metals</option>
                    {metalTypes.map((metal) => (
                      <option key={metal.value} value={metal.value}>
                        {metal.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#523A28' }}>
                    Min Price (₹)
                  </label>
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ borderColor: '#A47551' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#523A28' }}>
                    Max Price (₹)
                  </label>
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    placeholder="100000"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ borderColor: '#A47551' }}
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 text-sm rounded-lg border transition-colors"
                  style={{ borderColor: '#A47551', color: '#523A28' }}
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Products Grid/List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-b-transparent" style={{ borderColor: '#523A28' }}></div>
            <span className="ml-3" style={{ color: '#523A28' }}>Loading products...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <Package size={48} className="mx-auto mb-4" style={{ color: '#A47551' }} />
            <h3 className="text-xl font-medium mb-2" style={{ color: '#523A28' }}>
              No products found
            </h3>
            <p className="mb-4" style={{ color: '#A47551' }}>
              {searchTerm || Object.values(filters).some(f => f)
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first product'
              }
            </p>
            <button
              onClick={createNewProduct}
              className="px-6 py-3 rounded-lg font-medium transition-colors"
              style={{
                backgroundColor: '#523A28',
                color: '#E4D4C8'
              }}
            >
              Create Product
            </button>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => {
                  const stockStatus = getStockStatus(product.stock);
                  return (
                    <div key={product._id} className="rounded-lg shadow-lg overflow-hidden" style={{ backgroundColor: '#D0B49F' }}>
                      {/* Product Image */}
                      <div className="relative h-48 bg-gray-200 overflow-hidden">
                        {product.image && product.image.length > 0 ? (
                          <img
                            src={product.image?.[0]?.url || product.image?.[0] || product.image || '/placeholder-image.jpg'}
                            alt={product.name}
                            className="w-full h-full object-contain bg-white"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package size={32} style={{ color: '#A47551' }} />
                          </div>
                        )}

                        {/* Stock Status Badge */}
                        <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${stockStatus.bg} ${stockStatus.color}`}>
                          {stockStatus.text}
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="p-4">
                        <h3 className="font-semibold mb-2 line-clamp-2" style={{ color: '#523A28' }}>
                          {product.name}
                        </h3>

                        <p className="text-sm mb-3 line-clamp-2" style={{ color: '#A47551' }}>
                          {product.shortDescription}
                        </p>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold" style={{ color: '#523A28' }}>
                              {formatCurrency(product.price)}
                            </span>
                            <span className="text-sm" style={{ color: '#A47551' }}>
                              Stock: {product.stock}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-sm" style={{ color: '#A47551' }}>
                            <Tag size={14} />
                            <span>{product.category?.name || 'Uncategorized'}</span>
                            <span>•</span>
                            <span className="capitalize">{product.metalType}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <button onClick={() => editProduct(product._id)}
                            className="flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-colors flex items-center justify-center gap-1"
                            style={{
                              borderColor: '#A47551',
                              color: '#523A28'
                            }}
                          >
                            <Edit size={14} />
                            Edit
                          </button>

                          <button
                            onClick={() => setShowDeleteConfirm(product._id)}
                            className="px-3 py-2 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // List View
              <div className="rounded-lg shadow-lg overflow-hidden" style={{ backgroundColor: '#D0B49F' }}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b" style={{ borderColor: '#A47551' }}>
                        <th className="p-4 text-left font-medium" style={{ color: '#523A28' }}>Product</th>
                        <th className="p-4 text-left font-medium" style={{ color: '#523A28' }}>Category</th>
                        <th className="p-4 text-left font-medium" style={{ color: '#523A28' }}>Price</th>
                        <th className="p-4 text-left font-medium" style={{ color: '#523A28' }}>Stock</th>
                        <th className="p-4 text-left font-medium" style={{ color: '#523A28' }}>Status</th>
                        <th className="p-4 text-left font-medium" style={{ color: '#523A28' }}>Created</th>
                        <th className="p-4 text-center font-medium" style={{ color: '#523A28' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => {
                        const stockStatus = getStockStatus(product.stock);
                        return (
                          <tr key={product._id} className="border-b hover:bg-opacity-50" style={{ borderColor: '#A47551' }}>
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg bg-gray-200 flex-shrink-0">
                                  {product.images && product.images.length > 0 ? (
                                    <img
                                      src={product.images[0].url || product.images[0]}
                                      alt={product.name}
                                      className="w-full h-full object-cover rounded-lg"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Package size={16} style={{ color: '#A47551' }} />
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <h4 className="font-medium" style={{ color: '#523A28' }}>
                                    {product.name}
                                  </h4>
                                  <p className="text-sm line-clamp-1" style={{ color: '#A47551' }}>
                                    {product.shortDescription}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4" style={{ color: '#523A28' }}>
                              {product.category?.name || 'Uncategorized'}
                            </td>
                            <td className="p-4 font-medium" style={{ color: '#523A28' }}>
                              {formatCurrency(product.price)}
                            </td>
                            <td className="p-4" style={{ color: '#523A28' }}>
                              {product.stock}
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.bg} ${stockStatus.color}`}>
                                {stockStatus.text}
                              </span>
                            </td>
                            <td className="p-4 text-sm" style={{ color: '#A47551' }}>
                              {formatDate(product.createdAt)}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => editProduct(product._id)}
                                  className="p-2 rounded-lg border transition-colors"
                                  style={{ borderColor: '#A47551', color: '#523A28' }}
                                >
                                  <Edit size={14} />
                                </button>
                                <button
                                  onClick={() => setShowDeleteConfirm(product._id)}
                                  className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-4">
                <button
                  onClick={() => loadProducts(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  style={{ borderColor: '#A47551', color: '#523A28' }}
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => loadProducts(page)}
                        className={`px-3 py-2 rounded-lg transition-colors ${currentPage === page ? 'text-white' : ''
                          }`}
                        style={{
                          backgroundColor: currentPage === page ? '#523A28' : 'transparent',
                          color: currentPage === page ? 'white' : '#523A28',
                          border: `1px solid #A47551`
                        }}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => loadProducts(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  style={{ borderColor: '#A47551', color: '#523A28' }}
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-mx-4">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="text-red-500" size={24} />
                <h3 className="text-lg font-semibold" style={{ color: '#523A28' }}>
                  Confirm Delete
                </h3>
              </div>

              <p className="mb-6" style={{ color: '#A47551' }}>
                Are you sure you want to delete this product? This action cannot be undone.
              </p>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 rounded-lg border transition-colors"
                  style={{ borderColor: '#A47551', color: '#523A28' }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteProduct(showDeleteConfirm)}
                  className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewAllProducts;