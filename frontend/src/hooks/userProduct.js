// jewelry-ecommerce/frontend/src/hooks/useProduct.js
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductContext } from '../context/ProductContext';

// Main product hook
export const useProduct = () => {
    const context = useProductContext();
    return context;
};

// Product form hook
export const useProductForm = (initialData = null) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        shortDescription: '',
        price: '',
        category: '',
        metalType: '',
        metalPurity: '',
        stock: '',
        images: []
    });

    const [formErrors, setFormErrors] = useState({});
    const [isDirty, setIsDirty] = useState(false);

    // Initialize form with data (for editing)
    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                description: initialData.description || '',
                shortDescription: initialData.shortDescription || '',
                price: initialData.price?.toString() || '',
                category: initialData.category?._id || initialData.category || '',
                metalType: initialData.metalType || '',
                metalPurity: initialData.metalPurity || '',
                stock: initialData.stock?.toString() || '',
                images: initialData.images || []
            });
        }
    }, [initialData]);

    // Update field
    const updateField = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        setIsDirty(true);

        // Clear field error when user starts typing
        if (formErrors[field]) {
            setFormErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    // Update images
    const updateImages = (images) => {
        setFormData(prev => ({
            ...prev,
            images
        }));

        setIsDirty(true);

        // Clear images error
        if (formErrors.images) {
            setFormErrors(prev => ({
                ...prev,
                images: ''
            }));
        }
    };

    // Validate form
    const validateForm = () => {
        const errors = {};

        // Name validation
        if (!formData.name.trim()) {
            errors.name = 'Product name is required';
        } else if (formData.name.length < 3) {
            errors.name = 'Product name must be at least 3 characters';
        } else if (formData.name.length > 200) {
            errors.name = 'Product name must not exceed 200 characters';
        }

        // Short description validation
        if (!formData.shortDescription.trim()) {
            errors.shortDescription = 'Short description is required';
        } else if (formData.shortDescription.length < 10) {
            errors.shortDescription = 'Short description must be at least 10 characters';
        } else if (formData.shortDescription.length > 500) {
            errors.shortDescription = 'Short description must not exceed 500 characters';
        }

        // Description validation
        if (!formData.description.trim()) {
            errors.description = 'Full description is required';
        } else if (formData.description.length < 20) {
            errors.description = 'Full description must be at least 20 characters';
        } else if (formData.description.length > 2000) {
            errors.description = 'Full description must not exceed 2000 characters';
        }

        // Price validation
        if (!formData.price) {
            errors.price = 'Price is required';
        } else {
            const price = parseFloat(formData.price);
            if (isNaN(price) || price <= 0) {
                errors.price = 'Price must be a positive number';
            } else if (price > 1000000) {
                errors.price = 'Price seems too high';
            }
        }

        // Category validation
        if (!formData.category) {
            errors.category = 'Category is required';
        }

        // Metal type validation
        if (!formData.metalType) {
            errors.metalType = 'Metal type is required';
        }

        // Metal purity validation
        if (!formData.metalPurity.trim()) {
            errors.metalPurity = 'Metal purity is required';
        } else if (formData.metalPurity.length > 20) {
            errors.metalPurity = 'Metal purity must not exceed 20 characters';
        }

        // Stock validation
        if (formData.stock === '') {
            errors.stock = 'Stock quantity is required';
        } else {
            const stock = parseInt(formData.stock);
            if (isNaN(stock) || stock < 0) {
                errors.stock = 'Stock must be a non-negative number';
            } else if (stock > 10000) {
                errors.stock = 'Stock quantity seems too high';
            }
        }

        // Images validation
        if (!formData.images || formData.images.length === 0) {
            errors.images = 'At least one product image is required';
        } else if (formData.images.length > 5) {
            errors.images = 'Maximum 5 images allowed';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            shortDescription: '',
            price: '',
            category: '',
            metalType: '',
            metalPurity: '',
            stock: '',
            images: []
        });
        setFormErrors({});
        setIsDirty(false);
    };

    // Get processed form data for submission
    const getSubmissionData = () => {
        return {
            ...formData,
            price: parseFloat(formData.price),
            stock: parseInt(formData.stock)
        };
    };

    return {
        formData,
        formErrors,
        isDirty,
        updateField,
        updateImages,
        validateForm,
        resetForm,
        getSubmissionData
    };
};

// Image upload hook
export const useImageUpload = () => {
    const [previewImages, setPreviewImages] = useState([]);
    const [uploadErrors, setUploadErrors] = useState([]);

    // Handle image selection
    const handleImageSelect = (files) => {
        const validFiles = [];
        const errors = [];

        Array.from(files).forEach((file, index) => {
            // Check file type
            if (!file.type.startsWith('image/')) {
                errors.push(`File ${file.name} is not an image`);
                return;
            }

            // Check file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                errors.push(`File ${file.name} is too large (max 5MB)`);
                return;
            }

            // Check total images limit
            if (previewImages.length + validFiles.length >= 5) {
                errors.push('Maximum 5 images allowed');
                return;
            }

            validFiles.push(file);
        });

        // Create preview URLs for valid files
        const newPreviews = validFiles.map((file, index) => ({
            id: Date.now() + index,
            file,
            url: URL.createObjectURL(file),
            name: file.name
        }));

        setPreviewImages(prev => [...prev, ...newPreviews]);
        setUploadErrors(errors);

        return validFiles;
    };

    // Remove image
    const removeImage = (imageId) => {
        setPreviewImages(prev => {
            const imageToRemove = prev.find(img => img.id === imageId);
            if (imageToRemove && imageToRemove.url) {
                // Clean up object URL to prevent memory leaks
                URL.revokeObjectURL(imageToRemove.url);
            }
            return prev.filter(img => img.id !== imageId);
        });

        // Clear errors if removing images
        if (uploadErrors.length > 0) {
            setUploadErrors([]);
        }
    };

    // Clear all images
    const clearImages = () => {
        // Clean up object URLs
        previewImages.forEach(img => {
            if (img.url) {
                URL.revokeObjectURL(img.url);
            }
        });

        setPreviewImages([]);
        setUploadErrors([]);
    };

    // Clean up on unmount
    useEffect(() => {
        return () => {
            previewImages.forEach(img => {
                if (img.url) {
                    URL.revokeObjectURL(img.url);
                }
            });
        };
    }, []);

    return {
        previewImages,
        uploadErrors,
        handleImageSelect,
        removeImage,
        clearImages
    };
};

// Debounce function
const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
};

// Product filters hook
export const useProductFilters = () => {
    const { loadProducts, filters: contextFilters, updateFilters } = useProductContext();

    const [localFilters, setLocalFilters] = useState({
        category: '',
        metalType: '',
        minPrice: '',
        maxPrice: '',
        stockStatus: '',
        search: ''
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');

    // Debounced search function
    const debouncedSearch = useMemo(
        () => debounce((term) => {
            const newFilters = { ...localFilters, search: term };
            updateFilters(newFilters);
            loadProducts(1, 10, newFilters);
        }, 500),
        [localFilters, updateFilters, loadProducts]
    );

    // Handle search input change
    const handleSearchChange = (value) => {
        setSearchTerm(value);
        debouncedSearch(value);
    };

    // Handle filter change
    const handleFilterChange = (key, value) => {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFilters(newFilters);
        updateFilters(newFilters);
        loadProducts(1, 10, newFilters);
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
        setLocalFilters(emptyFilters);
        setSearchTerm('');
        updateFilters(emptyFilters);
        loadProducts(1, 10, emptyFilters);
    };

    // Handle sorting
    const handleSort = (field) => {
        const newOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortBy(field);
        setSortOrder(newOrder);

        const sortFilters = { ...localFilters, sortBy: field, sortOrder: newOrder };
        loadProducts(1, 10, sortFilters);
    };

    // Check if any filters are active
    const hasActiveFilters = useMemo(() => {
        return Object.values(localFilters).some(value => value !== '');
    }, [localFilters]);

    return {
        localFilters,
        searchTerm,
        sortBy,
        sortOrder,
        hasActiveFilters,
        handleSearchChange,
        handleFilterChange,
        clearAllFilters,
        handleSort
    };
};

// Updated useProductList hook
export const useProductList = () => {
     const {
    products,
    loading,
    error,
    categories,
    metalTypes,
    currentPage,
    totalPages,
    totalProducts,
    loadProducts,
    deleteProduct,
    clearError
  } = useProductContext();

    const [selectedProducts, setSelectedProducts] = useState([]);
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');

    const navigate = useNavigate();

    // Load products on mount with no filters initially
    useEffect(() => {
        loadProducts(1, 10, {});
    }, []);

    // Handle product selection
    const toggleProductSelection = (productId) => {
        setSelectedProducts(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    // Select all products
    const selectAllProducts = () => {
        setSelectedProducts(products.map(product => product._id));
    };

    // Clear selection
    const clearSelection = () => {
        setSelectedProducts([]);
    };

    // Handle sort
    const handleSort = (field) => {
        const newOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortBy(field);
        setSortOrder(newOrder);

        loadProducts(currentPage, 10, { sortBy: field, sortOrder: newOrder });
    };

    const editProduct = (productId) => {
        console.log(`Editing product with ID: ${productId}`);
        navigate(`/edit-product/${productId}`);
    };

    // Navigate to create product
    const createNewProduct = () => {
        navigate('/create-product');
    };

    // Bulk delete products
    const bulkDeleteProducts = async (productIds) => {
        try {
            const promises = productIds.map(id => deleteProduct(id));
            await Promise.all(promises);
            setSelectedProducts([]);
            return { success: true };
        } catch (error) {
            throw error;
        }
    };

    // Add search and filter methods that work with the component
    const searchProducts = (searchTerm, currentFilters = {}) => {
        const filters = { ...currentFilters, search: searchTerm };
        return loadProducts(1, 10, filters);
    };

    const filterProducts = (filterData) => {
        return loadProducts(1, 10, filterData);
    };

    return {
        products,
        loading,
        error,
        currentPage,
        totalPages,
        totalProducts,
        categories,
        metalTypes,
        selectedProducts,
        sortBy,
        sortOrder,
        loadProducts,
        deleteProduct,
        bulkDeleteProducts,
        searchProducts,
        filterProducts,
        clearError,
        toggleProductSelection,
        selectAllProducts,
        clearSelection,
        handleSort,
        editProduct,
        createNewProduct
    };
};