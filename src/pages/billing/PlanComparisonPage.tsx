import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Check, Minus, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
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

/**
 * Build the union of feature strings across every plan, preserving first-seen
 * order. Subscription plans expose features as a flat `string[]` (see
 * SubscriptionPlan in subscription-api.ts) — there is no structured feature-flag
 * map — so a matrix row is one feature string and a cell is a check when that
 * plan's `features` array contains the string, otherwise an em-dash.
 */
function buildFeatureRows(plans: SubscriptionPlan[]): string[] {
  const seen = new Set<string>();
  const rows: string[] = [];
  for (const plan of plans) {
    for (const feature of plan.features ?? []) {
      const value = feature.trim();
      if (value && !seen.has(value)) {
        seen.add(value);
        rows.push(value);
      }
    }
  }
  return rows;
}

export function PlanComparisonPage() {
  const navigate = useNavigate();
  const { data: plans, isLoading, isError } = useSubscriptionPlans();
  const { data: activeSub } = useActiveSubscription();

  const sortedPlans = useMemo(
    () => [...(plans ?? [])].sort((a, b) => planRank(a) - planRank(b)),
    [plans],
  );
  const featureRows = useMemo(() => buildFeatureRows(sortedPlans), [sortedPlans]);

  const planFeatureSets = useMemo(
    () =>
      sortedPlans.map(
        (plan) => new Set((plan.features ?? []).map((feature) => feature.trim())),
      ),
    [sortedPlans],
  );

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
        <div className="text-center py-16 text-slate-500">
          No subscription plans are available right now.
        </div>
      )}

      {!isLoading && !isError && sortedPlans.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <caption className="sr-only">
              Comparison of subscription plan tiers and the features included in each.
            </caption>

            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th
                  scope="col"
                  className="sticky left-0 z-10 bg-white dark:bg-slate-800 p-4 align-bottom text-sm font-semibold text-slate-500 dark:text-slate-400"
                >
                  Features
                </th>
                {sortedPlans.map((plan) => {
                  const isCurrent = activeSub?.serviceId === plan.id;
                  const cycle = plan.billing_period === 'annual' ? 'yr' : 'mo';
                  return (
                    <th
                      scope="col"
                      key={plan.id}
                      aria-current={isCurrent ? 'true' : undefined}
                      className={`p-4 align-bottom text-center min-w-[160px] bg-white dark:bg-slate-800 ${
                        plan.is_featured
                          ? 'border-x-2 border-t-2 border-indigo-300 dark:border-indigo-800'
                          : ''
                      }`}
                    >
                      {plan.is_featured && (
                        <span className="block mb-1 text-xs font-bold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                          Most Popular
                        </span>
                      )}
                      <span className="block text-base font-bold text-slate-900 dark:text-white">
                        {plan.name}
                      </span>
                      {plan.service_tier && (
                        <span className="block text-xs uppercase tracking-wide text-slate-400">
                          {plan.service_tier}
                        </span>
                      )}
                      <span className="mt-1 block">
                        <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                          ${plan.price.toFixed(2)}
                        </span>
                        <span className="text-sm text-slate-500">/{cycle}</span>
                      </span>
                      {isCurrent && (
                        <span className="mt-1 block text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          Current plan
                        </span>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {featureRows.length === 0 && (
                <tr>
                  <td
                    colSpan={sortedPlans.length + 1}
                    className="p-6 text-center text-sm text-slate-500"
                  >
                    These plans don&apos;t list individual features to compare.
                  </td>
                </tr>
              )}

              {featureRows.map((feature) => (
                <tr
                  key={feature}
                  className="border-b border-slate-100 dark:border-slate-700/60"
                >
                  <th
                    scope="row"
                    className="sticky left-0 z-10 bg-white dark:bg-slate-800 p-4 text-sm font-medium text-slate-700 dark:text-slate-200"
                  >
                    {feature}
                  </th>
                  {sortedPlans.map((plan, planIndex) => {
                    const included = planFeatureSets[planIndex].has(feature);
                    return (
                      <td
                        key={plan.id}
                        className={`p-4 text-center ${
                          plan.is_featured
                            ? 'border-x-2 border-indigo-300 dark:border-indigo-800'
                            : ''
                        }`}
                      >
                        {included ? (
                          <Check
                            className="mx-auto w-5 h-5 text-emerald-500"
                            role="img"
                            aria-label={`${plan.name} includes ${feature}`}
                          />
                        ) : (
                          <Minus
                            className="mx-auto w-4 h-4 text-slate-300 dark:text-slate-600"
                            role="img"
                            aria-label={`${plan.name} does not include ${feature}`}
                          />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>

            <tfoot>
              <tr>
                <td className="sticky left-0 z-10 bg-white dark:bg-slate-800 p-4" />
                {sortedPlans.map((plan) => {
                  const isCurrent = activeSub?.serviceId === plan.id;
                  return (
                    <td
                      key={plan.id}
                      className={`p-4 align-top text-center bg-white dark:bg-slate-800 ${
                        plan.is_featured
                          ? 'border-x-2 border-b-2 border-indigo-300 dark:border-indigo-800'
                          : ''
                      }`}
                    >
                      {isCurrent ? (
                        <Button type="button" variant="outline" className="w-full" disabled>
                          Current Plan
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          className="w-full"
                          aria-label={`Select the ${plan.name} plan`}
                          onClick={() =>
                            navigate(`/command-center/deliver/plans/change/${plan.id}`)
                          }
                        >
                          Select Plan
                        </Button>
                      )}
                    </td>
                  );
                })}
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}

export default PlanComparisonPage;
