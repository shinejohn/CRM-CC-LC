// ============================================
// Ops Cost Tracker - Budget vs actual costs
// ============================================

import React, { useState } from 'react';
import { useOpsDashboard } from '@/hooks/ops/useOpsDashboard';
import { useOpsCosts as useCosts } from '@/hooks/ops/useOpsCosts';
import { OpsCostChart } from '@/components/ops/OpsCostChart';

export function OpsCostTracker() {
  const { data: snapshot } = useOpsDashboard(60_000);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 1);
  const endDate = new Date();

  const { data: costsData } = useCosts({
    periodType: period,
    startDate,
    endDate,
  });

  const costs = costsData?.data ?? [];
  const budget = snapshot?.costs?.mtdBudget ?? 0;
  const actual = snapshot?.costs?.mtdTotal ?? 0;
  const projected = snapshot?.costs?.projectedMonthEnd;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Cost Tracker
        </h1>
        <select
          value={period}
          onChange={(e) =>
            setPeriod(e.target.value as 'daily' | 'weekly' | 'monthly')
          }
          className="rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Budget vs Actual (MTD)
          </h2>
          <OpsCostChart
            budget={budget}
            actual={actual}
            projected={projected}
            label="Month to Date"
          />
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Summary
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-slate-400">Budget</span>
              <span className="font-medium">
                ${budget.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-slate-400">Actual</span>
              <span
                className={`font-medium ${
                  actual > budget ? 'text-red-600' : 'text-green-600'
                }`}
              >
                ${actual.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-slate-400">Variance</span>
              <span
                className={`font-medium ${
                  (snapshot?.costs?.mtdVariance ?? 0) > 0
                    ? 'text-red-600'
                    : 'text-green-600'
                }`}
              >
                ${(snapshot?.costs?.mtdVariance ?? 0).toLocaleString()}
              </span>
            </div>
            {projected != null && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-slate-400">
                  Projected (EOM)
                </span>
                <span className="font-medium">
                  ${projected.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {costs.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Cost History
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-700">
                  <th className="text-left py-2 font-medium">Date</th>
                  <th className="text-right py-2 font-medium">Total</th>
                  <th className="text-right py-2 font-medium">Budget</th>
                </tr>
              </thead>
              <tbody>
                {costs.slice(0, 30).map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-gray-100 dark:border-slate-700"
                  >
                    <td className="py-2">
                      {new Date(c.costDate).toLocaleDateString()}
                    </td>
                    <td className="text-right py-2">
                      ${c.costTotal.toLocaleString()}
                    </td>
                    <td className="text-right py-2">
                      {c.budgetAllocated != null
                        ? `$${c.budgetAllocated.toLocaleString()}`
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
