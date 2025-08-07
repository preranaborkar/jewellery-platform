// services/orderService.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Order Service Functions
export const orderService = {
  // Create order from cart
  createOrder: async (orderData) => {
    try {
      const response = await api.post('/orders', orderData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create order');
    }
  },

  // Create Stripe checkout session
  createStripeCheckout: async (orderData) => {
    try {
      const response = await api.post('/orders/create-stripe-checkout', orderData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create checkout session');
    }
  },

  // Verify Stripe payment
  verifyStripePayment: async (sessionId) => {
    try {
      const response = await api.post('/orders/verify-stripe-payment', { sessionId });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Payment verification failed');
    }
  },

  // Get user orders
  getUserOrders: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await api.get(`/orders${queryParams ? `?${queryParams}` : ''}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch orders');
    }
  },

  // Get single order
  getOrderById: async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch order');
    }
  },

  // Cancel order
  cancelOrder: async (orderId) => {
    try {
      const response = await api.put(`/orders/${orderId}/cancel`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to cancel order');
    }
  },

  // Update payment status (for payment integration)
  updatePaymentStatus: async (orderId, paymentData) => {
    try {
      const response = await api.put(`/orders/${orderId}/payment`, paymentData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update payment status');
    }
  },

  // Process Stripe payment (redirect to Stripe Checkout)
  processStripePayment: async (orderData) => {
    try {
      // Create checkout session
      const response = await orderService.createStripeCheckout(orderData);
      
      if (response.success && response.data.sessionUrl) {
        // Redirect to Stripe checkout
        window.location.href = response.data.sessionUrl;
        return { success: true };
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      throw error;
    }
  }
};

export default orderService;