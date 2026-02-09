import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Clock } from 'lucide-react';
interface ActivityItem {
  id: string;
  text: string;
  time: string;
  type: 'success' | 'warning' | 'error' | 'info';
  action?: string;
}
const activities: ActivityItem[] = [{
  id: '1',
  text: 'Sarah sent 250 marketing emails',
  time: '2 hours ago',
  type: 'success'
}, {
  id: '2',
  text: 'Derek completed 5 service jobs',
  time: '3 hours ago',
  type: 'success',
  action: 'View'
}, {
  id: '3',
  text: 'New customer: ABC Plumbing',
  time: 'Yesterday',
  type: 'info',
  action: 'View'
}, {
  id: '4',
  text: 'Invoice #1234 overdue (5 days)',
  time: 'Dec 26',
  type: 'warning',
  action: 'Send Reminder'
}, {
  id: '5',
  text: 'Payment received: $850',
  time: 'Dec 25',
  type: 'success'
}, {
  id: '6',
  text: 'Campaign failed: Email bounce rate high',
  time: 'Dec 24',
  type: 'error',
  action: 'Fix Now'
}];
export function ActivityFeed() {
  const getDotColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-500';
      case 'warning':
        return 'bg-amber-500';
      case 'error':
        return 'bg-red-500';
      case 'info':
        return 'bg-blue-500';
    }
  };
  return <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden h-full">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <h3 className="font-bold text-slate-900 flex items-center gap-2">
          <span className="text-amber-500">⚡</span> Recent Activity
        </h3>
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
          View All <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="p-6">
        <div className="space-y-6 relative">
          {/* Vertical line connecting items */}
          <div className="absolute left-[5px] top-2 bottom-2 w-[2px] bg-slate-100" />

          {activities.map((item, index) => <motion.div key={item.id} initial={{
          opacity: 0,
          x: -20
        }} animate={{
          opacity: 1,
          x: 0
        }} transition={{
          delay: index * 0.1
        }} className="relative pl-6">
              <div className={`absolute left-0 top-2 w-3 h-3 rounded-full border-2 border-white ring-1 ring-slate-100 ${getDotColor(item.type)}`} />

              <div className="flex justify-between items-start group">
                <div>
                  <p className="text-sm text-slate-800 font-medium group-hover:text-blue-700 transition-colors">
                    {item.text}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span className="text-xs text-slate-500">{item.time}</span>
                  </div>
                </div>

                {item.action && <button className="text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-full transition-colors opacity-0 group-hover:opacity-100">
                    {item.action}
                  </button>}
              </div>
            </motion.div>)}
        </div>
      </div>
    </div>;
}