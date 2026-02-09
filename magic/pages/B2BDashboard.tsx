import React, { Children } from 'react';
import { motion } from 'framer-motion';
import { Plus, TrendingUp, DollarSign, CheckCircle2, AlertCircle, Clock, ArrowRight, Calendar } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { ColorPicker } from '../components/ColorPicker';
export function B2BDashboard({
  onNavigate
}: {
  onNavigate: (page: string) => void;
}) {
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
  return <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          🏢 Sales Dashboard
        </h1>
        <button onClick={() => onNavigate('pipeline')} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-md flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Deal
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[{
        id: 'metric-pipeline',
        label: 'Pipeline Value',
        value: '$156,000',
        subtext: '28 deals',
        icon: TrendingUp,
        defaultColor: 'sky'
      }, {
        id: 'metric-won',
        label: 'Deals Won',
        value: '8',
        subtext: '$42,000 revenue',
        icon: CheckCircle2,
        defaultColor: 'mint'
      }, {
        id: 'metric-winrate',
        label: 'Win Rate',
        value: '34%',
        subtext: '▲ +3% vs last month',
        icon: TrendingUp,
        defaultColor: 'sunshine'
      }, {
        id: 'metric-outstanding',
        label: 'Outstanding',
        value: '$18,400',
        subtext: '5 unpaid invoices',
        icon: DollarSign,
        defaultColor: 'coral'
      }].map((metric, i) => {
        const style = getCardStyle(metric.id, metric.defaultColor);
        return <motion.div key={i} variants={itemVariants} className={style.className}>
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <ColorPicker cardId={metric.id} currentColor={metric.defaultColor} />
              </div>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${style.iconBg} backdrop-blur-sm`}>
                  <metric.icon className={`w-6 h-6 ${style.iconColor}`} />
                </div>
              </div>
              <p className={`text-sm font-bold ${style.textClass} mb-1 opacity-80`}>
                {metric.label}
              </p>
              <h3 className={`text-3xl font-bold ${style.textClass} mb-1`}>
                {metric.value}
              </h3>
              <p className={`text-xs font-medium ${style.textClass} opacity-70`}>
                {metric.subtext}
              </p>
            </motion.div>;
      })}
      </div>

      {/* Pipeline Summary */}
      {(() => {
      const style = getCardStyle('pipeline-summary', 'ocean');
      return <motion.div variants={itemVariants} className={style.className}>
            <div className="absolute top-6 right-20 opacity-0 group-hover:opacity-100 transition-opacity">
              <ColorPicker cardId="pipeline-summary" currentColor="ocean" />
            </div>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-sm font-bold ${style.textClass} uppercase tracking-wide`}>
                Pipeline Summary
              </h3>
              <button onClick={() => onNavigate('pipeline')} className={`text-sm font-bold ${style.textClass} hover:underline flex items-center gap-1`}>
                View Board <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {[{
            stage: 'Lead',
            value: '$45,000',
            count: 12,
            percent: 100,
            color: 'bg-blue-300'
          }, {
            stage: 'Qualified',
            value: '$38,000',
            count: 8,
            percent: 75,
            color: 'bg-blue-400'
          }, {
            stage: 'Proposal',
            value: '$42,000',
            count: 5,
            percent: 50,
            color: 'bg-blue-500'
          }, {
            stage: 'Negotiation',
            value: '$31,000',
            count: 3,
            percent: 25,
            color: 'bg-blue-600'
          }].map((item, i) => <div key={i} className="flex items-center gap-4">
                  <div className={`w-24 text-sm font-bold ${style.textClass}`}>
                    {item.stage}
                  </div>
                  <div className={`flex-1 h-8 ${style.contentBg} rounded-lg overflow-hidden flex items-center relative border border-white/20`}>
                    <div className={`h-full ${item.color} absolute left-0 top-0`} style={{
                width: `${item.percent}%`
              }} />
                    <div className={`relative z-10 flex justify-between w-full px-3 text-sm font-bold ${style.textClass}`}>
                      <span>{item.value}</span>
                      <span>{item.count} deals</span>
                    </div>
                  </div>
                </div>)}
            </div>
          </motion.div>;
    })()}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Needs Attention */}
        {(() => {
        const style = getCardStyle('needs-attention', 'coral');
        return <motion.div variants={itemVariants} className={`${style.className} p-0 overflow-hidden`}>
              <div className={`px-6 py-4 border-b border-white/20 ${style.contentBg} backdrop-blur-sm flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  <AlertCircle className={`w-5 h-5 ${style.iconColor}`} />
                  <h3 className={`font-bold ${style.textClass}`}>
                    Needs Attention
                  </h3>
                </div>
                <ColorPicker cardId="needs-attention" currentColor="coral" />
              </div>
              <div className="divide-y divide-white/10">
                <div className={`p-4 ${style.itemHover} transition-colors`}>
                  <p className={`text-xs font-bold ${style.textClass} uppercase mb-2 opacity-80`}>
                    Overdue Activities (3)
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center justify-between text-sm">
                      <span className={`${style.textClass} font-medium`}>
                        • Acme - 14 days no reply
                      </span>
                      <button className={`${style.textClass} hover:underline text-xs font-bold opacity-80`}>
                        View
                      </button>
                    </li>
                    <li className="flex items-center justify-between text-sm">
                      <span className={`${style.textClass} font-medium`}>
                        • Beta - Proposal stale
                      </span>
                      <button className={`${style.textClass} hover:underline text-xs font-bold opacity-80`}>
                        View
                      </button>
                    </li>
                    <li className="flex items-center justify-between text-sm">
                      <span className={`${style.textClass} font-medium`}>
                        • Gamma - Contract review
                      </span>
                      <button className={`${style.textClass} hover:underline text-xs font-bold opacity-80`}>
                        View
                      </button>
                    </li>
                  </ul>
                </div>
                <div className={`p-4 ${style.itemHover} transition-colors`}>
                  <p className={`text-xs font-bold ${style.textClass} uppercase mb-2 opacity-80`}>
                    Stale Deals (2)
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center justify-between text-sm">
                      <span className={`${style.textClass} font-medium`}>
                        • Delta - 21 days in stage
                      </span>
                      <button className={`${style.textClass} hover:underline text-xs font-bold opacity-80`}>
                        View
                      </button>
                    </li>
                    <li className="flex items-center justify-between text-sm">
                      <span className={`${style.textClass} font-medium`}>
                        • Epsilon - 18 days in stage
                      </span>
                      <button className={`${style.textClass} hover:underline text-xs font-bold opacity-80`}>
                        View
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>;
      })()}

        {/* Invoices & Payments */}
        {(() => {
        const style = getCardStyle('invoices-payments', 'mint');
        return <motion.div variants={itemVariants} className={`${style.className} p-0 overflow-hidden`}>
              <div className={`px-6 py-4 border-b border-white/20 ${style.contentBg} backdrop-blur-sm flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  <DollarSign className={`w-5 h-5 ${style.iconColor}`} />
                  <h3 className={`font-bold ${style.textClass}`}>
                    Invoices & Payments
                  </h3>
                </div>
                <ColorPicker cardId="invoices-payments" currentColor="mint" />
              </div>
              <div className="divide-y divide-white/10">
                <div className={`p-4 ${style.itemHover} transition-colors flex justify-between items-center`}>
                  <div>
                    <p className={`text-xs font-bold ${style.textClass} uppercase mb-1 opacity-80`}>
                      Overdue
                    </p>
                    <p className="text-xl font-bold text-red-600 dark:text-red-400">
                      $8,200
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p className={`${style.textClass} font-medium`}>
                      INV-0142 Acme Corp
                    </p>
                    <p className={`${style.textClass} text-xs opacity-70`}>
                      32 days overdue
                    </p>
                  </div>
                </div>
                <div className={`p-4 ${style.itemHover} transition-colors flex justify-between items-center`}>
                  <div>
                    <p className={`text-xs font-bold ${style.textClass} uppercase mb-1 opacity-80`}>
                      Due This Week
                    </p>
                    <p className={`text-xl font-bold ${style.textClass}`}>
                      $5,400
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p className={`${style.textClass} font-medium`}>
                      INV-0156 TechStart
                    </p>
                    <p className={`${style.textClass} text-xs opacity-70`}>
                      Due Friday
                    </p>
                  </div>
                </div>
                <div className={`p-4 ${style.itemHover} transition-colors flex justify-between items-center`}>
                  <div>
                    <p className={`text-xs font-bold ${style.textClass} uppercase mb-1 opacity-80`}>
                      Recently Paid
                    </p>
                    <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                      $12,500
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p className={`${style.textClass} font-medium`}>
                      INV-0151 MainStreet
                    </p>
                    <p className={`${style.textClass} text-xs opacity-70`}>
                      Paid Dec 28
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>;
      })()}
      </div>

      {/* Upcoming Activities */}
      {(() => {
      const style = getCardStyle('upcoming-activities', 'lavender');
      return <motion.div variants={itemVariants} className={style.className}>
            <div className="absolute top-6 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <ColorPicker cardId="upcoming-activities" currentColor="lavender" />
            </div>
            <h3 className={`text-sm font-bold ${style.textClass} uppercase tracking-wide mb-4`}>
              Upcoming Activities
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className={`font-bold ${style.textClass} flex items-center gap-2`}>
                  <Calendar className={`w-4 h-4 ${style.iconColor}`} /> Today
                </h4>
                <div className={`p-3 ${style.contentBg} backdrop-blur-sm rounded-lg border border-white/20 flex items-start gap-3 shadow-sm`}>
                  <span className="text-lg">📞</span>
                  <div>
                    <p className={`text-sm font-bold ${style.textClass}`}>
                      10:00 Call with TechStart
                    </p>
                    <p className={`text-xs ${style.textClass} opacity-70`}>
                      Demo follow-up
                    </p>
                  </div>
                </div>
                <div className={`p-3 ${style.contentBg} backdrop-blur-sm rounded-lg border border-white/20 flex items-start gap-3 shadow-sm`}>
                  <span className="text-lg">📧</span>
                  <div>
                    <p className={`text-sm font-bold ${style.textClass}`}>
                      14:00 Send proposal - Acme
                    </p>
                    <p className={`text-xs ${style.textClass} opacity-70`}>
                      Q1 Service Contract
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className={`font-bold ${style.textClass} flex items-center gap-2`}>
                  <Calendar className={`w-4 h-4 ${style.iconColor}`} /> Tomorrow
                </h4>
                <div className={`p-3 ${style.contentBg} backdrop-blur-sm rounded-lg border border-white/20 flex items-start gap-3 shadow-sm`}>
                  <span className="text-lg">🤝</span>
                  <div>
                    <p className={`text-sm font-bold ${style.textClass}`}>
                      09:00 Demo for Beta Inc
                    </p>
                    <p className={`text-xs ${style.textClass} opacity-70`}>
                      Product walkthrough
                    </p>
                  </div>
                </div>
                <div className={`p-3 ${style.contentBg} backdrop-blur-sm rounded-lg border border-white/20 flex items-start gap-3 shadow-sm`}>
                  <span className="text-lg">📞</span>
                  <div>
                    <p className={`text-sm font-bold ${style.textClass}`}>
                      15:00 Follow up Gamma
                    </p>
                    <p className={`text-xs ${style.textClass} opacity-70`}>
                      Contract review
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>;
    })()}
    </motion.div>;
}