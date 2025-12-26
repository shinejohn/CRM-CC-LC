import React, { useState } from 'react';
import { BarChartIcon, PieChartIcon, TableIcon, ChevronDownIcon, DownloadIcon, RefreshCwIcon } from 'lucide-react';
export const DataReportPanel = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('week');
  
  // TODO: Connect to real API endpoint for meeting analytics data
  // Render different content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <div className="space-y-6">
            {/* Key metrics */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="text-gray-500 text-sm mb-1">Total Meetings</div>
                <div className="text-2xl font-bold">0</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="text-gray-500 text-sm mb-1">
                  Meeting Duration
                </div>
                <div className="text-2xl font-bold">0h 0m</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="text-gray-500 text-sm mb-1">Participants</div>
                <div className="text-2xl font-bold">0</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="text-gray-500 text-sm mb-1">
                  AI Assistance Rate
                </div>
                <div className="text-2xl font-bold">93%</div>
              </div>
            </div>
            {/* AI Assistance breakdown */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-lg font-medium mb-4">AI Assistance</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-gray-500 text-sm">
                    Questions Answered
                  </div>
                  <div className="text-xl font-bold mt-1">0</div>
                </div>
                <div>
                  <div className="text-gray-500 text-sm">Actions Completed</div>
                  <div className="text-xl font-bold mt-1">0</div>
                </div>
                <div>
                  <div className="text-gray-500 text-sm">Notes Generated</div>
                  <div className="text-xl font-bold mt-1">0</div>
                </div>
              </div>
            </div>
            {/* Topic Distribution */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-lg font-medium mb-4">Topic Distribution</h3>
              <p className="text-gray-500 text-sm">Connect to API to view data</p>
            </div>
          </div>;
      case 'meetings':
        return <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Meeting
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participants
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Topics
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Connect to API to view meetings</td></tr>
              </tbody>
            </table>
          </div>;
      case 'insights':
        return <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 bg-white p-8 rounded-lg border border-gray-200 shadow-sm text-center text-gray-500">
              Connect to API to view insights
            </div>
          </div>;
      default:
        return <div>Select a tab to view data</div>;
    }
  };
  return <div className="h-full flex flex-col">
      <div className="p-3 bg-gray-200 font-medium flex justify-between items-center">
        <span>Meeting Analytics</span>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <select value={timeRange} onChange={e => setTimeRange(e.target.value)} className="appearance-none bg-white border border-gray-300 rounded-md py-1 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="day">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
            </select>
            <ChevronDownIcon size={14} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
          <button className="p-1 hover:bg-gray-300 rounded">
            <RefreshCwIcon size={18} />
          </button>
          <button className="p-1 hover:bg-gray-300 rounded">
            <DownloadIcon size={18} />
          </button>
        </div>
      </div>
      {/* Tabs */}
      <div className="bg-gray-100 border-b border-gray-300">
        <div className="flex">
          <button className={`px-4 py-2 text-sm font-medium flex items-center ${activeTab === 'overview' ? 'bg-white border-t-2 border-blue-500' : 'hover:bg-gray-200'}`} onClick={() => setActiveTab('overview')}>
            <BarChartIcon size={16} className="mr-2" />
            Overview
          </button>
          <button className={`px-4 py-2 text-sm font-medium flex items-center ${activeTab === 'meetings' ? 'bg-white border-t-2 border-blue-500' : 'hover:bg-gray-200'}`} onClick={() => setActiveTab('meetings')}>
            <TableIcon size={16} className="mr-2" />
            Meetings
          </button>
          <button className={`px-4 py-2 text-sm font-medium flex items-center ${activeTab === 'insights' ? 'bg-white border-t-2 border-blue-500' : 'hover:bg-gray-200'}`} onClick={() => setActiveTab('insights')}>
            <PieChartIcon size={16} className="mr-2" />
            Insights
          </button>
        </div>
      </div>
      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {renderTabContent()}
      </div>
    </div>;
};