import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useReview } from '../../hooks/useOder';
import { useWishlist } from '../../hooks/useWishList';
import {
  Heart,
  Package,
  Check,
  ShoppingCart,
  ShoppingBag,
  X,
  RefreshCw,
  Star,
  Users
} from 'lucide-react';

const ProductCard = ({ product, isCompact = false }) => {
  const navigate = useNavigate();
  const {
    cartItems,
    addToCart,
    removeFromCart,
    cartLoading,
    isInCart,
    getCartItemQuantity
  } = useCart();
  const {
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    loading: wishlistLoading,
    error: wishlistError,
    clearError: clearWishlistError
  } = useWishlist();
  const { getProductRating } = useReview();

  const [addingToCart, setAddingToCart] = useState(new Set());
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [productRating, setProductRating] = useState(null);

  const [addingToWishlist, setAddingToWishlist] = useState(new Set());



  // Check if product is in cart
  const inCart = isInCart(product._id);
  const cartQuantity = getCartItemQuantity(product._id);
  const isAddingThisProduct = addingToCart.has(product._id);

  
  // Fetch product rating on component mount
  useEffect(() => {
    const fetchRating = async () => {
      try {
        const rating = await getProductRating(product._id);
        if (rating) {
          setProductRating(rating);
        }
      } catch (error) {
        console.error('Failed to fetch rating:', error);
      }
    };

    fetchRating();
  }, [product._id, getProductRating]);

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
      setAddingToCart(prev => {
        const updated = new Set(prev);
        updated.delete(productId);
        return updated;
      });
    }
  };

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

const openQuantityModal = (product) => {
  setSelectedProduct(product);
  setQuantity(1);
  setShowQuantityModal(true);
};

const inWishlist = isInWishlist(product._id);
const isAddingToWishlistThis = addingToWishlist.has(product._id);

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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Enhanced rating stars component
  const getRatingStars = (rating, size = 12, showEmpty = true) => {
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
          />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <Star size={size} className="text-gray-300" />
            <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
              <Star size={size} className="fill-yellow-400 text-yellow-400" />
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

  // Get rating data - prioritize productRating from API, fallback to product data
  const displayRating = productRating?.averageRating || product.averageRating || 0;
  const displayReviewCount = productRating?.reviewCount || product.reviewCount || 0;

  const handleProceedToOrder = (productId) => {
    navigate(`/checkout?productId=${productId}`);
  };

  return (
    <div
      className={`rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105 ${isCompact ? 'h-auto' : 'h-full'}`}
      style={{ backgroundColor: '#D0B49F' }}
    >
      {/* Product Image */}
      <div className={`relative bg-white overflow-hidden ${isCompact ? 'h-32' : 'h-48'}`}>
        {product.image && product.image.length > 0 ? (
          <img
            src={product.image[0]?.url || product.image[0]}
            alt={product.name}
            className="w-full h-full object-contain cursor-pointer"
            onClick={() => navigate(`/product/${product._id}`)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={32} style={{ color: '#A47551' }} />
          </div>
        )}

        {/* Quick Actions */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          <button
            onClick={() => handleWishlistToggle(product._id)}
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

        {/* Discount Badge */}
        {product.discount && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            -{product.discount}%
          </div>
        )}

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
          className={`font-semibold line-clamp-2 cursor-pointer hover:text-[#A47551] transition-colors ${isCompact ? 'text-sm' : 'text-base'}`}
          style={{ color: '#523A28' }}
          onClick={() => navigate(`/product/${product._id}`)}
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
                {getRatingStars(displayRating, isCompact ? 14 : 16)}
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
          <div className="flex items-center gap-2">
            <div className="flex">
              {getRatingStars(0, isCompact ? 14 : 16)}
            </div>
            <span className={`${isCompact ? 'text-xs' : 'text-sm'}`} style={{ color: '#A47551' }}>
              No reviews yet
            </span>
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
            <button
              onClick={() => openQuantityModal(product)}
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
            <div className="space-y-1">
              <button
                onClick={() => handleProceedToOrder(product._id)}
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
                onClick={() => handleRemoveFromCart(product._id)}
                disabled={isAddingThisProduct || cartLoading}
                className={`w-full font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${isCompact ? 'px-3 py-1 text-xs' : 'px-4 py-1.5 text-sm'} disabled:opacity-50 disabled:cursor-not-allowed`}
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
              {displayRating > 0 && (
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {getRatingStars(displayRating, 14)}
                  </div>
                  <span className="text-sm font-medium" style={{ color: '#523A28' }}>
                    {displayRating.toFixed(1)}
                  </span>
                  <span className="text-sm" style={{ color: '#A47551' }}>
                    ({displayReviewCount} reviews)
                  </span>
                </div>
              )}

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
  );
};

export default ProductCard;