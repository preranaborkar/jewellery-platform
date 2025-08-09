import React, { useState ,useEffect} from 'react';
import { useOrders, useOrderDetails, useReview } from '../../hooks/useOder';
import { Package, Star, Calendar, MapPin, CreditCard, Truck, Eye, EyeOff } from 'lucide-react';

const MyOrders = () => {
  const { orders, loading: ordersLoading, error: ordersError } = useOrders();
  const { order, loading: orderLoading, fetchOrderDetails } = useOrderDetails();
  const { addReview, updateReview, getUserReview, loading: reviewLoading } = useReview();
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [reviews, setReviews] = useState({});

useEffect(() => {
  console.log('=== DEBUG: Component mounted ===');
  console.log('Orders:', orders);
  console.log('Reviews state:', reviews);
}, [orders, reviews]);


  // Replace your handleViewDetails function with this:

const handleViewDetails = async (orderId) => {
  if (selectedOrderId === orderId) {
    setSelectedOrderId(null);
    return;
  }
  setSelectedOrderId(orderId);
  await fetchOrderDetails(orderId);
  
  // IMPORTANT: Wait for order details to be available
  // You might need to adjust this based on how your fetchOrderDetails works
  
  // Find the order from your orders array
  const currentOrder = orders.find(o => o._id === orderId);
  if (currentOrder && currentOrder.products) {
    console.log('=== Fetching existing reviews for order products ===');
    
    // Create a temporary reviews object
    const existingReviews = {};
    
    // Fetch reviews for each product
    for (const item of currentOrder.products) {
      if (item.product && item.product._id) {
        try {
          console.log(`Fetching review for product: ${item.product._id}`);
          const existingReview = await getUserReview(item.product._id);
          console.log(`Review found:`, existingReview);
          
          if (existingReview && existingReview.rating) {
            existingReviews[item.product._id] = existingReview.rating;
            console.log(`Added review: ${item.product._id} = ${existingReview.rating}`);
          }
        } catch (error) {
          console.error(`Error fetching review for product ${item.product._id}:`, error);
        }
      }
    }
    
    // Update reviews state with all existing reviews
    console.log('Final reviews to set:', existingReviews);
    setReviews(prev => ({
      ...prev,
      ...existingReviews
    }));
  }
};

  // Handle star rating click
  const handleStarClick = async (productId, rating, orderId) => {
    try {
      // Check if user already has a review for this product
      const existingReview = await getUserReview(productId);
      
      if (existingReview) {
        // Update existing review
        await updateReview(existingReview._id, { rating });
      } else {
        // Add new review
        await addReview(orderId, { 
          product: productId, 
          rating 
        });
      }
      
      // Update local state
      setReviews(prev => ({
        ...prev,
        [productId]: rating
      }));
    } catch (error) {
      console.error('Error handling review:', error);
    }
  };

  // Star Rating Component
  const StarRating = ({ productId, orderId, currentRating = 0 }) => {
    const [hoveredStar, setHoveredStar] = useState(0);
    const userRating = reviews[productId] || currentRating;

    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleStarClick(productId, star, orderId)}
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(0)}
            disabled={reviewLoading}
            className="transition-colors duration-200 disabled:opacity-50"
          >
            <Star
              className={`h-5 w-5 ${
                star <= (hoveredStar || userRating)
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
        {userRating > 0 && (
          <span className="text-sm text-[#A47551] ml-2">
            {userRating}/5 stars
          </span>
        )}
      </div>
    );
  };

  // Order Status Badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      confirmed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Confirmed' },
      processing: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Processing' },
      shipped: { bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'Shipped' },
      delivered: { bg: 'bg-green-100', text: 'text-green-800', label: 'Delivered' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  // Payment Status Badge
  const getPaymentBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Paid' },
      failed: { bg: 'bg-red-100', text: 'text-red-800', label: 'Failed' },
      refunded: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Refunded' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  if (ordersLoading) {
    return (
      <div className="min-h-screen bg-[#E4D4C8]/30 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A47551]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (ordersError) {
    return (
      <div className="min-h-screen bg-[#E4D4C8]/30 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <Package className="h-16 w-16 text-[#A47551] mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-[#523A28] mb-2">Error loading orders</h2>
            <p className="text-[#A47551]">{ordersError}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="min-h-screen bg-[#E4D4C8]/30 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <Package className="h-16 w-16 text-[#A47551] mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-[#523A28] mb-2">No orders found</h2>
            <p className="text-[#A47551]">You haven't placed any orders yet.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E4D4C8]/30 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#523A28]">My Orders</h1>
          <p className="text-[#A47551] mt-2">Track and manage your jewelry orders</p>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {orders.map((orderItem) => (
            <div key={orderItem._id} className="bg-white rounded-lg shadow-lg border border-[#D0B49F]/20 overflow-hidden">
              {/* Order Header */}
              <div className="p-6 border-b border-[#D0B49F]/20">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6">
                    <div>
                      <h3 className="text-lg font-semibold text-[#523A28]">
                        Order #{orderItem.orderNumber}
                      </h3>
                      <div className="flex items-center text-sm text-[#A47551] mt-1">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(orderItem.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      {getStatusBadge(orderItem.orderStatus)}
                      {getPaymentBadge(orderItem.paymentStatus)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-right mr-4">
                      <p className="text-2xl font-bold text-[#523A28]">
                        ₹{orderItem.totalAmount.toLocaleString()}
                      </p>
                      <p className="text-sm text-[#A47551]">
                        {orderItem.products.length} item{orderItem.products.length > 1 ? 's' : ''}
                      </p>
                    </div>

                    <button
                      onClick={() => handleViewDetails(orderItem._id)}
                      className="flex items-center space-x-2 px-4 py-2 bg-[#A47551] hover:bg-[#523A28] text-white rounded-lg transition-colors duration-300"
                    >
                      {selectedOrderId === orderItem._id ? (
                        <>
                          <EyeOff className="h-4 w-4" />
                          <span>Hide Details</span>
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4" />
                          <span>View Details</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Order Details */}
              {selectedOrderId === orderItem._id && (
                <div className="p-6 bg-[#E4D4C8]/20">
                  {orderLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A47551]"></div>
                    </div>
                  ) : order ? (
                    <div className="space-y-6">
                      {/* Shipping Address */}
                      <div className="bg-white rounded-lg p-4 border border-[#D0B49F]/20">
                        <h4 className="font-semibold text-[#523A28] mb-3 flex items-center">
                          <MapPin className="h-5 w-5 mr-2" />
                          Billing Address
                        </h4>
                        <p className="text-[#A47551] text-sm leading-relaxed">
                          {order.billingAddress.street}<br />
                          {order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.zipCode}<br />
                          {order.billingAddress.country}
                        </p>
                      </div>

                      {/* Payment Info */}
                      <div className="bg-white rounded-lg p-4 border border-[#D0B49F]/20">
                        <h4 className="font-semibold text-[#523A28] mb-3 flex items-center">
                          <CreditCard className="h-5 w-5 mr-2" />
                          Payment Information
                        </h4>
                        <div className="text-sm text-[#A47551] space-y-1">
                          <p>Method: {order.paymentMethod?.toUpperCase() || 'N/A'}</p>
                          <p>Status: {order.paymentStatus}</p>
                          {order.trackingNumber && (
                            <p>Tracking: {order.trackingNumber}</p>
                          )}
                        </div>
                      </div>

                      {/* Products */}
                      <div className="bg-white rounded-lg p-4 border border-[#D0B49F]/20">
                        <h4 className="font-semibold text-[#523A28] mb-4 flex items-center">
                          <Package className="h-5 w-5 mr-2" />
                          Order Items
                        </h4>
                        <div className="space-y-4">
                          {order.products.map((item, index) => (
                            <div key={index} className="flex items-start space-x-4 p-4 border border-[#D0B49F]/20 rounded-lg">
                              <div className="w-16 h-16 bg-[#E4D4C8] rounded-lg flex-shrink-0 flex items-center justify-center">
                                {item.product?.image && item.product.image.length > 0 ? (
                                  <img
                                    src={item.product.image[0]?.url || item.product.image[0]}
                                    alt={item.product?.name || 'Product'}
                                    className="w-full h-full object-cover rounded-lg"
                                  />
                                ) : (
                                  <Package className="h-8 w-8 text-[#A47551]" />
                                )}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <h5 className="font-medium text-[#523A28] mb-1">
                                  {item.product?.name || 'Product Name'}
                                </h5>
                                <div className="flex items-center justify-between text-sm text-[#A47551] mb-3">
                                  <span>Quantity: {item.quantity}</span>
                                  <span className="font-semibold">₹{item.price?.toLocaleString()}</span>
                                </div>
                                
                                {/* Review Section - Only show if order is delivered */}
                                {order.orderStatus === 'delivered' && (
                                  <div className="mt-3 p-3 bg-[#E4D4C8]/30 rounded-lg">
                                    <p className="text-sm font-medium text-[#523A28] mb-2">Rate this product:</p>
                                    <StarRating 
                                      productId={item.product?._id} 
                                      orderId={order._id}
                                      currentRating={reviews[item.product?._id] || 0}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Order Summary */}
                        <div className="mt-6 pt-4 border-t border-[#D0B49F]/20">
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-[#A47551]">
                              <span>Subtotal:</span>
                              <span>₹{order.subtotal?.toLocaleString()}</span>
                            </div>
                            {order.tax > 0 && (
                              <div className="flex justify-between text-[#A47551]">
                                <span>Tax:</span>
                                <span>₹{order.tax?.toLocaleString()}</span>
                              </div>
                            )}
                            {order.shipping > 0 && (
                              <div className="flex justify-between text-[#A47551]">
                                <span>Shipping:</span>
                                <span>₹{order.shipping?.toLocaleString()}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-lg font-bold text-[#523A28] pt-2 border-t border-[#D0B49F]/20">
                              <span>Total:</span>
                              <span>₹{order.totalAmount?.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-[#A47551]">
                      <p>Unable to load order details. Please try again.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyOrders;