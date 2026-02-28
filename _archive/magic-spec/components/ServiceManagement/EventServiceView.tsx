import React from 'react';
import { Calendar, MapPin, Users, Ticket, TrendingUp } from 'lucide-react';
interface EventServiceViewProps {
  service: any;
}
export function EventServiceView({
  service
}: EventServiceViewProps) {
  return <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-500">
              Total Attendees
            </span>
            <Users className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">1,248</div>
          <div className="text-xs text-green-600 flex items-center mt-1">
            <TrendingUp className="h-3 w-3 mr-1" /> +12% from last month
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-500">
              Ticket Sales
            </span>
            <Ticket className="h-4 w-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">$12,450</div>
          <div className="text-xs text-green-600 flex items-center mt-1">
            <TrendingUp className="h-3 w-3 mr-1" /> +8% from last month
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-500">
              Upcoming Events
            </span>
            <Calendar className="h-4 w-4 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">3</div>
          <div className="text-xs text-slate-500 mt-1">Next: Tomorrow, 7PM</div>
        </div>
      </div>

      {/* Upcoming Events List */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-semibold text-slate-900">Upcoming Events</h3>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View Calendar
          </button>
        </div>
        <div className="divide-y divide-slate-100">
          {[1, 2, 3].map(i => <div key={i} className="p-6 hover:bg-slate-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-lg flex flex-col items-center justify-center text-blue-600 border border-blue-100">
                    <span className="text-xs font-bold uppercase">Oct</span>
                    <span className="text-lg font-bold">{14 + i}</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">
                      Summer Jazz Festival - Day {i}
                    </h4>
                    <div className="flex items-center text-sm text-slate-500 mt-1 space-x-3">
                      <span className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" /> Central Park
                      </span>
                      <span className="flex items-center">
                        <Users className="h-3 w-3 mr-1" /> {150 + i * 20}{' '}
                        registered
                      </span>
                    </div>
                  </div>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Selling Fast
                </span>
              </div>
            </div>)}
        </div>
      </div>
    </div>;
}