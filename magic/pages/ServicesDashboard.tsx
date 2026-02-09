import React, { Children } from 'react';
import { motion } from 'framer-motion';
import { Plus, Users, Wrench, DollarSign, AlertCircle, Clock, MapPin, ArrowRight, Bell } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { ColorPicker } from '../components/ColorPicker';
export function ServicesDashboard({
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
      itemHover: isDarkMode ? 'hover:bg-black/30' : 'hover:bg-white/80'
    };
  };
  return <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          👥 Client Dashboard
        </h1>
        <button onClick={() => onNavigate('customer-add')} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-md flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Client
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[{
        id: 'metric-clients',
        label: 'Active Clients',
        value: '247',
        subtext: '▲ +12 this month',
        icon: Users,
        defaultColor: 'sky'
      }, {
        id: 'metric-jobs',
        label: 'Jobs This Month',
        value: '38',
        subtext: '▲ +6 vs average',
        icon: Wrench,
        defaultColor: 'mint'
      }, {
        id: 'metric-revenue',
        label: 'Revenue',
        value: '$14,200',
        subtext: '▲ +8% vs last month',
        icon: DollarSign,
        defaultColor: 'sunshine'
      }, {
        id: 'metric-outstanding-svc',
        label: 'Outstanding',
        value: '$3,850',
        subtext: '8 unpaid invoices',
        icon: AlertCircle,
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

      {/* Today's Schedule */}
      {(() => {
      const style = getCardStyle('todays-schedule', 'lavender');
      return <motion.div variants={itemVariants} className={style.className}>
            <div className="absolute top-6 right-20 opacity-0 group-hover:opacity-100 transition-opacity">
              <ColorPicker cardId="todays-schedule" currentColor="lavender" />
            </div>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-sm font-bold ${style.textClass} uppercase tracking-wide`}>
                📋 Today's Schedule
              </h3>
              <button className={`text-sm font-bold ${style.textClass} hover:underline flex items-center gap-1`}>
                View Full <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {[{
            time: '9:00 AM',
            client: 'John Smith',
            service: 'Water heater inspection',
            address: '456 Oak Lane',
            details: 'Est: 1hr | $85'
          }, {
            time: '11:00 AM',
            client: 'ABC Corp',
            service: 'Quarterly maintenance',
            address: '789 Business Blvd',
            details: 'Est: 2hr | $250'
          }, {
            time: '2:00 PM',
            client: 'Mary Johnson',
            service: 'Emergency drain repair',
            address: '123 Main St',
            details: 'Est: 1.5hr | $175'
          }].map((job, i) => <div key={i} className={`${style.contentBg} backdrop-blur-sm border border-white/20 rounded-xl p-4 ${style.itemHover} transition-colors shadow-sm`}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-20 font-bold ${style.textClass} pt-1`}>
                        {job.time}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">
                          {job.client} - {job.service}
                        </h4>
                        <div className="flex items-center gap-4 mt-1 text-sm text-slate-600 dark:text-slate-300">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {job.address}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {job.details}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 pl-24 md:pl-0">
                      <button className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm">
                        Start Job
                      </button>
                      <button className={`px-3 py-1.5 ${isDarkMode ? 'bg-slate-700' : 'bg-white'} border border-white/20 ${style.textClass} text-xs font-bold rounded-lg hover:bg-white/40 transition-colors shadow-sm`}>
                        Reschedule
                      </button>
                      <button className={`px-3 py-1.5 ${isDarkMode ? 'bg-slate-700' : 'bg-white'} border border-white/20 ${style.textClass} text-xs font-bold rounded-lg hover:bg-white/40 transition-colors shadow-sm`}>
                        View
                      </button>
                    </div>
                  </div>
                </div>)}
            </div>
          </motion.div>;
    })()}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Open Quotes */}
        {(() => {
        const style = getCardStyle('open-quotes', 'ocean');
        return <motion.div variants={itemVariants} className={`${style.className} p-0 overflow-hidden`}>
              <div className={`px-6 py-4 border-b border-white/20 ${style.contentBg} backdrop-blur-sm flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  <DollarSign className={`w-5 h-5 ${style.iconColor}`} />
                  <h3 className={`font-bold ${style.textClass}`}>
                    Open Quotes
                  </h3>
                </div>
                <ColorPicker cardId="open-quotes" currentColor="ocean" />
              </div>
              <div className="divide-y divide-white/10">
                <div className={`p-4 ${style.itemHover} transition-colors`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className={`font-bold ${style.textClass}`}>
                        Smith - Water heater
                      </p>
                      <p className={`text-sm ${style.textClass} opacity-80`}>
                        $2,400 | 5 days old
                      </p>
                    </div>
                    <button className={`text-xs font-bold ${style.textClass} hover:underline`}>
                      Follow Up
                    </button>
                  </div>
                </div>
                <div className={`p-4 ${style.itemHover} transition-colors`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className={`font-bold ${style.textClass}`}>
                        Davis - Bathroom
                      </p>
                      <p className={`text-sm ${style.textClass} flex items-center gap-1 opacity-80`}>
                        $5,800 | 11 days{' '}
                        <AlertCircle className="w-3 h-3 text-amber-500" />
                      </p>
                    </div>
                    <button className={`text-xs font-bold ${style.textClass} hover:underline`}>
                      Follow Up
                    </button>
                  </div>
                </div>
                <div className={`p-4 ${style.contentBg} text-center`}>
                  <button className={`text-sm font-bold ${style.textClass} hover:underline`}>
                    View All Quotes →
                  </button>
                </div>
              </div>
            </motion.div>;
      })()}

        {/* Unpaid Invoices */}
        {(() => {
        const style = getCardStyle('unpaid-invoices', 'coral');
        return <motion.div variants={itemVariants} className={`${style.className} p-0 overflow-hidden`}>
              <div className={`px-6 py-4 border-b border-white/20 ${style.contentBg} backdrop-blur-sm flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  <AlertCircle className={`w-5 h-5 ${style.iconColor}`} />
                  <h3 className={`font-bold ${style.textClass}`}>
                    Unpaid Invoices
                  </h3>
                </div>
                <ColorPicker cardId="unpaid-invoices" currentColor="coral" />
              </div>
              <div className="divide-y divide-white/10">
                <div className={`p-4 ${style.itemHover} transition-colors`}>
                  <p className={`text-xs font-bold ${style.textClass} uppercase mb-2 opacity-80`}>
                    🔴 Overdue
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className={`${style.textClass} opacity-90`}>
                        Adams
                      </span>
                      <span className={`font-bold ${style.textClass}`}>
                        $450 (18 days)
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className={`${style.textClass} opacity-90`}>
                        Chen
                      </span>
                      <span className={`font-bold ${style.textClass}`}>
                        $285 (12 days)
                      </span>
                    </div>
                  </div>
                  <button className={`mt-3 w-full py-1.5 ${style.contentBg} border border-white/20 ${style.textClass} text-xs font-bold rounded-lg hover:bg-white/40 transition-colors shadow-sm`}>
                    Send Reminders
                  </button>
                </div>
                <div className={`p-4 ${style.itemHover} transition-colors`}>
                  <p className={`text-xs font-bold ${style.textClass} uppercase mb-2 opacity-80`}>
                    🟡 Due This Week
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className={`${style.textClass} opacity-90`}>
                        Wilson
                      </span>
                      <span className={`font-bold ${style.textClass}`}>
                        $320 (Fri)
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className={`${style.textClass} opacity-90`}>
                        Brown
                      </span>
                      <span className={`font-bold ${style.textClass}`}>
                        $175 (Mon)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>;
      })()}

        {/* Needs Action */}
        {(() => {
        const style = getCardStyle('needs-action', 'sunshine');
        return <motion.div variants={itemVariants} className={`${style.className} p-0 overflow-hidden`}>
              <div className={`px-6 py-4 border-b border-white/20 ${style.contentBg} backdrop-blur-sm flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  <Bell className={`w-5 h-5 ${style.iconColor}`} />
                  <h3 className={`font-bold ${style.textClass}`}>
                    Needs Action
                  </h3>
                </div>
                <ColorPicker cardId="needs-action" currentColor="sunshine" />
              </div>
              <div className="divide-y divide-white/10">
                <div className={`p-4 ${style.itemHover} transition-colors`}>
                  <h4 className={`font-bold ${style.textClass} mb-1`}>
                    At-Risk Clients (5)
                  </h4>
                  <p className={`text-sm ${style.textClass} mb-2 opacity-80`}>
                    60+ days without contact
                  </p>
                  <div className="flex -space-x-2 overflow-hidden mb-3">
                    {[1, 2, 3, 4, 5].map(i => <div key={i} className={`inline-block h-8 w-8 rounded-full ring-2 ring-white ${style.contentBg} flex items-center justify-center text-xs font-bold ${style.textClass} shadow-sm`}>
                        {String.fromCharCode(64 + i)}
                      </div>)}
                  </div>
                  <button className={`text-xs font-bold ${style.textClass} hover:underline`}>
                    View List
                  </button>
                </div>
                <div className={`p-4 ${style.itemHover} transition-colors`}>
                  <h4 className={`font-bold ${style.textClass} mb-1`}>
                    Quotes Expiring
                  </h4>
                  <p className={`text-sm ${style.textClass} opacity-80`}>
                    2 quotes expire in 3 days
                  </p>
                </div>
                <div className={`p-4 ${style.contentBg} text-center`}>
                  <button className={`text-sm font-bold ${style.textClass} hover:underline`}>
                    View All Actions →
                  </button>
                </div>
              </div>
            </motion.div>;
      })()}
      </div>
    </motion.div>;
}