import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CreditCard, Crown, Clock, MapPin, XCircle, Shield, Calendar, DollarSign, AlertTriangle } from 'lucide-react';

interface CommunitySubscription {
  id: string;
  customer_id: string;
  product_slug: string;
  tier: string;
  status: string;
  monthly_rate: string;
  commitment_starts_at: string;
  commitment_ends_at: string;
  bonus_starts_at: string;
  bonus_ends_at: string;
  next_renewal_at: string;
  is_founder_pricing: boolean;
  founder_lock_expires_at: string | null;
  category_group: string | null;
  category_subtype: string | null;
  expert_column_name: string | null;
  sponsored_section: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  early_termination_balance: string | null;
  community: {
    id: string;
    name: string;
    slug: string;
  };
}

export const SubscriptionsPage: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<CommunitySubscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedSubForCancel, setSelectedSubForCancel] = useState<CommunitySubscription | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    setIsLoading(true);
    try {
      const { apiClient } = await import('@/services/api');
      const res = await apiClient.get('/community-subscriptions');
      setSubscriptions(res.data.data || []);
    } catch {
      setSubscriptions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!selectedSubForCancel) return;
    setCancellingId(selectedSubForCancel.id);
    setError(null);
    try {
      const { apiClient } = await import('@/services/api');
      await apiClient.delete(`/community-subscriptions/${selectedSubForCancel.id}`, {
        data: { reason: 'Customer requested cancellation' },
      });
      setCancelDialogOpen(false);
      setSelectedSubForCancel(null);
      await fetchSubscriptions();
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err && typeof (err as { message: unknown }).message === "string"
          ? (err as { message: string }).message
          : "Failed to cancel subscription";
      setError(message);
    } finally {
      setCancellingId(null);
    }
  };

  const openCancelDialog = (sub: CommunitySubscription) => {
    setSelectedSubForCancel(sub);
    setCancelDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200';
      case 'pending': return 'bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'influencer': return <Crown className="w-5 h-5 text-indigo-500" />;
      case 'expert': return <Shield className="w-5 h-5 text-purple-500" />;
      case 'sponsor': return <DollarSign className="w-5 h-5 text-emerald-500" />;
      case 'reporter': return <Calendar className="w-5 h-5 text-blue-500" />;
      default: return <CreditCard className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getCommitmentProgress = (sub: CommunitySubscription) => {
    const start = new Date(sub.commitment_starts_at).getTime();
    const end = new Date(sub.commitment_ends_at).getTime();
    const now = Date.now();
    const progress = Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
    return Math.round(progress);
  };

  const isInBonusPeriod = (sub: CommunitySubscription) => {
    if (!sub.bonus_starts_at || !sub.bonus_ends_at) return false;
    const now = Date.now();
    return now >= new Date(sub.bonus_starts_at).getTime() && now <= new Date(sub.bonus_ends_at).getTime();
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-indigo-500" />
            My Subscriptions
          </h1>
          <p className="text-gray-500 mt-1">Manage your community subscriptions and billing.</p>
        </div>
        {subscriptions.some((s) => s.status === 'active') && (
          <Button asChild type="button" variant="outline" className="shrink-0">
            <Link to="/subscriptions/roi">Subscriber ROI</Link>
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Subscription?</DialogTitle>
            <DialogDescription asChild>
              <div>
                <span>This will cancel your {selectedSubForCancel?.tier} subscription in {selectedSubForCancel?.community?.name}.</span>
                {selectedSubForCancel && getCommitmentProgress(selectedSubForCancel) < 100 && (
                  <span className="block mt-3 font-semibold text-amber-600">
                    ⚠️ Early termination: You have {Math.round(100 - getCommitmentProgress(selectedSubForCancel))}% of your commitment remaining.
                    Estimated balance due: ${(parseFloat(selectedSubForCancel.monthly_rate) * Math.ceil((100 - getCommitmentProgress(selectedSubForCancel)) / (100/12))).toFixed(2)}
                  </span>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Keep Subscription
            </Button>
            <Button
              onClick={handleCancel}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={cancellingId !== null}
            >
              {cancellingId ? 'Cancelling...' : 'Confirm Cancellation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Subscriptions List */}
      {isLoading ? (
        <div className="text-center py-16 text-gray-500">Loading subscriptions...</div>
      ) : subscriptions.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="p-12 text-center">
            <Crown className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">No Active Subscriptions</h3>
            <p className="text-gray-500 mt-2">Start by becoming a community influencer, expert, or sponsor.</p>
            <Button
              className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={() => window.location.href = '/community-influencer'}
            >
              Explore Influencer Program
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {subscriptions.map((sub) => {
            const progress = getCommitmentProgress(sub);
            const inBonus = isInBonusPeriod(sub);

            return (
              <Card key={sub.id} className={`shadow-sm border-l-4 ${sub.status === 'active' ? 'border-l-emerald-500' : 'border-l-gray-300'}`}>
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div className="flex items-center gap-3">
                    {getTierIcon(sub.tier)}
                    <div>
                      <CardTitle className="text-lg capitalize">{sub.tier} Subscription</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <MapPin className="w-3 h-3" />
                        {sub.community?.name || 'Unknown Community'}
                        {sub.category_group && (
                          <span className="text-gray-400">• {sub.category_group.replace(/_/g, ' ')}</span>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(sub.status)}>{sub.status}</Badge>
                    {sub.is_founder_pricing && (
                      <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-200">
                        <Shield className="w-3 h-3 mr-1" /> Founder
                      </Badge>
                    )}
                    {inBonus && (
                      <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200">
                        🎁 Bonus Period
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Rate & Dates */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Monthly Rate</p>
                      <p className="font-semibold text-lg text-gray-900 dark:text-white">${sub.monthly_rate}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Commitment Ends</p>
                      <p className="font-medium text-gray-900 dark:text-white">{formatDate(sub.commitment_ends_at)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Next Renewal</p>
                      <p className="font-medium text-gray-900 dark:text-white">{formatDate(sub.next_renewal_at)}</p>
                    </div>
                    {sub.is_founder_pricing && sub.founder_lock_expires_at && (
                      <div>
                        <p className="text-gray-500">Founder Lock Until</p>
                        <p className="font-medium text-amber-600">{formatDate(sub.founder_lock_expires_at)}</p>
                      </div>
                    )}
                  </div>

                  {/* Commitment Progress */}
                  {sub.status === 'active' && (
                    <div>
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Commitment Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-indigo-600 rounded-full h-2 transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Expert / Sponsor info */}
                  {sub.expert_column_name && (
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-sm">
                      <p className="text-purple-700 dark:text-purple-300">
                        Expert Column: <strong>{sub.expert_column_name}</strong>
                      </p>
                    </div>
                  )}
                  {sub.sponsored_section && (
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 text-sm">
                      <p className="text-emerald-700 dark:text-emerald-300">
                        Sponsoring: <strong>{sub.sponsored_section}</strong>
                      </p>
                    </div>
                  )}

                  {/* Cancel Button */}
                  {sub.status === 'active' && (
                    <div className="flex justify-end pt-2 border-t border-gray-100 dark:border-gray-800">
                      <Button
                        variant="ghost"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => openCancelDialog(sub)}
                      >
                        <XCircle className="w-4 h-4 mr-2" /> Cancel Subscription
                      </Button>
                    </div>
                  )}

                  {/* Cancelled info */}
                  {sub.status === 'cancelled' && (
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Cancelled on {formatDate(sub.cancelled_at || '')}
                      {sub.cancellation_reason && <span>— {sub.cancellation_reason}</span>}
                      {sub.early_termination_balance && (
                        <Badge className="ml-2 bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200">
                          Balance: ${sub.early_termination_balance}
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
