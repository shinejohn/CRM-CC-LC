import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Service } from '../../hooks/useServices';
import { useServices } from '../../hooks/useServices';
import { useAuth } from '../../core/AuthContext';

interface ServiceCatalogProps {
  services: Service[];
}

export function ServiceCatalog({ services: initialServices }: ServiceCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { user } = useAuth();
  const { subscribe, isLoading: isSubscribing } = useServices();

  const categories = ['all', ...new Set(initialServices.map(s => s.category))];
  const filteredServices = selectedCategory === 'all'
    ? initialServices
    : initialServices.filter(s => s.category === selectedCategory);

  const handleSubscribe = async (serviceId: string, tierId: string) => {
    const customerEmail = user?.email ?? '';
    if (!customerEmail) {
      console.error('Please log in to subscribe');
      return;
    }
    try {
      await subscribe(serviceId, tierId, customerEmail);
    } catch (error) {
      console.error('Failed to subscribe:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(cat)}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </Button>
        ))}
      </div>

      {/* Services Grid */}
      <div className="space-y-8">
        {filteredServices.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-slate-400">No services available</p>
          </div>
        ) : (
          filteredServices.map((service) => (
            <div key={service.id}>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {service.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
                {service.description}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {service.tiers.map((tier, index) => (
                  <motion.div
                    key={tier.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className={`relative ${tier.popular ? 'border-purple-500 border-2' : ''}`}>
                      {tier.popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <Badge className="bg-purple-500">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Popular
                          </Badge>
                        </div>
                      )}
                      <CardContent className="p-6">
                        <h4 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                          {tier.name}
                        </h4>
                        <div className="mb-4">
                          <span className="text-3xl font-bold text-gray-900 dark:text-white">
                            ${tier.price}
                          </span>
                          <span className="text-gray-500 dark:text-slate-400">
                            /{tier.billingCycle === 'monthly' ? 'mo' : 'yr'}
                          </span>
                        </div>
                        <ul className="space-y-2 mb-6">
                          {tier.features.map((feature, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-300">
                              <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                        <Button
                          className={`w-full ${tier.popular ? 'bg-purple-500 hover:bg-purple-600' : ''}`}
                          variant={tier.popular ? 'default' : 'outline'}
                          onClick={() => handleSubscribe(service.id, tier.id)}
                          disabled={isSubscribing}
                        >
                          Subscribe
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

