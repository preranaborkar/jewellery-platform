// jewelry-ecommerce/frontend/src/context/ProductContext.js
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import productService from '../services/productService';
import debounce from 'lodash.debounce';

const ProductContext = createContext();

export const useProductContext = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProductContext must be used within a ProductProvider');
  }
  return context;
};

export const ProductProvider = ({ children }) => {
  // State for products
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // Filters
  const [filters, setFilters] = useState({
    category: '',
    metalType: '',
    minPrice: '',
    maxPrice: '',
    search: ''
  });

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Load categories
  const loadCategories = async () => {
    try {
      const result = await productService.getCategories();
      if (result.success) {
        setCategories(result.data);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
      // Don't set error for categories as it's not critical
    }
  };

  // Create product
  const createProduct = async (productData) => {
    setCreating(true);
    setError('');
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const result = await productService.createProduct(productData);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.success) {
        // Add new product to the beginning of the list
        setProducts(prev => [result.data, ...prev]);

        // Show success message briefly
        setTimeout(() => {
          setUploadProgress(0);
        }, 2000);

        return result;
      }
    } catch (err) {
      console.error('Product creation error:', err);
      const errorMessage = productService.getErrorMessage(err.status, err.data);
      setError(errorMessage);
      setUploadProgress(0);
      throw err;
    } finally {
      setCreating(false);
    }
  };

  // Load products - Updated to properly handle filters
  const loadProducts = async (page = 1, limit = 10, searchFilters = {}) => {
    setLoading(true);
    setError('');

    try {
      // Merge current filters with passed filters, removing empty values
      const mergedFilters = { ...filters, ...searchFilters };

      // Clean up filters - remove empty strings and undefined values
      const cleanFilters = Object.entries(mergedFilters).reduce((acc, [key, value]) => {
        if (value && value !== '' && value !== undefined && value !== null) {
          acc[key] = value;
        }
        return acc;
      }, {});

      console.log('Sending filters to backend:', cleanFilters); // Debug log

      const result = await productService.getAdminProducts(page, limit, cleanFilters);

      if (result.success) {
        setProducts(result.data.products || result.data);
        setCurrentPage(result.data.currentPage || page);
        setTotalPages(result.data.totalPages || 1);
        setTotalProducts(result.data.totalProducts || 0);
      }
    } catch (err) {
      console.error('Error loading products:', err);
      const errorMessage = productService.getErrorMessage(err.status, err.data);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Update searchProducts method
  const searchProducts = async (searchTerm) => {
    const searchFilters = { ...filters, search: searchTerm };
    await loadProducts(1, 10, searchFilters);
  };

  // Update filterProducts method
  const filterProducts = async (filterData) => {
    // Don't update context filters here, let the component manage them
    const combinedFilters = { ...filters, ...filterData };
    await loadProducts(1, 10, combinedFilters);
  };

  // Update product
  const updateProduct = async (productId, productData) => {
    setUpdating(true);
    setError('');

    try {
      const result = await productService.updateProduct(productId, productData);

      if (result.success) {
        // Update product in the list
        setProducts(prev =>
          prev.map(product =>
            product._id === productId ? result.data : product
          )
        );
        return result;
      }
    } catch (err) {
      console.error('Product update error:', err);
      const errorMessage = productService.getErrorMessage(err.status, err.data);
      setError(errorMessage);
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  // Delete product
  const deleteProduct = async (productId) => {
    setDeleting(true);
    setError('');

    try {
      const result = await productService.deleteProduct(productId);

      if (result.success) {
        // Remove product from the list
        setProducts(prev => prev.filter(product => product._id !== productId));
        return result;
      }
    } catch (err) {
      console.error('Product deletion error:', err);
      const errorMessage = productService.getErrorMessage(err.status, err.data);
      setError(errorMessage);
      throw err;
    } finally {
      setDeleting(false);
    }
  };

  // Update filters
  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      category: '',
      metalType: '',
      minPrice: '',
      maxPrice: '',
      search: ''
    });
  };

  // Clear error
  const clearError = () => {
    setError('');
  };

  // Get product by ID
  const getProductById = (productId) => {
    return products.find(product => product._id === productId);
  };




  // Add these methods to your existing ProductProvider component

  const getProduct = useCallback(async (productId) => {
    setLoading(true);
    setError('');

    try {
      const result = await productService.getProductById(productId);

      if (result.success) {
        return result.data;
      }
    } catch (err) {
      console.error('Error loading product:', err);
      const errorMessage = productService.getErrorMessage(err.status, err.data);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);


  // Toggle product status
  const toggleProductStatus = async (productId, status) => {
    setUpdating(true);
    setError('');

    try {
      const result = await productService.toggleProductStatus(productId, status);

      if (result.success) {
        // Update product in the list
        setProducts(prev =>
          prev.map(product =>
            product._id === productId
              ? { ...product, status: result.data.status }
              : product
          )
        );
        return result;
      }
    } catch (err) {
      console.error('Status toggle error:', err);
      const errorMessage = productService.getErrorMessage(err.status, err.data);
      setError(errorMessage);
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  // Update product stock
  const updateProductStock = async (productId, stock) => {
    setUpdating(true);
    setError('');

    try {
      const result = await productService.updateStock(productId, stock);

      if (result.success) {
        // Update product in the list
        setProducts(prev =>
          prev.map(product =>
            product._id === productId
              ? { ...product, stock: result.data.stock }
              : product
          )
        );
        return result;
      }
    } catch (err) {
      console.error('Stock update error:', err);
      const errorMessage = productService.getErrorMessage(err.status, err.data);
      setError(errorMessage);
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  // Get product statistics
  const getProductStats = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await productService.getProductStats();

      if (result.success) {
        return result.data;
      }
    } catch (err) {
      console.error('Error loading product stats:', err);
      const errorMessage = productService.getErrorMessage(err.status, err.data);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Enhanced search with debouncing
  const debouncedSearch = useMemo(() => {
    return debounce(async (searchTerm) => {
      const searchFilters = { ...filters, search: searchTerm };
      await loadProducts(1, 10, searchFilters);
    }, 500);
  }, [filters]);



  const value = {
    // State
    products,
    categories,
    loading,
    creating,
    updating,
    deleting,
    error,
    uploadProgress,
    currentPage,
    totalPages,
    totalProducts,
    filters,

    // Actions
    createProduct,
    loadProducts,
    updateProduct,
    deleteProduct,
    loadCategories,
    updateFilters,
    clearFilters,
    clearError,
    getProductById,
    searchProducts,
    filterProducts,

    // Pagination
    setCurrentPage,


    getProduct,

    toggleProductStatus,
    updateProductStock,
    getProductStats,
    debouncedSearch
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};