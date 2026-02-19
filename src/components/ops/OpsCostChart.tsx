// ============================================
// OpsCostChart - Budget vs actual chart
// ============================================

import React from 'react';

interface OpsCostChartProps {
  budget: number;
  actual: number;
  projected?: number;
  label?: string;
}

export function OpsCostChart({
  budget,
  actual,
  projected,
  label = 'MTD',
}: OpsCostChartProps) {
  const max = Math.max(budget, actual, projected ?? 0, 1);
  const budgetPct = (budget / max) * 100;
  const actualPct = (actual / max) * 100;
  const projectedPct = projected != null ? (projected / max) * 100 : 0;
  const overBudget = actual > budget;

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600 dark:text-slate-400">{label}</span>
        <div className="flex gap-4">
          <span>
            Budget: <strong>${budget.toLocaleString()}</strong>
          </span>
          <span className={overBudget ? 'text-red-600' : 'text-green-600'}>
            Actual: <strong>${actual.toLocaleString()}</strong>
          </span>
          {projected != null && (
            <span className="text-gray-500">
              Projected: <strong>${projected.toLocaleString()}</strong>
            </span>
          )}
        </div>
      </div>
      <div className="h-8 bg-gray-100 dark:bg-slate-800 rounded-lg overflow-hidden flex">
        <div
          className="bg-indigo-200 dark:bg-indigo-800"
          style={{ width: `${Math.min(budgetPct, 100)}%` }}
          title={`Budget: $${budget.toLocaleString()}`}
        />
        <div
          className={overBudget ? 'bg-red-500' : 'bg-green-500'}
          style={{
            width: `${Math.min(Math.max(actualPct - budgetPct, 0), 100 - budgetPct)}%`,
          }}
          title={`Actual: $${actual.toLocaleString()}`}
        />
        {projected != null && projected > actual && (
          <div
            className="bg-amber-300 dark:bg-amber-700 opacity-70"
            style={{
              width: `${Math.min(Math.max(projectedPct - actualPct, 0), 100 - actualPct)}%`,
            }}
            title={`Projected: $${projected.toLocaleString()}`}
          />
        )}
      </div>
    </div>
  );
}
