import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, ClockIcon, UsersIcon, VideoIcon, CalendarIcon } from 'lucide-react';
export const CalendarView = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  // Mock scheduled calls data
  const scheduledCalls = [{
    id: 1,
    title: 'Team Weekly Sync',
    date: new Date(2023, 5, 15, 10, 0),
    duration: 60,
    participants: 5,
    type: 'video'
  }, {
    id: 2,
    title: 'Client Presentation',
    date: new Date(2023, 5, 18, 14, 30),
    duration: 45,
    participants: 3,
    type: 'presentation'
  }, {
    id: 3,
    title: 'Project Review',
    date: new Date(2023, 5, 22, 11, 0),
    duration: 90,
    participants: 8,
    type: 'report'
  }, {
    id: 4,
    title: 'Marketing Strategy',
    date: new Date(2023, 5, 25, 9, 0),
    duration: 60,
    participants: 4,
    type: 'marketing'
  }];
  const getMonthData = date => {
    const year = date.getFullYear();
    const month = date.getMonth();
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    // Day of the week for the first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayIndex = firstDay.getDay();
    // Total number of days in the month
    const daysInMonth = lastDay.getDate();
    // Create array of days to display
    const days = [];
    // Add empty days from previous month
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    // Add days of current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };
  const monthDays = getMonthData(currentMonth);
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  const formatMonth = date => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };
  const isToday = date => {
    if (!date) return false;
    const today = new Date();
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  };
  const isSelected = date => {
    if (!date || !selectedDate) return false;
    return date.getDate() === selectedDate.getDate() && date.getMonth() === selectedDate.getMonth() && date.getFullYear() === selectedDate.getFullYear();
  };
  const hasEvents = date => {
    if (!date) return false;
    return scheduledCalls.some(call => call.date.getDate() === date.getDate() && call.date.getMonth() === date.getMonth() && call.date.getFullYear() === date.getFullYear());
  };
  const getEventsForDate = date => {
    if (!date) return [];
    return scheduledCalls.filter(call => call.date.getDate() === date.getDate() && call.date.getMonth() === date.getMonth() && call.date.getFullYear() === date.getFullYear());
  };
  const formatTime = date => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  return <div className="h-full flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        <h2 className="text-lg font-medium">Call Schedule</h2>
        <div className="flex space-x-2">
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-md flex items-center text-sm">
            <PlusIcon size={16} className="mr-1" />
            New Call
          </button>
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        {/* Calendar */}
        <div className="w-2/3 p-4 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-medium">{formatMonth(currentMonth)}</h3>
            <div className="flex space-x-2">
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full" onClick={prevMonth}>
                <ChevronLeftIcon size={20} />
              </button>
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full" onClick={nextMonth}>
                <ChevronRightIcon size={20} />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {weekdays.map(day => <div key={day} className="text-center py-2 text-sm font-medium text-gray-500">
                {day}
              </div>)}
            {monthDays.map((day, index) => <div key={index} className={`h-24 border rounded-md p-1 ${day ? 'cursor-pointer hover:bg-gray-50' : 'bg-gray-50'} ${isSelected(day) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`} onClick={() => day && setSelectedDate(day)}>
                {day && <>
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full ${isToday(day) ? 'bg-blue-500 text-white' : isSelected(day) ? 'text-blue-600' : 'text-gray-700'}`}>
                        {day.getDate()}
                      </span>
                      {hasEvents(day) && <span className="w-2 h-2 rounded-full bg-green-500"></span>}
                    </div>
                    <div className="overflow-hidden space-y-1">
                      {getEventsForDate(day).slice(0, 2).map(event => <div key={event.id} className="text-xs p-1 rounded bg-blue-100 text-blue-800 truncate">
                            {formatTime(event.date)} {event.title}
                          </div>)}
                      {getEventsForDate(day).length > 2 && <div className="text-xs text-gray-500 pl-1">
                          +{getEventsForDate(day).length - 2} more
                        </div>}
                    </div>
                  </>}
              </div>)}
          </div>
        </div>
        {/* Events for selected date */}
        <div className="w-1/3 border-l border-gray-200 p-4 overflow-y-auto bg-gray-50">
          <h3 className="text-lg font-medium mb-4">
            {selectedDate.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
          })}
          </h3>
          {getEventsForDate(selectedDate).length === 0 ? <div className="text-center py-8 text-gray-500">
              <CalendarIcon size={40} className="mx-auto mb-2 opacity-50" />
              <p>No scheduled calls for this date</p>
              <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md text-sm flex items-center mx-auto">
                <PlusIcon size={16} className="mr-2" />
                Schedule a call
              </button>
            </div> : <div className="space-y-4">
              {getEventsForDate(selectedDate).map(event => <div key={event.id} className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">{event.title}</h4>
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                      {event.type}
                    </span>
                  </div>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <ClockIcon size={14} className="mr-2" />
                      {formatTime(event.date)} ({event.duration} min)
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <UsersIcon size={14} className="mr-2" />
                      {event.participants} participants
                    </div>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <button className="px-3 py-1.5 bg-blue-500 text-white rounded-md text-sm flex items-center">
                      <VideoIcon size={14} className="mr-1" />
                      Join
                    </button>
                    <button className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-md text-sm">
                      Edit
                    </button>
                    <button className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-md text-sm">
                      Cancel
                    </button>
                  </div>
                </div>)}
            </div>}
        </div>
      </div>
    </div>;
};