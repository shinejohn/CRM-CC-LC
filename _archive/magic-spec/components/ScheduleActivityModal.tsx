import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Phone, Mail, Users, FileText, CheckCircle2, Zap } from 'lucide-react';
import { TaskJugglerModal } from './TaskJugglerModal';
interface ScheduleActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (data: any) => void;
}
export function ScheduleActivityModal({
  isOpen,
  onClose,
  onSchedule
}: ScheduleActivityModalProps) {
  const [type, setType] = useState('call');
  const [summary, setSummary] = useState('');
  const [date, setDate] = useState('');
  const [assignee, setAssignee] = useState('sarah');
  const [notes, setNotes] = useState('');
  const [showTaskJuggler, setShowTaskJuggler] = useState(false);
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
      }} className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" /> Schedule Activity
            </h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Activity Type
              </label>
              <div className="relative">
                <select value={type} onChange={e => setType(e.target.value)} className="w-full p-2 pl-9 border border-slate-200 rounded-lg outline-none focus:border-blue-500 appearance-none bg-white">
                  <option value="call">📞 Call</option>
                  <option value="email">📧 Email</option>
                  <option value="meeting">🤝 Meeting</option>
                  <option value="task">📋 Task</option>
                  <option value="proposal">📄 Send Proposal</option>
                </select>
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  {type === 'call' && <Phone className="w-4 h-4 text-slate-400" />}
                  {type === 'email' && <Mail className="w-4 h-4 text-slate-400" />}
                  {type === 'meeting' && <Users className="w-4 h-4 text-slate-400" />}
                  {type === 'task' && <CheckCircle2 className="w-4 h-4 text-slate-400" />}
                  {type === 'proposal' && <FileText className="w-4 h-4 text-slate-400" />}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Summary
              </label>
              <input type="text" value={summary} onChange={e => setSummary(e.target.value)} placeholder="e.g. Follow up on proposal" className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Due Date
                </label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Assign To
                </label>
                <select value={assignee} onChange={e => setAssignee(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 bg-white">
                  <option value="sarah">Sarah Martinez</option>
                  <option value="john">John Doe</option>
                  <option value="jane">Jane Smith</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Notes
              </label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add details..." className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 h-24 resize-none" />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                <span className="text-sm text-slate-600">Add to calendar</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                <span className="text-sm text-slate-600">
                  Send reminder 1 hour before
                </span>
              </label>
            </div>
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
            <button onClick={() => setShowTaskJuggler(true)} className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-sm flex items-center gap-2">
              <Zap className="w-4 h-4" /> Send to TaskJuggler
            </button>
            <div className="flex gap-3">
              <button onClick={onClose} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button onClick={() => onSchedule({
              type,
              summary,
              date,
              assignee,
              notes
            })} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                Schedule
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* TaskJuggler Modal */}
      <TaskJugglerModal isOpen={showTaskJuggler} onClose={() => setShowTaskJuggler(false)} activityData={{
      type,
      summary,
      date,
      assignee,
      notes
    }} onSend={data => {
      localStorage.setItem('cc_taskjuggler_sync_' + Date.now(), JSON.stringify(data));
      console.log('[API POST] /api/v1/taskjuggler/sync', data);
      setShowTaskJuggler(false);
      onClose();
    }} />
    </AnimatePresence>;
}