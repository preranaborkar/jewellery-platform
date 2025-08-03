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
      const cartData = response.data || response;
      setCart(cartData);
      setCartItems(cartData.items || []);
      calculateTotals(cartData.items || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  }, [calculateTotals]);

  // Add to cart
  const addToCart = useCallback(async (productId, quantity ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await cartService.addToCart(productId, quantity);
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

  // Check if product is in cart
  const isInCart = useCallback((productId) => {
    return cartItems.some(item => item.product._id === productId);
  }, [cartItems]);

  // Get cart item quantity
  const getCartItemQuantity = useCallback((productId) => {
    const item = cartItems.find(item => item.product._id === productId);
    return item ? item.quantity : 0;
  }, [cartItems]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initialize cart on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchCart();
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