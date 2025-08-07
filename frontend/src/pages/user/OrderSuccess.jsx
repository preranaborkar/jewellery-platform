// pages/OrderSuccess.js - FIXED VERSION
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, RefreshCw, AlertCircle, Package, Truck } from 'lucide-react';
// Remove this import if orderService doesn't exist
// import { orderService } from '../../services/orderService';

const OrderSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [order, setOrder] = useState(null);

  const sessionId = searchParams.get('session_id');
  const orderId = searchParams.get('order_id');

// Fixed OrderSuccess.js verification section
// Fixed OrderSuccess.js useEffect to prevent duplicate calls
useEffect(() => {
  const verifyPayment = async () => {
    console.log("Order success sessionId:", sessionId);

    if (!sessionId) {
      setError('No session ID found. Please contact support if you believe this is an error.');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please login again.');
        setLoading(false);
        return;
      }

      // Call controller's verify-payment endpoint
      const response = await fetch(`${process.env.REACT_APP_API_URL}/orders/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          sessionId
        })
      });

      if (!response.ok) {
        throw new Error('Payment verification failed');
      }

      const result = await response.json();
      
      if (result.success) {
        setOrder(result.data.order);
      } else {
        setError(result.message || 'Payment verification failed');
      }
    } catch (err) {
      console.error('Payment verification error:', err);
      setError('Unable to verify payment. Please contact support with your session ID: ' + sessionId);
    } finally {
      setLoading(false);
    }
  };

  // Only run once when component mounts or sessionId changes
  if (sessionId) {
    verifyPayment();
  }
}, [sessionId]); // Only sessionId as dependency
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#E4D4C8' }}>
        <div className="text-center">
          <RefreshCw size={48} className="animate-spin mx-auto mb-4" style={{ color: '#523A28' }} />
          <h2 className="text-xl font-semibold mb-2" style={{ color: '#523A28' }}>
            Verifying Payment...
          </h2>
          <p style={{ color: '#A47551' }}>
            Please wait while we confirm your payment
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#E4D4C8' }}>
        <div className="max-w-md mx-auto text-center p-8">
          <div className="bg-red-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <AlertCircle size={40} className="text-red-600" />
          </div>

          <h1 className="text-2xl font-bold mb-4" style={{ color: '#523A28' }}>
            Payment Verification Failed
          </h1>

          <p className="mb-6" style={{ color: '#A47551' }}>
            {error}
          </p>

          <div className="space-y-4">
            <button
              onClick={() => navigate('/orders')}
              className="w-full px-6 py-3 rounded-lg font-semibold transition-colors"
              style={{ backgroundColor: '#523A28', color: '#E4D4C8' }}
            >
              View My Orders
            </button>

            <button
              onClick={() => navigate('/contact')}
              className="w-full px-6 py-3 rounded-lg border-2 font-semibold transition-colors"
              style={{ borderColor: '#523A28', color: '#523A28' }}
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#E4D4C8' }}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-green-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <CheckCircle size={40} className="text-green-600" />
          </div>

          <h1 className="text-3xl font-bold mb-4" style={{ color: '#523A28' }}>
            Payment Successful!
          </h1>

          <p className="text-lg mb-6" style={{ color: '#A47551' }}>
            Thank you for your payment. Your order has been confirmed and will be processed shortly.
          </p>

          {order && (
            <>
              <div className="p-6 rounded-lg mb-6" style={{ backgroundColor: '#D0B49F' }}>
                <div className="text-left space-y-3">
                  <div className="flex justify-between">
                    <span style={{ color: '#A47551' }}>Order Number:</span>
                    <span className="font-semibold" style={{ color: '#523A28' }}>
                      {order.orderNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: '#A47551' }}>Total Amount:</span>
                    <span className="font-semibold" style={{ color: '#523A28' }}>
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: '#A47551' }}>Payment Method:</span>
                    <span className="font-semibold" style={{ color: '#523A28' }}>
                      Credit/Debit Card
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: '#A47551' }}>Payment Status:</span>
                    <span className="font-semibold text-green-600">
                      Completed
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: '#A47551' }}>Order Status:</span>
                    <span className="font-semibold text-green-600">
                      Confirmed
                    </span>
                  </div>
                  {order.stripePaymentIntentId && (
                    <div className="flex justify-between">
                      <span style={{ color: '#A47551' }}>Transaction ID:</span>
                      <span className="font-mono text-sm" style={{ color: '#523A28' }}>
                        {order.stripePaymentIntentId}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="p-6 rounded-lg mb-6" style={{ backgroundColor: '#D0B49F' }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: '#523A28' }}>
                  Order Items
                </h3>
                <div className="space-y-3">
                  {order.products.map((item, index) => (
                    <div key={index} className="flex gap-3 p-3 bg-white rounded-lg">
                      <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        {item.product.image && item.product.image.length > 0 ? (
                          <img
                            src={item.product.image[0]?.url || item.product.image[0]}
                            alt={item.product.name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package size={16} style={{ color: '#A47551' }} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm" style={{ color: '#523A28' }}>
                          {item.product.name}
                        </h4>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-sm" style={{ color: '#A47551' }}>
                            Qty: {item.quantity} × {formatCurrency(item.price)}
                          </span>
                          <span className="font-medium" style={{ color: '#523A28' }}>
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="space-y-4">
            <button
              onClick={() => navigate('/orders')}
              className="w-full px-6 py-3 rounded-lg font-semibold transition-colors"
              style={{ backgroundColor: '#523A28', color: '#E4D4C8' }}
            >
              View Order Details
            </button>

            <button
              onClick={() => navigate('/products-categories')}
              className="w-full px-6 py-3 rounded-lg border-2 font-semibold transition-colors"
              style={{ borderColor: '#523A28', color: '#523A28' }}
            >
              Continue Shopping
            </button>
          </div>

          
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;