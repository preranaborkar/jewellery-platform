// backend/src/routes/adminProductRoutes.js
const express = require('express');
const router = express.Router();

const {
    createProduct,
    getAllAdminProducts,
    updateProduct,
    deleteProduct,
    getInventory,
    getProductById
} = require('../controllers/adminProductController');

const { uploadProductImages, handleMulterError } = require('../middleware/upload');

const { protect, authorize } = require('../middleware/auth');







// Apply auth middleware to all routes
router.use(protect);
router.use(authorize('admin'));

// ADMIN PRODUCT ENDPOINTS
// Create product with image upload
router.post('/', 
    uploadProductImages, 
    handleMulterError, 
    createProduct
);

// Update product with image upload
router.put('/:id', 
    uploadProductImages, 
    handleMulterError, 
    updateProduct
);

router.get('/', getAllAdminProducts);
router.delete('/:id', deleteProduct);
router.get('/:id', getProductById);

router.get('/inventory', getInventory);


module.exports = router;