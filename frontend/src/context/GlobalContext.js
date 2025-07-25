import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Initial State
const initialState = {
  // UI State
  theme: 'light',
  sidebarOpen: false,
  mobileMenuOpen: false,
  searchModalOpen: false,
  wishlistDrawerOpen: false,
  
  // Loading States
  pageLoading: false,
  globalLoading: false,
  
  // Notifications
  notifications: [],
  toast: null,
  
  // Search & Filters
  searchQuery: '',
  searchResults: [],
  searchLoading: false,
  filters: {
    category: '',
    priceRange: [0, 10000],
    materials: [],
    brands: [],
    rating: 0,
    availability: 'all', // all, in-stock, out-of-stock
    sortBy: 'featured', // featured, newest, price-low, price-high, rating
  },
  
  // Wishlist
  wishlist: [],
  
  // Recently Viewed
  recentlyViewed: [],
  
  // App Settings
  currency: 'USD',
  language: 'en',
  
  // Error States
  error: null,
  networkError: false,
};

// Action Types
const GLOBAL_ACTIONS = {
  // UI Actions
  SET_THEME: 'SET_THEME',
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
  TOGGLE_MOBILE_MENU: 'TOGGLE_MOBILE_MENU',
  TOGGLE_SEARCH_MODAL: 'TOGGLE_SEARCH_MODAL',
  TOGGLE_WISHLIST_DRAWER: 'TOGGLE_WISHLIST_DRAWER',
  
  // Loading Actions
  SET_PAGE_LOADING: 'SET_PAGE_LOADING',
  SET_GLOBAL_LOADING: 'SET_GLOBAL_LOADING',
  
  // Notification Actions
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  CLEAR_NOTIFICATIONS: 'CLEAR_NOTIFICATIONS',
  SET_TOAST: 'SET_TOAST',
  CLEAR_TOAST: 'CLEAR_TOAST',
  
  // Search Actions
  SET_SEARCH_QUERY: 'SET_SEARCH_QUERY',
  SET_SEARCH_RESULTS: 'SET_SEARCH_RESULTS',
  SET_SEARCH_LOADING: 'SET_SEARCH_LOADING',
  CLEAR_SEARCH: 'CLEAR_SEARCH',
  
  // Filter Actions
  UPDATE_FILTERS: 'UPDATE_FILTERS',
  RESET_FILTERS: 'RESET_FILTERS',
  
  // Wishlist Actions
  LOAD_WISHLIST: 'LOAD_WISHLIST',
  ADD_TO_WISHLIST: 'ADD_TO_WISHLIST',
  REMOVE_FROM_WISHLIST: 'REMOVE_FROM_WISHLIST',
  CLEAR_WISHLIST: 'CLEAR_WISHLIST',
  
  // Recently Viewed Actions
  ADD_TO_RECENTLY_VIEWED: 'ADD_TO_RECENTLY_VIEWED',
  CLEAR_RECENTLY_VIEWED: 'CLEAR_RECENTLY_VIEWED',
  
  // App Settings Actions
  SET_CURRENCY: 'SET_CURRENCY',
  SET_LANGUAGE: 'SET_LANGUAGE',
  
  // Error Actions
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_NETWORK_ERROR: 'SET_NETWORK_ERROR',
};

// Reducer Function
const globalReducer = (state, action) => {
  switch (action.type) {
    // UI Actions
    case GLOBAL_ACTIONS.SET_THEME:
      return {
        ...state,
        theme: action.payload,
      };

    case GLOBAL_ACTIONS.TOGGLE_SIDEBAR:
      return {
        ...state,
        sidebarOpen: action.payload !== undefined ? action.payload : !state.sidebarOpen,
      };

    case GLOBAL_ACTIONS.TOGGLE_MOBILE_MENU:
      return {
        ...state,
        mobileMenuOpen: action.payload !== undefined ? action.payload : !state.mobileMenuOpen,
      };

    case GLOBAL_ACTIONS.TOGGLE_SEARCH_MODAL:
      return {
        ...state,
        searchModalOpen: action.payload !== undefined ? action.payload : !state.searchModalOpen,
      };

    case GLOBAL_ACTIONS.TOGGLE_WISHLIST_DRAWER:
      return {
        ...state,
        wishlistDrawerOpen: action.payload !== undefined ? action.payload : !state.wishlistDrawerOpen,
      };

    // Loading Actions
    case GLOBAL_ACTIONS.SET_PAGE_LOADING:
      return {
        ...state,
        pageLoading: action.payload,
      };

    case GLOBAL_ACTIONS.SET_GLOBAL_LOADING:
      return {
        ...state,
        globalLoading: action.payload,
      };

    // Notification Actions
    case GLOBAL_ACTIONS.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [...state.notifications, {
          id: Date.now(),
          timestamp: new Date(),
          ...action.payload,
        }],
      };

    case GLOBAL_ACTIONS.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(notification => notification.id !== action.payload),
      };

    case GLOBAL_ACTIONS.CLEAR_NOTIFICATIONS:
      return {
        ...state,
        notifications: [],
      };

    case GLOBAL_ACTIONS.SET_TOAST:
      return {
        ...state,
        toast: {
          id: Date.now(),
          timestamp: new Date(),
          ...action.payload,
        },
      };

    case GLOBAL_ACTIONS.CLEAR_TOAST:
      return {
        ...state,
        toast: null,
      };

    // Search Actions
    case GLOBAL_ACTIONS.SET_SEARCH_QUERY:
      return {
        ...state,
        searchQuery: action.payload,
      };

    case GLOBAL_ACTIONS.SET_SEARCH_RESULTS:
      return {
        ...state,
        searchResults: action.payload,
        searchLoading: false,
      };

    case GLOBAL_ACTIONS.SET_SEARCH_LOADING:
      return {
        ...state,
        searchLoading: action.payload,
      };

    case GLOBAL_ACTIONS.CLEAR_SEARCH:
      return {
        ...state,
        searchQuery: '',
        searchResults: [],
        searchLoading: false,
      };

    // Filter Actions
    case GLOBAL_ACTIONS.UPDATE_FILTERS:
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload,
        },
      };

    case GLOBAL_ACTIONS.RESET_FILTERS:
      return {
        ...state,
        filters: {
          category: '',
          priceRange: [0, 10000],
          materials: [],
          brands: [],
          rating: 0,
          availability: 'all',
          sortBy: 'featured',
        },
      };

    // Wishlist Actions
    case GLOBAL_ACTIONS.LOAD_WISHLIST:
      return {
        ...state,
        wishlist: action.payload,
      };

    case GLOBAL_ACTIONS.ADD_TO_WISHLIST:
      const isAlreadyInWishlist = state.wishlist.some(item => item.id === action.payload.id);
      if (isAlreadyInWishlist) return state;
      
      return {
        ...state,
        wishlist: [...state.wishlist, action.payload],
      };

    case GLOBAL_ACTIONS.REMOVE_FROM_WISHLIST:
      return {
        ...state,
        wishlist: state.wishlist.filter(item => item.id !== action.payload),
      };

    case GLOBAL_ACTIONS.CLEAR_WISHLIST:
      return {
        ...state,
        wishlist: [],
      };

    // Recently Viewed Actions
    case GLOBAL_ACTIONS.ADD_TO_RECENTLY_VIEWED:
      const filteredRecentlyViewed = state.recentlyViewed.filter(item => item.id !== action.payload.id);
      return {
        ...state,
        recentlyViewed: [action.payload, ...filteredRecentlyViewed].slice(0, 10), // Keep last 10 items
      };

    case GLOBAL_ACTIONS.CLEAR_RECENTLY_VIEWED:
      return {
        ...state,
        recentlyViewed: [],
      };

    // App Settings Actions
    case GLOBAL_ACTIONS.SET_CURRENCY:
      return {
        ...state,
        currency: action.payload,
      };

    case GLOBAL_ACTIONS.SET_LANGUAGE:
      return {
        ...state,
        language: action.payload,
      };

    // Error Actions
    case GLOBAL_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
      };

    case GLOBAL_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case GLOBAL_ACTIONS.SET_NETWORK_ERROR:
      return {
        ...state,
        networkError: action.payload,
      };

    default:
      return state;
  }
};

// Create Context
const GlobalContext = createContext();

// Context Provider Component
export const GlobalProvider = ({ children }) => {
  const [state, dispatch] = useReducer(globalReducer, initialState);

  // Load saved preferences on mount
  useEffect(() => {
    try {
      // Load theme preference
      const savedTheme = localStorage.getItem('theme') || 'light';
      if (savedTheme !== state.theme) {
        dispatch({ type: GLOBAL_ACTIONS.SET_THEME, payload: savedTheme });
      }

      // Load currency preference
      const savedCurrency = localStorage.getItem('currency') || 'USD';
      if (savedCurrency !== state.currency) {
        dispatch({ type: GLOBAL_ACTIONS.SET_CURRENCY, payload: savedCurrency });
      }

      // Load language preference
      const savedLanguage = localStorage.getItem('language') || 'en';
      if (savedLanguage !== state.language) {
        dispatch({ type: GLOBAL_ACTIONS.SET_LANGUAGE, payload: savedLanguage });
      }

      // Load wishlist from localStorage
      const savedWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      if (savedWishlist.length > 0) {
        dispatch({ type: GLOBAL_ACTIONS.LOAD_WISHLIST, payload: savedWishlist });
      }

      // Load recently viewed from localStorage
      const savedRecentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      if (savedRecentlyViewed.length > 0) {
        dispatch({ type: GLOBAL_ACTIONS.ADD_TO_RECENTLY_VIEWED, payload: savedRecentlyViewed });
      }
    } catch (error) {
      console.error('Error loading saved preferences:', error);
    }
  }, []);

  // Save preferences to localStorage when they change
  useEffect(() => {
    localStorage.setItem('theme', state.theme);
    localStorage.setItem('currency', state.currency);
    localStorage.setItem('language', state.language);
    localStorage.setItem('wishlist', JSON.stringify(state.wishlist));
    localStorage.setItem('recentlyViewed', JSON.stringify(state.recentlyViewed));
  }, [state.theme, state.currency, state.language, state.wishlist, state.recentlyViewed]);

  // Auto-clear toast messages
  useEffect(() => {
    if (state.toast) {
      const timer = setTimeout(() => {
        dispatch({ type: GLOBAL_ACTIONS.CLEAR_TOAST });
      }, state.toast.duration || 5000);

      return () => clearTimeout(timer);
    }
  }, [state.toast]);

  // UI Actions
  const setTheme = (theme) => {
    dispatch({ type: GLOBAL_ACTIONS.SET_THEME, payload: theme });
  };

  const toggleSidebar = (isOpen) => {
    dispatch({ type: GLOBAL_ACTIONS.TOGGLE_SIDEBAR, payload: isOpen });
  };

  const toggleMobileMenu = (isOpen) => {
    dispatch({ type: GLOBAL_ACTIONS.TOGGLE_MOBILE_MENU, payload: isOpen });
  };

  const toggleSearchModal = (isOpen) => {
    dispatch({ type: GLOBAL_ACTIONS.TOGGLE_SEARCH_MODAL, payload: isOpen });
  };

  const toggleWishlistDrawer = (isOpen) => {
    dispatch({ type: GLOBAL_ACTIONS.TOGGLE_WISHLIST_DRAWER, payload: isOpen });
  };

  // Loading Actions
  const setPageLoading = (loading) => {
    dispatch({ type: GLOBAL_ACTIONS.SET_PAGE_LOADING, payload: loading });
  };

  const setGlobalLoading = (loading) => {
    dispatch({ type: GLOBAL_ACTIONS.SET_GLOBAL_LOADING, payload: loading });
  };

  // Notification Actions
  const addNotification = (notification) => {
    dispatch({ type: GLOBAL_ACTIONS.ADD_NOTIFICATION, payload: notification });
  };

  const removeNotification = (id) => {
    dispatch({ type: GLOBAL_ACTIONS.REMOVE_NOTIFICATION, payload: id });
  };

  const clearNotifications = () => {
    dispatch({ type: GLOBAL_ACTIONS.CLEAR_NOTIFICATIONS });
  };

  const showToast = (message, type = 'info', duration = 5000) => {
    dispatch({ 
      type: GLOBAL_ACTIONS.SET_TOAST, 
      payload: { message, type, duration } 
    });
  };

  const hideToast = () => {
    dispatch({ type: GLOBAL_ACTIONS.CLEAR_TOAST });
  };

  // Search Actions
  const setSearchQuery = (query) => {
    dispatch({ type: GLOBAL_ACTIONS.SET_SEARCH_QUERY, payload: query });
  };

  const performSearch = async (query) => {
    try {
      dispatch({ type: GLOBAL_ACTIONS.SET_SEARCH_LOADING, payload: true });
      
      const response = await fetch(`/api/products/search?q=${encodeURIComponent(query)}`);
      const results = await response.json();
      
      dispatch({ type: GLOBAL_ACTIONS.SET_SEARCH_RESULTS, payload: results });
    } catch (error) {
      console.error('Search failed:', error);
      dispatch({ type: GLOBAL_ACTIONS.SET_SEARCH_RESULTS, payload: [] });
    }
  };

  const clearSearch = () => {
    dispatch({ type: GLOBAL_ACTIONS.CLEAR_SEARCH });
  };

  // Filter Actions
  const updateFilters = (newFilters) => {
    dispatch({ type: GLOBAL_ACTIONS.UPDATE_FILTERS, payload: newFilters });
  };

  const resetFilters = () => {
    dispatch({ type: GLOBAL_ACTIONS.RESET_FILTERS });
  };

  // Wishlist Actions
  const addToWishlist = (product) => {
    dispatch({ type: GLOBAL_ACTIONS.ADD_TO_WISHLIST, payload: product });
    showToast('Added to wishlist!', 'success');
  };

  const removeFromWishlist = (productId) => {
    dispatch({ type: GLOBAL_ACTIONS.REMOVE_FROM_WISHLIST, payload: productId });
    showToast('Removed from wishlist', 'info');
  };

  const isInWishlist = (productId) => {
    return state.wishlist.some(item => item.id === productId);
  };

  const clearWishlist = () => {
    dispatch({ type: GLOBAL_ACTIONS.CLEAR_WISHLIST });
  };

  // Recently Viewed Actions
  const addToRecentlyViewed = (product) => {
    dispatch({ type: GLOBAL_ACTIONS.ADD_TO_RECENTLY_VIEWED, payload: product });
  };

  const clearRecentlyViewed = () => {
    dispatch({ type: GLOBAL_ACTIONS.CLEAR_RECENTLY_VIEWED });
  };

  // App Settings Actions
  const setCurrency = (currency) => {
    dispatch({ type: GLOBAL_ACTIONS.SET_CURRENCY, payload: currency });
  };

  const setLanguage = (language) => {
    dispatch({ type: GLOBAL_ACTIONS.SET_LANGUAGE, payload: language });
  };

  // Error Actions
  const setError = (error) => {
    dispatch({ type: GLOBAL_ACTIONS.SET_ERROR, payload: error });
  };

  const clearError = () => {
    dispatch({ type: GLOBAL_ACTIONS.CLEAR_ERROR });
  };

  const setNetworkError = (hasError) => {
    dispatch({ type: GLOBAL_ACTIONS.SET_NETWORK_ERROR, payload: hasError });
  };

  // Context value
  const value = {
    // State
    ...state,
    
    // UI Actions
    setTheme,
    toggleSidebar,
    toggleMobileMenu,
    toggleSearchModal,
    toggleWishlistDrawer,
    
    // Loading Actions
    setPageLoading,
    setGlobalLoading,
    
    // Notification Actions
    addNotification,
    removeNotification,
    clearNotifications,
    showToast,
    hideToast,
    
    // Search Actions
    setSearchQuery,
    performSearch,
    clearSearch,
    
    // Filter Actions
    updateFilters,
    resetFilters,
    
    // Wishlist Actions
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
    
    // Recently Viewed Actions
    addToRecentlyViewed,
    clearRecentlyViewed,
    
    // App Settings Actions
    setCurrency,
    setLanguage,
    
    // Error Actions
    setError,
    clearError,
    setNetworkError,
  };

  return (
    <GlobalContext.Provider value={value}>
      {children}
    </GlobalContext.Provider>
  );
};

// Custom Hook to use Global Context
export const useGlobal = () => {
  const context = useContext(GlobalContext);
  
  if (!context) {
    throw new Error('useGlobal must be used within a GlobalProvider');
  }
  
  return context;
};

export default GlobalContext;