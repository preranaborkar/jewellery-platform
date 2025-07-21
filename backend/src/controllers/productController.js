// backend/src/controllers/productController.js
const Product = require('../models/Product');
const Review = require('../models/Review');
const Category = require('../models/Category');

// Get all products with filters and pagination
const getAllProducts = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            sort = '-createdAt',
            category,
            metalType,
            minPrice,
            maxPrice,
            search,
            inStock
        } = req.query;

        // Build filter object
        const filter = {};
        
        if (category) {
            filter.category = category;
        }
        
        if (metalType) {
            filter.metalType = metalType.toLowerCase();
        }
        
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = parseFloat(minPrice);
            if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
        }
        
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { shortDescription: { $regex: search, $options: 'i' } }
            ];
        }
        
        if (inStock === 'true') {
            filter.stock = { $gt: 0 };
        }

        // Calculate pagination
        const skip = (page - 1) * limit;
        const totalProducts = await Product.countDocuments(filter);
        const totalPages = Math.ceil(totalProducts / limit);

        // Get products with population
        const products = await Product.find(filter)
            .populate('category', 'name')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        res.status(200).json({
            success: true,
            data: {
                products,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalProducts,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            }
        });
    } catch (error) {
        console.error('Get all products error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching products',
            error: error.message
        });
    }
};

// Get single product by ID
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category', 'name description')
            .populate({
                path: 'reviews',
                populate: {
                    path: 'user',
                    select: 'firstName lastName avatar'
                }
            });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error('Get product by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching product',
            error: error.message
        });
    }
};

// Get products by category
const getProductsByCategory = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            sort = '-createdAt',
            metalType,
            minPrice,
            maxPrice,
            inStock
        } = req.query;

        const categoryId = req.params.category;

        // Check if category exists
        const categoryExists = await Category.findById(categoryId);
        if (!categoryExists) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // Build filter
        const filter = { category: categoryId };
        
        if (metalType) {
            filter.metalType = metalType.toLowerCase();
        }
        
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = parseFloat(minPrice);
            if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
        }
        
        if (inStock === 'true') {
            filter.stock = { $gt: 0 };
        }

        const skip = (page - 1) * limit;
        const totalProducts = await Product.countDocuments(filter);
        const totalPages = Math.ceil(totalProducts / limit);

        const products = await Product.find(filter)
            .populate('category', 'name')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        res.status(200).json({
            success: true,
            data: {
                products,
                category: categoryExists,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalProducts,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            }
        });
    } catch (error) {
        console.error('Get products by category error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching products by category',
            error: error.message
        });
    }
};

// Advanced search products
const searchProducts = async (req, res) => {
    try {
        const {
            q: searchQuery,
            page = 1,
            limit = 10,
            sort = '-createdAt',
            category,
            metalType,
            minPrice,
            maxPrice,
            minRating,
            inStock
        } = req.query;

        if (!searchQuery) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        // Build search filter
        const filter = {
            $or: [
                { name: { $regex: searchQuery, $options: 'i' } },
                { description: { $regex: searchQuery, $options: 'i' } },
                { shortDescription: { $regex: searchQuery, $options: 'i' } },
                { metalType: { $regex: searchQuery, $options: 'i' } },
                { metalPurity: { $regex: searchQuery, $options: 'i' } }
            ]
        };

        console.log(filter);
        // Add additional filters
        if (category) {
            filter.category = category;
        }
        
        if (metalType) {
            filter.metalType = metalType.toLowerCase();
        }
        
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = parseFloat(minPrice);
            if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
        }
        
        if (minRating) {
            filter.ratingsAverage = { $gte: parseFloat(minRating) };
        }
        
        if (inStock === 'true') {
            filter.stock = { $gt: 0 };
        }

        const skip = (page - 1) * limit;
        const totalProducts = await Product.countDocuments(filter);
        const totalPages = Math.ceil(totalProducts / limit);

        const products = await Product.find(filter)
            .populate('category', 'name')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        res.status(200).json({
            success: true,
            data: {
                products,
                searchQuery,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalProducts,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            }
        });
    } catch (error) {
        console.error('Search products error:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching products',
            error: error.message
        });
    }
};



// Add product review
const addProductReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const productId = req.params.id;
        const userId = req.user.userId;

        console.log(req.user);
        console.log('Adding review for product:', productId, 'by user:', userId);
        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check if user already reviewed this product
        const existingReview = await Review.findOne({ user: userId, product: productId });
        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this product'
            });
        }

        // Create new review
        const review = new Review({
            user: userId,
            product: productId,
            rating: parseInt(rating),
            comment
        });

        await review.save();

        // Update product reviews array
        product.reviews.push(review._id);

        // Calculate new ratings average
        const allReviews = await Review.find({ product: productId });
        const totalRatings = allReviews.reduce((sum, rev) => sum + rev.rating, 0);
        product.ratingsAverage = totalRatings / allReviews.length;
        product.ratingsCount = allReviews.length;

        await product.save();

        // Populate review for response
        await review.populate('user', 'firstName lastName avatar');

        res.status(201).json({
            success: true,
            message: 'Review added successfully',
            data: review
        });
    } catch (error) {
        console.error('Add product review error:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding review',
            error: error.message
        });
    }
};

// Get product reviews
const getProductReviews = async (req, res) => {
    try {
        const { page = 1, limit = 10, sort = '-createdAt' } = req.query;
        const productId = req.params.id;

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        const skip = (page - 1) * limit;
        const totalReviews = await Review.countDocuments({ product: productId });
        const totalPages = Math.ceil(totalReviews / limit);

        const reviews = await Review.find({ product: productId })
            .populate('user', 'firstName lastName avatar')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            data: {
                reviews,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalReviews,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            }
        });
    } catch (error) {
        console.error('Get product reviews error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching reviews',
            error: error.message
        });
    }
};

module.exports = {
    getAllProducts,
    getProductById,
    getProductsByCategory,
    searchProducts,
    addProductReview,
    getProductReviews
};