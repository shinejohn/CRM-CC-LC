import React from 'react';
import { BarChart2, PieChart, Users, MessageSquare } from 'lucide-react';
interface PollServiceViewProps {
  service: any;
}
export function PollServiceView({
  service
}: PollServiceViewProps) {
  return <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Community Choice: Best Local Park
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Active since Oct 20 • Ends in 3 days
            </p>
          </div>
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            Active
          </span>
        </div>

        <div className="space-y-4 mb-8">
          {[{
          label: 'Central Park',
          percent: 45,
          votes: 234
        }, {
          label: 'Riverside Walk',
          percent: 30,
          votes: 156
        }, {
          label: 'Highland Gardens',
          percent: 15,
          votes: 78
        }, {
          label: 'Westside Commons',
          percent: 10,
          votes: 52
        }].map((option, i) => <div key={i}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-slate-700">
                  {option.label}
                </span>
                <span className="text-slate-500">
                  {option.percent}% ({option.votes})
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{
              width: `${option.percent}%`
            }}></div>
              </div>
            </div>)}
        </div>

        <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-6">
          <div className="text-center">
            <div className="flex items-center justify-center text-slate-400 mb-1">
              <Users className="h-5 w-5" />
            </div>
            <div className="text-xl font-bold text-slate-900">520</div>
            <div className="text-xs text-slate-500">Total Votes</div>
          </div>
          <div className="text-center border-l border-slate-100">
            <div className="flex items-center justify-center text-slate-400 mb-1">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div className="text-xl font-bold text-slate-900">48</div>
            <div className="text-xs text-slate-500">Comments</div>
          </div>
          <div className="text-center border-l border-slate-100">
            <div className="flex items-center justify-center text-slate-400 mb-1">
              <BarChart2 className="h-5 w-5" />
            </div>
            <div className="text-xl font-bold text-slate-900">12%</div>
            <div className="text-xs text-slate-500">Engagement</div>
          </div>
        </div>
      </div>
    </div>;
}