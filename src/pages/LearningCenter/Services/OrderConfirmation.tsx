import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { LearningLayout } from '@/components/LearningCenter/Layout/LearningLayout';
import { orderApi, type Order } from '@/services/learning/order-api';
import { CheckCircle, Loader2, ArrowLeft } from 'lucide-react';

export const OrderConfirmationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadOrder();
    }
  }, [id]);

  const loadOrder = async () => {
    setLoading(true);
    try {
      const data = await orderApi.get(id!);
      setOrder(data);
    } catch (error) {
      console.error('Failed to load order:', error);
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbs = [
    { label: 'Learning Center', href: '/learning' },
    { label: 'Services', href: '/learning/services' },
    { label: 'Order Confirmation' },
  ];

  if (loading) {
    return (
      <LearningLayout title="Loading Order..." breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-indigo-600" size={32} />
        </div>
      </LearningLayout>
    );
  }

  if (!order) {
    return (
      <LearningLayout title="Order Not Found" breadcrumbs={breadcrumbs}>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order not found</h2>
          <Link to="/learning/services" className="text-indigo-600 hover:text-indigo-700">
            Back to services
          </Link>
        </div>
      </LearningLayout>
    );
  }

  return (
    <LearningLayout title="Order Confirmation" breadcrumbs={breadcrumbs}>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Success Message */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <CheckCircle className="mx-auto text-green-600 mb-4" size={48} />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600">
            Thank you for your purchase. Your order has been received and is being processed.
          </p>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Details</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Order Number:</span>
              <span className="font-medium text-gray-900">{order.order_number}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                order.status === 'completed' ? 'bg-green-100 text-green-700' :
                order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {order.status}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Status:</span>
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                order.payment_status === 'paid' ? 'bg-green-100 text-green-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {order.payment_status}
              </span>
            </div>
            
            {order.paid_at && (
              <div className="flex justify-between">
                <span className="text-gray-600">Paid At:</span>
                <span className="text-gray-900">{new Date(order.paid_at).toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Items</h2>
          
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between items-start pb-4 border-b border-gray-200 last:border-0">
                <div>
                  <h3 className="font-medium text-gray-900">{item.service_name}</h3>
                  {item.service_description && (
                    <p className="text-sm text-gray-600 mt-1">{item.service_description}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">Quantity: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">${item.total.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">${item.price.toFixed(2)} each</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal:</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </div>
            {order.tax > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Tax:</span>
                <span>${order.tax.toFixed(2)}</span>
              </div>
            )}
            {order.shipping > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Shipping:</span>
                <span>${order.shipping.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
              <span>Total:</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Link
            to="/learning/services"
            className="flex-1 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-center font-medium"
          >
            Continue Shopping
          </Link>
          <Link
            to={`/learning/services/orders/${order.id}`}
            className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-center font-medium"
          >
            View Order Details
          </Link>
        </div>
      </div>
    </LearningLayout>
  );
};
