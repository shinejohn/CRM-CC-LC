import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '@/components/shared';
import { Button } from '@/components/ui/button';
import {
  useActiveSubscription,
  useProrationPreview,
  useUpgradeSubscription,
  useDowngradeSubscription,
} from '@/hooks/useSubscription';

function formatCents(cents: number): string {
  const sign = cents < 0 ? '-' : '';
  return `${sign}$${(Math.abs(cents) / 100).toFixed(2)}`;
}

export function PlanUpgradeFlow() {
  const navigate = useNavigate();
  const { serviceId } = useParams<{ serviceId: string }>();
  const [done, setDone] = useState(false);

  const { data: activeSub, isLoading: subLoading } = useActiveSubscription();
  const { data: preview, isLoading: previewLoading, isError: previewError } = useProrationPreview(serviceId);

  const upgrade = useUpgradeSubscription();
  const downgrade = useDowngradeSubscription();

  const isDowngrade = preview?.direction === 'downgrade';
  const mutation = isDowngrade ? downgrade : upgrade;
  const errorMessage =
    (upgrade.error as { message?: string } | null)?.message ??
    (downgrade.error as { message?: string } | null)?.message ??
    null;

  const handleConfirm = () => {
    if (!activeSub || !serviceId) return;
    mutation.mutate(
      { subscriptionId: activeSub.id, targetServiceId: serviceId },
      { onSuccess: () => setDone(true) },
    );
  };

  const loading = subLoading || previewLoading;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <PageHeader title="Change Your Plan" subtitle="Review the details before confirming" />

      <Button
        type="button"
        variant="ghost"
        className="gap-2"
        onClick={() => navigate('/command-center/deliver/plans')}
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Plans
      </Button>

      {loading && (
        <div className="flex justify-center py-16" aria-busy="true">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      )}

      {!loading && !activeSub && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
          <AlertCircle className="mx-auto text-amber-500 mb-2 w-8 h-8" />
          <p className="text-amber-800">You do not have an active subscription to change.</p>
        </div>
      )}

      {!loading && activeSub && previewError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="mx-auto text-red-500 mb-2 w-8 h-8" />
          <p className="text-red-700">Could not calculate the proration for this plan change.</p>
        </div>
      )}

      {done && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 text-center">
          <CheckCircle2 className="mx-auto text-emerald-500 mb-2 w-8 h-8" />
          <p className="text-emerald-800 font-medium mb-4">
            Your plan has been {isDowngrade ? 'downgraded' : 'upgraded'} successfully.
          </p>
          <Button type="button" onClick={() => navigate('/command-center/deliver/billing')}>
            Back to Billing
          </Button>
        </div>
      )}

      {!loading && activeSub && preview && !done && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
              <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">Current Plan</p>
              <p className="font-bold text-slate-900 dark:text-white">{preview.current_plan.name}</p>
              <p className="text-sm text-slate-500">
                {formatCents(preview.current_plan.amount_cents)} / {preview.current_plan.billing_cycle}
              </p>
            </div>
            <div className="rounded-xl border border-indigo-300 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 p-5">
              <p className="text-xs uppercase tracking-wide text-indigo-500 mb-1 flex items-center gap-1">
                <ArrowRight className="w-3 h-3" /> New Plan
              </p>
              <p className="font-bold text-slate-900 dark:text-white">{preview.target_plan.name}</p>
              <p className="text-sm text-slate-500">
                {formatCents(preview.target_plan.amount_cents)} / {preview.target_plan.billing_cycle}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-300">
                {preview.proration_amount_cents >= 0 ? 'Prorated charge today' : 'Prorated credit'}
              </span>
              <span className="font-medium text-slate-900 dark:text-white">
                {formatCents(preview.proration_amount_cents)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-300">Next invoice total</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {formatCents(preview.next_invoice_total_cents)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-300">Effective</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {new Date(preview.effective_date).toLocaleDateString()}
              </span>
            </div>
            {!preview.stripe_preview && (
              <p className="text-xs text-slate-400">Estimated proration based on remaining billing period.</p>
            )}
          </div>

          {preview.direction === 'unchanged' ? (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
              This plan costs the same as your current plan, so there is nothing to change.
            </div>
          ) : (
            <>
              {errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {errorMessage}
                </div>
              )}
              <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/command-center/deliver/plans')}
                  disabled={mutation.isPending}
                >
                  Cancel
                </Button>
                <Button type="button" onClick={handleConfirm} disabled={mutation.isPending} className="gap-2">
                  {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Confirm {isDowngrade ? 'Downgrade' : 'Upgrade'}
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default PlanUpgradeFlow;
