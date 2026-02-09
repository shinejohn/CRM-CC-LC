import React, { useState } from 'react';
import { Search, Bell, User, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
export function GlobalHeader() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  return <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 fixed top-0 left-64 right-0 z-40">
      {/* Left: Brand */}
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold text-slate-900">SMB Command Center</h1>
      </div>

      {/* Right: Search, Notifications, User */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <button onClick={() => setShowSearch(true)} className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-sm text-slate-600">
          <Search className="w-4 h-4" />
          <span>Search...</span>
          <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-xs">
            ⌘K
          </kbd>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5 text-slate-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          <AnimatePresence>
            {showNotifications && <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                <motion.div initial={{
              opacity: 0,
              y: -10
            }} animate={{
              opacity: 1,
              y: 0
            }} exit={{
              opacity: 0,
              y: -10
            }} className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-slate-200 z-50">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900">Activities</h3>
                    <button className="text-xs font-medium text-blue-600 hover:underline">
                      View All →
                    </button>
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {/* Overdue */}
                    <div className="p-4 border-b border-slate-100">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-slate-500 uppercase">
                          Overdue
                        </span>
                        <span className="w-2 h-2 bg-red-500 rounded-full" />
                      </div>
                      <div className="space-y-3">
                        <div className="text-sm">
                          <p className="font-medium text-slate-900">
                            📞 Call Acme Corp - Follow up on proposal
                          </p>
                          <p className="text-xs text-slate-500">2 days ago</p>
                        </div>
                        <div className="text-sm">
                          <p className="font-medium text-slate-900">
                            📧 Email Beta Inc - Send revised quote
                          </p>
                          <p className="text-xs text-slate-500">3 days ago</p>
                        </div>
                      </div>
                    </div>

                    {/* Today */}
                    <div className="p-4 border-b border-slate-100">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-slate-500 uppercase">
                          Today
                        </span>
                        <span className="w-2 h-2 bg-amber-500 rounded-full" />
                      </div>
                      <div className="space-y-3">
                        <div className="text-sm">
                          <p className="font-medium text-slate-900">
                            📞 Call TechStart - Demo follow-up
                          </p>
                          <p className="text-xs text-slate-500">10:00 AM</p>
                        </div>
                        <div className="text-sm">
                          <p className="font-medium text-slate-900">
                            🤝 Meeting with Gamma LLC
                          </p>
                          <p className="text-xs text-slate-500">2:00 PM</p>
                        </div>
                      </div>
                    </div>

                    {/* Upcoming */}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-slate-500 uppercase">
                          Upcoming
                        </span>
                        <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                      </div>
                      <div className="space-y-3">
                        <div className="text-sm">
                          <p className="font-medium text-slate-900">
                            📧 Send proposal to Delta Co
                          </p>
                          <p className="text-xs text-slate-500">Tomorrow</p>
                        </div>
                        <div className="text-sm">
                          <p className="font-medium text-slate-900">
                            📞 Call Epsilon - Contract renewal
                          </p>
                          <p className="text-xs text-slate-500">Jan 5</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </>}
          </AnimatePresence>
        </div>

        {/* User Menu */}
        <button className="flex items-center gap-2 p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-slate-600" />
          </div>
          <ChevronDown className="w-4 h-4 text-slate-600" />
        </button>
      </div>

      {/* Search Modal */}
      <AnimatePresence>
        {showSearch && <>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={() => setShowSearch(false)} />
            <motion.div initial={{
          opacity: 0,
          scale: 0.95
        }} animate={{
          opacity: 1,
          scale: 1
        }} exit={{
          opacity: 0,
          scale: 0.95
        }} className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 z-50">
              <div className="p-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <Search className="w-5 h-5 text-slate-400" />
                  <input type="text" placeholder="Search across everything..." autoFocus className="flex-1 outline-none text-slate-900 placeholder-slate-400" />
                  <kbd className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-xs">
                    ESC
                  </kbd>
                </div>
              </div>

              <div className="p-4">
                <div className="mb-4">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-2">
                    Recent
                  </p>
                  <div className="space-y-2">
                    <button className="w-full flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg text-left">
                      <div className="flex items-center gap-3">
                        <span>👤</span>
                        <span className="text-sm font-medium text-slate-900">
                          Acme Corporation
                        </span>
                      </div>
                      <span className="text-xs text-slate-500">Account</span>
                    </button>
                    <button className="w-full flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg text-left">
                      <div className="flex items-center gap-3">
                        <span>💼</span>
                        <span className="text-sm font-medium text-slate-900">
                          Q1 Service Contract
                        </span>
                      </div>
                      <span className="text-xs text-slate-500">Deal</span>
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-2">
                    Quick Actions
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-medium text-slate-700">
                      + New Deal
                    </button>
                    <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-medium text-slate-700">
                      + New Account
                    </button>
                    <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-medium text-slate-700">
                      + New Activity
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>}
      </AnimatePresence>
    </div>;
}