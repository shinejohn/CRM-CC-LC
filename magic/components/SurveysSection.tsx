import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, ChevronDown, ChevronUp, Plus, CheckCircle2, Circle, ArrowRight } from 'lucide-react';
interface SurveysSectionProps {
  onNavigate?: (page: string) => void;
}
export function SurveysSection({
  onNavigate
}: SurveysSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const surveys = [{
    name: 'Business Overview',
    status: 'completed',
    category: 'Business Info'
  }, {
    name: 'Service Delivery Process',
    status: 'in-progress',
    category: 'Service Delivery'
  }, {
    name: 'Customer Communication',
    status: 'completed',
    category: 'Communication'
  }];
  const stats = {
    total: 13,
    completed: 7,
    inProgress: 3
  };
  return <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div onClick={() => setIsExpanded(!isExpanded)} className="p-6 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Business Surveys</h3>
            <p className="text-xs text-slate-500">
              {stats.completed}/{stats.total} completed
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={e => {
          e.stopPropagation();
          onNavigate?.('survey-management');
        }} className="text-sm font-medium text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
            View All
          </button>
          {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && <motion.div initial={{
        height: 0,
        opacity: 0
      }} animate={{
        height: 'auto',
        opacity: 1
      }} exit={{
        height: 0,
        opacity: 0
      }} className="border-t border-slate-100">
            <div className="p-6">
              <p className="text-sm text-slate-600 mb-4 bg-purple-50 p-3 rounded-lg border border-purple-100">
                Complete surveys to help AI employees understand your business,
                services, and communication preferences.
              </p>

              <div className="space-y-3 mb-4">
                {surveys.map((survey, index) => <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors">
                    <div className="flex items-center gap-3">
                      {survey.status === 'completed' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Circle className="w-5 h-5 text-blue-500" />}
                      <div>
                        <h4 className="font-medium text-slate-900 text-sm">
                          {survey.name}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {survey.category}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${survey.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                      {survey.status === 'completed' ? 'Done' : 'In Progress'}
                    </span>
                  </div>)}
              </div>

              <button onClick={() => onNavigate?.('survey-management')} className="w-full py-2.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-1">
                View All {stats.total} Surveys{' '}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>}
      </AnimatePresence>
    </div>;
}