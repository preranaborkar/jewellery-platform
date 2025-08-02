// hooks/useOrders.js
import { useState, useEffect, useCallback } from 'react';
import ordersService from '../services/orderService';
import { useAuth } from '../context/AuthContext';

export const useOrders = (initialFilters = {}) => {
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState(null);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        page: 1,
        limit: 10,
        ...initialFilters
    });

    const { isAdmin } = useAuth();

    // Fetch orders
    const fetchOrders = useCallback(async (filterParams = filters) => {
        if (!isAdmin()) {
            setError('Unauthorized access');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await ordersService.getAllOrders(filterParams);
            
            setOrders(response.data.orders);
            setStats(response.data.stats);
            setPagination(response.data.pagination);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching orders:', err);
        } finally {
            setLoading(false);
        }
    }, [filters, isAdmin]);

    // Update filters and fetch
    const updateFilters = useCallback((newFilters) => {
        const updatedFilters = { ...filters, ...newFilters, page: 1 };
        setFilters(updatedFilters);
        fetchOrders(updatedFilters);
    }, [filters, fetchOrders]);

    // Change page
    const changePage = useCallback((page) => {
        const updatedFilters = { ...filters, page };
        setFilters(updatedFilters);
        fetchOrders(updatedFilters);
    }, [filters, fetchOrders]);

    // Refresh orders
    const refreshOrders = useCallback(() => {
        fetchOrders(filters);
    }, [fetchOrders, filters]);

    // Clear filters
    const clearFilters = useCallback(() => {
        const clearedFilters = { page: 1, limit: 10 };
        setFilters(clearedFilters);
        fetchOrders(clearedFilters);
    }, [fetchOrders]);

    // Initial fetch
    useEffect(() => {
        fetchOrders();
    }, []);

    return {
        orders,
        stats,
        pagination,
        loading,
        error,
        filters,
        updateFilters,
        changePage,
        refreshOrders,
        clearFilters
    };
};

// Hook for single order
export const useOrder = (orderId) => {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const { isAdmin } = useAuth();

    const fetchOrder = useCallback(async () => {
        if (!isAdmin() || !orderId) {
            setError('Unauthorized access or invalid order ID');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await ordersService.getOrderById(orderId);
            setOrder(response.data.order);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching order:', err);
        } finally {
            setLoading(false);
        }
    }, [orderId, isAdmin]);

    const updateOrderStatus = useCallback(async (statusData) => {
        if (!isAdmin() || !orderId) {
            throw new Error('Unauthorized access');
        }

        try {
            setLoading(true);
            const response = await ordersService.updateOrderStatus(orderId, statusData);
            setOrder(response.data.order);
            return response.data.order;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [orderId, isAdmin]);

    useEffect(() => {
        if (orderId) {
            fetchOrder();
        }
    }, [orderId, fetchOrder]);

    return {
        order,
        loading,
        error,
        updateOrderStatus,
        refreshOrder: fetchOrder
    };
};