import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { LearningLayout } from '@/components/LearningCenter/Layout/LearningLayout';
import { serviceApi, type Service } from '@/services/learning/service-api';
import { orderApi } from '@/services/learning/order-api';
import { ArrowLeft, Loader2, Check, ShoppingCart, Tag } from 'lucide-react';

export const ServiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (id) {
      loadService();
    }
  }, [id]);

  const loadService = async () => {
    setLoading(true);
    try {
      const data = await serviceApi.get(id!);
      setService(data);
    } catch (error) {
      console.error('Failed to load service:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!service) return;

    setCheckoutLoading(true);
    try {
      const response = await orderApi.checkout({
        services: [
          {
            service_id: service.id,
            quantity: quantity,
          },
        ],
        customer_email: '', // Will need to get from auth or form
        customer_name: '', // Will need to get from auth or form
      });

      // Redirect to Stripe checkout
      window.location.href = response.url;
    } catch (error) {
      console.error('Checkout failed:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const breadcrumbs = [
    { label: 'Learning Center', href: '/learning' },
    { label: 'Services', href: '/learning/services' },
    { label: service?.name || 'Service' },
  ];

  if (loading) {
    return (
      <LearningLayout title="Loading..." breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-indigo-600" size={32} />
        </div>
      </LearningLayout>
    );
  }

  if (!service) {
    return (
      <LearningLayout title="Service Not Found" breadcrumbs={breadcrumbs}>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Service not found</h2>
          <button
            onClick={() => navigate('/learning/services')}
            className="text-indigo-600 hover:text-indigo-700"
          >
            Back to catalog
          </button>
        </div>
      </LearningLayout>
    );
  }

  return (
    <LearningLayout title={service.name} breadcrumbs={breadcrumbs}>
      <div className="space-y-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/learning/services')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={20} />
          Back to Catalog
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Image & Description */}
          <div className="space-y-6">
            {/* Service Image */}
            {service.images && service.images.length > 0 && (
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={service.images[0]}
                  alt={service.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Description */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
              <div className="prose text-gray-600">
                {service.long_description ? (
                  <p>{service.long_description}</p>
                ) : (
                  <p>{service.description}</p>
                )}
              </div>
            </div>

            {/* Features */}
            {service.features && service.features.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Features</h2>
                <ul className="space-y-3">
                  {service.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="text-green-500 mt-0.5 flex-shrink-0" size={20} />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Capabilities */}
            {service.capabilities && service.capabilities.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">What It Does</h2>
                <ul className="space-y-2">
                  {service.capabilities.map((capability, index) => (
                    <li key={index} className="text-gray-700">• {capability}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Column - Pricing & Purchase */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 sticky top-4">
              {/* Service Type Badge */}
              {service.service_type && (
                <div className="mb-4">
                  <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-indigo-100 text-indigo-700">
                    {service.service_type}
                  </span>
                  {service.service_tier && (
                    <span className="ml-2 inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-purple-100 text-purple-700">
                      {service.service_tier}
                    </span>
                  )}
                </div>
              )}

              {/* Pricing */}
              <div className="mb-6">
                {service.discount_percentage && (
                  <div className="text-sm text-gray-500 line-through mb-1">
                    ${service.compare_at_price?.toFixed(2)}
                  </div>
                )}
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-gray-900">
                    ${service.price.toFixed(2)}
                  </span>
                  {service.billing_period && (
                    <span className="text-lg text-gray-500">/{service.billing_period}</span>
                  )}
                </div>
                {service.discount_percentage && (
                  <div className="mt-2">
                    <span className="px-2 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-700">
                      Save {service.discount_percentage}%
                    </span>
                  </div>
                )}
              </div>

              {/* Quantity Selector (for non-subscription services) */}
              {!service.is_subscription && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      -
                    </button>
                    <span className="text-lg font-medium text-gray-900 w-12 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Purchase Button */}
              <button
                onClick={handleCheckout}
                disabled={checkoutLoading || !service.is_in_stock}
                className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {checkoutLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Processing...
                  </>
                ) : (
                  <>
                    <ShoppingCart size={20} />
                    {service.is_subscription ? 'Subscribe Now' : 'Purchase Now'}
                  </>
                )}
              </button>

              {!service.is_in_stock && (
                <p className="mt-2 text-sm text-red-600 text-center">Out of stock</p>
              )}

              {/* Stock Status */}
              {service.is_in_stock && (
                <p className="mt-2 text-sm text-green-600 text-center">✓ In stock</p>
              )}
            </div>

            {/* Integrations */}
            {service.integrations && service.integrations.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Integrations</h3>
                <div className="flex flex-wrap gap-2">
                  {service.integrations.map((integration, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-700"
                    >
                      {integration}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </LearningLayout>
  );
};
