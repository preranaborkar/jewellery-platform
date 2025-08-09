// hooks/useProductsByCategory.js
import { useState, useEffect, useCallback } from 'react';
import { productService, categoryService } from '../services/productService-user';

export const useProductsByCategory = () => {
  const [categories, setCategories] = useState([]);
  const [productsByCategory, setProductsByCategory] = useState({});
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Fetch all categories
  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true);
    setError(null);
    try {
      const response = await categoryService.getAllCategories();
      setCategories(response.data || response.categories || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching categories:', err);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  // Fetch products for a specific category
 const fetchProductsByCategory = useCallback(async (categoryId, params = {}) => {
  setLoading(true);
  setError(null);
  try {
    const response = await productService.getProductsByCategory(categoryId, params);
    
    setProductsByCategory(prev => ({
      ...prev,
      [categoryId]: {
        products: response.data.products || [], // Direct access
        totalProducts: response.data.pagination.totalProducts || 0,
        currentPage: response.data.pagination.currentPage || 1,
        totalPages: response.data.pagination.totalPages || 1,
        hasMore: response.data.pagination.hasNextPage || false
      }
    }));
    
    return response;
  } catch (err) {
    setError(err.message);
    throw err;
  } finally {
    setLoading(false);
  }
}, []);


// fetch product details by id
  const fetchProductDetails = useCallback(async (productId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await productService.getProductById(productId);
      return response.data || response.product || {};

    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch products for all categories
  const fetchAllCategoriesWithProducts = useCallback(async (limit = 8) => {
    if (categories.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      // In useProductsByCategory.js, fix fetchAllCategoriesWithProducts:
      const promises = categories.map(category =>
        productService.getProductsByCategory(category._id, { limit })
          .then(response => {
            console.log(`Raw response for ${category.name}:`, response);
            return {
              categoryId: category._id,
              categoryName: category.name,
              products: response.data.products || [], // Direct access to nested products
              totalProducts: response.data.pagination.totalProducts || 0
            };
          })
          .catch(err => ({
            categoryId: category._id,
            categoryName: category.name,
            products: [],
            totalProducts: 0,
            error: err.message
          }))
      );

      const results = await Promise.all(promises);

      const categorizedProducts = {};
      results.forEach(result => {
        categorizedProducts[result.categoryId] = {
          products: result.products,
          totalProducts: result.totalProducts,
          categoryName: result.categoryName,
          error: result.error || null
        };
      });

      setProductsByCategory(categorizedProducts);
      console.log('Final categorized products:', categorizedProducts);

    } catch (err) {
      setError(err.message);
      console.error('Error fetching all categories with products:', err);
    } finally {
      setLoading(false);
    }
  }, [categories]);

  // Load more products for a category
  const loadMoreProducts = useCallback(async (categoryId, page = 2, limit = 8) => {
    setLoading(true);
    try {
      const response = await productService.getProductsByCategory(categoryId, { page, limit });

      setProductsByCategory(prev => ({
        ...prev,
        [categoryId]: {
          ...prev[categoryId],
          products: [
            ...(prev[categoryId]?.products || []),
            ...(response.data || response.products || [])
          ],
          currentPage: response.currentPage || response.page || page,
          totalPages: response.totalPages || response.pages || 1,
          hasMore: response.hasMore || false
        }
      }));

      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Search products within a category
  const searchInCategory = useCallback(async (categoryId, searchTerm, params = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await productService.searchProducts(searchTerm, {
        category: categoryId,
        ...params
      });

      setProductsByCategory(prev => ({
        ...prev,
        [categoryId]: {
          ...prev[categoryId],
          products: response.data || response.products || [],
          totalProducts: response.totalProducts || response.total || 0,
          isSearchResult: true,
          searchTerm
        }
      }));

      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear search and reload category products
  const clearCategorySearch = useCallback(async (categoryId) => {
    await fetchProductsByCategory(categoryId);
  }, [fetchProductsByCategory]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Get products for specific category
  const getCategoryProducts = useCallback((categoryId) => {
    return productsByCategory[categoryId] || {
      products: [],
      totalProducts: 0,
      currentPage: 1,
      totalPages: 1,
      hasMore: false
    };
  }, [productsByCategory]);

  // Get category by ID
  const getCategoryById = useCallback((categoryId) => {
    return categories.find(cat => cat._id === categoryId);
  }, [categories]);

  // Initialize - fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    // State
    categories,
    productsByCategory,
    loading,
    categoriesLoading,
    error,
    selectedCategory,

    // Actions
    fetchCategories,
    fetchProductsByCategory,
    fetchProductDetails,
    fetchAllCategoriesWithProducts,
    loadMoreProducts,
    searchInCategory,
    clearCategorySearch,
    clearError,
    setSelectedCategory,

    // Helpers
    getCategoryProducts,
    getCategoryById
  };
};


export default useProductsByCategory;