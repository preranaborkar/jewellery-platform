

// backend/src/routes/categoryRoutes.js
const express = require('express');
const router = express.Router();
const {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    searchCategories
} = require('../controllers/categoryController');

// Validation middleware
const validateCategory = (req, res, next) => {
    const { name, description, image } = req.body;
    
    if (req.method === 'POST') {
        if (!name || !description || !image) {
            return res.status(400).json({
                success: false,
                message: 'Name, description, and image are required fields'
            });
        }
    }
    
    if (name && typeof name !== 'string') {
        return res.status(400).json({
            success: false,
            message: 'Name must be a string'
        });
    }
    
    if (description && typeof description !== 'string') {
        return res.status(400).json({
            success: false,
            message: 'Description must be a string'
        });
    }
    
    if (image && typeof image !== 'string') {
        return res.status(400).json({
            success: false,
            message: 'Image must be a string'
        });
    }
    
    next();
};

// Validate MongoDB ObjectId
const validateObjectId = (req, res, next) => {
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid category ID'
        });
    }
    next();
};

// Routes
router.get('/search', searchCategories);
router.get('/', getAllCategories);
router.get('/:id', validateObjectId, getCategoryById);
router.post('/', validateCategory, createCategory);
router.put('/:id', validateObjectId, validateCategory, updateCategory);
router.delete('/:id', validateObjectId, deleteCategory);

module.exports = router;


