import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, Crown, Clock, CheckCircle2, AlertCircle, Zap, ArrowRight, Shield, TrendingUp, Users, Sparkles } from 'lucide-react';

interface Community {
  id: string;
  name: string;
  slug: string;
}

interface SlotCategory {
  category_group: string;
  category_subtype: string | null;
  influencer: { max: number; current: number; remaining: number };
  expert: { max: number; current: number; remaining: number };
}

interface SlotOverview {
  community_id: string;
  community_ceiling: number;
  total_influencers: number;
  ceiling_remaining: number;
  categories: SlotCategory[];
}

interface FounderCheck {
  eligible: boolean;
  days_remaining: number | null;
  window_closes_at: string | null;
  reason: string;
}

export const CommunityInfluencerPage: React.FC = () => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<string>('');
  const [slotData, setSlotData] = useState<SlotOverview | null>(null);
  const [founderData, setFounderData] = useState<FounderCheck | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load communities
  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const { apiClient } = await import('@/services/api');
        const res = await apiClient.get('/communities');
        setCommunities(res.data.data || []);
      } catch {
        setError('Unable to load communities.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCommunities();
  }, []);

  // Load slot availability + founder check when community changes
  useEffect(() => {
    if (!selectedCommunity) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { apiClient } = await import('@/services/api');
        const [slotsRes, founderRes] = await Promise.all([
          apiClient.get(`/community-subscriptions/slot-availability/${selectedCommunity}`),
          apiClient.get(`/community-subscriptions/founder-check/${selectedCommunity}`),
        ]);
        setSlotData(slotsRes.data.data);
        setFounderData(founderRes.data.data);
      } catch {
        setError('Failed to load community data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [selectedCommunity]);

  const handleSubscribe = async () => {
    if (!selectedCommunity || !selectedCategory) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const { apiClient } = await import('@/services/api');
      const [categoryGroup, categorySubtype] = selectedCategory.split('::');

      await apiClient.post('/community-subscriptions', {
        community_id: selectedCommunity,
        product_slug: 'community-influencer',
        payment_method_id: 'pm_placeholder', // Will be replaced with Stripe Elements
        category_group: categoryGroup,
        category_subtype: categorySubtype || null,
      });

      // Refresh slot data
      const slotsRes = await apiClient.get(`/community-subscriptions/slot-availability/${selectedCommunity}`);
      setSlotData(slotsRes.data.data);
      setSelectedCategory('');
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err && typeof (err as { message: unknown }).message === "string"
          ? (err as { message: string }).message
          : "Subscription failed. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableCategories = slotData?.categories.filter(c => c.influencer.remaining > 0) || [];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
            <Star className="w-8 h-8 text-amber-500" />
            Community Influencer Program
          </h1>
          <p className="text-gray-500 mt-1">
            Become the go-to voice in your community. 12-month commitment + 3 months free.
          </p>
        </div>
      </div>

      {/* Founder Pricing Banner */}
      {founderData?.eligible && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="bg-amber-100 dark:bg-amber-800 rounded-full p-2">
              <Crown className="w-6 h-6 text-amber-600 dark:text-amber-300" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-200">
                🎉 Founder Pricing Available!
              </h3>
              <p className="text-amber-800 dark:text-amber-300 mt-1">
                {founderData.reason}
                {founderData.days_remaining !== null && (
                  <span className="font-bold"> — {founderData.days_remaining} days remaining</span>
                )}
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-400 mt-2">
                Lock in today's pricing for 3 years. Rate guaranteed even as prices increase.
              </p>
            </div>
            <Badge className="bg-amber-600 text-white text-sm px-3 py-1">FOUNDER</Badge>
          </div>
        </div>
      )}

      {/* Step 1: Select Community */}
      <Card className="shadow-sm border-t-4 border-t-indigo-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold">1</span>
            Select Your Community
          </CardTitle>
          <CardDescription>Choose the community where you want to become an influencer.</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedCommunity} onValueChange={setSelectedCommunity}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Choose a community..." />
            </SelectTrigger>
            <SelectContent>
              {communities.map(c => (
                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Step 2: Select Category */}
      {selectedCommunity && slotData && (
        <Card className="shadow-sm border-t-4 border-t-emerald-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold">2</span>
              Choose Your Category
            </CardTitle>
            <CardDescription>
              {slotData.ceiling_remaining} of {slotData.community_ceiling} total influencer slots remaining.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Loading slot availability...</div>
            ) : availableCategories.length === 0 ? (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <p className="text-red-700 dark:text-red-300">All influencer slots are currently filled. Join the waitlist to be first in line.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {slotData.categories.map((cat) => {
                  const key = `${cat.category_group}::${cat.category_subtype || ''}`;
                  const isAvailable = cat.influencer.remaining > 0;
                  const isSelected = selectedCategory === key;

                  return (
                    <button
                      key={key}
                      disabled={!isAvailable}
                      onClick={() => setSelectedCategory(key)}
                      className={`text-left p-4 rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 ring-2 ring-indigo-200'
                          : isAvailable
                            ? 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                            : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 opacity-60 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white capitalize">
                            {cat.category_group.replace(/_/g, ' ')}
                          </p>
                          {cat.category_subtype && (
                            <p className="text-sm text-gray-500 capitalize">{cat.category_subtype.replace(/_/g, ' ')}</p>
                          )}
                        </div>
                        {isSelected && <CheckCircle2 className="w-5 h-5 text-indigo-600" />}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className={`text-sm font-medium ${isAvailable ? 'text-emerald-600' : 'text-red-500'}`}>
                          {cat.influencer.remaining}/{cat.influencer.max} slots available
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Pricing Card */}
      {selectedCategory && (
        <Card className="shadow-sm border-t-4 border-t-purple-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold">3</span>
              Your Investment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-wider font-medium">Community Influencer</p>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-5xl font-bold text-gray-900 dark:text-white">$300</span>
                    <span className="text-gray-500">/month</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">12-month commitment • 3 months free</p>
                  {founderData?.eligible && (
                    <Badge className="mt-2 bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-200">
                      <Shield className="w-3 h-3 mr-1" /> Founder Rate Locked for 3 Years
                    </Badge>
                  )}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <Zap className="w-4 h-4 text-indigo-500" /> Headliner placement
                  </div>
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <Sparkles className="w-4 h-4 text-indigo-500" /> Display ads included
                  </div>
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <TrendingUp className="w-4 h-4 text-indigo-500" /> 20 story mentions/mo
                  </div>
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <Star className="w-4 h-4 text-indigo-500" /> Priority listing badge
                  </div>
                </div>
              </div>

              {error && (
                <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-center gap-2 text-red-700 dark:text-red-300">
                  <AlertCircle className="w-4 h-4" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <Button
                onClick={handleSubscribe}
                disabled={isSubmitting}
                className="mt-6 w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 text-lg"
                id="subscribe-btn"
              >
                {isSubmitting ? 'Processing...' : (
                  <>Subscribe Now <ArrowRight className="w-5 h-5 ml-2" /></>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Community Stats Overview */}
      {selectedCommunity && slotData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Active Influencers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{slotData.total_influencers}</div>
              <p className="text-xs text-gray-500 mt-1">of {slotData.community_ceiling} max</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Slots Remaining</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${slotData.ceiling_remaining > 10 ? 'text-emerald-600' : slotData.ceiling_remaining > 0 ? 'text-amber-600' : 'text-red-600'}`}>
                {slotData.ceiling_remaining}
              </div>
              <p className="text-xs text-gray-500 mt-1">across all categories</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{slotData.categories.length}</div>
              <p className="text-xs text-gray-500 mt-1">{availableCategories.length} with openings</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
