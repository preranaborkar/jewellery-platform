// services/adminOrderService.js
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

const orderService = {
    getAllOrders: async (page = 1) => {
        const api = createAxiosInstance();
        const response = await api.get(`/admin/orders?page=${page}`);
        return response.data;
    },

    getOrderDetails: async (orderId) => {
        const api = createAxiosInstance();
        const response = await api.get(`/admin/orders/${orderId}`);
        return response.data;
    },

    updateOrderStatus: async (orderId, data) => {
        const api = createAxiosInstance();
        const response = await api.put(`/admin/orders/${orderId}/status`, data);
        return response.data;
    },

    getStats: async () => {
        const api = createAxiosInstance();
        const response = await api.get(`/admin/orders/stats`);
        return response.data;
    }
};

export default orderService;