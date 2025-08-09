// components/ProductsByCategory.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Package,
  Star,
  ShoppingCart,
  Eye,
  Heart,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  X,
  Check,
  ShoppingBag,
  Users // Add this import
} from 'lucide-react';
import useProductsByCategory from '../../hooks/useProductsByCategory';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishList';
import { useReview } from '../../hooks/useOder';

const ProductsByCategory = () => {
    const navigate = useNavigate();
  const {
    categories,
    productsByCategory,
    loading,
    categoriesLoading,
    error,
    selectedCategory,
    fetchCategories,
    fetchProductsByCategory,
    fetchAllCategoriesWithProducts,
    loadMoreProducts,
    clearError,
    setSelectedCategory,
    getCategoryProducts,
    getCategoryById
  } = useProductsByCategory();

  const { getProductRating } = useReview();
  const {
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    loading: wishlistLoading,
    error: wishlistError,
    clearError: clearWishlistError
  } = useWishlist();
  // Cart hook
  const {
    addToCart,
    removeFromCart,
    isInCart,
    getCartItemQuantity,
    loading: cartLoading,
    error: cartError,
    clearError: clearCartError
  } = useCart();

  // Local state
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [addingToWishlist, setAddingToWishlist] = useState(new Set());
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [addingToCart, setAddingToCart] = useState(new Set());
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [productRatings, setProductRatings] = useState({}); // Cache for product ratings

  // Load initial data
  useEffect(() => {
    if (categories.length > 0) {
      fetchAllCategoriesWithProducts(8);
    }
  }, [categories, fetchAllCategoriesWithProducts]);

  // Fetch ratings for all products when they are loaded
  useEffect(() => {
    const fetchProductRatings = async () => {
      const allProducts = [];
      
      // Collect all products from all categories
      Object.values(productsByCategory).forEach(categoryData => {
        if (categoryData.products && Array.isArray(categoryData.products)) {
          allProducts.push(...categoryData.products);
        }
      });

      // Fetch ratings for products that don't have cached ratings
      const ratingsToFetch = allProducts.filter(product => 
        product._id && !productRatings[product._id] && !product.averageRating
      );

      if (ratingsToFetch.length > 0) {
        const ratingsPromises = ratingsToFetch.map(async (product) => {
          try {
            const rating = await getProductRating(product._id);
            return { productId: product._id, rating };
          } catch (error) {
            console.error(`Failed to fetch rating for product ${product._id}:`, error);
            return { productId: product._id, rating: null };
          }
        });

        const ratings = await Promise.all(ratingsPromises);
        const ratingsMap = {};
        ratings.forEach(({ productId, rating }) => {
          if (rating) {
            ratingsMap[productId] = rating;
          }
        });

        if (Object.keys(ratingsMap).length > 0) {
          setProductRatings(prev => ({ ...prev, ...ratingsMap }));
        }
      }
    };

    fetchProductRatings();
  }, [productsByCategory, getProductRating, productRatings]);

  

  // Handle category selection
  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    if (!productsByCategory[categoryId]) {
      fetchProductsByCategory(categoryId);
    }
  };

  const handleWishlistToggle = async (productId) => {
    const newAddingToWishlist = new Set(addingToWishlist);
    newAddingToWishlist.add(productId);
    setAddingToWishlist(newAddingToWishlist);

    try {
      await toggleWishlist(productId);
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
    } finally {
      setAddingToWishlist(prev => {
        const updated = new Set(prev);
        updated.delete(productId);
        return updated;
      });
    }
  };

  // Toggle category expansion
  const toggleCategoryExpansion = (categoryId) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleAddToCart = async (productId, selectedQuantity = 1) => {
    const newAddingToCart = new Set(addingToCart);
    newAddingToCart.add(productId);
    setAddingToCart(newAddingToCart);

    try {
      await addToCart(productId, selectedQuantity);
      setShowQuantityModal(false);
      setSelectedProduct(null);
      setQuantity(1);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      // Use the current state, not the stale closure
      setAddingToCart(prev => {
        const updated = new Set(prev);
        updated.delete(productId);
        return updated;
      });
    }
  };
  // Add this function to handle remove from cart
  const handleRemoveFromCart = async (productId) => {
    const newAddingToCart = new Set(addingToCart);
    newAddingToCart.add(productId);
    setAddingToCart(newAddingToCart);

    try {
      await removeFromCart(productId);
    } catch (error) {
      console.error('Failed to remove from cart:', error);
    } finally {
      setAddingToCart(prev => {
        const updated = new Set(prev);
        updated.delete(productId);
        return updated;
      });
    }
  };

  // Add this function to open quantity modal
  const openQuantityModal = (product) => {
    setSelectedProduct(product);
    setQuantity(1);
    setShowQuantityModal(true);
  };

  // Enhanced rating stars component with hover tooltips
  const getRatingStars = (rating, size = 12, showEmpty = true, showTooltip = false) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star
            key={i}
            size={size}
            className="fill-yellow-400 text-yellow-400"
            title={showTooltip ? `${rating.toFixed(1)} out of 5 stars` : undefined}
          />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <Star size={size} className="text-gray-300" />
            <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
              <Star 
                size={size} 
                className="fill-yellow-400 text-yellow-400"
                title={showTooltip ? `${rating.toFixed(1)} out of 5 stars` : undefined}
              />
            </div>
          </div>
        );
      } else if (showEmpty) {
        stars.push(
          <Star key={i} size={size} className="text-gray-300" />
        );
      }
    }

    return stars;
  };

  // Handle proceed to order
  const handleProceedToOrder = (productId) => {
    // Navigate to checkout or order page
    // You can implement this based on your routing setup
    window.location.href = '/checkout';
  };

  // Add this function to manually refresh product rating
  const refreshProductRating = async (productId) => {
    try {
      const rating = await getProductRating(productId);
      if (rating) {
        setProductRatings(prev => ({
          ...prev,
          [productId]: rating
        }));
      }
    } catch (error) {
      console.error(`Failed to refresh rating for product ${productId}:`, error);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  
  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };
  // Product Card Component
  const ProductCard = ({ product, isCompact = false }) => {
    const inCart = isInCart(product._id);
    const cartQuantity = getCartItemQuantity(product._id);
    const isAddingThisProduct = addingToCart.has(product._id);
    const inWishlist = isInWishlist(product._id);
    const isAddingToWishlistThis = addingToWishlist.has(product._id);

    // Get rating data for this specific product - prioritize API data, fallback to product data
    const cachedRating = productRatings[product._id];
    const displayRating = cachedRating?.averageRating || product.averageRating || 0;
    const displayReviewCount = cachedRating?.reviewCount || product.reviewCount || 0;

    return (
      <div
        className={`rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105 ${isCompact ? 'h-auto' : 'h-full'}`}
        style={{ backgroundColor: '#D0B49F' }}
       onClick={() => handleProductClick(product._id)}
      >
        {/* Product Image */}
        <div className={`relative bg-white overflow-hidden ${isCompact ? 'h-32' : 'h-48'}`}>
          {product.image && product.image.length > 0 ? (
            <img
              src={product.image[0]?.url || product.image[0]}
              alt={product.name}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package size={32} style={{ color: '#A47551' }} />
            </div>
          )}

          {/* Quick Actions */}
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            <button
              onClick={(e) =>{
                e.stopPropagation();
                 handleWishlistToggle(product._id)}}
              disabled={isAddingToWishlistThis || wishlistLoading}
              className={`p-1.5 rounded-full shadow-lg transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed ${inWishlist
                ? 'bg-red-500 text-white'
                : 'bg-white hover:bg-gray-50'
                }`}
            >
              {isAddingToWishlistThis ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <Heart
                  size={14}
                  className={inWishlist ? 'fill-current' : ''}
                  style={{ color: inWishlist ? 'white' : '#A47551' }}
                />
              )}
            </button>
          </div>

          {/* Rating Badge - Top Center */}
          {displayRating > 0 && (
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-95 backdrop-blur-sm text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
              <Star size={12} className="fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-gray-800">{displayRating.toFixed(1)}</span>
            </div>
          )}

          {/* In Cart Badge */}
          {inCart && (
            <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
              <Check size={12} />
              In Cart ({cartQuantity})
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className={`p-3 ${isCompact ? 'space-y-1' : 'space-y-2'}`}>
          <h3
            className={`font-semibold line-clamp-2 ${isCompact ? 'text-sm' : 'text-base'}`}
            style={{ color: '#523A28' }}
          >
            {product.name}
          </h3>

          {!isCompact && (
            <p className="text-sm line-clamp-2" style={{ color: '#A47551' }}>
              {product.shortDescription}
            </p>
          )}

          {/* Enhanced Rating Display */}
          {displayRating > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {getRatingStars(displayRating, isCompact ? 14 : 16, true, true)}
                </div>
                <div className="flex items-center gap-1">
                  <span className={`font-semibold ${isCompact ? 'text-sm' : 'text-base'}`} style={{ color: '#523A28' }}>
                    {displayRating.toFixed(1)}
                  </span>
                  <span className={`${isCompact ? 'text-xs' : 'text-sm'}`} style={{ color: '#A47551' }}>
                    ({displayReviewCount})
                  </span>
                </div>
              </div>
              {displayReviewCount > 0 && (
                <div className="flex items-center gap-1">
                  <Users size={isCompact ? 12 : 14} style={{ color: '#A47551' }} />
                  <span className="text-xs" style={{ color: '#A47551' }}>
                    {displayReviewCount} {displayReviewCount === 1 ? 'review' : 'reviews'}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* No Rating Display */}
          {displayRating === 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {getRatingStars(0, isCompact ? 14 : 16)}
                </div>
                <span className={`${isCompact ? 'text-xs' : 'text-sm'}`} style={{ color: '#A47551' }}>
                  No reviews yet
                </span>
              </div>
              <button
                onClick={() => refreshProductRating(product._id)}
                className="text-xs px-2 py-1 rounded transition-colors hover:bg-opacity-80"
                style={{ backgroundColor: '#A47551', color: 'white' }}
                title="Refresh rating"
              >
                <RefreshCw size={10} />
              </button>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center justify-between">
            <div>
              <span className={`font-bold ${isCompact ? 'text-sm' : 'text-lg'}`} style={{ color: '#523A28' }}>
                {formatCurrency(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs line-through ml-2" style={{ color: '#A47551' }}>
                  {formatCurrency(product.originalPrice)}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <span className={`text-xs ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            {!inCart ? (
              // Add to Cart Button
              <button
                onClick={(e) => { e.stopPropagation();openQuantityModal(product)}}
                disabled={product.stock === 0 || isAddingThisProduct || cartLoading}
                className={`w-full font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${isCompact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'} disabled:opacity-50 disabled:cursor-not-allowed`}
                style={{
                  backgroundColor: '#523A28',
                  color: '#E4D4C8'
                }}
              >
                {isAddingThisProduct ? (
                  <>
                    <RefreshCw size={isCompact ? 12 : 16} className="animate-spin" />
                    Adding...
                  </>
                ) : product.stock === 0 ? (
                  'Out of Stock'
                ) : (
                  <>
                    <ShoppingCart size={isCompact ? 12 : 16} />
                    Add to Cart
                  </>
                )}
              </button>
            ) : (
              // When item is in cart - show both Order and Remove buttons
              <div className="space-y-1">
                <button
                  onClick={(e) => { e.stopPropagation(); handleProceedToOrder(product._id)}}
                  className={`w-full font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${isCompact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'}`}
                  style={{
                    backgroundColor: '#2D5016',
                    color: '#E4D4C8'
                  }}
                >
                  <ShoppingBag size={isCompact ? 12 : 16} />
                  Order Now
                </button>

                <button
                  onClick={(e) => {e.stopPropagation();handleRemoveFromCart(product._id)}}
                  disabled={isAddingThisProduct || cartLoading}
                  className={`w-full font-medium  rounded-lg transition-colors flex items-center justify-center gap-2 ${isCompact ? 'px-3 py-1 text-xs' : 'px-4 py-1.5 text-sm'} disabled:opacity-50 disabled:cursor-not-allowed`}
                  style={{
                    backgroundColor: '#c06767ff',
                    color: '#E4D4C8'
                  }}
                >
                  {isAddingThisProduct ? (
                    <>
                      <RefreshCw size={isCompact ? 10 : 14} className="animate-spin" />
                      Removing...
                    </>
                  ) : (
                    <>
                      <X size={isCompact ? 10 : 14} />
                      Remove
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Category Section Component
  const CategorySection = ({ category, isExpanded }) => {
    const categoryData = getCategoryProducts(category._id) || { products: [], totalProducts: 0 };
    const productsArray = Array.isArray(categoryData.products) ? categoryData.products : [];
    const displayProducts = isExpanded ? productsArray : productsArray.slice(0, 4);

    return (
      <div className="mb-12">
        {/* Category Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold" style={{ color: '#523A28' }}>
              {category.name}
            </h2>
            <span
              className="px-3 py-1 rounded-full text-sm font-medium"
              style={{ backgroundColor: '#A47551', color: 'white' }}
            >
              {categoryData.totalProducts} items
            </span>
          </div>
        </div>

        {/* Category Description */}
        {category.description && (
          <p className="mb-4 text-sm" style={{ color: '#A47551' }}>
            {category.description}
          </p>
        )}

        {/* Products Grid */}
        {displayProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayProducts.map((product) => (
                <ProductCard key={product._id} product={product} isCompact={true} />
              ))}
            </div>

            {/* Load More / Show Less */}
            {categoryData.products.length > 4 && (
              <div className="text-center mt-6">
                <button
                  onClick={() => toggleCategoryExpansion(category._id)}
                  className="px-6 py-2 rounded-lg font-medium transition-colors"
                  style={{ backgroundColor: '#A47551', color: 'white' }}
                >
                  {isExpanded ? 'Show Less' : `Show All ${categoryData.totalProducts} Products`}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 rounded-lg" style={{ backgroundColor: '#D0B49F' }}>
            <Package size={48} className="mx-auto mb-4" style={{ color: '#A47551' }} />
            <p style={{ color: '#523A28' }}>No products found in this category</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#E4D4C8' }}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#523A28' }}>
            Products by Category
          </h1>
        </div>

        {/* Error Alerts */}
        {error && (
          <div className="mb-6 p-4 rounded-lg border border-red-300 bg-red-50 flex items-center gap-3">
            <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
            <p className="text-red-700">{error}</p>
            <button
              onClick={clearError}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {cartError && (
          <div className="mb-6 p-4 rounded-lg border border-red-300 bg-red-50 flex items-center gap-3">
            <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
            <p className="text-red-700">Cart Error: {cartError}</p>
            <button
              onClick={clearCartError}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {wishlistError && (
          <div className="mb-6 p-4 rounded-lg border border-red-300 bg-red-50 flex items-center gap-3">
            <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
            <p className="text-red-700">Wishlist Error: {wishlistError}</p>
            <button
              onClick={clearWishlistError}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Loading State */}
        {(categoriesLoading || loading) && categories.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-b-transparent" style={{ borderColor: '#523A28' }}></div>
            <span className="ml-3" style={{ color: '#523A28' }}>Loading categories...</span>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <Package size={48} className="mx-auto mb-4" style={{ color: '#A47551' }} />
            <h3 className="text-xl font-medium mb-2" style={{ color: '#523A28' }}>
              No categories found
            </h3>
            <p className="mb-4" style={{ color: '#A47551' }}>
              Categories will appear here once they are created.
            </p>
            <button
              onClick={fetchCategories}
              className="px-6 py-3 rounded-lg font-medium transition-colors"
              style={{ backgroundColor: '#523A28', color: '#E4D4C8' }}
            >
              Refresh
            </button>
          </div>
        ) : (
          /* Categories List */
          <div>
            {categories.map((category) => (
              <CategorySection
                key={category._id}
                category={category}
                isExpanded={expandedCategories.has(category._id)}
              />
            ))}
          </div>
        )}

        {/* Category Quick Navigation */}
        {categories.length > 0 && (
          <div className="mt-12 p-6 rounded-lg shadow-lg" style={{ backgroundColor: '#D0B49F' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#523A28' }}>
              Quick Navigation
            </h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category._id}
                  onClick={() => handleCategorySelect(category._id)}
                  className="px-4 py-2 rounded-full text-sm font-medium transition-colors border"
                  style={{
                    borderColor: '#A47551',
                    color: '#523A28',
                    backgroundColor: selectedCategory === category._id ? '#A47551' : 'transparent'
                  }}
                >
                  {category.name}
                  <span className="ml-2 text-xs">
                    ({getCategoryProducts(category._id).totalProducts})
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity Selection Modal */}
        {showQuantityModal && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4" style={{ backgroundColor: '#E4D4C8' }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#523A28' }}>
                Select Quantity
              </h3>

              <div className="mb-4">
                <p className="text-sm mb-2" style={{ color: '#A47551' }}>
                  {selectedProduct.name}
                </p>

                {/* Rating in Modal */}
                {(() => {
                  const cachedRating = productRatings[selectedProduct._id];
                  const modalRating = cachedRating?.averageRating || selectedProduct.averageRating || 0;
                  const modalReviewCount = cachedRating?.reviewCount || selectedProduct.reviewCount || 0;
                  
                  return modalRating > 0 && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {getRatingStars(modalRating, 14)}
                      </div>
                      <span className="text-sm font-medium" style={{ color: '#523A28' }}>
                        {modalRating.toFixed(1)}
                      </span>
                      <span className="text-sm" style={{ color: '#A47551' }}>
                        ({modalReviewCount} reviews)
                      </span>
                    </div>
                  );
                })()}

                <p className="text-sm mb-4" style={{ color: '#A47551' }}>
                  Price: {formatCurrency(selectedProduct.price)} each
                </p>

                <div className="flex items-center justify-center gap-4 mb-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#A47551', color: 'white' }}
                  >
                    -
                  </button>

                  <span className="text-xl font-semibold w-12 text-center" style={{ color: '#523A28' }}>
                    {quantity}
                  </span>

                  <button
                    onClick={() => setQuantity(Math.min(selectedProduct.stock, quantity + 1))}
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#A47551', color: 'white' }}
                  >
                    +
                  </button>
                </div>

                <p className="text-center text-sm" style={{ color: '#A47551' }}>
                  Total: {formatCurrency(selectedProduct.price * quantity)}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowQuantityModal(false);
                    setSelectedProduct(null);
                    setQuantity(1);
                  }}
                  className="flex-1 px-4 py-2 rounded-lg border"
                  style={{ borderColor: '#A47551', color: '#523A28' }}
                >
                  Cancel
                </button>

                <button
                  onClick={() => handleAddToCart(selectedProduct._id, quantity)}
                  disabled={addingToCart.has(selectedProduct._id)}
                  className="flex-1 px-4 py-2 rounded-lg text-white font-medium disabled:opacity-50"
                  style={{ backgroundColor: '#523A28' }}
                >
                  {addingToCart.has(selectedProduct._id) ? 'Adding...' : 'Add to Cart'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsByCategory;