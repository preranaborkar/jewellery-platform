// backend/src/routes/adminProductRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
    createProduct,
    getAllAdminProducts,
    updateProduct,
    deleteProduct,
    getInventory,
    bulkUploadProducts
} = require('../controllers/adminProductController');

const { protect, authorize } = require('../middleware/auth');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

// Multer configuration for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

// Validation middleware
const validateObjectId = (req, res, next) => {
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid product ID'
        });
    }
    next();
};

const validateProduct = (req, res, next) => {
    const { name, description, shortDescription, price, category, metalType, metalPurity, stock } = req.body;
    
    if (req.method === 'POST') {
        if (!name || !description || !shortDescription || !price || !category || !metalType || !metalPurity || stock === undefined) {
            return res.status(400).json({
                success: false,
                message: 'All required fields must be provided'
            });
        }
    }
    
    if (price !== undefined && (isNaN(price) || parseFloat(price) < 0)) {
        return res.status(400).json({
            success: false,
            message: 'Price must be a positive number'
        });
    }
    
    if (stock !== undefined && (isNaN(stock) || parseInt(stock) < 0)) {
        return res.status(400).json({
            success: false,
            message: 'Stock must be a non-negative number'
        });
    }
    
    if (metalType && !['gold', 'silver', 'platinum', 'diamond', 'other'].includes(metalType.toLowerCase())) {
        return res.status(400).json({
            success: false,
            message: 'Invalid metal type'
        });
    }
    
    next();
};

const validateCategory = (req, res, next) => {
    const { name, description, image } = req.body;
    
    if (!name || !description || !image) {
        return res.status(400).json({
            success: false,
            message: 'Name, description, and image are required for category'
        });
    }
    
    next();
};

// Apply auth middleware to all routes
router.use(protect);
router.use(authorize('admin'));

// ADMIN PRODUCT ENDPOINTS
router.post('/products', upload.array('images', 5), validateProduct, createProduct);
router.get('/products', getAllAdminProducts);
router.put('/products/:id', validateObjectId, upload.array('images', 5), validateProduct, updateProduct);
router.delete('/products/:id', validateObjectId, deleteProduct);

// ADMIN CATEGORY ENDPOINTS
// router.post('/categories', upload.single('image'), validateCategory, createCategory);

// ADMIN INVENTORY -- calculation
router.get('/inventory', getInventory);

// BULK UPLOAD
router.post('/bulk-upload', upload.single('csvFile'), bulkUploadProducts);// not tested yet

module.exports = router;