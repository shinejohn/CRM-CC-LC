import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Search, Package, Lock, CheckCircle2, Star, Zap, Monitor,
  Mail, Newspaper, PenTool, BarChart3, ShoppingCart,
  Bell, Calendar, Bot, Share2, Gift, Filter
} from 'lucide-react';

interface Product {
  id: string;
  product_slug: string;
  name: string;
  description: string;
  service_type: string;
  price: string;
  compare_at_price: string | null;
  is_subscription: boolean;
  billing_period: string | null;
  billing_unit: string | null;
  sold_by: string;
  requires_products: string[];
  is_perk: boolean;
  commission_rate: string | null;
}

interface ProductWithEligibility {
  product: Product;
  can_purchase: boolean;
  missing_prerequisites: string[];
}

const categoryIcons: Record<string, React.ReactNode> = {
  'cross-platform': <Monitor className="w-5 h-5" />,
  'day.news': <Newspaper className="w-5 h-5" />,
  'goeventcity': <Calendar className="w-5 h-5" />,
  'alphasite': <Bot className="w-5 h-5" />,
};

const categoryLabels: Record<string, string> = {
  'cross-platform': 'Cross-Platform',
  'day.news': 'Day.News',
  'goeventcity': 'GoEventCity',
  'alphasite': 'AI Services',
};

const soldByLabels: Record<string, { label: string; color: string }> = {
  'emma': { label: 'Sales Team', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-800 dark:text-indigo-200' },
  'patricia': { label: 'Community Mgr', color: 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200' },
  'self-serve': { label: 'Self-Serve', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200' },
  'auto': { label: 'Automatic', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' },
};

export const ProductCatalogPage: React.FC = () => {
  const [products, setProducts] = useState<ProductWithEligibility[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const { apiClient } = await import('@/services/api');
        const res = await apiClient.get('/products');
        setProducts(res.data.data || []);
      } catch {
        setProducts([]);
        setLoadError('Could not load the product catalog. Try refreshing the page.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const serviceTypes = [...new Set(products.map(p => p.product.service_type))];

  const filtered = products.filter(p => {
    const matchesSearch = p.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || p.product.service_type === filterType;
    return matchesSearch && matchesType;
  });

  // Group by service_type
  const grouped = filtered.reduce<Record<string, ProductWithEligibility[]>>((acc, p) => {
    const type = p.product.service_type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(p);
    return acc;
  }, {});

  const formatPrice = (product: Product) => {
    const price = parseFloat(product.price);
    if (price === 0 && product.is_perk) return 'Included';
    if (price === 0) return 'Free';
    if (product.commission_rate) return `${product.commission_rate}% commission`;
    if (product.is_subscription) return `$${price}/mo`;
    if (product.billing_unit) return `$${price}/${product.billing_unit.replace('per-', '')}`;
    return `$${price}`;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
            <Package className="w-8 h-8 text-indigo-500" />
            Product Catalog
          </h1>
          <p className="text-gray-500 mt-1">
            Explore all available products and services across the Fibonacco platform.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-[250px]"
              id="product-search"
            />
          </div>
        </div>
      </div>

      {loadError && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200" role="alert">
          {loadError}
        </div>
      )}

      {/* Platform Filter Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant={filterType === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterType('all')}
          className={filterType === 'all' ? 'bg-indigo-600 text-white' : ''}
        >
          All Products
        </Button>
        {serviceTypes.map(type => (
          <Button
            key={type}
            variant={filterType === type ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType(type)}
            className={filterType === type ? 'bg-indigo-600 text-white' : ''}
          >
            {categoryIcons[type]}
            <span className="ml-1">{categoryLabels[type] || type}</span>
          </Button>
        ))}
      </div>

      {/* Product Grid by Category */}
      {isLoading ? (
        <div className="text-center py-16 text-gray-500">Loading product catalog...</div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="text-center py-16 text-gray-500">No products match your search.</div>
      ) : (
        Object.entries(grouped).map(([type, items]) => (
          <div key={type} className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
              {categoryIcons[type] || <Package className="w-5 h-5" />}
              {categoryLabels[type] || type}
              <Badge variant="secondary" className="ml-2">{items.length}</Badge>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map(({ product, can_purchase, missing_prerequisites }) => {
                const price = parseFloat(product.price);
                const comparePrice = product.compare_at_price ? parseFloat(product.compare_at_price) : null;
                const discount = comparePrice && comparePrice > price
                  ? Math.round(((comparePrice - price) / comparePrice) * 100)
                  : null;

                return (
                  <Card
                    key={product.product_slug}
                    className={`shadow-sm hover:shadow-md transition-shadow relative ${
                      !can_purchase ? 'opacity-75' : ''
                    } ${product.is_perk ? 'border-l-4 border-l-emerald-400' : ''}`}
                  >
                    {discount && (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-red-500 text-white text-xs">-{discount}%</Badge>
                      </div>
                    )}

                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">{product.name}</CardTitle>
                          {product.is_perk && (
                            <Badge className="mt-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200 text-xs">
                              <Gift className="w-3 h-3 mr-1" /> Perk
                            </Badge>
                          )}
                        </div>
                      </div>
                      <CardDescription className="text-xs line-clamp-2 mt-1">
                        {product.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      {/* Price */}
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                          {formatPrice(product)}
                        </span>
                        {comparePrice && comparePrice > price && (
                          <span className="text-sm text-gray-400 line-through">${comparePrice}</span>
                        )}
                      </div>

                      {/* Sold By */}
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${soldByLabels[product.sold_by]?.color || 'bg-gray-100 text-gray-800'}`}>
                          {soldByLabels[product.sold_by]?.label || product.sold_by}
                        </Badge>
                        {product.is_subscription && (
                          <Badge variant="outline" className="text-xs">
                            <Zap className="w-3 h-3 mr-1" /> Subscription
                          </Badge>
                        )}
                      </div>

                      {/* Prerequisites */}
                      {!can_purchase && missing_prerequisites.length > 0 && (
                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-2 text-xs">
                          <p className="flex items-center gap-1 text-amber-700 dark:text-amber-300 font-medium">
                            <Lock className="w-3 h-3" /> Requires:
                          </p>
                          <ul className="ml-4 mt-1 space-y-0.5">
                            {missing_prerequisites.map(slug => (
                              <li key={slug} className="text-amber-600 dark:text-amber-400">
                                {slug.replace(/-/g, ' ')}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Action Button */}
                      <Button
                        className="w-full mt-2"
                        variant={can_purchase ? 'default' : 'outline'}
                        disabled={!can_purchase}
                        size="sm"
                        id={`purchase-${product.product_slug}`}
                      >
                        {can_purchase ? (
                          <><CheckCircle2 className="w-4 h-4 mr-1" /> Get Started</>
                        ) : (
                          <><Lock className="w-4 h-4 mr-1" /> Prerequisites Required</>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
};
