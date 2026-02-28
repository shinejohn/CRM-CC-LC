import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, List, Calendar, Grid, ChevronDown, Clock, CheckCircle2 } from 'lucide-react';
import { useBusinessMode } from '../contexts/BusinessModeContext';
import { ScheduleActivityModal } from '../components/ScheduleActivityModal';
interface ActivitiesPageProps {
  onNavigate?: (page: string) => void;
}
export function ActivitiesPage({
  onNavigate
}: ActivitiesPageProps) {
  const {
    mode,
    terminology
  } = useBusinessMode();
  const [viewMode, setViewMode] = useState<'list' | 'calendar' | 'matrix'>('list');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  return <motion.div initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            📅 {terminology.activities}
          </h1>
          <p className="text-slate-500">
            Manage your {terminology.activities.toLowerCase()}
          </p>
        </div>
        <button onClick={() => setShowScheduleModal(true)} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> New
        </button>
      </div>

      {/* View Toggle */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 bg-white rounded-lg p-1 border border-slate-200">
          <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 rounded text-sm font-medium flex items-center gap-1 transition-colors ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
            <List className="w-4 h-4" /> List
          </button>
          <button onClick={() => setViewMode('calendar')} className={`px-3 py-1.5 rounded text-sm font-medium flex items-center gap-1 transition-colors ${viewMode === 'calendar' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
            <Calendar className="w-4 h-4" /> Calendar
          </button>
          <button onClick={() => setViewMode('matrix')} className={`px-3 py-1.5 rounded text-sm font-medium flex items-center gap-1 transition-colors ${viewMode === 'matrix' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
            <Grid className="w-4 h-4" /> Matrix
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[{
        label: 'Overdue',
        count: 7,
        color: 'bg-red-100 text-red-700',
        dot: 'bg-red-500'
      }, {
        label: 'Today',
        count: 5,
        color: 'bg-amber-100 text-amber-700',
        dot: 'bg-amber-500'
      }, {
        label: 'This Week',
        count: 23,
        color: 'bg-blue-100 text-blue-700',
        dot: 'bg-blue-500'
      }, {
        label: 'Completed This Month',
        count: 48,
        color: 'bg-emerald-100 text-emerald-700',
        dot: 'bg-emerald-500'
      }].map((stat, i) => <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-600">{stat.label}</p>
              <span className={`w-2 h-2 rounded-full ${stat.dot}`} />
            </div>
            <p className="text-3xl font-bold text-slate-900">{stat.count}</p>
          </div>)}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
        <div className="flex items-center gap-3">
          <button className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm font-medium text-slate-700 flex items-center gap-1">
            Type <ChevronDown className="w-4 h-4" />
          </button>
          <button className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm font-medium text-slate-700 flex items-center gap-1">
            Owner <ChevronDown className="w-4 h-4" />
          </button>
          <button className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm font-medium text-slate-700 flex items-center gap-1">
            {terminology.customer} <ChevronDown className="w-4 h-4" />
          </button>
          <button className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm font-medium text-slate-700 flex items-center gap-1">
            Date <ChevronDown className="w-4 h-4" />
          </button>
          <div className="flex-1" />
          <input type="text" placeholder="Search..." className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
        </div>
      </div>

      {/* List View */}
      {viewMode === 'list' && <>
          {/* Overdue Section */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 bg-red-50 border-b border-red-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <h3 className="font-bold text-red-900 uppercase text-sm">
                Overdue
              </h3>
            </div>
            <div className="divide-y divide-slate-100">
              <div className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">📞</span>
                    <div>
                      <h4 className="font-medium text-slate-900">
                        Call Acme Corp - Follow up on proposal
                      </h4>
                      <p className="text-sm text-slate-500 mt-1">
                        Assigned: Sarah M. | Deal: Q1 Services
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-red-600">
                    3 days overdue
                  </span>
                </div>
                <div className="flex gap-2 mt-3 ml-9">
                  <button className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 transition-colors">
                    Mark Done
                  </button>
                  <button className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-200 transition-colors">
                    Reschedule
                  </button>
                </div>
              </div>

              <div className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">📧</span>
                    <div>
                      <h4 className="font-medium text-slate-900">
                        Email Beta Inc - Send revised quote
                      </h4>
                      <p className="text-sm text-slate-500 mt-1">
                        Assigned: John D. | Deal: Annual Contract
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-red-600">
                    2 days overdue
                  </span>
                </div>
                <div className="flex gap-2 mt-3 ml-9">
                  <button className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 transition-colors">
                    Mark Done
                  </button>
                  <button className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-200 transition-colors">
                    Reschedule
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Today Section */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 bg-amber-50 border-b border-amber-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <h3 className="font-bold text-amber-900 uppercase text-sm">
                Today
              </h3>
            </div>
            <div className="divide-y divide-slate-100">
              <div className="p-6 hover:bg-slate-50 transition-colors flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🤝</span>
                  <div>
                    <h4 className="font-medium text-slate-900">
                      Meeting with TechStart - Demo presentation
                    </h4>
                    <p className="text-sm text-slate-500">10:00 AM</p>
                  </div>
                </div>
                <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <CheckCircle2 className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="p-6 hover:bg-slate-50 transition-colors flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">📞</span>
                  <div>
                    <h4 className="font-medium text-slate-900">
                      Call Gamma LLC - Contract review
                    </h4>
                    <p className="text-sm text-slate-500">2:00 PM</p>
                  </div>
                </div>
                <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <CheckCircle2 className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="p-6 hover:bg-slate-50 transition-colors flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">📋</span>
                  <div>
                    <h4 className="font-medium text-slate-900">
                      Task: Prepare weekly report
                    </h4>
                    <p className="text-sm text-slate-500">5:00 PM</p>
                  </div>
                </div>
                <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <CheckCircle2 className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Upcoming Section */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <h3 className="font-bold text-emerald-900 uppercase text-sm">
                Upcoming
              </h3>
            </div>
            <div className="divide-y divide-slate-100">
              <div className="p-6 hover:bg-slate-50 transition-colors flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">📧</span>
                  <span className="font-medium text-slate-900">
                    Send proposal to Delta Co
                  </span>
                </div>
                <span className="text-sm text-slate-500">Tomorrow</span>
              </div>

              <div className="p-6 hover:bg-slate-50 transition-colors flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">📞</span>
                  <span className="font-medium text-slate-900">
                    Call Epsilon - Contract renewal
                  </span>
                </div>
                <span className="text-sm text-slate-500">Jan 5</span>
              </div>

              <div className="p-6 hover:bg-slate-50 transition-colors flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🤝</span>
                  <span className="font-medium text-slate-900">
                    Quarterly review with BigCorp
                  </span>
                </div>
                <span className="text-sm text-slate-500">Jan 8</span>
              </div>
            </div>
          </div>
        </>}

      {/* Calendar View */}
      {viewMode === 'calendar' && <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <div className="grid grid-cols-7 gap-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="text-center font-bold text-slate-600 text-sm py-2">
                {day}
              </div>)}
            {Array.from({
          length: 35
        }, (_, i) => {
          const dayNum = i - 2;
          const isToday = dayNum === 2;
          const hasActivity = [2, 5, 8, 12, 15].includes(dayNum);
          return <div key={i} className={`aspect-square border border-slate-200 rounded-lg p-2 ${dayNum < 1 || dayNum > 31 ? 'bg-slate-50 text-slate-400' : isToday ? 'bg-blue-50 border-blue-500' : 'hover:bg-slate-50 cursor-pointer'}`}>
                    {dayNum >= 1 && dayNum <= 31 && <>
                        <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-slate-900'}`}>
                          {dayNum}
                        </div>
                        {hasActivity && <div className="mt-1 space-y-1">
                            <div className="w-full h-1 bg-blue-500 rounded" />
                            <div className="w-full h-1 bg-amber-500 rounded" />
                          </div>}
                      </>}
                  </div>;
        })}
          </div>

          <div className="mt-6 border-t border-slate-200 pt-6">
            <h3 className="font-bold text-slate-900 mb-4">
              Today's Activities
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg">
                <span className="text-xl">🤝</span>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">
                    Meeting with TechStart
                  </p>
                  <p className="text-sm text-slate-500">10:00 AM</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg">
                <span className="text-xl">📞</span>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">Call Gamma LLC</p>
                  <p className="text-sm text-slate-500">2:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>}

      {/* Matrix View */}
      {viewMode === 'matrix' && <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">
                    Activity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">
                    {terminology.customer}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">
                    Owner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[{
              activity: 'Call Acme Corp - Follow up',
              type: '📞 Call',
              customer: 'Acme Corp',
              owner: 'Sarah M.',
              date: 'Dec 29',
              status: 'overdue'
            }, {
              activity: 'Email Beta Inc - Send quote',
              type: '📧 Email',
              customer: 'Beta Inc',
              owner: 'John D.',
              date: 'Dec 30',
              status: 'overdue'
            }, {
              activity: 'Meeting with TechStart',
              type: '🤝 Meeting',
              customer: 'TechStart',
              owner: 'Sarah M.',
              date: 'Today 10:00 AM',
              status: 'today'
            }, {
              activity: 'Call Gamma LLC',
              type: '📞 Call',
              customer: 'Gamma LLC',
              owner: 'Bob T.',
              date: 'Today 2:00 PM',
              status: 'today'
            }, {
              activity: 'Send proposal to Delta Co',
              type: '📧 Email',
              customer: 'Delta Co',
              owner: 'Sarah M.',
              date: 'Tomorrow',
              status: 'upcoming'
            }].map((item, i) => <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {item.activity}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {item.type}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {item.customer}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {item.owner}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {item.date}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.status === 'overdue' ? 'bg-red-100 text-red-700' : item.status === 'today' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                        {item.status === 'overdue' ? 'Overdue' : item.status === 'today' ? 'Today' : 'Upcoming'}
                      </span>
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </div>
        </div>}

      {/* Schedule Activity Modal */}
      <ScheduleActivityModal isOpen={showScheduleModal} onClose={() => setShowScheduleModal(false)} onSchedule={data => {
      localStorage.setItem('cc_activity_' + Date.now(), JSON.stringify(data));
      console.log('[API POST] /api/v1/activities', data);
      setShowScheduleModal(false);
    }} />
    </motion.div>;
}