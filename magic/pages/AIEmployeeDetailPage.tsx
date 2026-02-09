import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Settings, Download, TrendingUp, ArrowUp } from 'lucide-react';
export function AIEmployeeDetailPage({
  onBack
}: {
  onBack: () => void;
}) {
  return <motion.div initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} className="max-w-5xl mx-auto pb-12 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Performance
        </button>
        <div className="flex gap-3">
          <button className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2">
            <Settings className="w-4 h-4" /> Configure
          </button>
          <button className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" /> Export PDF
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">
          👩‍💼 Sarah - Marketing Manager Performance
        </h1>
        <select className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700">
          <option>Last 30 Days</option>
          <option>Last 7 Days</option>
          <option>Last 90 Days</option>
          <option>This Year</option>
        </select>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[{
        label: 'Tasks Done',
        value: '127',
        change: '+15',
        icon: TrendingUp
      }, {
        label: 'Efficiency',
        value: '95%',
        change: '+2%',
        icon: TrendingUp
      }, {
        label: 'Quality',
        value: '9.2/10',
        change: '+0.3',
        icon: TrendingUp
      }, {
        label: 'Impact',
        value: '+$3,200',
        change: 'revenue',
        icon: TrendingUp
      }].map((metric, i) => <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <p className="text-sm font-medium text-slate-500 mb-1">
              {metric.label}
            </p>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              {metric.value}
            </h3>
            <div className="flex items-center gap-1 text-sm text-emerald-600 font-medium">
              <ArrowUp className="w-3 h-3" />
              {metric.change}
            </div>
          </div>)}
      </div>

      {/* Performance Trend */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-6">
          Performance Trend
        </h3>
        <div className="h-64 relative flex items-end">
          <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-slate-400">
            <span>100%</span>
            <span>90%</span>
            <span>80%</span>
            <span>70%</span>
          </div>

          <div className="ml-10 flex-1 h-full relative border-l border-b border-slate-200">
            <div className="absolute inset-0 flex flex-col justify-between">
              {[...Array(4)].map((_, i) => <div key={i} className="border-t border-slate-100 w-full h-0" />)}
            </div>

            <svg className="absolute inset-0 w-full h-full overflow-visible">
              <path d="M0,192 L80,160 L160,128 L240,96 L320,80 L400,64 L480,48" fill="none" stroke="#3b82f6" strokeWidth="2" />
              <path d="M0,200 L80,168 L160,140 L240,112 L320,96 L400,88 L480,72" fill="none" stroke="#10b981" strokeWidth="2" />
            </svg>

            <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-slate-400">
              <span>Dec 1</span>
              <span>Dec 8</span>
              <span>Dec 15</span>
              <span>Dec 22</span>
              <span>Dec 29</span>
            </div>
          </div>
        </div>
        <div className="flex justify-center gap-6 mt-8 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-blue-600" />
            <span className="text-slate-600">Efficiency</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-emerald-600" />
            <span className="text-slate-600">Quality Score</span>
          </div>
        </div>
      </div>

      {/* Task Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-6">
          Task Breakdown
        </h3>
        <div className="space-y-4">
          {[{
          task: 'Email Campaigns Sent',
          count: 47,
          percent: 100
        }, {
          task: 'Social Media Posts',
          count: 35,
          percent: 74
        }, {
          task: 'Leads Generated',
          count: 23,
          percent: 49
        }, {
          task: 'Content Pieces Created',
          count: 12,
          percent: 26
        }, {
          task: 'Reports Generated',
          count: 10,
          percent: 21
        }].map((item, i) => <div key={i}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-slate-700">{item.task}</span>
                <span className="font-bold text-slate-900">{item.count}</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{
              width: `${item.percent}%`
            }} />
              </div>
            </div>)}
        </div>
      </div>

      {/* Email Campaign Performance */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide">
            Email Campaign Performance
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Campaign
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Sent
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Opens
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Clicks
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[{
              name: 'Holiday Special',
              sent: 250,
              opens: '78 (31%)',
              clicks: '12 (5%)',
              revenue: '$450'
            }, {
              name: 'Monthly Newsletter',
              sent: 245,
              opens: '68 (28%)',
              clicks: '8 (3%)',
              revenue: '$120'
            }, {
              name: 'Service Reminder',
              sent: 180,
              opens: '54 (30%)',
              clicks: '15 (8%)',
              revenue: '$890'
            }, {
              name: 'Re-engagement',
              sent: 75,
              opens: '18 (24%)',
              clicks: '4 (5%)',
              revenue: '$340'
            }].map((campaign, i) => <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    {campaign.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {campaign.sent}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {campaign.opens}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {campaign.clicks}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-emerald-600">
                    {campaign.revenue}
                  </td>
                </tr>)}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-6">
          Recent Activity
        </h3>
        <div className="space-y-4">
          {[{
          time: 'Today 10:45 AM',
          activity: 'Sent "Holiday Special" campaign (250 recipients)'
        }, {
          time: 'Today 9:30 AM',
          activity: 'Posted to Facebook and Instagram'
        }, {
          time: 'Yesterday 3:00 PM',
          activity: 'Generated weekly marketing report'
        }, {
          time: 'Yesterday 11:00 AM',
          activity: 'Created content calendar for January'
        }, {
          time: 'Dec 27 2:15 PM',
          activity: 'Sent "Service Reminder" campaign (180 recipients)'
        }].map((item, i) => <div key={i} className="flex gap-4 text-sm">
              <span className="text-slate-500 w-32 shrink-0">{item.time}</span>
              <span className="text-slate-700">{item.activity}</span>
            </div>)}
        </div>
        <button className="mt-4 text-sm font-medium text-blue-600 hover:underline">
          View All Activity →
        </button>
      </div>

      {/* AI Insights */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-6">
          AI Insights
        </h3>
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg">
            <p className="text-sm text-emerald-900 font-medium mb-1">
              🟢 Sarah's email open rates are 28% above industry average
            </p>
            <p className="text-xs text-emerald-700">
              Recommendation: Increase email frequency
            </p>
          </div>
          <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg">
            <p className="text-sm text-emerald-900 font-medium mb-1">
              🟢 Thursday sends perform 15% better than other days
            </p>
            <p className="text-xs text-emerald-700">
              Current: Thursday 9 AM ✓ Optimal
            </p>
          </div>
          <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg">
            <p className="text-sm text-amber-900 font-medium mb-1">
              🟡 Social media engagement could improve with more video content
            </p>
            <p className="text-xs text-amber-700">
              Recommendation: Add Jennifer for video creation
            </p>
          </div>
        </div>
      </div>
    </motion.div>;
}