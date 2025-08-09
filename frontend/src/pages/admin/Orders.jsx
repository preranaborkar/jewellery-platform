import React, { useState } from 'react';
import { Eye, Edit } from 'lucide-react';
import { useOrders } from '../../hooks/useAdminOrder';



const OrderModal = ({ order, isOpen, onClose, onUpdate }) => {
  const [status, setStatus] = useState('');
  const [tracking, setTracking] = useState('');

  if (!isOpen || !order) return null;

  const handleUpdate = () => {
    onUpdate(order._id, { orderStatus: status, trackingNumber: tracking });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96" style={{ backgroundColor: '#E4D4C8' }}>
        <h3 className="text-xl font-bold mb-4" style={{ color: '#523A28' }}>
          Order: {order.orderNumber}
        </h3>
        
        <div className="space-y-4">
          <div>
            <p><strong>Customer:</strong> {order.user.firstName} {order.user.lastName}</p>
            <p><strong>Email:</strong> {order.user.email}</p>
            <p><strong>Amount:</strong> ₹{order.totalAmount}</p>
            <p><strong>Current Status:</strong> {order.orderStatus}</p>
          </div>

          <div>
            <label className="block mb-2 font-medium">Update Status:</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Select Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 font-medium">Tracking Number:</label>
            <input
              type="text"
              value={tracking}
              onChange={(e) => setTracking(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter tracking number"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleUpdate}
              className="px-4 py-2 text-white rounded"
              style={{ backgroundColor: '#523A28' }}
            >
              Update
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded"
              style={{ backgroundColor: '#A47551', color: 'white' }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminOrdersPage = () => {
  const { orders, loading, currentPage, totalPages, updateOrderStatus } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const getStatusColor = (status) => {
    const colors = {
      pending: '#E4D4C8',
      confirmed: '#D0B49F',
      processing: '#A47551',
      shipped: '#523A28',
      delivered: '#2D5016',
      cancelled: '#DC2626'
    };
    return colors[status] || '#E4D4C8';
  };

  const openModal = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#E4D4C8' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#523A28' }}></div>
          <p style={{ color: '#523A28' }}>Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#E4D4C8' }}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6" style={{ color: '#523A28' }}>
          Orders Management
        </h1>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <table className="w-full">
            <thead style={{ backgroundColor: '#523A28' }}>
              <tr>
                <th className="px-6 py-3 text-left text-white">Order</th>
                <th className="px-6 py-3 text-left text-white">Customer</th>
                <th className="px-6 py-3 text-left text-white">Amount</th>
                <th className="px-6 py-3 text-left text-white">Status</th>
                <th className="px-6 py-3 text-left text-white">Date</th>
                <th className="px-6 py-3 text-left text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr key={order._id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium" style={{ color: '#523A28' }}>{order.orderNumber}</p>
                      <p className="text-sm" style={{ color: '#A47551' }}>{order.products.length} items</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium" style={{ color: '#523A28' }}>
                        {order.user.firstName} {order.user.lastName}
                      </p>
                      <p className="text-sm" style={{ color: '#A47551' }}>{order.user.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold" style={{ color: '#523A28' }}>
                    ₹{order.totalAmount}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="px-3 py-1 rounded-full text-sm font-medium text-white"
                      style={{ backgroundColor: getStatusColor(order.orderStatus) }}
                    >
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4" style={{ color: '#A47551' }}>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      
                      <button
                        onClick={() => openModal(order)}
                        className="p-2 rounded hover:opacity-80"
                        style={{ backgroundColor: '#A47551', color: 'white' }}
                      >
                        <Edit size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Simple Pagination */}
          <div className="px-6 py-4 flex justify-between items-center border-t">
            <p style={{ color: '#A47551' }}>Page {currentPage} of {totalPages}</p>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                className="px-4 py-2 rounded disabled:opacity-50"
                style={{ backgroundColor: '#D0B49F', color: '#523A28' }}
              >
                Previous
              </button>
              <button
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded disabled:opacity-50"
                style={{ backgroundColor: '#D0B49F', color: '#523A28' }}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      <OrderModal
        order={selectedOrder}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onUpdate={updateOrderStatus}
      />
    </div>
  );
};

export default AdminOrdersPage;