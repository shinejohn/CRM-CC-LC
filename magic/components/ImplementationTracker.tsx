import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, ArrowRight } from 'lucide-react';
interface Implementation {
  id: string;
  title: string;
  progress: number;
  status: 'in-progress' | 'completed';
  daysRemaining?: number;
  completedDate?: string;
}
const implementations: Implementation[] = [{
  id: '1',
  title: 'Email Automation Setup',
  progress: 75,
  status: 'in-progress',
  daysRemaining: 2
}, {
  id: '2',
  title: 'CRM Data Migration',
  progress: 100,
  status: 'completed',
  completedDate: 'yesterday'
}, {
  id: '3',
  title: 'Content Calendar Setup',
  progress: 40,
  status: 'in-progress',
  daysRemaining: 5
}];
export function ImplementationTracker() {
  return <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="text-xl">🚀</span> Active Implementations
        </h2>
      </div>

      <div className="space-y-4">
        {implementations.map((impl, index) => <motion.div key={impl.id} initial={{
        opacity: 0,
        x: -20
      }} animate={{
        opacity: 1,
        x: 0
      }} transition={{
        delay: index * 0.1
      }} className={`p-4 rounded-lg border ${impl.status === 'completed' ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-bold text-slate-900">{impl.title}</h3>
              {impl.status === 'completed' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
            </div>

            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600">Progress</span>
                <span className="font-bold text-slate-900">
                  {impl.progress}%
                </span>
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <motion.div initial={{
              width: 0
            }} animate={{
              width: `${impl.progress}%`
            }} transition={{
              duration: 1,
              ease: 'easeOut',
              delay: index * 0.1
            }} className={`h-full rounded-full ${impl.status === 'completed' ? 'bg-emerald-500' : 'bg-blue-600'}`} />
              </div>
            </div>

            <div className="flex items-center justify-between">
              {impl.status === 'in-progress' ? <>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="w-3 h-3" />
                    Est. completion: {impl.daysRemaining} days
                  </div>
                  <button className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1">
                    View Progress <ArrowRight className="w-3 h-3" />
                  </button>
                </> : <>
                  <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    Completed {impl.completedDate}
                  </div>
                  <button className="text-xs font-medium text-emerald-600 hover:text-emerald-800 flex items-center gap-1">
                    View Report <ArrowRight className="w-3 h-3" />
                  </button>
                </>}
            </div>
          </motion.div>)}
      </div>
    </div>;
}