import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';

// Initial State
const initialState = {
  items: [],
  totalItems: 0,
  totalAmount: 0,
  isLoading: false,
  error: null,
  isOpen: false, // Cart drawer state
  appliedCoupon: null,
  discountAmount: 0,
  shippingCost: 0,
  taxAmount: 0,
};

// Action Types
const CART_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  LOAD_CART: 'LOAD_CART',
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  TOGGLE_CART: 'TOGGLE_CART',
  APPLY_COUPON: 'APPLY_COUPON',
  REMOVE_COUPON: 'REMOVE_COUPON',
  UPDATE_SHIPPING: 'UPDATE_SHIPPING',
  CALCULATE_TOTALS: 'CALCULATE_TOTALS',
};

// Helper function to calculate totals
const calculateTotals = (items, appliedCoupon, shippingCost) => {
  const subtotal = items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);

  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percentage') {
      discountAmount = (subtotal * appliedCoupon.value) / 100;
    } else if (appliedCoupon.type === 'fixed') {
      discountAmount = Math.min(appliedCoupon.value, subtotal);
    }
  }

  const taxRate = 0.1; // 10% tax rate - can be configurable
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = taxableAmount * taxRate;
  
  const totalAmount = subtotal - discountAmount + shippingCost + taxAmount;
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);

  return {
    totalItems,
    totalAmount: Math.max(0, totalAmount),
    subtotal,
    discountAmount,
    taxAmount,
  };
};

// Reducer Function
const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case CART_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case CART_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case CART_ACTIONS.LOAD_CART:
      const loadedTotals = calculateTotals(
        action.payload.items || [],
        action.payload.appliedCoupon,
        action.payload.shippingCost || 0
      );
      return {
        ...state,
        items: action.payload.items || [],
        appliedCoupon: action.payload.appliedCoupon || null,
        shippingCost: action.payload.shippingCost || 0,
        ...loadedTotals,
        isLoading: false,
        error: null,
      };

    case CART_ACTIONS.ADD_ITEM:
      const existingItemIndex = state.items.findIndex(
        item => item.id === action.payload.id && 
                 JSON.stringify(item.selectedOptions) === JSON.stringify(action.payload.selectedOptions)
      );

      let updatedItems;
      if (existingItemIndex >= 0) {
        updatedItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
      } else {
        updatedItems = [...state.items, action.payload];
      }

      const addTotals = calculateTotals(updatedItems, state.appliedCoupon, state.shippingCost);
      return {
        ...state,
        items: updatedItems,
        ...addTotals,
        error: null,
      };

    case CART_ACTIONS.REMOVE_ITEM:
      const filteredItems = state.items.filter(item => 
        !(item.id === action.payload.id && 
          JSON.stringify(item.selectedOptions) === JSON.stringify(action.payload.selectedOptions))
      );
      const removeTotals = calculateTotals(filteredItems, state.appliedCoupon, state.shippingCost);
      return {
        ...state,
        items: filteredItems,
        ...removeTotals,
        error: null,
      };

    case CART_ACTIONS.UPDATE_QUANTITY:
      const quantityUpdatedItems = state.items.map(item =>
        item.id === action.payload.id && 
        JSON.stringify(item.selectedOptions) === JSON.stringify(action.payload.selectedOptions)
          ? { ...item, quantity: Math.max(0, action.payload.quantity) }
          : item
      ).filter(item => item.quantity > 0);

      const updateTotals = calculateTotals(quantityUpdatedItems, state.appliedCoupon, state.shippingCost);
      return {
        ...state,
        items: quantityUpdatedItems,
        ...updateTotals,
        error: null,
      };

    case CART_ACTIONS.CLEAR_CART:
      return {
        ...initialState,
        isOpen: state.isOpen,
      };

    case CART_ACTIONS.TOGGLE_CART:
      return {
        ...state,
        isOpen: action.payload !== undefined ? action.payload : !state.isOpen,
      };

    case CART_ACTIONS.APPLY_COUPON:
      const couponTotals = calculateTotals(state.items, action.payload, state.shippingCost);
      return {
        ...state,
        appliedCoupon: action.payload,
        ...couponTotals,
        error: null,
      };

    case CART_ACTIONS.REMOVE_COUPON:
      const noCouponTotals = calculateTotals(state.items, null, state.shippingCost);
      return {
        ...state,
        appliedCoupon: null,
        ...noCouponTotals,
        error: null,
      };

    case CART_ACTIONS.UPDATE_SHIPPING:
      const shippingTotals = calculateTotals(state.items, state.appliedCoupon, action.payload);
      return {
        ...state,
        shippingCost: action.payload,
        ...shippingTotals,
        error: null,
      };

    case CART_ACTIONS.CALCULATE_TOTALS:
      const recalculatedTotals = calculateTotals(state.items, state.appliedCoupon, state.shippingCost);
      return {
        ...state,
        ...recalculatedTotals,
      };

    default:
      return state;
  }
};

// Create Context
const CartContext = createContext();

// Context Provider Component
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { user, isAuthenticated, token } = useAuth();

  // Load cart from localStorage or API when user changes
  useEffect(() => {
    const loadCart = async () => {
      if (isAuthenticated && user) {
        try {
          dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });
          
          // Call your backend API to get user's cart
          const response = await fetch(`/api/cart`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const cartData = await response.json();
            dispatch({ type: CART_ACTIONS.LOAD_CART, payload: cartData });
          } else {
            // If no cart found, load from localStorage
            const localCart = JSON.parse(localStorage.getItem('cart') || '{"items": []}');
            dispatch({ type: CART_ACTIONS.LOAD_CART, payload: localCart });
          }
        } catch (error) {
          console.error('Failed to load cart:', error);
          // Fallback to localStorage
          const localCart = JSON.parse(localStorage.getItem('cart') || '{"items": []}');
          dispatch({ type: CART_ACTIONS.LOAD_CART, payload: localCart });
        }
      } else {
        // Load from localStorage for guest users
        const localCart = JSON.parse(localStorage.getItem('cart') || '{"items": []}');
        dispatch({ type: CART_ACTIONS.LOAD_CART, payload: localCart });
      }
    };

    loadCart();
  }, [user, isAuthenticated, token]);

  // Save cart to localStorage and API whenever cart changes
  useEffect(() => {
    const saveCart = async () => {
      const cartData = {
        items: state.items,
        appliedCoupon: state.appliedCoupon,
        shippingCost: state.shippingCost,
      };

      // Always save to localStorage
      localStorage.setItem('cart', JSON.stringify(cartData));

      // Save to API if user is authenticated
      if (isAuthenticated && user && token) {
        try {
          await fetch(`/api/cart`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(cartData),
          });
        } catch (error) {
          console.error('Failed to sync cart with server:', error);
        }
      }
    };

    // Don't save on initial load
    if (state.items.length > 0 || state.appliedCoupon) {
      saveCart();
    }
  }, [state.items, state.appliedCoupon, state.shippingCost, isAuthenticated, user, token]);

  // Add item to cart
  const addToCart = async (product, quantity = 1, selectedOptions = {}) => {
    try {
      const cartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || product.image,
        quantity,
        selectedOptions,
        maxQuantity: product.stock || 999,
      };

      dispatch({ type: CART_ACTIONS.ADD_ITEM, payload: cartItem });
      return { success: true, message: 'Item added to cart!' };
    } catch (error) {
      const errorMessage = error.message || 'Failed to add item to cart';
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: errorMessage });
      return { success: false, message: errorMessage };
    }
  };

  // Remove item from cart
  const removeFromCart = (itemId, selectedOptions = {}) => {
    dispatch({ 
      type: CART_ACTIONS.REMOVE_ITEM, 
      payload: { id: itemId, selectedOptions } 
    });
  };

  // Update item quantity
  const updateQuantity = (itemId, quantity, selectedOptions = {}) => {
    dispatch({ 
      type: CART_ACTIONS.UPDATE_QUANTITY, 
      payload: { id: itemId, quantity, selectedOptions } 
    });
  };

  // Clear entire cart
  const clearCart = () => {
    dispatch({ type: CART_ACTIONS.CLEAR_CART });
  };

  // Toggle cart drawer
  const toggleCart = (isOpen) => {
    dispatch({ type: CART_ACTIONS.TOGGLE_CART, payload: isOpen });
  };

  // Apply coupon
  const applyCoupon = async (couponCode) => {
    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });
      
      const response = await fetch(`/api/coupons/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({ 
          code: couponCode, 
          cartTotal: state.totalAmount 
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.valid) {
        dispatch({ type: CART_ACTIONS.APPLY_COUPON, payload: data.coupon });
        return { success: true, message: 'Coupon applied successfully!' };
      } else {
        throw new Error(data.message || 'Invalid coupon code');
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to apply coupon';
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: errorMessage });
      return { success: false, message: errorMessage };
    }
  };

  // Remove coupon
  const removeCoupon = () => {
    dispatch({ type: CART_ACTIONS.REMOVE_COUPON });
  };

  // Update shipping cost
  const updateShippingCost = (cost) => {
    dispatch({ type: CART_ACTIONS.UPDATE_SHIPPING, payload: cost });
  };

  // Get item count for a specific product
  const getItemQuantity = (productId, selectedOptions = {}) => {
    const item = state.items.find(item => 
      item.id === productId && 
      JSON.stringify(item.selectedOptions) === JSON.stringify(selectedOptions)
    );
    return item ? item.quantity : 0;
  };

  // Check if item is in cart
  const isInCart = (productId, selectedOptions = {}) => {
    return state.items.some(item => 
      item.id === productId && 
      JSON.stringify(item.selectedOptions) === JSON.stringify(selectedOptions)
    );
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: CART_ACTIONS.CLEAR_ERROR });
  };

  // Context value
  const value = {
    // State
    items: state.items,
    totalItems: state.totalItems,
    totalAmount: state.totalAmount,
    subtotal: state.subtotal,
    discountAmount: state.discountAmount,
    taxAmount: state.taxAmount,
    shippingCost: state.shippingCost,
    appliedCoupon: state.appliedCoupon,
    isLoading: state.isLoading,
    error: state.error,
    isOpen: state.isOpen,
    
    // Actions
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    toggleCart,
    applyCoupon,
    removeCoupon,
    updateShippingCost,
    clearError,
    
    // Helpers
    getItemQuantity,
    isInCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Custom Hook to use Cart Context
export const useCart = () => {
  const context = useContext(CartContext);
  
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  
  return context;
};

export default CartContext;