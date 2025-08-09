// hooks/useAdminOrder.js
import { useState, useEffect } from 'react';
import orderService from '../services/adminOrderService';

export const useOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchOrders = async (page = 1) => {
        setLoading(true);
        try {
            const data = await orderService.getAllOrders(page);
            setOrders(data.orders);
            setTotalPages(data.totalPages);
            setCurrentPage(data.currentPage);
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
        setLoading(false);
    };

    const updateOrderStatus = async (orderId, statusData) => {
        try {
            await orderService.updateOrderStatus(orderId, statusData);
            fetchOrders(currentPage); // Refresh orders
        } catch (error) {
            console.error('Error updating order:', error);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    return {
        orders,
        loading,
        currentPage,
        totalPages,
        fetchOrders,
        updateOrderStatus
    };
};

export const useAdminStats = () => {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalCustomers: 0,
        totalProducts: 0,
        pendingOrders: 0,
        lowStockProducts: 0,
        monthlyRevenue: 0,
        revenueChange: 0,
        ordersChange: 0,
        customersChange: 0,
        productsChange: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchStats = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const statsData = await orderService.getStats();
            setStats(statsData);
            
        } catch (err) {
            console.error('Error fetching admin stats:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    return {
        stats,
        loading,
        error,
        refreshStats: fetchStats
    };
};