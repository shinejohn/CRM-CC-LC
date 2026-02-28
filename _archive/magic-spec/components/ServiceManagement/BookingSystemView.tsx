import React from 'react';
import { Calendar as CalendarIcon, Clock, CheckCircle, User } from 'lucide-react';
interface BookingSystemViewProps {
  service: any;
}
export function BookingSystemView({
  service
}: BookingSystemViewProps) {
  return <div className="space-y-6">
      {/* Today's Overview */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900">
            Today's Schedule
          </h3>
          <span className="text-sm text-slate-500">October 24, 2023</span>
        </div>

        <div className="space-y-4">
          {[{
          time: '09:00 AM',
          client: 'Sarah Johnson',
          type: 'Consultation',
          status: 'Confirmed'
        }, {
          time: '11:30 AM',
          client: 'Mike Peters',
          type: 'Follow-up',
          status: 'Checked In'
        }, {
          time: '02:00 PM',
          client: 'Emma Wilson',
          type: 'New Client',
          status: 'Pending'
        }, {
          time: '04:15 PM',
          client: 'James Hall',
          type: 'Consultation',
          status: 'Confirmed'
        }].map((booking, i) => <div key={i} className="flex items-center p-3 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
              <div className="w-20 font-medium text-slate-900">
                {booking.time}
              </div>
              <div className="w-2 h-2 rounded-full bg-blue-500 mx-4"></div>
              <div className="flex-1">
                <div className="font-medium text-slate-900">
                  {booking.client}
                </div>
                <div className="text-xs text-slate-500">{booking.type}</div>
              </div>
              <div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' : booking.status === 'Checked In' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {booking.status}
                </span>
              </div>
            </div>)}
        </div>
      </div>

      {/* Availability Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <h4 className="text-sm font-medium text-slate-500 mb-3">
            Weekly Utilization
          </h4>
          <div className="flex items-end gap-2 h-32">
            {[40, 65, 85, 90, 60, 30, 20].map((h, i) => <div key={i} className="flex-1 bg-blue-100 rounded-t relative group">
                <div className="absolute bottom-0 left-0 right-0 bg-blue-500 rounded-t transition-all duration-500" style={{
              height: `${h}%`
            }}></div>
                <div className="absolute -bottom-6 left-0 right-0 text-center text-xs text-slate-500">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                </div>
              </div>)}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <h4 className="text-sm font-medium text-slate-500 mb-3">
            Quick Actions
          </h4>
          <div className="space-y-2">
            <button className="w-full text-left px-4 py-3 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-blue-300 transition-all flex items-center">
              <CalendarIcon className="h-4 w-4 mr-3 text-blue-500" />
              <span className="text-sm font-medium text-slate-700">
                Block Time Off
              </span>
            </button>
            <button className="w-full text-left px-4 py-3 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-blue-300 transition-all flex items-center">
              <Clock className="h-4 w-4 mr-3 text-blue-500" />
              <span className="text-sm font-medium text-slate-700">
                Edit Availability
              </span>
            </button>
            <button className="w-full text-left px-4 py-3 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-blue-300 transition-all flex items-center">
              <User className="h-4 w-4 mr-3 text-blue-500" />
              <span className="text-sm font-medium text-slate-700">
                Add Walk-in Client
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>;
}