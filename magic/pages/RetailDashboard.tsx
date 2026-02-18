import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Users, Calendar, TrendingUp, AlertCircle, ArrowRight, Gift, Award, Cake, Heart } from 'lucide-react';
import { LogVisitModal } from '../components/LogVisitModal';
import { useTheme } from '../contexts/ThemeContext';
import { ColorPicker } from '../components/ColorPicker';
import { useDashboardAnalytics } from '@/hooks/useAnalytics';
import { useBusinessMode } from '../contexts/BusinessModeContext';

export function RetailDashboard({
  onNavigate
}: {
  onNavigate: (page: string) => void;
}) {
  const [isLogVisitOpen, setIsLogVisitOpen] = useState(false);
  const { getColorScheme, isDarkMode } = useTheme();
  const { terminology } = useBusinessMode();
  const { data: analytics, isLoading } = useDashboardAnalytics();
  const customers = (analytics as { customers?: { total?: number; new?: number } })?.customers;
  const orders = (analytics as { orders?: { total?: number; recent?: number } })?.orders;
  const guestCount = customers?.total ?? 0;
  const newGuests = customers?.new ?? 0;
  const visitsCount = orders?.total ?? 0;
  const recentVisits = orders?.recent ?? 0;
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
          🎯 Guest Relations
        </h1>
        <div className="flex gap-3">
          <button onClick={() => setIsLogVisitOpen(true)} className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 shadow-sm">
            <Calendar className="w-4 h-4" /> Log Visit
          </button>
          <button onClick={() => onNavigate('customer-add')} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-md flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Guest
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[{
        id: 'metric-guests',
        label: `Known ${terminology.customers}`,
        value: isLoading ? '—' : guestCount.toLocaleString(),
        subtext: `▲ +${newGuests} this period`,
        icon: Users,
        defaultColor: 'sky'
      }, {
        id: 'metric-visits',
        label: `${terminology.activities} This Month`,
        value: isLoading ? '—' : visitsCount.toLocaleString(),
        subtext: `▲ +${recentVisits} recent`,
        icon: Calendar,
        defaultColor: 'mint'
      }, {
        id: 'metric-regulars',
        label: 'Regulars (3+ visits)',
        value: isLoading ? '—' : String(Math.round(guestCount * 0.15)),
        subtext: guestCount > 0 ? `${Math.round((guestCount * 0.15) / guestCount * 100)}% of base` : '—',
        icon: Heart,
        defaultColor: 'lavender'
      }, {
        id: 'metric-risk',
        label: 'At Risk Lapsed',
        value: isLoading ? '—' : String(Math.max(0, Math.round(guestCount * 0.02))),
        subtext: '60+ days no visit',
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

      {/* Loyalty Program Overview */}
      {(() => {
      const style = getCardStyle('loyalty-overview', 'peach');
      return <motion.div variants={itemVariants} className={style.className}>
            <div className="absolute top-6 right-20 opacity-0 group-hover:opacity-100 transition-opacity">
              <ColorPicker cardId="loyalty-overview" currentColor="peach" />
            </div>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-sm font-bold ${style.textClass} uppercase tracking-wide flex items-center gap-2`}>
                <Award className="w-4 h-4" /> Loyalty Program Overview
              </h3>
              <button onClick={() => onNavigate('loyalty')} className={`text-sm font-bold ${style.textClass} hover:underline flex items-center gap-1`}>
                Manage <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              <div className={`${style.contentBg} backdrop-blur-sm rounded-xl p-4 text-center border border-white/20 shadow-sm`}>
                <p className={`text-sm font-medium ${style.textClass} mb-1 opacity-80`}>
                  Total Members
                </p>
                <p className={`text-2xl font-bold ${style.textClass}`}>423</p>
              </div>
              <div className={`${style.contentBg} backdrop-blur-sm rounded-xl p-4 text-center border border-white/20 shadow-sm`}>
                <p className={`text-sm font-medium ${style.textClass} mb-1 opacity-80`}>
                  Active (30 days)
                </p>
                <p className={`text-2xl font-bold ${style.textClass}`}>312</p>
              </div>
              <div className={`${style.contentBg} backdrop-blur-sm rounded-xl p-4 text-center border border-white/20 shadow-sm`}>
                <p className={`text-sm font-medium ${style.textClass} mb-1 opacity-80`}>
                  Rewards Redeemed
                </p>
                <p className={`text-2xl font-bold ${style.textClass}`}>47</p>
              </div>
            </div>

            <div className="space-y-4">
              {[{
            tier: '🥉 Bronze (1-2)',
            count: 245,
            percent: 58,
            color: 'bg-amber-600'
          }, {
            tier: '🥈 Silver (3-5)',
            count: 112,
            percent: 26,
            color: 'bg-slate-400'
          }, {
            tier: '🥇 Gold (6-10)',
            count: 48,
            percent: 11,
            color: 'bg-yellow-400'
          }, {
            tier: '💎 VIP (11+)',
            count: 18,
            percent: 5,
            color: 'bg-purple-600'
          }].map((item, i) => <div key={i} className="flex items-center gap-4">
                  <div className={`w-32 text-sm font-bold ${style.textClass}`}>
                    {item.tier}
                  </div>
                  <div className={`flex-1 h-6 ${style.contentBg} rounded-full overflow-hidden flex items-center relative border border-white/20`}>
                    <motion.div initial={{
                width: 0
              }} animate={{
                width: `${item.percent}%`
              }} transition={{
                duration: 1,
                delay: 0.2 + i * 0.1
              }} className={`h-full ${item.color} absolute left-0 top-0 rounded-full`} />
                  </div>
                  <div className={`w-24 text-right text-sm font-medium ${style.textClass}`}>
                    {item.count} members
                  </div>
                </div>)}
            </div>
          </motion.div>;
    })()}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Birthdays */}
        {(() => {
        const style = getCardStyle('birthdays', 'lavender');
        return <motion.div variants={itemVariants} className={`${style.className} p-0 overflow-hidden`}>
              <div className={`px-6 py-4 border-b border-white/20 ${style.contentBg} backdrop-blur-sm flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  <Cake className={`w-5 h-5 ${style.iconColor}`} />
                  <h3 className={`font-bold ${style.textClass}`}>
                    Upcoming Birthdays
                  </h3>
                </div>
                <ColorPicker cardId="birthdays" currentColor="lavender" />
              </div>
              <div className="divide-y divide-white/10">
                <div className={`p-4 ${style.itemHover} transition-colors flex items-center justify-between`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${style.contentBg} rounded-full flex items-center justify-center text-lg shadow-sm`}>
                      💎
                    </div>
                    <div>
                      <p className={`font-bold ${style.textClass}`}>
                        Sarah M. - Tomorrow
                      </p>
                      <p className={`text-xs ${style.textClass} opacity-80`}>
                        12 visits | Table 7
                      </p>
                    </div>
                  </div>
                  <button className={`px-3 py-1.5 ${style.contentBg} ${style.textClass} text-xs font-bold rounded-lg hover:bg-white/40 transition-colors`}>
                    Send Offer
                  </button>
                </div>
                <div className={`p-4 ${style.itemHover} transition-colors flex items-center justify-between`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${style.contentBg} rounded-full flex items-center justify-center text-lg shadow-sm`}>
                      🥇
                    </div>
                    <div>
                      <p className={`font-bold ${style.textClass}`}>
                        Mike T. - Jan 4
                      </p>
                      <p className={`text-xs ${style.textClass} opacity-80`}>
                        8 visits | Wine lover
                      </p>
                    </div>
                  </div>
                  <button className={`px-3 py-1.5 ${style.contentBg} ${style.textClass} text-xs font-bold rounded-lg hover:bg-white/40 transition-colors`}>
                    Send Offer
                  </button>
                </div>
                <div className={`p-4 ${style.contentBg} text-center`}>
                  <button className={`text-sm font-bold ${style.textClass} hover:underline`}>
                    View All Upcoming →
                  </button>
                </div>
              </div>
            </motion.div>;
      })()}

        {/* Win-Back Opportunities */}
        {(() => {
        const style = getCardStyle('win-back', 'coral');
        return <motion.div variants={itemVariants} className={`${style.className} p-0 overflow-hidden`}>
              <div className={`px-6 py-4 border-b border-white/20 ${style.contentBg} backdrop-blur-sm flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  <AlertCircle className={`w-5 h-5 ${style.iconColor}`} />
                  <h3 className={`font-bold ${style.textClass}`}>
                    Win-Back Opportunities
                  </h3>
                </div>
                <ColorPicker cardId="win-back" currentColor="coral" />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`text-3xl font-bold ${style.textClass}`}>
                    23
                  </span>
                  <span className={`text-sm font-medium ${style.textClass} opacity-80`}>
                    lapsed regulars (60+ days)
                  </span>
                </div>

                <ul className="space-y-2 mb-6">
                  <li className={`text-sm ${style.textClass} flex items-center gap-2 font-medium`}>
                    <span className="w-2 h-2 bg-red-500 rounded-full" />
                    Tom & Lisa - 68 days (was weekly)
                  </li>
                  <li className={`text-sm ${style.textClass} flex items-center gap-2 font-medium`}>
                    <span className="w-2 h-2 bg-red-500 rounded-full" />
                    David K. - 72 days (Gold member)
                  </li>
                  <li className={`text-sm ${style.textClass} flex items-center gap-2 font-medium`}>
                    <span className="w-2 h-2 bg-red-500 rounded-full" />
                    The Hendersons - 65 days
                  </li>
                </ul>

                <div className={`${style.contentBg} border border-white/20 rounded-lg p-3 mb-4`}>
                  <p className={`text-xs ${style.textClass} font-bold flex items-center gap-1`}>
                    💡 "We miss you" 15% off campaign could recover
                    ~$1,200/month
                  </p>
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 transition-colors shadow-sm">
                    Launch Campaign
                  </button>
                  <button className={`flex-1 py-2 ${style.contentBg} border border-white/20 ${style.textClass} text-sm font-bold rounded-lg hover:bg-white/40 transition-colors shadow-sm`}>
                    View All
                  </button>
                </div>
              </div>
            </motion.div>;
      })()}
      </div>

      <LogVisitModal isOpen={isLogVisitOpen} onClose={() => setIsLogVisitOpen(false)} />
    </motion.div>;
}