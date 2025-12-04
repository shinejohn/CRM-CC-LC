import React from 'react';
import { CalendarView } from '../components/CalendarView';
import { NavigationMenu } from '../components/NavigationMenu';
export const SchedulePage = () => {
  return <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Schedule Calls</h1>
        <NavigationMenu />
      </div>
      {/* Main Content */}
      <div className="flex-1 overflow-hidden p-4 max-w-7xl mx-auto w-full">
        <div className="h-[calc(100vh-120px)]">
          <CalendarView />
        </div>
      </div>
    </div>;
};