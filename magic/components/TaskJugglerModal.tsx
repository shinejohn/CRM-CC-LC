import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Zap, CheckCircle2, AlertCircle, Clock, Users, Target } from 'lucide-react';
interface TaskJugglerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activityData?: {
    type: string;
    summary: string;
    date: string;
    assignee: string;
    notes: string;
  };
  onSend: (data: any) => void;
}
export function TaskJugglerModal({
  isOpen,
  onClose,
  activityData,
  onSend
}: TaskJugglerModalProps) {
  const [priority, setPriority] = useState('medium');
  const [estimatedTime, setEstimatedTime] = useState('1');
  const [dependencies, setDependencies] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const handleSend = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setSent(true);
      setTimeout(() => {
        onSend({
          ...activityData,
          priority,
          estimatedTime,
          dependencies
        });
        setSent(false);
        onClose();
      }, 1500);
    }, 1500);
  };
  if (!isOpen) return null;
  return <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div initial={{
        opacity: 0,
        scale: 0.95,
        y: 20
      }} animate={{
        opacity: 1,
        scale: 1,
        y: 0
      }} exit={{
        opacity: 0,
        scale: 0.95,
        y: 20
      }} className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-purple-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Zap className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Send to TaskJuggler
                </h2>
                <p className="text-sm text-slate-600">
                  Optimize and schedule this task automatically
                </p>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {!sent ? <>
              {/* Activity Summary */}
              {activityData && <div className="p-6 bg-slate-50 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">
                    Activity Details
                  </h3>
                  <div className="bg-white rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">
                        {activityData.type === 'call' ? '📞' : activityData.type === 'email' ? '📧' : activityData.type === 'meeting' ? '🤝' : activityData.type === 'task' ? '📋' : '📄'}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">
                          {activityData.summary || 'Untitled Activity'}
                        </p>
                        <p className="text-sm text-slate-500">
                          Due: {activityData.date || 'Not set'} • Assigned to:{' '}
                          {activityData.assignee || 'Unassigned'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>}

              {/* TaskJuggler Settings */}
              <div className="p-6 space-y-6">
                <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-indigo-600 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-indigo-900 mb-1">
                        What is TaskJuggler?
                      </h3>
                      <p className="text-sm text-indigo-700">
                        TaskJuggler uses AI to automatically optimize task
                        scheduling, resource allocation, and dependency
                        management. It analyzes your team's capacity and
                        priorities to find the best execution plan.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4 text-slate-400" />
                      Priority Level
                    </label>
                    <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 bg-white">
                      <option value="low">🟢 Low - Can wait</option>
                      <option value="medium">
                        🟡 Medium - Normal priority
                      </option>
                      <option value="high">🟠 High - Important</option>
                      <option value="urgent">🔴 Urgent - Critical</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      Estimated Time (hours)
                    </label>
                    <input type="number" value={estimatedTime} onChange={e => setEstimatedTime(e.target.value)} min="0.5" step="0.5" className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" placeholder="1.0" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-400" />
                    Dependencies (optional)
                  </label>
                  <input type="text" value={dependencies} onChange={e => setDependencies(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" placeholder="e.g., Task #123, Approval from Sarah" />
                  <p className="text-xs text-slate-500 mt-1">
                    TaskJuggler will ensure dependencies are completed first
                  </p>
                </div>

                <div className="bg-slate-50 rounded-lg p-4">
                  <h3 className="text-sm font-bold text-slate-700 mb-3">
                    TaskJuggler will optimize:
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Best time slot based on team availability</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Resource allocation and workload balancing</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Dependency resolution and sequencing</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Critical path analysis</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button onClick={onClose} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button onClick={handleSend} disabled={isSending} className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50">
                  {isSending ? <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Optimizing...
                    </> : <>
                      <Send className="w-4 h-4" /> Send to TaskJuggler
                    </>}
                </button>
              </div>
            </> /* Success State */ : <motion.div initial={{
          opacity: 0,
          scale: 0.9
        }} animate={{
          opacity: 1,
          scale: 1
        }} className="p-12 text-center">
              <motion.div initial={{
            scale: 0
          }} animate={{
            scale: 1
          }} transition={{
            type: 'spring',
            duration: 0.5
          }} className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </motion.div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                Task Sent Successfully!
              </h3>
              <p className="text-slate-600">
                TaskJuggler is optimizing your schedule...
              </p>
            </motion.div>}
        </motion.div>
      </div>
    </AnimatePresence>;
}