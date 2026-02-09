import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from 'lucide-react';
interface CalendarEvent {
  id: number;
  title: string;
  time: string;
  type: 'meeting' | 'presentation' | 'workshop';
  participants: number;
}
export const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const events: CalendarEvent[] = [{
    id: 1,
    title: 'Team Standup',
    time: '09:00 AM',
    type: 'meeting',
    participants: 5
  }, {
    id: 2,
    title: 'Client Presentation',
    time: '02:00 PM',
    type: 'presentation',
    participants: 8
  }, {
    id: 3,
    title: 'Design Workshop',
    time: '04:00 PM',
    type: 'workshop',
    participants: 12
  }];
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };
  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();
  };
  const isSelected = (day: number) => {
    return day === selectedDate.getDate() && currentDate.getMonth() === selectedDate.getMonth() && currentDate.getFullYear() === selectedDate.getFullYear();
  };
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'meeting':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'presentation':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'workshop':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };
  return <div className="flex gap-4 h-full">
      {/* Calendar Grid */}
      <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Calendar Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex space-x-2">
            <button onClick={previousMonth} className="p-2 hover:bg-gray-100 rounded-md transition-colors">
              <ChevronLeftIcon size={20} />
            </button>
            <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-md transition-colors">
              <ChevronRightIcon size={20} />
            </button>
          </div>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
              {day}
            </div>)}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {/* Empty cells for days before month starts */}
          {Array.from({
          length: firstDayOfMonth
        }).map((_, index) => <div key={`empty-${index}`} className="aspect-square" />)}

          {/* Days of the month */}
          {Array.from({
          length: daysInMonth
        }).map((_, index) => {
          const day = index + 1;
          return <button key={day} onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))} className={`aspect-square p-2 rounded-lg border transition-colors ${isToday(day) ? 'bg-blue-500 text-white border-blue-600 font-bold' : isSelected(day) ? 'bg-blue-100 border-blue-300 text-blue-900' : 'border-gray-200 hover:bg-gray-50'}`}>
                <div className="text-sm">{day}</div>
              </button>;
        })}
        </div>
      </div>

      {/* Events Sidebar */}
      <div className="w-80 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">
            {selectedDate.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric'
          })}
          </h3>
          <button className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
            <PlusIcon size={18} />
          </button>
        </div>

        <div className="space-y-3">
          {events.map(event => <div key={event.id} className={`p-3 rounded-lg border ${getEventTypeColor(event.type)}`}>
              <div className="font-medium text-sm mb-1">{event.title}</div>
              <div className="text-xs opacity-75">{event.time}</div>
              <div className="text-xs opacity-75 mt-1">
                {event.participants} participants
              </div>
            </div>)}
        </div>

        {events.length === 0 && <div className="text-center text-gray-500 text-sm py-8">
            No events scheduled for this day
          </div>}
      </div>
    </div>;
};