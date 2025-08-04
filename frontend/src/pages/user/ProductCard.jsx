import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { 
  Heart, 
  Package, 
  Check, 
  ShoppingCart, 
  ShoppingBag, 
  X, 
  RefreshCw,
  Star
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
  
  const [addingToCart, setAddingToCart] = useState(new Set());
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Check if product is in cart
  const inCart = isInCart(product._id);
  const cartQuantity = getCartItemQuantity(product._id);
  const isAddingThisProduct = addingToCart.has(product._id);

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

  // Add this function to open quantity modal
  const openQuantityModal = (product) => {
    setSelectedProduct(product);
    setQuantity(1);
    setShowQuantityModal(true);
  };
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  

  // Format currency
  const getRatingStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={12}
        className={index < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
      />
    ));
  };

  
  // Handle proceed to order
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
          <button className="p-1.5 rounded-full bg-white shadow-lg hover:bg-gray-50 transition-colors">
            <Heart size={14} style={{ color: '#A47551' }} />
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
            // When item is in cart - show both Order and Remove buttons
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