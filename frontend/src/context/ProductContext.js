// jewelry-ecommerce/frontend/src/context/ProductContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import productService from '../services/productService';

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

    // Load products
    const loadProducts = async (page = 1, limit = 10, searchFilters = {}) => {
        setLoading(true);
        setError('');

        try {
            const result = await productService.getAdminProducts(page, limit, searchFilters);
            
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

    // Search products
    const searchProducts = async (searchTerm) => {
        const searchFilters = { ...filters, search: searchTerm };
        await loadProducts(1, 10, searchFilters);
    };

    // Filter products
    const filterProducts = async (filterData) => {
        updateFilters(filterData);
        await loadProducts(1, 10, { ...filters, ...filterData });
    };

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
        setCurrentPage
    };

    return (
        <ProductContext.Provider value={value}>
            {children}
        </ProductContext.Provider>
    );
};