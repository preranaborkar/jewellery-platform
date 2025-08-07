// pages/OrderCancelled.js
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle, ArrowLeft, CreditCard, Package } from 'lucide-react';

const OrderCancelled = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#E4D4C8' }}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-red-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <XCircle size={40} className="text-red-600" />
          </div>
          
          <h1 className="text-3xl font-bold mb-4" style={{ color: '#523A28' }}>
            Payment Cancelled
          </h1>
          
          <p className="text-lg mb-6" style={{ color: '#A47551' }}>
            Your payment was cancelled and no charges have been made to your account.
            Your order is still pending and waiting for payment.
          </p>

          <div className="p-6 rounded-lg mb-6" style={{ backgroundColor: '#D0B49F' }}>
            <h3 className="text-lg font-semibold mb-3" style={{ color: '#523A28' }}>
              What would you like to do?
            </h3>
            <p className="text-sm mb-4" style={{ color: '#A47551' }}>
              Your items are still reserved in your cart. You can try payment again or choose a different payment method.
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => navigate('/cart')}
              className="w-full px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              style={{ backgroundColor: '#523A28', color: '#E4D4C8' }}
            >
              <CreditCard size={20} />
              Try Payment Again
            </button>
            
            <button
              onClick={() => navigate('/cart')}
              className="w-full px-6 py-3 rounded-lg border-2 font-semibold transition-colors flex items-center justify-center gap-2"
              style={{ borderColor: '#523A28', color: '#523A28' }}
            >
              <Package size={20} />
              Review Cart & Choose Cash on Delivery
            </button>

            <button
              onClick={() => navigate('/products-categories')}
              className="w-full px-6 py-3 rounded-lg border-2 font-semibold transition-colors flex items-center justify-center gap-2"
              style={{ borderColor: '#A47551', color: '#A47551' }}
            >
              <ArrowLeft size={20} />
              Continue Shopping
            </button>
          </div>

          {/* Help Section */}
          <div className="mt-8 p-4 rounded-lg" style={{ backgroundColor: '#D0B49F' }}>
            <h3 className="font-semibold mb-3" style={{ color: '#523A28' }}>
              Need Help?
            </h3>
            <div className="space-y-2 text-sm" style={{ color: '#A47551' }}>
              <p>If you're experiencing issues with payment, you can:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Try a different payment method</li>
                <li>Check your card details and try again</li>
                <li>Choose Cash on Delivery option</li>
                <li>Contact our support team for assistance</li>
              </ul>
            </div>
            
            <button
              onClick={() => navigate('/contact')}
              className="mt-4 px-4 py-2 rounded-lg border font-medium transition-colors"
              style={{ borderColor: '#523A28', color: '#523A28' }}
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderCancelled;