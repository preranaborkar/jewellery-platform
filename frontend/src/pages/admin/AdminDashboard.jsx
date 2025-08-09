import { Users, Package, FileText, ShoppingCart, DollarSign, Eye, Plus, AlertTriangle, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAdminStats } from '../../hooks/useAdminOrder';

const AdminDashboard = () => {
    const { isAdmin, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const { stats,  loading, error } = useAdminStats();

    // Check authorization
    if (!isAuthenticated || !isAdmin()) {
        return (
            <div className="min-h-screen bg-[#E4D4C8] flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
                    <h2 className="text-2xl font-bold text-[#523A28] mb-4 text-center">
                        Access Denied
                    </h2>
                    <p className="text-[#A47551] text-center">
                        Only administrators can access this page.
                    </p>
                </div>
            </div>
        );
    }

    // Format currency
    const formatCurrency = (amount) => {
        return `₹${amount.toLocaleString('en-IN')}`;
    };

    // Format change percentage
    const formatChange = (change) => {
        return change > 0 ? `+${change}%` : `${change}%`;
    };

    const statsCards = [
        { 
            title: 'Total Revenue', 
            value: formatCurrency(stats.totalRevenue), 
            change: formatChange(stats.revenueChange), 
            icon: DollarSign, 
            trend: stats.revenueChange >= 0 ? 'up' : 'down' 
        },
        { 
            title: 'Orders', 
            value: stats.totalOrders.toLocaleString(), 
            change: formatChange(stats.ordersChange), 
            icon: ShoppingCart, 
            trend: stats.ordersChange >= 0 ? 'up' : 'down' 
        },
        { 
            title: 'Customers', 
            value: stats.totalCustomers.toLocaleString(), 
            change: formatChange(stats.customersChange), 
            icon: Users, 
            trend: stats.customersChange >= 0 ? 'up' : 'down' 
        },
        { 
            title: 'Products', 
            value: stats.totalProducts.toLocaleString(), 
            change: formatChange(stats.productsChange), 
            icon: Package, 
            trend: stats.productsChange >= 0 ? 'up' : 'down' 
        }
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#E4D4C8] to-[#D0B49F] flex items-center justify-center">
                <div className="text-[#523A28] text-xl">Loading dashboard...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#E4D4C8] to-[#D0B49F]">
            <main className="p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-[#523A28] mb-2">Admin Dashboard</h1>
                        <p className="text-[#A47551]">Welcome back! Here's what's happening with your store.</p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {statsCards.map((stat, index) => (
                            <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 border border-[#D0B49F]/20">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 rounded-lg bg-[#E4D4C8]">
                                        <stat.icon size={24} className="text-[#A47551]" />
                                    </div>
                                    <span className={`text-sm font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                        {stat.change}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-[#523A28] mb-1">{stat.value}</h3>
                                    <p className="text-[#A47551] text-sm">{stat.title}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Additional Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white rounded-xl p-6 shadow-lg border border-[#D0B49F]/20">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 rounded-lg bg-orange-100">
                                    <AlertTriangle size={24} className="text-orange-600" />
                                </div>
                                <span className="text-sm font-medium text-orange-600">Pending</span>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-[#523A28] mb-1">{stats.pendingOrders}</h3>
                                <p className="text-[#A47551] text-sm">Pending Orders</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-lg border border-[#D0B49F]/20">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 rounded-lg bg-red-100">
                                    <Package size={24} className="text-red-600" />
                                </div>
                                <span className="text-sm font-medium text-red-600">Low Stock</span>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-[#523A28] mb-1">{stats.lowStockProducts}</h3>
                                <p className="text-[#A47551] text-sm">Low Stock Items</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-lg border border-[#D0B49F]/20">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 rounded-lg bg-green-100">
                                    <TrendingUp size={24} className="text-green-600" />
                                </div>
                                <span className="text-sm font-medium text-green-600">This Month</span>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-[#523A28] mb-1">{formatCurrency(stats.monthlyRevenue)}</h3>
                                <p className="text-[#A47551] text-sm">Monthly Revenue</p>
                            </div>
                        </div>
                    </div>

                   
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;