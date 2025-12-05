import React, { useState } from 'react';
import { BarChartIcon, PieChartIcon, TableIcon, ChevronDownIcon, DownloadIcon, RefreshCwIcon } from 'lucide-react';
export const DataReportPanel = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('week');
  // Mock data for demonstration purposes - COMMENTED OUT PER USER REQUEST
  const mockData = null; /* {
    overview: {
      meetingCount: 24,
      totalDuration: '32h 45m',
      participantCount: 87,
      aiAssistance: {
        questionsAnswered: 156,
        actionsCompleted: 93,
        notesGenerated: 24
      },
      topicDistribution: [{
        name: 'Project Planning',
        percentage: 35
      }, {
        name: 'Design Review',
        percentage: 25
      }, {
        name: 'Client Meetings',
        percentage: 20
      }, {
        name: 'Team Sync',
        percentage: 15
      }, {
        name: 'Other',
        percentage: 5
      }]
    },
    meetings: [{
      id: 1,
      title: 'Q3 Planning Session',
      date: '2023-07-12',
      duration: '1h 20m',
      participants: 8,
      topics: ['Budget', 'Timeline', 'Resource Allocation']
    }, {
      id: 2,
      title: 'Design Review',
      date: '2023-07-14',
      duration: '45m',
      participants: 5,
      topics: ['UI Updates', 'User Testing Results']
    }, {
      id: 3,
      title: 'Client Presentation',
      date: '2023-07-15',
      duration: '1h',
      participants: 12,
      topics: ['Project Status', 'Demo', 'Feedback']
    }, {
      id: 4,
      title: 'Team Sync',
      date: '2023-07-18',
      duration: '30m',
      participants: 6,
      topics: ['Weekly Goals', 'Blockers']
    }],
    insights: [{
      id: 1,
      title: 'Meeting Efficiency Increased',
      description: 'Meetings are 23% shorter on average while maintaining productivity',
      metric: '+23%',
      trend: 'up'
    }, {
      id: 2,
      title: 'Most Active Discussion Topics',
      description: 'Product roadmap and design feedback generate the most engagement',
      topics: ['Product Roadmap', 'Design Feedback', 'Resource Planning']
    }, {
      id: 3,
      title: 'Action Item Completion Rate',
      description: '78% of action items are completed within the deadline',
      metric: '78%',
      trend: 'up'
    }, {
      id: 4,
      title: 'Meeting Participation',
      description: 'Team members speak for roughly equal amounts of time',
      metric: 'Balanced',
      trend: 'neutral'
    }]
  }; */
  
  // TODO: Connect to real API endpoint for meeting analytics data
  // Bar chart component for topic distribution
  const BarChart = ({
    data
  }) => <div className="mt-4">
      {data.map(item => <div key={item.name} className="mb-3">
          <div className="flex justify-between text-sm mb-1">
            <span>{item.name}</span>
            <span className="font-medium">{item.percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{
          width: `${item.percentage}%`
        }}></div>
          </div>
        </div>)}
    </div>;
  // Render different content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <div className="space-y-6">
            {/* Key metrics */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="text-gray-500 text-sm mb-1">Total Meetings</div>
                <div className="text-2xl font-bold">
                  {mockData.overview.meetingCount}
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="text-gray-500 text-sm mb-1">
                  Meeting Duration
                </div>
                <div className="text-2xl font-bold">
                  {mockData.overview.totalDuration}
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="text-gray-500 text-sm mb-1">Participants</div>
                <div className="text-2xl font-bold">
                  {mockData.overview.participantCount}
                </div>
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
                  <div className="text-xl font-bold mt-1">
                    {mockData.overview.aiAssistance.questionsAnswered}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 text-sm">Actions Completed</div>
                  <div className="text-xl font-bold mt-1">
                    {mockData.overview.aiAssistance.actionsCompleted}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 text-sm">Notes Generated</div>
                  <div className="text-xl font-bold mt-1">
                    {mockData.overview.aiAssistance.notesGenerated}
                  </div>
                </div>
              </div>
            </div>
            {/* Topic Distribution */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-lg font-medium mb-4">Topic Distribution</h3>
              <BarChart data={mockData.overview.topicDistribution} />
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
                {mockData.meetings.map(meeting => <tr key={meeting.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {meeting.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {meeting.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {meeting.duration}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {meeting.participants}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex flex-wrap gap-1">
                        {meeting.topics.map(topic => <span key={topic} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            {topic}
                          </span>)}
                      </div>
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </div>;
      case 'insights':
        return <div className="grid grid-cols-2 gap-4">
            {mockData.insights.map(insight => <div key={insight.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="font-medium text-lg mb-2">{insight.title}</h3>
                <p className="text-gray-600 mb-3">{insight.description}</p>
                {insight.metric && <div className={`text-xl font-bold ${insight.trend === 'up' ? 'text-green-600' : insight.trend === 'down' ? 'text-red-600' : 'text-gray-800'}`}>
                    {insight.metric}
                  </div>}
                {insight.topics && <div className="flex flex-wrap gap-1 mt-2">
                    {insight.topics.map(topic => <span key={topic} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {topic}
                      </span>)}
                  </div>}
              </div>)}
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