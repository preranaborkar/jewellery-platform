// backend/src/routes/reviewRoutes.js
const express = require('express');
const router = express.Router();
const {
  addReview,
  updateReview,
  getUserReview,
  getProductRating,
  getProductReviews,
  deleteReview
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

// Protected routes (require authentication)
router.use(protect);

// Update existing review
router.put('/:reviewId', updateReview);

// Get user's review for a specific product
router.get('/user/:productId', getUserReview);

// Get product's rating summary
router.get('/product/:productId/rating', getProductRating);

// Get all reviews for a product (with pagination)
router.get('/product/:productId', getProductReviews);

// Delete review
router.delete('/:reviewId', deleteReview);

module.exports = router;
