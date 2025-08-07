// components/CartPage.js - Updated with proper navigation
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ArrowLeft,
  Package,
  AlertCircle,
  RefreshCw,
  X,
  ShoppingBag,
  CreditCard,
  Truck,
  Shield,
  CheckCircle
} from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import {loadStripe} from '@stripe/stripe-js';

const CartPage = () => {
  const navigate = useNavigate();
  const {
    cart,
    cartItems,
    cartCount,
    cartTotal,
    loading,
    error,
    updateCartItem,
    removeFromCart,
    clearCart,
    fetchCart,
    clearError
  } = useCart();

  const [updatingItems, setUpdatingItems] = useState(new Set());
  const [removingItems, setRemovingItems] = useState(new Set());
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Fetch cart on component mount
  useEffect(() => {
    fetchCart();
    console.log('Cart fetched:#####',cartItems);
  }, [fetchCart]);

  // Handle quantity update
  const handleQuantityUpdate = async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    const newUpdatingItems = new Set(updatingItems);
    newUpdatingItems.add(productId);
    setUpdatingItems(newUpdatingItems);

    try {
      await updateCartItem(productId, newQuantity);
    } catch (error) {
      console.error('Failed to update quantity:', error);
    } finally {
      setUpdatingItems(prev => {
        const updated = new Set(prev);
        updated.delete(productId);
        return updated;
      });
    }
  };

  // Handle item removal
  const handleRemoveItem = async (productId) => {
    const newRemovingItems = new Set(removingItems);
    newRemovingItems.add(productId);
    setRemovingItems(newRemovingItems);

    try {
      await removeFromCart(productId);
    } catch (error) {
      console.error('Failed to remove item:', error);
    } finally {
      setRemovingItems(prev => {
        const updated = new Set(prev);
        updated.delete(productId);
        return updated;
      });
    }
  };

  // Handle clear cart
  const handleClearCart = async () => {
    try {
      await clearCart();
      setShowClearConfirm(false);
    } catch (error) {
      console.error('Failed to clear cart:', error);
    }
  };

  // Handle navigation
  const handleContinueShopping = () => {
    navigate('/products-categories');
  };

  

// Fixed handleProceedToCheckout function for CartPage.js
// Fixed handleProceedToCheckout function for CartPage.js
const handleProceedToCheckout = async () => {
  try {
    const stripe = await loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
    
    if (!stripe) {
      console.error('Failed to load Stripe');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No authentication token found');
      navigate('/login');
      return;
    }

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    };

    // ONLY create Stripe checkout session with cart items
    console.log('Creating Stripe checkout with cart items:', cartItems);
    
    const checkoutResponse = await fetch(`${process.env.REACT_APP_API_URL}/orders/create-stripe-checkout`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({ 
        items: cartItems // Send cart items directly
      })
    });

    if (!checkoutResponse.ok) {
      throw new Error('Failed to create checkout session');
    }

    const checkoutResult = await checkoutResponse.json();
    console.log('Checkout session created:', checkoutResult);

    // Redirect to Stripe checkout
    if (checkoutResult.id) {
      const result = await stripe.redirectToCheckout({ 
        sessionId: checkoutResult.id 
      });
      if (result.error) {
        console.error('Stripe checkout error:', result.error.message);
      }
    }

  } catch (error) {
    console.error('Checkout process failed:', error);
    // Show error to user
  }
};

  const handleGoBack = () => {
    navigate(-1); // Go back to previous page
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  // Calculate savings
  const calculateSavings = () => {
    return cartItems.reduce((savings, item) => {
      const originalPrice = item.product.originalPrice || item.product.price;
      const currentPrice = item.product.price;
      const discount = (originalPrice - currentPrice) * item.quantity;
      return savings + discount;
    }, 0);
  };

  const totalSavings = calculateSavings();

  // Cart Item Component
  const CartItem = ({ item }) => {
    const { product, quantity } = item;
    const isUpdating = updatingItems.has(product._id);
    const isRemoving = removingItems.has(product._id);
    const originalPrice = product.originalPrice || product.price;
    const hasDiscount = originalPrice > product.price;

    return (
      <div className="p-4 rounded-lg shadow-md mb-4" style={{ backgroundColor: '#D0B49F' }}>
        <div className="flex gap-4">
          {/* Product Image */}
          <div className="w-24 h-24 bg-white rounded-lg overflow-hidden flex-shrink-0">
            {product.image && product.image.length > 0 ? (
              <img
                src={product.image[0]?.url || product.image[0]}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package size={24} style={{ color: '#A47551' }} />
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="flex-1">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg line-clamp-2" style={{ color: '#523A28' }}>
                {product.name}
              </h3>
              
              <button
                onClick={() => handleRemoveItem(product._id)}
                disabled={isRemoving || loading}
                className="p-1 rounded-full hover:bg-red-100 transition-colors disabled:opacity-50"
              >
                {isRemoving ? (
                  <RefreshCw size={16} className="animate-spin text-red-500" />
                ) : (
                  <Trash2 size={16} className="text-red-500" />
                )}
              </button>
            </div>

            {product.shortDescription && (
              <p className="text-sm mb-3 line-clamp-2" style={{ color: '#A47551' }}>
                {product.shortDescription}
              </p>
            )}

            {/* Price and Discount */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg font-bold" style={{ color: '#523A28' }}>
                {formatCurrency(product.price)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-sm line-through" style={{ color: '#A47551' }}>
                    {formatCurrency(originalPrice)}
                  </span>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    {Math.round(((originalPrice - product.price) / originalPrice) * 100)}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Quantity Controls and Subtotal */}
            <div className="flex items-center justify-between">
              {/* Quantity Controls */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium" style={{ color: '#523A28' }}>
                  Qty:
                </span>
                <div className="flex items-center border rounded-lg" style={{ borderColor: '#A47551' }}>
                  <button
                    onClick={() => handleQuantityUpdate(product._id, quantity - 1)}
                    disabled={quantity <= 1 || isUpdating || loading}
                    className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ color: '#523A28' }}
                  >
                    <Minus size={14} />
                  </button>
                  
                  <span 
                    className="px-4 py-2 text-center min-w-[3rem] font-medium"
                    style={{ color: '#523A28' }}
                  >
                    {isUpdating ? <RefreshCw size={14} className="animate-spin mx-auto" /> : quantity}
                  </span>
                  
                  <button
                    onClick={() => handleQuantityUpdate(product._id, quantity + 1)}
                    disabled={quantity >= product.stock || isUpdating || loading}
                    className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ color: '#523A28' }}
                  >
                    <Plus size={14} />
                  </button>
                </div>
                
                <span className="text-xs" style={{ color: '#A47551' }}>
                  (Stock: {product.stock})
                </span>
              </div>

              {/* Subtotal */}
              <div className="text-right">
                <div className="text-lg font-bold" style={{ color: '#523A28' }}>
                  {formatCurrency(product.price * quantity)}
                </div>
                {hasDiscount && (
                  <div className="text-xs text-green-600">
                    Saved: {formatCurrency((originalPrice - product.price) * quantity)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Loading State
  if (loading && cartItems.length === 0) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#E4D4C8' }}>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-b-transparent" style={{ borderColor: '#523A28' }}></div>
            <span className="ml-3" style={{ color: '#523A28' }}>Loading cart...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#E4D4C8' }}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={handleGoBack}
              className="p-2 rounded-lg border transition-colors"
              style={{ borderColor: '#A47551', color: '#523A28' }}
            >
              <ArrowLeft size={20} />
            </button>
            
            <div>
              <h1 className="text-3xl font-bold" style={{ color: '#523A28' }}>
                Shopping Cart
              </h1>
              <p style={{ color: '#A47551' }}>
                {cartCount} {cartCount === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>
          </div>

          {cartItems.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="px-4 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
            >
              <Trash2 size={16} />
              Clear Cart
            </button>
          )}
        </div>

        {/* Error Alert */}
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

        {cartItems.length === 0 ? (
          /* Empty Cart */
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <ShoppingCart size={64} className="mx-auto mb-4" style={{ color: '#A47551' }} />
              <h2 className="text-2xl font-bold mb-2" style={{ color: '#523A28' }}>
                Your cart is empty
              </h2>
              <p className="mb-6" style={{ color: '#A47551' }}>
                Looks like you haven't added any items to your cart yet.
              </p>
              <button
                onClick={handleContinueShopping}
                className="px-6 py-3 rounded-lg font-medium transition-colors"
                style={{ backgroundColor: '#523A28', color: '#E4D4C8' }}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        ) : (
          /* Cart Content */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="mb-4">
                <h2 className="text-xl font-semibold" style={{ color: '#523A28' }}>
                  Cart Items ({cartCount})
                </h2>
              </div>

              {cartItems.map((item) => (
                <CartItem key={item.product._id} item={item} />
              ))}

              {/* Continue Shopping */}
              <button
                onClick={handleContinueShopping}
                className="w-full mt-4 px-4 py-3 rounded-lg border-2 border-dashed transition-colors flex items-center justify-center gap-2"
                style={{ borderColor: '#A47551', color: '#523A28' }}
              >
                <Package size={20} />
                Continue Shopping
              </button>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-4">
                <div className="p-6 rounded-lg shadow-lg" style={{ backgroundColor: '#D0B49F' }}>
                  <h3 className="text-xl font-semibold mb-4" style={{ color: '#523A28' }}>
                    Order Summary
                  </h3>

                  {/* Summary Details */}
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span style={{ color: '#A47551' }}>Subtotal ({cartCount} items)</span>
                      <span className="font-medium" style={{ color: '#523A28' }}>
                        {formatCurrency(cartTotal)}
                      </span>
                    </div>

                    {totalSavings > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Total Savings</span>
                        <span className="font-medium">
                          -{formatCurrency(totalSavings)}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span style={{ color: '#A47551' }}>Shipping</span>
                      <span className="font-medium text-green-600">FREE</span>
                    </div>

                    <div className="flex justify-between">
                      <span style={{ color: '#A47551' }}>Tax</span>
                      <span style={{ color: '#A47551' }}>Calculated at checkout</span>
                    </div>

                    <hr style={{ borderColor: '#A47551' }} />

                    <div className="flex justify-between text-lg font-bold">
                      <span style={{ color: '#523A28' }}>Total</span>
                      <span style={{ color: '#523A28' }}>
                        {formatCurrency(cartTotal)}
                      </span>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <button
                    onClick={handleProceedToCheckout}
                    className="w-full px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 mb-4"
                    style={{ backgroundColor: '#523A28', color: '#E4D4C8' }}
                  >
                    <CreditCard size={20} />
                    Proceed to Checkout
                  </button>

                  {/* Trust Badges */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2" style={{ color: '#A47551' }}>
                      <Shield size={16} />
                      <span>Secure checkout</span>
                    </div>
                    <div className="flex items-center gap-2" style={{ color: '#A47551' }}>
                      <Truck size={16} />
                      <span>Free shipping on all orders</span>
                    </div>
                    <div className="flex items-center gap-2" style={{ color: '#A47551' }}>
                      <CheckCircle size={16} />
                      <span>Easy returns within 30 days</span>
                    </div>
                  </div>
                </div>

                {/* Promo Code */}
                <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: '#D0B49F' }}>
                  <h4 className="font-medium mb-3" style={{ color: '#523A28' }}>
                    Have a promo code?
                  </h4>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter code"
                      className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                      style={{ borderColor: '#A47551' }}
                    />
                    <button
                      className="px-4 py-2 rounded-lg font-medium transition-colors"
                      style={{ backgroundColor: '#A47551', color: 'white' }}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Clear Cart Confirmation Modal */}
        {showClearConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4" style={{ backgroundColor: '#E4D4C8' }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#523A28' }}>
                Clear Cart?
              </h3>
              <p className="mb-6" style={{ color: '#A47551' }}>
                Are you sure you want to remove all items from your cart? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 px-4 py-2 rounded-lg border"
                  style={{ borderColor: '#A47551', color: '#523A28' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearCart}
                  className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white font-medium"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;