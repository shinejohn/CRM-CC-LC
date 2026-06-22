import { useNavigate } from 'react-router';
import { Check, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { PageHeader } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { useActiveSubscription, useSubscriptionPlans } from '@/hooks/useSubscription';
import type { SubscriptionPlan } from '@/services/learning/subscription-api';

const TIER_ORDER: Record<string, number> = {
  trial: 0,
  basic: 1,
  standard: 2,
  premium: 3,
  enterprise: 4,
};

function planRank(plan: SubscriptionPlan): number {
  const tier = plan.service_tier ?? '';
  if (tier in TIER_ORDER) return TIER_ORDER[tier];
  return plan.price;
}

export function PlanComparisonPage() {
  const navigate = useNavigate();
  const { data: plans, isLoading, isError } = useSubscriptionPlans();
  const { data: activeSub } = useActiveSubscription();

  const sortedPlans = [...(plans ?? [])].sort((a, b) => planRank(a) - planRank(b));

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <PageHeader
        title="Compare Plans"
        subtitle="Choose the plan that fits your business"
      />

      <Button
        type="button"
        variant="ghost"
        className="gap-2"
        onClick={() => navigate('/command-center/deliver/billing')}
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Billing
      </Button>

      {isLoading && (
        <div className="flex justify-center py-16" aria-busy="true">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      )}

      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="mx-auto text-red-500 mb-2 w-8 h-8" />
          <p className="text-red-700">Failed to load plans. Please try again.</p>
        </div>
      )}

      {!isLoading && !isError && sortedPlans.length === 0 && (
        <div className="text-center py-16 text-slate-500">No subscription plans are available right now.</div>
      )}

      {!isLoading && sortedPlans.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedPlans.map((plan) => {
            const isCurrent = activeSub?.serviceId === plan.id;
            const cycle = plan.billing_period === 'annual' ? 'yr' : 'mo';

            return (
              <div
                key={plan.id}
                className={`rounded-xl border p-6 flex flex-col ${
                  plan.is_featured
                    ? 'border-indigo-400 ring-2 ring-indigo-200 dark:ring-indigo-900'
                    : 'border-slate-200 dark:border-slate-700'
                } bg-white dark:bg-slate-800`}
              >
                {plan.is_featured && (
                  <span className="self-start mb-2 text-xs font-bold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                    Most Popular
                  </span>
                )}
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                {plan.service_tier && (
                  <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">{plan.service_tier}</p>
                )}
                <p className="mt-2 mb-4">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                    ${plan.price.toFixed(2)}
                  </span>
                  <span className="text-sm text-slate-500">/{cycle}</span>
                </p>

                {plan.description && (
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">{plan.description}</p>
                )}

                {Array.isArray(plan.features) && plan.features.length > 0 && (
                  <ul className="space-y-2 mb-6 flex-1">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-200">
                        <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-auto">
                  {isCurrent ? (
                    <Button type="button" variant="outline" className="w-full" disabled>
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      className="w-full"
                      onClick={() => navigate(`/command-center/deliver/plans/change/${plan.id}`)}
                    >
                      Select Plan
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default PlanComparisonPage;
