// import React, { useState } from 'react';
// import { useOrder } from '../../hooks/useOder';
// import { useAuth } from '../../context/AuthContext';

// const Orders = () => {
//     const { isAdmin, isAuthenticated } = useAuth();
//     const {
//         orders,
//         stats,
//         pagination,
//         loading,
//         error,
//         updateFilters,
//         changePage,
//         refreshOrders,
//         clearFilters
//     } = useOrder();

//     const [filterForm, setFilterForm] = useState({
//         orderStatus: '',
//         paymentStatus: '',
//         paymentMethod: '',
//         startDate: '',
//         endDate: ''
//     });

//     const [selectedOrder, setSelectedOrder] = useState(null);

//     // Check authorization
//     if (!isAuthenticated || !isAdmin()) {
//         return (
//             <div className="min-h-screen bg-[#E4D4C8] flex items-center justify-center">
//                 <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
//                     <h2 className="text-2xl font-bold text-[#523A28] mb-4 text-center">
//                         Access Denied
//                     </h2>
//                     <p className="text-[#A47551] text-center">
//                         Only administrators can access this page.
//                     </p>
//                 </div>
//             </div>
//         );
//     }

//     const handleFilterChange = (e) => {
//         setFilterForm({
//             ...filterForm,
//             [e.target.name]: e.target.value
//         });
//     };

//     const applyFilters = () => {
//         updateFilters(filterForm);
//     };

//     const resetFilters = () => {
//         setFilterForm({
//             orderStatus: '',
//             paymentStatus: '',
//             paymentMethod: '',
//             startDate: '',
//             endDate: ''
//         });
//         clearFilters();
//     };

//     const getStatusColor = (status, type) => {
//         const statusColors = {
//             orderStatus: {
//                 pending: 'bg-yellow-100 text-yellow-800',
//                 confirmed: 'bg-blue-100 text-blue-800',
//                 delivered: 'bg-green-100 text-green-800',
//                 cancelled: 'bg-red-100 text-red-800'
//             },
//             paymentStatus: {
//                 pending: 'bg-yellow-100 text-yellow-800',
//                 completed: 'bg-green-100 text-green-800',
//                 failed: 'bg-red-100 text-red-800',
//                 refunded: 'bg-purple-100 text-purple-800'
//             }
//         };
//         return statusColors[type][status] || 'bg-gray-100 text-gray-800';
//     };

//     const formatDate = (dateString) => {
//         return new Date(dateString).toLocaleDateString('en-IN', {
//             year: 'numeric',
//             month: 'short',
//             day: 'numeric',
//             hour: '2-digit',
//             minute: '2-digit'
//         });
//     };

//     const formatCurrency = (amount) => {
//         return new Intl.NumberFormat('en-IN', {
//             style: 'currency',
//             currency: 'INR'
//         }).format(amount);
//     };

//     // Safe array with fallback to empty array
//     const safeOrders = orders || [];

//     if (loading && safeOrders.length === 0) {
//         return (
//             <div className="min-h-screen bg-[#E4D4C8] flex items-center justify-center">
//                 <div className="text-[#523A28] text-xl">Loading orders...</div>
//             </div>
//         );
//     }

//     return (
//         <div className="min-h-screen bg-[#E4D4C8] p-4 md:p-6">
//             <div className="max-w-7xl mx-auto">
//                 {/* Header */}
//                 <div className="mb-8">
//                     <h1 className="text-3xl md:text-4xl font-bold text-[#523A28] mb-2">
//                         Orders Management
//                     </h1>
//                     <p className="text-[#A47551]">
//                         Manage and track all customer orders
//                     </p>
//                 </div>

//                 {/* Stats Cards */}
//                 {stats && (
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
//                         <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-[#A47551]">
//                             <h3 className="text-sm font-medium text-[#523A28] mb-2">Total Orders</h3>
//                             <p className="text-2xl font-bold text-[#A47551]">{stats.totalOrders}</p>
//                         </div>
//                         <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-green-500">
//                             <h3 className="text-sm font-medium text-[#523A28] mb-2">Total Revenue</h3>
//                             <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalRevenue)}</p>
//                         </div>
//                         <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-yellow-500">
//                             <h3 className="text-sm font-medium text-[#523A28] mb-2">Pending Orders</h3>
//                             <p className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</p>
//                         </div>
//                         <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-blue-500">
//                             <h3 className="text-sm font-medium text-[#523A28] mb-2">Completed Orders</h3>
//                             <p className="text-2xl font-bold text-blue-600">{stats.completedOrders}</p>
//                         </div>
//                     </div>
//                 )}

//                 {/* Filters */}
//                 <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
//                     <h2 className="text-xl font-semibold text-[#523A28] mb-4">Filters</h2>
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
//                         <select
//                             name="orderStatus"
//                             value={filterForm.orderStatus}
//                             onChange={handleFilterChange}
//                             className="p-3 border border-[#D0B49F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A47551]"
//                         >
//                             <option value="">All Order Status</option>
//                             <option value="pending">Pending</option>
//                             <option value="confirmed">Confirmed</option>
//                             <option value="delivered">Delivered</option>
//                             <option value="cancelled">Cancelled</option>
//                         </select>

//                         <select
//                             name="paymentStatus"
//                             value={filterForm.paymentStatus}
//                             onChange={handleFilterChange}
//                             className="p-3 border border-[#D0B49F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A47551]"
//                         >
//                             <option value="">All Payment Status</option>
//                             <option value="pending">Pending</option>
//                             <option value="completed">Completed</option>
//                             <option value="failed">Failed</option>
//                             <option value="refunded">Refunded</option>
//                         </select>

//                         <select
//                             name="paymentMethod"
//                             value={filterForm.paymentMethod}
//                             onChange={handleFilterChange}
//                             className="p-3 border border-[#D0B49F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A47551]"
//                         >
//                             <option value="">All Payment Methods</option>
//                             <option value="razorpay">Razorpay</option>
//                             <option value="cod">Cash on Delivery</option>
//                             <option value="upi">UPI</option>
//                             <option value="card">Card</option>
//                         </select>

//                         <input
//                             type="date"
//                             name="startDate"
//                             value={filterForm.startDate}
//                             onChange={handleFilterChange}
//                             className="p-3 border border-[#D0B49F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A47551]"
//                             placeholder="Start Date"
//                         />

//                         <input
//                             type="date"
//                             name="endDate"
//                             value={filterForm.endDate}
//                             onChange={handleFilterChange}
//                             className="p-3 border border-[#D0B49F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A47551]"
//                             placeholder="End Date"
//                         />
//                     </div>

//                     <div className="flex flex-wrap gap-4 mt-4">
//                         <button
//                             onClick={applyFilters}
//                             className="bg-[#A47551] text-white px-6 py-2 rounded-lg hover:bg-[#523A28] transition-colors"
//                         >
//                             Apply Filters
//                         </button>
//                         <button
//                             onClick={resetFilters}
//                             className="bg-[#D0B49F] text-[#523A28] px-6 py-2 rounded-lg hover:bg-[#A47551] hover:text-white transition-colors"
//                         >
//                             Reset
//                         </button>
//                         <button
//                             onClick={refreshOrders}
//                             className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
//                         >
//                             Refresh
//                         </button>
//                     </div>
//                 </div>

//                 {/* Error Message */}
//                 {error && (
//                     <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//                         {error}
//                     </div>
//                 )}

//                 {/* Orders List */}
//                 <div className="bg-white rounded-lg shadow-lg overflow-hidden">
//                     <div className="overflow-x-auto">
//                         <table className="min-w-full">
//                             <thead className="bg-[#523A28] text-white">
//                                 <tr>
//                                     <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
//                                         Amount
//                                     </th>
//                                     <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
//                                         Status
//                                     </th>
//                                     <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
//                                         Payment
//                                     </th>
//                                     <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
//                                         Date
//                                     </th>
//                                     <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
//                                         Actions
//                                     </th>
//                                 </tr>
//                             </thead>
//                             <tbody className="bg-white divide-y divide-gray-200">
//                                 {safeOrders.length === 0 ? (
//                                     <tr>
//                                         <td colSpan="7" className="px-6 py-8 text-center text-[#A47551]">
//                                             No orders found
//                                         </td>
//                                     </tr>
//                                 ) : (
//                                     safeOrders.map((order) => (
//                                         <tr key={order._id} className="hover:bg-[#E4D4C8] transition-colors">
//                                             <td className="px-6 py-4 whitespace-nowrap">
//                                                 <div>
//                                                     <div className="text-sm font-medium text-[#523A28]">
//                                                         #{order.orderNumber}
//                                                     </div>
//                                                     <div className="text-sm text-[#A47551]">
//                                                         {order.products?.length || 0} item{(order.products?.length || 0) > 1 ? 's' : ''}
//                                                     </div>
//                                                 </div>
//                                             </td>
//                                             <td className="px-6 py-4 whitespace-nowrap">
//                                                 <div>
//                                                     <div className="text-sm font-medium text-[#523A28]">
//                                                         {order.user?.firstName} {order.user?.lastName}
//                                                     </div>
//                                                     <div className="text-sm text-[#A47551]">
//                                                         {order.user?.email}
//                                                     </div>
//                                                 </div>
//                                             </td>
//                                             <td className="px-6 py-4 whitespace-nowrap">
//                                                 <div className="text-sm font-medium text-[#523A28]">
//                                                     {formatCurrency(order.totalAmount)}
//                                                 </div>
//                                                 <div className="text-xs text-[#A47551]">
//                                                     {order.paymentMethod?.toUpperCase()}
//                                                 </div>
//                                             </td>
//                                             <td className="px-6 py-4 whitespace-nowrap">
//                                                 <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.orderStatus, 'orderStatus')}`}>
//                                                     {order.orderStatus}
//                                                 </span>
//                                             </td>
//                                             <td className="px-6 py-4 whitespace-nowrap">
//                                                 <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.paymentStatus, 'paymentStatus')}`}>
//                                                     {order.paymentStatus}
//                                                 </span>
//                                             </td>
//                                             <td className="px-6 py-4 whitespace-nowrap text-sm text-[#A47551]">
//                                                 {formatDate(order.createdAt)}
//                                             </td>
//                                             <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                                                 <button
//                                                     onClick={() => setSelectedOrder(order)}
//                                                     className="text-[#A47551] hover:text-[#523A28] mr-3"
//                                                 >
//                                                     View
//                                                 </button>
//                                                 <button
//                                                     onClick={() => {/* Add edit functionality */}}
//                                                     className="text-blue-600 hover:text-blue-900"
//                                                 >
//                                                     Edit
//                                                 </button>
//                                             </td>
//                                         </tr>
//                                     ))
//                                 )}
//                             </tbody>
//                         </table>
//                     </div>

//                     {/* Pagination */}
//                     {pagination && pagination.totalPages > 1 && (
//                         <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
//                             <div className="flex-1 flex justify-between items-center">
//                                 <div className="text-sm text-[#A47551]">
//                                     Showing {((pagination.currentPage - 1) * 10) + 1} to {Math.min(pagination.currentPage * 10, pagination.totalOrders)} of {pagination.totalOrders} orders
//                                 </div>
//                                 <div className="flex space-x-2">
//                                     <button
//                                         onClick={() => changePage(pagination.currentPage - 1)}
//                                         disabled={!pagination.hasPrevPage}
//                                         className={`px-4 py-2 text-sm rounded-lg ${
//                                             pagination.hasPrevPage
//                                                 ? 'bg-[#A47551] text-white hover:bg-[#523A28]'
//                                                 : 'bg-gray-300 text-gray-500 cursor-not-allowed'
//                                         }`}
//                                     >
//                                         Previous
//                                     </button>
//                                     <span className="px-4 py-2 text-sm text-[#523A28]">
//                                         Page {pagination.currentPage} of {pagination.totalPages}
//                                     </span>
//                                     <button
//                                         onClick={() => changePage(pagination.currentPage + 1)}
//                                         disabled={!pagination.hasNextPage}
//                                         className={`px-4 py-2 text-sm rounded-lg ${
//                                             pagination.hasNextPage
//                                                 ? 'bg-[#A47551] text-white hover:bg-[#523A28]'
//                                                 : 'bg-gray-300 text-gray-500 cursor-not-allowed'
//                                         }`}
//                                     >
//                                         Next
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>
//                     )}
//                 </div>

//                 {/* Order Detail Modal */}
//                 {selectedOrder && (
//                     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//                         <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
//                             <div className="p-6">
//                                 <div className="flex justify-between items-center mb-6">
//                                     <h2 className="text-2xl font-bold text-[#523A28]">
//                                         Order Details - #{selectedOrder.orderNumber}
//                                     </h2>
//                                     <button
//                                         onClick={() => setSelectedOrder(null)}
//                                         className="text-gray-500 hover:text-gray-700 text-2xl"
//                                     >
//                                         ×
//                                     </button>
//                                 </div>

//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//                                     <div>
//                                         <h3 className="text-lg font-semibold text-[#523A28] mb-3">Customer Information</h3>
//                                         <div className="space-y-2">
//                                             <p><span className="font-medium">Name:</span> {selectedOrder.user?.firstName} {selectedOrder.user?.lastName}</p>
//                                             <p><span className="font-medium">Email:</span> {selectedOrder.user?.email}</p>
//                                             <p><span className="font-medium">Phone:</span> {selectedOrder.user?.phone}</p>
//                                         </div>
//                                     </div>

//                                     <div>
//                                         <h3 className="text-lg font-semibold text-[#523A28] mb-3">Order Information</h3>
//                                         <div className="space-y-2">
//                                             <p><span className="font-medium">Order Date:</span> {formatDate(selectedOrder.createdAt)}</p>
//                                             <p><span className="font-medium">Payment Method:</span> {selectedOrder.paymentMethod?.toUpperCase()}</p>
//                                             <p><span className="font-medium">Transaction ID:</span> {selectedOrder.transactionId || 'N/A'}</p>
//                                         </div>
//                                     </div>
//                                 </div>

//                                 <div className="mb-6">
//                                     <h3 className="text-lg font-semibold text-[#523A28] mb-3">Billing Address</h3>
//                                     <div className="bg-[#E4D4C8] p-4 rounded-lg">
//                                         <p>{selectedOrder.billingAddress?.street}</p>
//                                         <p>{selectedOrder.billingAddress?.city}, {selectedOrder.billingAddress?.state} {selectedOrder.billingAddress?.zipCode}</p>
//                                         <p>{selectedOrder.billingAddress?.country}</p>
//                                     </div>
//                                 </div>

//                                 <div className="mb-6">
//                                     <h3 className="text-lg font-semibold text-[#523A28] mb-3">Products</h3>
//                                     <div className="space-y-3">
//                                         {(selectedOrder.products || []).map((item, index) => (
//                                             <div key={index} className="flex justify-between items-center p-4 bg-[#E4D4C8] rounded-lg">
//                                                 <div>
//                                                     <p className="font-medium text-[#523A28]">{item.product?.name || 'Product Name'}</p>
//                                                     <p className="text-sm text-[#A47551]">Quantity: {item.quantity}</p>
//                                                 </div>
//                                                 <div className="text-right">
//                                                     <p className="font-medium text-[#523A28]">{formatCurrency(item.price)}</p>
//                                                     <p className="text-sm text-[#A47551]">Total: {formatCurrency(item.price * item.quantity)}</p>
//                                                 </div>
//                                             </div>
//                                         ))}
//                                     </div>
//                                 </div>

//                                 <div className="border-t pt-4">
//                                     <div className="flex justify-between items-center mb-2">
//                                         <span className="text-[#A47551]">Subtotal:</span>
//                                         <span className="text-[#523A28]">{formatCurrency(selectedOrder.subtotal)}</span>
//                                     </div>
//                                     <div className="flex justify-between items-center mb-2">
//                                         <span className="text-[#A47551]">Tax:</span>
//                                         <span className="text-[#523A28]">{formatCurrency(selectedOrder.tax)}</span>
//                                     </div>
//                                     <div className="flex justify-between items-center mb-4">
//                                         <span className="text-[#A47551]">Shipping:</span>
//                                         <span className="text-[#523A28]">{formatCurrency(selectedOrder.shipping)}</span>
//                                     </div>
//                                     <div className="flex justify-between items-center text-xl font-bold border-t pt-2">
//                                         <span className="text-[#523A28]">Total:</span>
//                                         <span className="text-[#523A28]">{formatCurrency(selectedOrder.totalAmount)}</span>
//                                     </div>
//                                 </div>

//                                 <div className="flex justify-between items-center mt-6 pt-4 border-t">
//                                     <div className="flex space-x-4">
//                                         <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedOrder.orderStatus, 'orderStatus')}`}>
//                                             {selectedOrder.orderStatus}
//                                         </span>
//                                         <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedOrder.paymentStatus, 'paymentStatus')}`}>
//                                             {selectedOrder.paymentStatus}
//                                         </span>
//                                     </div>
//                                     <div className="flex space-x-2">
//                                         <button
//                                             onClick={() => {/* Add update status functionality */}}
//                                             className="bg-[#A47551] text-white px-4 py-2 rounded-lg hover:bg-[#523A28] transition-colors"
//                                         >
//                                             Update Status
//                                         </button>
//                                         <button
//                                             onClick={() => setSelectedOrder(null)}
//                                             className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
//                                         >
//                                             Close
//                                         </button>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default Orders;