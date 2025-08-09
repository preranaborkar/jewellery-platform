// frontend/src/services/orderService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with token
const createAxiosInstance = () => {
  const token = localStorage.getItem('token');
  return axios.create({
    baseURL: API_URL,
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    }
  });
};

export const orderService = {
  // Get user's orders
  getMyOrders: async () => {
    try {
      const api = createAxiosInstance();
      const response = await api.get('/orders/my-orders');
      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch orders');
    }
  },

  // Get single order details
  getOrderDetails: async (orderId) => {
    try {
      const api = createAxiosInstance();
      const response = await api.get(`/orders/order/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order details:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch order details');
    }
  },

  // Add review for a product
  addReview: async (orderId, reviewData) => {
    try {
      const api = createAxiosInstance();
      const response = await api.post(`/orders/order/${orderId}/review`, reviewData);
      return response.data;
    } catch (error) {
      console.error('Error adding review:', error);
      throw new Error(error.response?.data?.message || 'Failed to add review');
    }
  },

  // Update existing review
  updateReview: async (reviewId, reviewData) => {
    try {
      const api = createAxiosInstance();
      const response = await api.put(`/reviews/${reviewId}`, reviewData);
      return response.data;
    } catch (error) {
      console.error('Error updating review:', error);
      throw new Error(error.response?.data?.message || 'Failed to update review');
    }
  },


  // Get user's review for a product
  getUserReview: async (productId) => {
    try {
      const api = createAxiosInstance();
      const response = await api.get(`/reviews/user/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user review:', error);
      return null; // Return null if no review found instead of throwing error
    }
  },

  // Get product rating summary
  getProductRating: async (productId) => {
    try {
      const api = createAxiosInstance();
      const response = await api.get(`/reviews/product/${productId}/rating`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product rating:', error);
      return null;
    }
  },

  // Track order status
  trackOrder: async (orderId) => {
    try {
      const api = createAxiosInstance();
      const response = await api.get(`/orders/track/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error tracking order:', error);
      throw new Error(error.response?.data?.message || 'Failed to track order');
    }
  }
};