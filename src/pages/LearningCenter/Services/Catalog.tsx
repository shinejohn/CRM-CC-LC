import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { LearningLayout } from '@/components/LearningCenter/Layout/LearningLayout';
import { serviceApi, type Service, type ServiceCategory } from '@/services/learning/service-api';
import { ShoppingCart, Loader2, Tag, Filter } from 'lucide-react';

export const ServiceCatalogPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [selectedCategory, selectedType]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [servicesData, categoriesData] = await Promise.all([
        serviceApi.list({
          category_id: selectedCategory || undefined,
          service_type: selectedType || undefined,
          per_page: 50,
        }),
        serviceApi.categories(),
      ]);

      setServices(servicesData.data);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to load services:', error);
    } finally {
      setLoading(false);
    }
  };

  const serviceTypes = [
    { value: 'day.news', label: 'Day.News' },
    { value: 'goeventcity', label: 'GoEventCity' },
    { value: 'downtownsguide', label: 'DowntownsGuide' },
    { value: 'golocalvoices', label: 'GoLocalVoices' },
    { value: 'alphasite', label: 'AlphaSite' },
    { value: 'fibonacco', label: 'Fibonacco' },
  ];

  const breadcrumbs = [
    { label: 'Learning Center', href: '/learning' },
    { label: 'Services' },
  ];

  return (
    <LearningLayout title="Service Catalog" breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Service Catalog</h1>
            <p className="text-lg text-gray-600">
              Browse and purchase services for your business
            </p>
          </div>
          <Link
            to="/learning/services/billing"
            className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-50"
          >
            Billing & Orders
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            {/* Service Type Filter */}
            <select
              value={selectedType || ''}
              onChange={(e) => setSelectedType(e.target.value || null)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">All Service Types</option>
              {serviceTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Services Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
          </div>
        ) : services.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-200">
            <ShoppingCart className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
            <p className="text-gray-500">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Link
                key={service.id}
                to={`/learning/services/${service.id}`}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Service Image */}
                {service.images && service.images.length > 0 && (
                  <div className="aspect-video bg-gray-100 overflow-hidden">
                    <img
                      src={service.images[0]}
                      alt={service.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="p-6">
                  {/* Service Type Badge */}
                  {service.service_type && (
                    <div className="mb-2">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-700">
                        {service.service_type}
                      </span>
                    </div>
                  )}

                  {/* Service Name */}
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.name}</h3>

                  {/* Description */}
                  {service.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {service.description}
                    </p>
                  )}

                  {/* Pricing */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      {service.discount_percentage && (
                        <span className="text-xs text-gray-500 line-through mr-2">
                          ${service.compare_at_price?.toFixed(2)}
                        </span>
                      )}
                      <span className="text-2xl font-bold text-gray-900">
                        ${service.price.toFixed(2)}
                      </span>
                      {service.billing_period && (
                        <span className="text-sm text-gray-500">/{service.billing_period}</span>
                      )}
                    </div>
                    {service.discount_percentage && (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                        -{service.discount_percentage}%
                      </span>
                    )}
                  </div>

                  {/* Features Preview */}
                  {service.features && service.features.length > 0 && (
                    <div className="mb-4">
                      <ul className="text-sm text-gray-600 space-y-1">
                        {service.features.slice(0, 3).map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <span className="text-green-500">✓</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* CTA Button */}
                  <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                    View Details
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </LearningLayout>
  );
};
