// backend/src/controllers/adminProductController.js
const Product = require('../models/Product');
const Category = require('../models/Category');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');
const csv = require('csv-parser');
const fs = require('fs');

// Create new product
const createProduct = async (req, res) => {
    try {
        const {
            name,
            description,
            shortDescription,
            price,
            category,
            metalType,
            metalPurity,
            stock
        } = req.body;

        // Check if category exists
        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
            return res.status(400).json({
                success: false,
                message: 'Invalid category ID'
            });
        }



        // Handle image uploads
        let imageUrls = [];

        if (req.body.image && Array.isArray(req.body.image)) {
            imageUrls = req.body.image;
        }
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                try {
                    const result = await uploadToCloudinary(file.buffer, {
                        folder: 'jewelry-products',
                        transformation: [
                            { width: 800, height: 800, crop: 'fill' },
                            { quality: 'auto', fetch_format: 'auto' }
                        ]
                    });
                    imageUrls.push(result.secure_url);
                } catch (uploadError) {
                    console.error('Image upload error:', uploadError);
                    return res.status(400).json({
                        success: false,
                        message: 'Error uploading images'
                    });
                }
            }
        }

        if (imageUrls.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'At least one product image is required'
            });
        }

        // Create product
        const product = new Product({
            name,
            description,
            shortDescription,
            price: parseFloat(price),
            category,
            metalType: metalType.toLowerCase(),
            metalPurity,
            stock: parseInt(stock),
            image: imageUrls
        });

        await product.save();
        await product.populate('category', 'name');

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: product
        });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating product',
            error: error.message
        });
    }
};

// Get all products for admin (with detailed info)
const getAllAdminProducts = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            sort = '-createdAt',
            category,
            metalType,
            stockStatus,
            search
        } = req.query;

        // Build filter
        const filter = {};

        if (category) {
            filter.category = category;
        }

        if (metalType) {
            filter.metalType = metalType.toLowerCase();
        }

        if (stockStatus === 'inStock') {
            filter.stock = { $gt: 0 };
        } else if (stockStatus === 'outOfStock') {
            filter.stock = { $lte: 0 };
        } else if (stockStatus === 'lowStock') {
            filter.stock = { $lte: 10, $gt: 0 };
        }

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { metalType: { $regex: search, $options: 'i' } }
            ];
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

        // Add stock status to each product
        const productsWithStatus = products.map(product => ({
            ...product,
            stockStatus: product.stock <= 0 ? 'outOfStock' :
                product.stock <= 10 ? 'lowStock' : 'inStock'
        }));

        res.status(200).json({
            success: true,
            data: {
                products: productsWithStatus,
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
        console.error('Get admin products error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching products',
            error: error.message
        });
    }
};

// Update product
const updateProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const updateData = { ...req.body };

        // Check if product exists
        const existingProduct = await Product.findById(productId);
        if (!existingProduct) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Validate category if provided
        if (updateData.category) {
            const categoryExists = await Category.findById(updateData.category);
            if (!categoryExists) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid category ID'
                });
            }
        }

        // Handle image updates
        if (req.files && req.files.length > 0) {
            // Delete old images from Cloudinary
            for (const imageUrl of existingProduct.image) {
                try {
                    const publicId = imageUrl.split('/').pop().split('.')[0];
                    await deleteFromCloudinary(`jewelry-products/${publicId}`);
                } catch (deleteError) {
                    console.log('Error deleting old image:', deleteError);
                }
            }

            // Upload new images
            let newImageUrls = [];
            for (const file of req.files) {
                try {
                    const result = await uploadToCloudinary(file.buffer, {
                        folder: 'jewelry-products',
                        transformation: [
                            { width: 800, height: 800, crop: 'fill' },
                            { quality: 'auto', fetch_format: 'auto' }
                        ]
                    });
                    newImageUrls.push(result.secure_url);
                } catch (uploadError) {
                    console.error('Image upload error:', uploadError);
                    return res.status(400).json({
                        success: false,
                        message: 'Error uploading new images'
                    });
                }
            }
            updateData.image = newImageUrls;
        }

        // Convert data types
        if (updateData.price) updateData.price = parseFloat(updateData.price);
        if (updateData.stock !== undefined) updateData.stock = parseInt(updateData.stock);
        if (updateData.metalType) updateData.metalType = updateData.metalType.toLowerCase();

        // Update product
        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            updateData,
            { new: true, runValidators: true }
        ).populate('category', 'name');

        res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            data: updatedProduct
        });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating product',
            error: error.message
        });
    }
};

// Delete product
const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Delete images from Cloudinary
        for (const imageUrl of product.image) {
            try {
                const publicId = imageUrl.split('/').pop().split('.')[0];
                await deleteFromCloudinary(`jewelry-products/${publicId}`);
            } catch (deleteError) {
                console.log('Error deleting image:', deleteError);
            }
        }

        await Product.findByIdAndDelete(productId);

        res.status(200).json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting product',
            error: error.message
        });
    }
};

// Create category (Admin only)
// const createCategory = async (req, res) => {
//     try {
//         const { name, description } = req.body;

//         // Handle image upload
//         let imageUrl = '';
//         if (req.file) {
//             try {
//                 const result = await uploadToCloudinary(req.file.buffer, {
//                     folder: 'jewelry-categories',
//                     transformation: [
//                         { width: 400, height: 300, crop: 'fill' },
//                         { quality: 'auto', fetch_format: 'auto' }
//                     ]
//                 });
//                 imageUrl = result.secure_url;
//             } catch (uploadError) {
//                 return res.status(400).json({
//                     success: false,
//                     message: 'Error uploading category image'
//                 });
//             }
//         }

//         const category = new Category({
//             name,
//             description,
//             image: imageUrl
//         });

//         await category.save();

//         res.status(201).json({
//             success: true,
//             message: 'Category created successfully',
//             data: category
//         });
//     } catch (error) {
//         console.error('Create category error:', error);
//         if (error.code === 11000) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Category with this name already exists'
//             });
//         }
//         res.status(500).json({
//             success: false,
//             message: 'Error creating category',
//             error: error.message
//         });
//     }
// };

// Get inventory tracking
const getInventory = async (req, res) => {
    try {
        // Get inventory stats
        const totalProducts = await Product.countDocuments();
        const outOfStock = await Product.countDocuments({ stock: { $lte: 0 } });
        const lowStock = await Product.countDocuments({ stock: { $lte: 10, $gt: 0 } });
        const inStock = await Product.countDocuments({ stock: { $gt: 10 } });

        // Get total inventory value
        const inventoryValue = await Product.aggregate([
            {
                $group: {
                    _id: null,
                    totalValue: { $sum: { $multiply: ['$price', '$stock'] } }
                }
            }
        ]);

        // Get low stock products
        const lowStockProducts = await Product.find({ stock: { $lte: 10 } })
            .populate('category', 'name')
            .select('name price stock category')
            .sort({ stock: 1 })
            .limit(10);

        // Get inventory by category
        const inventoryByCategory = await Product.aggregate([
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'categoryInfo'
                }
            },
            {
                $unwind: '$categoryInfo'
            },
            {
                $group: {
                    _id: '$categoryInfo.name',
                    totalProducts: { $sum: 1 },
                    totalStock: { $sum: '$stock' },
                    totalValue: { $sum: { $multiply: ['$price', '$stock'] } }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                overview: {
                    totalProducts,
                    inStock,
                    lowStock,
                    outOfStock,
                    totalValue: inventoryValue[0]?.totalValue || 0
                },
                lowStockProducts,
                inventoryByCategory
            }
        });
    } catch (error) {
        console.error('Get inventory error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching inventory data',
            error: error.message
        });
    }
};

// Bulk upload products
const bulkUploadProducts = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'CSV file is required'
            });
        }

        const results = [];
        const errors = [];

        // Parse CSV file
        const csvData = req.file.buffer.toString('utf8');
        const rows = csvData.split('\n').slice(1); // Skip header row

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            if (!row.trim()) continue;

            try {
                const [name, description, shortDescription, price, categoryName, metalType, metalPurity, stock, imageUrls] =
                    row.split(',').map(field => field.trim().replace(/"/g, ''));

                // Validate required fields
                if (!name || !description || !shortDescription || !price || !categoryName || !metalType || !metalPurity || stock === undefined) {
                    errors.push({
                        row: i + 2,
                        error: 'Missing required fields'
                    });
                    continue;
                }

                // Find category
                const category = await Category.findOne({ name: categoryName });
                if (!category) {
                    errors.push({
                        row: i + 2,
                        error: `Category '${categoryName}' not found`
                    });
                    continue;
                }

                // Validate metal type
                const validMetalTypes = ['gold', 'silver', 'platinum', 'diamond', 'other'];
                if (!validMetalTypes.includes(metalType.toLowerCase())) {
                    errors.push({
                        row: i + 2,
                        error: `Invalid metal type: ${metalType}`
                    });
                    continue;
                }

                // Parse image URLs
                const images = imageUrls ? imageUrls.split(';').map(url => url.trim()) : [];
                if (images.length === 0) {
                    errors.push({
                        row: i + 2,
                        error: 'At least one image URL is required'
                    });
                    continue;
                }

                // Create product
                const product = new Product({
                    name,
                    description,
                    shortDescription,
                    price: parseFloat(price),
                    category: category._id,
                    metalType: metalType.toLowerCase(),
                    metalPurity,
                    stock: parseInt(stock),
                    image: images
                });

                await product.save();
                results.push({
                    row: i + 2,
                    productId: product._id,
                    name: product.name
                });

            } catch (error) {
                errors.push({
                    row: i + 2,
                    error: error.message
                });
            }
        }

        res.status(200).json({
            success: true,
            message: `Bulk upload completed. ${results.length} products created, ${errors.length} errors.`,
            data: {
                successful: results,
                errors: errors,
                summary: {
                    totalProcessed: rows.length,
                    successful: results.length,
                    failed: errors.length
                }
            }
        });
    } catch (error) {
        console.error('Bulk upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing bulk upload',
            error: error.message
        });
    }
};

module.exports = {
    createProduct,
    getAllAdminProducts,
    updateProduct,
    deleteProduct,
    getInventory,
    bulkUploadProducts
};