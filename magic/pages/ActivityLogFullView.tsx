import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Filter, Mail, Wrench, Calendar, UserPlus, DollarSign } from 'lucide-react';
export function ActivityLogFullView({
  onBack
}: {
  onBack: () => void;
}) {
  const activities = [{
    date: 'TODAY',
    items: [{
      time: '10:45 AM',
      type: 'marketing',
      icon: Mail,
      color: 'text-emerald-600',
      bg: 'bg-emerald-100',
      title: 'Sarah sent marketing email campaign "Holiday Special"',
      details: 'Recipients: 250 | Opens: 78 (31%) | Clicks: 12 (5%)',
      action: 'View Campaign Details'
    }, {
      time: '10:30 AM',
      type: 'operations',
      icon: Wrench,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
      title: 'Derek completed job #1247 - Drain Cleaning',
      details: 'Customer: John Smith | Duration: 1.5 hours | Revenue: $185',
      action: 'View Job Details'
    }, {
      time: '9:15 AM',
      type: 'sales',
      icon: Calendar,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
      title: 'Olivia confirmed appointment with ABC Corporation',
      details: 'Scheduled: Tomorrow 2:00 PM | Service: Quarterly Inspection',
      action: 'View Appointment'
    }, {
      time: '8:45 AM',
      type: 'customer',
      icon: UserPlus,
      color: 'text-indigo-600',
      bg: 'bg-indigo-100',
      title: 'New customer registered: Williams Family',
      details: 'Source: Website | Service Interest: Water Heater Installation',
      action: 'View Customer'
    }]
  }, {
    date: 'YESTERDAY',
    items: [{
      time: '4:30 PM',
      type: 'finance',
      icon: DollarSign,
      color: 'text-amber-600',
      bg: 'bg-amber-100',
      title: 'Emma sent payment reminder for Invoice #1234',
      details: 'Customer: Mary Johnson | Amount: $450 | Days Overdue: 5',
      action: 'View Invoice'
    }, {
      time: '2:15 PM',
      type: 'operations',
      icon: Wrench,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
      title: 'Derek completed 3 scheduled jobs',
      details: 'Total Revenue: $720 | Average Rating: 5.0',
      action: 'View Jobs'
    }]
  }];
  return <motion.div initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} className="max-w-4xl mx-auto pb-12 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Overview
        </button>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <span className="text-2xl">⚡</span> Activity Log
        </h1>
        <div className="w-24" /> {/* Spacer */}
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search activities..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          <select className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
            <option>Type: All</option>
            <option>Marketing</option>
            <option>Operations</option>
            <option>Sales</option>
            <option>Finance</option>
          </select>
          <select className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
            <option>AI Employee: All</option>
            <option>Sarah (Marketing)</option>
            <option>Derek (Operations)</option>
            <option>Olivia (Sales)</option>
            <option>Emma (Finance)</option>
          </select>
          <select className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
            <option>Date: Last 7 Days</option>
            <option>Today</option>
            <option>Yesterday</option>
            <option>Last 30 Days</option>
          </select>
          <button className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="space-y-8">
        {activities.map((group, groupIndex) => <div key={groupIndex}>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4 pl-2">
              {group.date}
            </h3>
            <div className="space-y-4">
              {group.items.map((item, index) => <motion.div key={index} initial={{
            opacity: 0,
            x: -10
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            delay: index * 0.1
          }} className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex items-start gap-4 hover:shadow-md transition-shadow">
                  <div className={`w-10 h-10 rounded-full ${item.bg} flex items-center justify-center shrink-0 mt-1`}>
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-500">
                        {item.time}
                      </span>
                    </div>
                    <h4 className="font-medium text-slate-900 mb-1">
                      {item.title}
                    </h4>
                    <p className="text-sm text-slate-600 mb-3">
                      {item.details}
                    </p>
                    <button className="text-xs font-bold text-blue-600 hover:underline">
                      {item.action}
                    </button>
                  </div>
                </motion.div>)}
            </div>
          </div>)}
      </div>

      <div className="text-center pt-4">
        <button className="px-6 py-2 bg-white border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-colors">
          Load More Activities...
        </button>
      </div>
    </motion.div>;
}