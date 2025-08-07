// hooks/useCart.js
import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { cartService } from '../services/cartService';

// Create Cart Context
const CartContext = createContext();

// Cart Provider Component
export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Calculate totals
  const calculateTotals = useCallback((items) => {
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    const total = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    setCartCount(count);
    setCartTotal(total);
  }, []);

  // Fetch cart
  const fetchCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await cartService.getCart();
      console.log('Full cart response:', response); // Debug log

      // Handle different possible response structures
      const cartData = response.data?.cart || response.cart || response.data || response;
      console.log('Processed cart data:', cartData); // Debug log

      // Extract items array - handle different possible structures
      const items = cartData?.items || cartData?.products || cartData || [];
      console.log('Extracted items:', items); // Debug log

      setCart(cartData);
      setCartItems(Array.isArray(items) ? items : []);
      calculateTotals(Array.isArray(items) ? items : []);

      console.log('Cart state updated with items:', items); // Debug log
    } catch (err) {
      console.error('Error in fetchCart:', err); // Debug log
      if (err.status === 401 || err.message.includes('401')) {
        // Clear invalid auth data
        localStorage.removeItem('customer');
        localStorage.removeItem('token');
        setCart(null);
        setCartItems([]);
        setCartCount(0);
        setCartTotal(0);
        return; // Don't set error for 401
      }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [calculateTotals]);

  // Add to cart
  const addToCart = useCallback(async (productId, quantity) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Adding to cart:', { productId, quantity }); // Debug log
      const response = await cartService.addToCart(productId, quantity);

      console.log('Add to cart response:', response); // Debug log
      await fetchCart(); // Refresh cart after adding
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCart]);

  // Update cart item
  const updateCartItem = useCallback(async (productId, quantity) => {
    setLoading(true);
    setError(null);
    try {
      const response = await cartService.updateCartItem(productId, quantity);
      await fetchCart(); // Refresh cart after updating
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCart]);

  // Remove from cart
  const removeFromCart = useCallback(async (productId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await cartService.removeFromCart(productId);
      await fetchCart(); // Refresh cart after removing
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCart]);

  // Clear cart
  const clearCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await cartService.clearCart();
      setCart(null);
      setCartItems([]);
      setCartCount(0);
      setCartTotal(0);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // In hooks/useCart.js - Replace the existing isInCart function with this:

  // Check if product is in cart
  const isInCart = useCallback((productId) => {
    console.log('Checking isInCart for productId:', productId);
    console.log('Current cartItems:', cartItems);

    const found = cartItems.some(item => {
      // Handle different possible data structures
      const itemProductId = item.product?._id || item.product?.id || item.productId || item._id;
      console.log('Comparing:', itemProductId, 'with', productId);
      return itemProductId === productId;
    });

    console.log('isInCart result:', found);
    return found;
  }, [cartItems]);

  // Get cart item quantity  
  const getCartItemQuantity = useCallback((productId) => {
    console.log('Getting quantity for productId:', productId);

    const item = cartItems.find(item => {
      // Handle different possible data structures
      const itemProductId = item.product?._id || item.product?.id || item.productId || item._id;
      return itemProductId === productId;
    });

    const quantity = item ? item.quantity : 0;
    console.log('Quantity found:', quantity);
    return quantity;
  }, [cartItems]);
  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ✅ ADD AUTHENTICATION CHECK
  useEffect(() => {
    const token = localStorage.getItem('token');
    const customer = localStorage.getItem('customer');

    if (token && customer) {
      try {
        const user = JSON.parse(customer);
        if (user && user.userId) { // Only fetch if user data is valid
          fetchCart();
        }
      } catch (error) {
        console.error('Invalid user data in localStorage');
        // Clear invalid data
        localStorage.removeItem('customer');
        localStorage.removeItem('token');
      }
    }
  }, [fetchCart]);

  const value = {
    // State
    cart,
    cartItems,
    cartCount,
    cartTotal,
    loading,
    error,

    // Actions
    fetchCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    clearError,

    // Helpers
    isInCart,
    getCartItemQuantity
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// useCart hook
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default useCart;