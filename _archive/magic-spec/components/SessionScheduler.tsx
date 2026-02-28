import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Phone, FileText, Plus, Clock } from 'lucide-react';
interface Session {
  id: string;
  date: string;
  time: string;
  type: string;
  icon: 'phone' | 'document';
  status: 'upcoming' | 'future';
}
const sessions: Session[] = [{
  id: '1',
  date: 'Wed, Jan 3',
  time: '2:00 PM',
  type: 'Strategy Review Call',
  icon: 'phone',
  status: 'upcoming'
}, {
  id: '2',
  date: 'Fri, Jan 5',
  time: '10:00 AM',
  type: 'Content Planning Session',
  icon: 'document',
  status: 'future'
}, {
  id: '3',
  date: 'Mon, Jan 8',
  time: '3:00 PM',
  type: 'Performance Review',
  icon: 'phone',
  status: 'future'
}];
export function SessionScheduler() {
  return <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" /> Upcoming Sessions
        </h2>
      </div>

      <div className="space-y-4 flex-1">
        {sessions.map((session, index) => <motion.div key={session.id} initial={{
        opacity: 0,
        x: 20
      }} animate={{
        opacity: 1,
        x: 0
      }} transition={{
        delay: index * 0.1
      }} className="p-4 rounded-lg border border-slate-200 hover:border-blue-200 hover:bg-blue-50/30 transition-all group">
            <div className="flex items-start gap-3 mb-3">
              <div className={`w-10 h-10 rounded-lg ${session.icon === 'phone' ? 'bg-blue-100' : 'bg-purple-100'} flex items-center justify-center shrink-0`}>
                {session.icon === 'phone' ? <Phone className={`w-5 h-5 ${session.icon === 'phone' ? 'text-blue-600' : 'text-purple-600'}`} /> : <FileText className="w-5 h-5 text-purple-600" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span className="text-sm font-bold text-slate-900">
                    {session.date} @ {session.time}
                  </span>
                </div>
                <p className="text-sm text-slate-600">{session.type}</p>
              </div>
            </div>

            <div className="flex gap-2">
              {session.status === 'upcoming' ? <>
                  <button className="flex-1 py-1.5 px-3 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors">
                    Join
                  </button>
                  <button className="flex-1 py-1.5 px-3 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-200 transition-colors">
                    Reschedule
                  </button>
                </> : <button className="w-full py-1.5 px-3 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-200 transition-colors">
                  Add to Calendar
                </button>}
            </div>
          </motion.div>)}
      </div>

      <button className="w-full mt-4 py-3 px-4 bg-slate-50 border-2 border-dashed border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-100 hover:border-slate-300 transition-colors flex items-center justify-center gap-2">
        <Plus className="w-4 h-4" /> Schedule New Session
      </button>
    </div>;
}