// backend/src/controllers/reviewController.js
const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');

// Add or update review for a product
const addReview = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { product, rating } = req.body;
    const userId = req.user.userId;

    // Validate input
    if (!product || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Product ID and rating are required'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Check if order exists and belongs to user
    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or unauthorized'
      });
    }

    // Check if product is in the order
    const productInOrder = order.products.some(p => p.product.toString() === product);
    if (!productInOrder) {
      return res.status(400).json({
        success: false,
        message: 'Product not found in this order'
      });
    }

    // Check if review already exists
    let review = await Review.findOne({ user: userId, product });

    if (review) {
      // Update existing review
      review.rating = rating;
      review.updatedAt = new Date();
      await review.save();
    } else {
      // Create new review
      review = new Review({
        user: userId,
        product,
        rating
      });
      await review.save();

      // Add review to product's reviews array
      await Product.findByIdAndUpdate(product, {
        $push: { reviews: review._id }
      });
    }

    // Update product's average rating
    await updateProductRating(product);

    // Populate review data
    const populatedReview = await Review.findById(review._id)
      .populate('user', 'fullName firstName lastName')
      .populate('product', 'name');

    res.status(201).json({
      success: true,
      message: review ? 'Review updated successfully' : 'Review added successfully',
      data: populatedReview
    });

  } catch (error) {
    console.error('Error in addReview:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update existing review
const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating } = req.body;
    const userId = req.user.userId;

    // Validate input
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Valid rating (1-5) is required'
      });
    }

    // Find and update review
    const review = await Review.findOneAndUpdate(
      { _id: reviewId, user: userId },
      { rating, updatedAt: new Date() },
      { new: true }
    ).populate('user', 'fullName firstName lastName')
     .populate('product', 'name');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or unauthorized'
      });
    }

    // Update product's average rating
    await updateProductRating(review.product._id);

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: review
    });

  } catch (error) {
    console.error('Error in updateReview:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get user's review for a specific product
const getUserReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.userId;

    console.log('%%%%%%Fetching user review for product:', productId, 'by user:', userId);
    const review = await Review.findOne({ user: userId, product: productId })
      .populate('user', 'fullName firstName lastName')
      .populate('product', 'name');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({
      success: true,
      data: review
    });

  } catch (error) {
    console.error('Error in getUserReview:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get product's rating summary
const getProductRating = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId)
      .select('ratingsAverage ratingsCount');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Get all reviews for detailed breakdown
    const reviews = await Review.find({ product: productId })
      .populate('user', 'fullName firstName lastName');

    // Calculate rating distribution
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(review => {
      ratingDistribution[review.rating]++;
    });

    res.json({
      success: true,
      data: {
        averageRating: product.ratingsAverage,
        totalReviews: product.ratingsCount,
        ratingDistribution,
        reviews: reviews.slice(0, 10) // Return first 10 reviews
      }
    });

  } catch (error) {
    console.error('Error in getProductRating:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all reviews for a product (with pagination)
const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ product: productId })
      .populate('user', 'fullName firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalReviews = await Review.countDocuments({ product: productId });

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalReviews / limit),
          totalReviews,
          hasNext: page < Math.ceil(totalReviews / limit),
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error in getProductReviews:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete review
const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.userId;

    const review = await Review.findOneAndDelete({ _id: reviewId, user: userId });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or unauthorized'
      });
    }

    // Remove review from product's reviews array
    await Product.findByIdAndUpdate(review.product, {
      $pull: { reviews: reviewId }
    });

    // Update product's average rating
    await updateProductRating(review.product);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('Error in deleteReview:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Helper function to update product's average rating
const updateProductRating = async (productId) => {
  try {
    const reviews = await Review.find({ product: productId });
    
    if (reviews.length === 0) {
      await Product.findByIdAndUpdate(productId, {
        ratingsAverage: 0,
        ratingsCount: 0
      });
      return;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    await Product.findByIdAndUpdate(productId, {
      ratingsAverage: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      ratingsCount: reviews.length
    });

  } catch (error) {
    console.error('Error updating product rating:', error);
  }
};

module.exports = {
  addReview,
  updateReview,
  getUserReview,
  getProductRating,
  getProductReviews,
  deleteReview
};