import React, { Children } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Download, Edit, Plus, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { ColorPicker } from '../components/ColorPicker';
export function BillingDashboard() {
  const {
    getColorScheme,
    isDarkMode
  } = useTheme();
  const containerVariants = {
    hidden: {
      opacity: 0
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20
    },
    visible: {
      opacity: 1,
      y: 0
    }
  };
  // Helper to get card styles
  const getCardStyle = (id: string, defaultColor: string) => {
    const scheme = getColorScheme(id, defaultColor);
    return {
      className: `bg-gradient-to-br ${scheme.gradient} rounded-xl shadow-lg border-2 ${scheme.border} p-6 hover:shadow-xl transition-shadow relative group`,
      iconBg: scheme.iconBg,
      iconColor: scheme.iconColor,
      textClass: scheme.text,
      contentBg: isDarkMode ? 'bg-black/20' : 'bg-white/60',
      itemHover: isDarkMode ? 'hover:bg-black/30' : 'hover:bg-white/30'
    };
  };
  return <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-5xl mx-auto pb-12 space-y-8">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
        💳 Billing & Subscription
      </h1>

      {/* Current Plan */}
      {(() => {
      const style = getCardStyle('current-plan', 'sky');
      return <motion.div variants={itemVariants} className={style.className}>
            <div className="absolute top-6 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <ColorPicker cardId="current-plan" currentColor="sky" />
            </div>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-sm font-bold ${style.textClass} uppercase tracking-wide`}>
                Current Plan
              </h3>
              <button className={`text-sm font-bold ${style.textClass} hover:underline`}>
                Change Plan
              </button>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className={`w-12 h-12 ${style.contentBg} rounded-full flex items-center justify-center text-2xl shadow-sm`}>
                🎯
              </div>
              <div>
                <h2 className={`text-xl font-bold ${style.textClass}`}>
                  Growth Plan (Tier 2)
                </h2>
                <p className={`${style.textClass} text-sm opacity-80`}>
                  Perfect for growing businesses
                </p>
              </div>
            </div>

            <div className={`space-y-3 mb-6 border-b border-white/20 pb-6`}>
              <div className="flex justify-between text-sm">
                <span className={`${style.textClass} opacity-90`}>
                  Base Plan
                </span>
                <span className={`font-bold ${style.textClass}`}>
                  $199.00/month
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className={`${style.textClass} opacity-90`}>
                  Sarah (Marketing)
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  $0 (included)
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className={`${style.textClass} opacity-90`}>
                  Derek (Dispatch)
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  $0 (included)
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className={`${style.textClass} opacity-90`}>
                  Olivia (Customer Svc)
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  $0 (included)
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className={`${style.textClass} opacity-90`}>
                  Extra: Emma (Finance)
                </span>
                <span className={`font-bold ${style.textClass}`}>
                  $99.00/month
                </span>
              </div>
            </div>

            <div className="flex justify-between items-end">
              <div>
                <p className={`text-sm ${style.textClass} mb-1 opacity-80`}>
                  Next billing date
                </p>
                <p className={`font-bold ${style.textClass}`}>
                  January 15, 2025
                </p>
              </div>
              <div className="text-right">
                <p className={`text-sm ${style.textClass} mb-1 opacity-80`}>
                  Monthly Total
                </p>
                <p className={`text-2xl font-bold ${style.textClass}`}>
                  $298.00
                  <span className={`text-sm font-normal ${style.textClass} opacity-80`}>
                    /month
                  </span>
                </p>
              </div>
            </div>
          </motion.div>;
    })()}

      {/* Payment Method */}
      {(() => {
      const style = getCardStyle('payment-method', 'mint');
      return <motion.div variants={itemVariants} className={style.className}>
            <div className="absolute top-6 right-24 opacity-0 group-hover:opacity-100 transition-opacity">
              <ColorPicker cardId="payment-method" currentColor="mint" />
            </div>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-sm font-bold ${style.textClass} uppercase tracking-wide`}>
                Payment Method
              </h3>
              <div className="flex gap-3">
                <button className={`text-sm font-bold ${style.textClass} hover:underline flex items-center gap-1`}>
                  <Plus className="w-4 h-4" /> Add New
                </button>
                <button className={`text-sm font-bold ${style.textClass} hover:underline flex items-center gap-1`}>
                  <Edit className="w-4 h-4" /> Edit
                </button>
              </div>
            </div>

            <div className={`flex items-center gap-4 p-4 border border-white/20 rounded-xl ${style.contentBg} backdrop-blur-sm shadow-sm`}>
              <div className="w-12 h-8 bg-white dark:bg-slate-700 border border-white/20 rounded flex items-center justify-center">
                <CreditCard className={`w-6 h-6 ${style.textClass}`} />
              </div>
              <div className="flex-1">
                <p className={`font-bold ${style.textClass}`}>
                  Visa ending in 4242
                </p>
                <p className={`text-sm ${style.textClass} opacity-80`}>
                  Expires 12/2026
                </p>
              </div>
              <span className={`px-2 py-1 ${style.iconBg} ${style.textClass} text-xs font-bold rounded`}>
                Default
              </span>
            </div>
          </motion.div>;
    })()}

      {/* Billing History */}
      {(() => {
      const style = getCardStyle('billing-history', 'lavender');
      return <motion.div variants={itemVariants} className={`${style.className} p-0 overflow-hidden`}>
            <div className={`p-6 border-b border-white/20 flex items-center justify-between ${style.contentBg} backdrop-blur-sm`}>
              <h3 className={`text-sm font-bold ${style.textClass} uppercase tracking-wide`}>
                Billing History
              </h3>
              <div className="flex items-center gap-2">
                <ColorPicker cardId="billing-history" currentColor="lavender" />
                <button className={`text-sm font-bold ${style.textClass} hover:underline flex items-center gap-1`}>
                  <Download className="w-4 h-4" /> Download All
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`${isDarkMode ? 'bg-black/10' : 'bg-white/20'} border-b border-white/20`}>
                    <th className={`px-6 py-3 text-left text-xs font-bold ${style.textClass} uppercase tracking-wide opacity-80`}>
                      Date
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-bold ${style.textClass} uppercase tracking-wide opacity-80`}>
                      Description
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-bold ${style.textClass} uppercase tracking-wide opacity-80`}>
                      Amount
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-bold ${style.textClass} uppercase tracking-wide opacity-80`}>
                      Status
                    </th>
                    <th className={`px-6 py-3 text-right text-xs font-bold ${style.textClass} uppercase tracking-wide opacity-80`}>
                      Invoice
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {/* Mock data commented out - use BillingDashboardPage with real API */}
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center opacity-80">
                      No payment history. Use BillingDashboardPage for real data.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className={`p-4 border-t border-white/20 ${style.contentBg} text-center`}>
              <button className={`text-sm font-bold ${style.textClass} hover:underline`}>
                View All Invoices
              </button>
            </div>
          </motion.div>;
    })()}

      {/* Usage This Period */}
      {(() => {
      const style = getCardStyle('usage-period', 'peach');
      return <motion.div variants={itemVariants} className={style.className}>
            <div className="absolute top-6 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <ColorPicker cardId="usage-period" currentColor="peach" />
            </div>
            <h3 className={`text-sm font-bold ${style.textClass} uppercase tracking-wide mb-6`}>
              Usage This Period
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Mock usage data commented out - wire to real usage API */}
              <div className="col-span-2 text-center py-8 opacity-80">
                No usage data. Wire to real usage API.
              </div>
            </div>
          </motion.div>;
    })()}
    </motion.div>;
}