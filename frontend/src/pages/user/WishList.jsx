// components/Wishlist.jsx
import React, { useState } from 'react';
import {
  Heart,
  ShoppingCart,
  X,
  RefreshCw,
  Package,
  Star,
  Check,
  ShoppingBag,
  Trash2
} from 'lucide-react';
import { useWishlist } from '../../hooks/useWishList';
import { useCart } from '../../hooks/useCart'

const Wishlist = () => {
  const {
    wishlist,
    loading,
    error,
    removeFromWishlist,
    clearWishlist,
    clearError
  } = useWishlist();

  const {
    addToCart,
    isInCart,
    getCartItemQuantity,
    removeFromCart,
    loading: cartLoading,
    error: cartError,
    clearError: clearCartError
  } = useCart();

  const [removingFromWishlist, setRemovingFromWishlist] = useState(new Set());
  const [addingToCart, setAddingToCart] = useState(new Set());
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Handle remove from wishlist
  const handleRemoveFromWishlist = async (productId) => {
    const newRemoving = new Set(removingFromWishlist);
    newRemoving.add(productId);
    setRemovingFromWishlist(newRemoving);

    try {
      await removeFromWishlist(productId);
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
    } finally {
      setRemovingFromWishlist(prev => {
        const updated = new Set(prev);
        updated.delete(productId);
        return updated;
      });
    }
  };

  // Handle add to cart
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

  // Handle remove from cart
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

  // Open quantity modal
  const openQuantityModal = (product) => {
    setSelectedProduct(product);
    setQuantity(1);
    setShowQuantityModal(true);
  };

  // Handle proceed to order
  const handleProceedToOrder = (productId) => {
    window.location.href = '/checkout';
  };

  // Handle clear all wishlist
  const handleClearWishlist = async () => {
    if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
      try {
        await clearWishlist();
      } catch (error) {
        console.error('Failed to clear wishlist:', error);
      }
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  // Get rating stars
  const getRatingStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={14}
        className={i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
      />
    ));
  };

  // Product Card Component (Same as your existing one)
  const ProductCard = ({ product }) => {
    const inCart = isInCart(product._id);
    const cartQuantity = getCartItemQuantity(product._id);
    const isAddingThisProduct = addingToCart.has(product._id);
    const isRemovingThis = removingFromWishlist.has(product._id);

    return (
      <div
        className="rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105"
        style={{ backgroundColor: '#D0B49F' }}
      >
        {/* Product Image */}
        <div className="relative bg-white overflow-hidden h-48">
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

          {/* Remove from Wishlist Button */}
          <div className="absolute top-2 right-2">
            <button
              onClick={() => handleRemoveFromWishlist(product._id)}
              disabled={isRemovingThis}
              className="p-1.5 rounded-full shadow-lg transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed bg-red-500 text-white"
            >
              {isRemovingThis ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <X size={14} />
              )}
            </button>
          </div>

          {/* Discount Badge */}
          {product.discount && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              -{product.discount}%
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
        <div className="p-3 space-y-2">
          <h3 className="font-semibold line-clamp-2 text-base" style={{ color: '#523A28' }}>
            {product.name}
          </h3>

          <p className="text-sm line-clamp-2" style={{ color: '#A47551' }}>
            {product.shortDescription}
          </p>

          {/* Rating */}
          {product.averageRating > 0 && (
            <div className="flex items-center gap-1">
              <div className="flex">
                {getRatingStars(Math.round(product.averageRating))}
              </div>
              <span className="text-xs" style={{ color: '#A47551' }}>
                ({product.reviewCount || 0})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold text-lg" style={{ color: '#523A28' }}>
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
                className="w-full font-medium rounded-lg transition-colors flex items-center justify-center gap-2 px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: '#523A28',
                  color: '#E4D4C8'
                }}
              >
                {isAddingThisProduct ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Adding...
                  </>
                ) : product.stock === 0 ? (
                  'Out of Stock'
                ) : (
                  <>
                    <ShoppingCart size={16} />
                    Add to Cart
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-1">
                <button
                  onClick={() => handleProceedToOrder(product._id)}
                  className="w-full font-medium rounded-lg transition-colors flex items-center justify-center gap-2 px-4 py-2 text-sm"
                  style={{
                    backgroundColor: '#2D5016',
                    color: '#E4D4C8'
                  }}
                >
                  <ShoppingBag size={16} />
                  Order Now
                </button>

                <button
                  onClick={() => handleRemoveFromCart(product._id)}
                  disabled={isAddingThisProduct || cartLoading}
                  className="w-full font-medium rounded-lg transition-colors flex items-center justify-center gap-2 px-4 py-1.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: '#c06767ff',
                    color: '#E4D4C8'
                  }}
                >
                  {isAddingThisProduct ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      Removing...
                    </>
                  ) : (
                    <>
                      <X size={14} />
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

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#E4D4C8' }}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#523A28' }}>
              My Wishlist
            </h1>
            <p className="text-sm" style={{ color: '#A47551' }}>
              {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved
            </p>
          </div>

          {wishlist.length > 0 && (
            <button
              onClick={handleClearWishlist}
              className="px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              style={{ backgroundColor: '#c06767ff', color: '#E4D4C8' }}
            >
              <Trash2 size={16} />
              Clear All
            </button>
          )}
        </div>

        {/* Error Alerts */}
        {error && (
          <div className="mb-6 p-4 rounded-lg border border-red-300 bg-red-50 flex items-center gap-3">
            <X className="text-red-500 flex-shrink-0" size={20} />
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
            <X className="text-red-500 flex-shrink-0" size={20} />
            <p className="text-red-700">Cart Error: {cartError}</p>
            <button
              onClick={clearCartError}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div
              className="animate-spin rounded-full h-8 w-8 border-2 border-b-transparent"
              style={{ borderColor: '#523A28' }}
            ></div>
            <span className="ml-3" style={{ color: '#523A28' }}>
              Loading wishlist...
            </span>
          </div>
        ) : wishlist.length === 0 ? (
          /* Empty Wishlist */
          <div className="text-center py-12">
            <Heart size={64} className="mx-auto mb-4" style={{ color: '#A47551' }} />
            <h3 className="text-xl font-medium mb-2" style={{ color: '#523A28' }}>
              Your wishlist is empty
            </h3>
            <p className="mb-6" style={{ color: '#A47551' }}>
              Start adding products you love to see them here
            </p>
            <a
              href="/products-categories"
              className="inline-block px-6 py-3 rounded-lg font-medium transition-colors"
              style={{ backgroundColor: '#523A28', color: '#E4D4C8' }}
            >
              Browse Products
            </a>
          </div>
        ) : (
          /* Wishlist Items */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        {/* Quantity Selection Modal */}
        {showQuantityModal && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div
              className="bg-white rounded-lg p-6 max-w-sm w-full mx-4"
              style={{ backgroundColor: '#E4D4C8' }}
            >
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#523A28' }}>
                Select Quantity
              </h3>

              <div className="mb-4">
                <p className="text-sm mb-2" style={{ color: '#A47551' }}>
                  {selectedProduct.name}
                </p>
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

                  <span
                    className="text-xl font-semibold w-12 text-center"
                    style={{ color: '#523A28' }}
                  >
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

export default Wishlist;