import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, ArrowRight, ListChecks, AlertCircle, PartyPopper } from 'lucide-react';
import {
  PageHeader,
  DataCard,
  LoadingState,
  EmptyState,
} from '@/components/shared';
import { Button } from '@/components/ui/button';
import { useOnboarding, useCompleteOnboardingStep } from '@/hooks/useOnboarding';
import type { OnboardingStep } from '@/services/crm/onboarding-api';

export function OnboardingChecklist() {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useOnboarding();
  const completeStep = useCompleteOnboardingStep();

  const percent = data?.percent ?? 0;
  const steps = data?.steps ?? [];

  const handleMarkDone = (step: OnboardingStep) => {
    if (step.completed || completeStep.isPending) return;
    completeStep.mutate(step.key);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Getting Started"
        subtitle="Complete these steps to get the most out of your account"
        icon={ListChecks}
      />

      {isError ? (
        <DataCard>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--nexus-bg-secondary)] border border-[var(--nexus-card-border)] flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-[var(--nexus-accent-danger)]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--nexus-text-primary)] mb-2">
              Couldn&apos;t load your checklist
            </h3>
            <p className="text-sm text-[var(--nexus-text-secondary)] max-w-md mb-6">
              There was a problem fetching your onboarding steps. Check your connection and try again.
            </p>
            <Button type="button" variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        </DataCard>
      ) : isLoading ? (
        <DataCard>
          <LoadingState variant="list" count={5} />
        </DataCard>
      ) : steps.length === 0 ? (
        <DataCard>
          <EmptyState
            icon={ListChecks}
            title="Nothing to set up yet"
            description="Your onboarding checklist will appear here after your first purchase."
          />
        </DataCard>
      ) : (
        <>
          {/* Progress bar */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <DataCard>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[var(--nexus-text-secondary)]">
                    {data?.complete ? 'All set!' : 'Your progress'}
                  </span>
                  <span className="text-sm font-semibold text-[var(--nexus-text-primary)]">
                    {percent}%
                  </span>
                </div>
                <div
                  className="h-2 w-full rounded-full bg-[var(--nexus-bg-secondary)] overflow-hidden"
                  role="progressbar"
                  aria-valuenow={percent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Onboarding completion"
                >
                  <motion.div
                    className="h-full rounded-full bg-[var(--nexus-accent-primary)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
                {data?.complete && (
                  <div className="flex items-center gap-2 text-sm text-[var(--nexus-accent-primary)] pt-1">
                    <PartyPopper className="w-4 h-4" />
                    You&apos;ve completed onboarding. Nicely done!
                  </div>
                )}
              </div>
            </DataCard>
          </motion.div>

          {/* Steps */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <DataCard noPadding>
              <ul className="divide-y divide-[var(--nexus-card-border)]">
                {steps.map((step) => (
                  <li key={step.key} className="flex items-center gap-4 p-4">
                    {step.completed ? (
                      <CheckCircle2 className="w-5 h-5 shrink-0 text-[var(--nexus-accent-primary)]" aria-hidden="true" />
                    ) : (
                      <Circle className="w-5 h-5 shrink-0 text-[var(--nexus-text-tertiary)]" aria-hidden="true" />
                    )}

                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium ${
                          step.completed
                            ? 'text-[var(--nexus-text-tertiary)] line-through'
                            : 'text-[var(--nexus-text-primary)]'
                        }`}
                      >
                        {step.label}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(step.cta_route)}
                        aria-label={`Go to ${step.label}`}
                      >
                        Open
                        <ArrowRight className="w-4 h-4 ml-1.5" />
                      </Button>
                      {!step.completed && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkDone(step)}
                          disabled={completeStep.isPending}
                          aria-label={`Mark "${step.label}" as done`}
                        >
                          Mark done
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </DataCard>
          </motion.div>
        </>
      )}
    </div>
  );
}
