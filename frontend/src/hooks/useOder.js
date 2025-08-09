// frontend/src/hooks/useOrder.js
import { useState, useEffect } from 'react';
import { orderService } from '../services/orderService';

// Hook for managing orders list
export const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await orderService.getMyOrders();
      setOrders(response.data || response);
    } catch (err) {
      setError(err.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return { 
    orders, 
    loading, 
    error, 
    refetchOrders: fetchOrders,
    setOrders
  };
};

// Hook for managing order details
export const useOrderDetails = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrderDetails = async (orderId) => {
    if (!orderId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await orderService.getOrderDetails(orderId);
      setOrder(response.data || response);
    } catch (err) {
      setError(err.message);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  return { 
    order, 
    loading, 
    error, 
    fetchOrderDetails,
    setOrder
  };
};

// Hook for managing reviews
export const useReview = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addReview = async (orderId, reviewData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await orderService.addReview(orderId, reviewData);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateReview = async (reviewId, reviewData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await orderService.updateReview(reviewId, reviewData);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };


  const getUserReview = async (productId) => {
    try {
      const response = await orderService.getUserReview(productId);
      return response?.data || response;
    } catch (err) {
      return null; // Return null if no review found
    }
  };

  const getProductRating = async (productId) => {
    try {
      const response = await orderService.getProductRating(productId);
      return response?.data || response;
    } catch (err) {
      return null;
    }
  };

  return { 
    addReview, 
    updateReview,
    getUserReview, 
    getProductRating,
    loading, 
    error 
  };
};