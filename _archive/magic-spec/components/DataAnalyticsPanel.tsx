import React, { useEffect, useState } from 'react';
import { BarChart4Icon, PieChartIcon, LineChartIcon, TrendingUpIcon, UsersIcon, ShoppingCartIcon, DollarSignIcon, CalendarIcon, RefreshCwIcon, DownloadIcon, FilterIcon, CheckCircleIcon, ClockIcon, PlusIcon, MinusIcon, AlertCircleIcon, PenToolIcon } from 'lucide-react';
import { simulateApiDelay } from '../utils/mockApi';

type GenerationStatus = 'completed' | 'in-progress' | 'pending';
type TabType = 'revenue' | 'customers' | 'sales' | 'marketing' | 'operations';
export const DataAnalyticsPanel = () => {
  const [activeTab, setActiveTab] = useState<TabType>('revenue');
  const [timeRange, setTimeRange] = useState('quarter');
  const [isGenerating, setIsGenerating] = useState(true);
  const [generationProgress, setGenerationProgress] = useState<Record<TabType, GenerationStatus>>({
    revenue: 'completed',
    customers: 'completed',
    sales: 'in-progress',
    marketing: 'pending',
    operations: 'pending'
  });
  const [confidenceLevels] = useState({
    revenue: 92,
    customers: 88,
    sales: 84,
    marketing: 79,
    operations: 76
  });
  // Simulating AI generating analytics data
  useEffect(() => {
    if (isGenerating) {
      const timer = simulateApiDelay(8000).then(() => {
        if (generationProgress.sales === 'in-progress') {
          setGenerationProgress(prev => ({
            ...prev,
            sales: 'completed',
            marketing: 'in-progress'
          }));
          setTimeout(() => {
            setGenerationProgress(prev => ({
              ...prev,
              marketing: 'completed',
              operations: 'in-progress'
            }));
            setTimeout(() => {
              setGenerationProgress(prev => ({
                ...prev,
                operations: 'completed'
              }));
              setIsGenerating(false);
            });
          }, 6000);
        }
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isGenerating, generationProgress]);
  const getStatusIcon = (status: GenerationStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon size={16} className="text-green-500" />;
      case 'in-progress':
        return <ClockIcon size={16} className="text-blue-500 animate-pulse" />;
      case 'pending':
        return <ClockIcon size={16} className="text-gray-400" />;
      default:
        return null;
    }
  };
  const getConfidenceBadge = (level: number) => {
    let color = 'gray';
    if (level > 85) color = 'green';else if (level > 70) color = 'blue';else if (level > 50) color = 'yellow';else color = 'red';
    return <div className={`px-2 py-1 rounded-full text-xs font-medium bg-${color}-100 text-${color}-800 flex items-center`}>
        <BarChart4Icon size={12} className="mr-1" />
        {level}% confidence
      </div>;
  };
  // Render Revenue Analysis tab
  const renderRevenueAnalysis = () => <div className="space-y-6">
      <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Revenue Trends</h3>
          {getConfidenceBadge(confidenceLevels.revenue)}
        </div>
        <div className="h-64 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center relative overflow-hidden">
          {/* Simulated line chart */}
          <div className="absolute inset-0 p-4">
            <div className="w-full h-full flex items-end">
              <div className="flex-1 h-[30%] bg-blue-500 opacity-20 rounded-sm"></div>
              <div className="flex-1 h-[45%] bg-blue-500 opacity-30 rounded-sm"></div>
              <div className="flex-1 h-[40%] bg-blue-500 opacity-40 rounded-sm"></div>
              <div className="flex-1 h-[60%] bg-blue-500 opacity-50 rounded-sm"></div>
              <div className="flex-1 h-[70%] bg-blue-500 opacity-60 rounded-sm"></div>
              <div className="flex-1 h-[65%] bg-blue-500 opacity-70 rounded-sm"></div>
              <div className="flex-1 h-[80%] bg-blue-500 opacity-80 rounded-sm"></div>
              <div className="flex-1 h-[90%] bg-blue-500 opacity-90 rounded-sm"></div>
            </div>
            <div className="absolute bottom-4 left-4 right-4 flex justify-between text-xs text-gray-500">
              <span>Q1</span>
              <span>Q2</span>
              <span>Q3</span>
              <span>Q4</span>
              <span>Q1</span>
              <span>Q2</span>
              <span>Q3</span>
              <span>Q4</span>
            </div>
            <div className="absolute top-4 left-4 text-sm font-medium text-gray-700">
              Revenue Growth: +18.7% YoY
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-4">
          <div className="p-3 bg-blue-50 rounded-md">
            <div className="text-sm text-blue-800 font-medium">
              Total Revenue
            </div>
            <div className="text-xl font-bold text-blue-900">$5.9M</div>
            <div className="text-xs text-blue-700 flex items-center mt-1">
              <TrendingUpIcon size={12} className="mr-1" /> +18.7% YoY
            </div>
          </div>
          <div className="p-3 bg-green-50 rounded-md">
            <div className="text-sm text-green-800 font-medium">
              Gross Margin
            </div>
            <div className="text-xl font-bold text-green-900">68%</div>
            <div className="text-xs text-green-700 flex items-center mt-1">
              <TrendingUpIcon size={12} className="mr-1" /> +6% YoY
            </div>
          </div>
          <div className="p-3 bg-purple-50 rounded-md">
            <div className="text-sm text-purple-800 font-medium">EBITDA</div>
            <div className="text-xl font-bold text-purple-900">$1.32M</div>
            <div className="text-xs text-purple-700 flex items-center mt-1">
              <TrendingUpIcon size={12} className="mr-1" /> +22.4% YoY
            </div>
          </div>
          <div className="p-3 bg-yellow-50 rounded-md">
            <div className="text-sm text-yellow-800 font-medium">ARR</div>
            <div className="text-xl font-bold text-yellow-900">$4.8M</div>
            <div className="text-xs text-yellow-700 flex items-center mt-1">
              <TrendingUpIcon size={12} className="mr-1" /> +24.1% YoY
            </div>
          </div>
        </div>
      </div>
      {/* Additional revenue sections would continue here - truncated for brevity */}
    </div>;
  // Render Customer Segmentation tab
  const renderCustomerSegmentation = () => <div className="space-y-6">
      <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Customer Distribution</h3>
          {getConfidenceBadge(confidenceLevels.customers)}
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 text-center">
            <div className="text-sm text-gray-500">Total Customers</div>
            <div className="text-3xl font-bold text-gray-900 mt-1">487</div>
            <div className="text-xs text-green-600 flex items-center justify-center mt-1">
              <TrendingUpIcon size={12} className="mr-1" /> +32% YoY
            </div>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 text-center">
            <div className="text-sm text-gray-500">Avg. Contract Value</div>
            <div className="text-3xl font-bold text-gray-900 mt-1">$12,100</div>
            <div className="text-xs text-green-600 flex items-center justify-center mt-1">
              <TrendingUpIcon size={12} className="mr-1" /> +8% YoY
            </div>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 text-center">
            <div className="text-sm text-gray-500">Customer Retention</div>
            <div className="text-3xl font-bold text-gray-900 mt-1">94.3%</div>
            <div className="text-xs text-green-600 flex items-center justify-center mt-1">
              <TrendingUpIcon size={12} className="mr-1" /> +2.1% YoY
            </div>
          </div>
        </div>
      </div>
    </div>;
  // Render Sales Performance tab
  const renderSalesPerformance = () => {
    if (generationProgress.sales !== 'completed') {
      return <div className="h-96 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-lg font-medium text-gray-700">
              Analyzing sales performance data...
            </p>
            <p className="text-sm text-gray-500 mt-2">
              This may take a few moments
            </p>
          </div>
        </div>;
    }
    return <div className="space-y-6">
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Sales Overview</h3>
            {getConfidenceBadge(confidenceLevels.sales)}
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 text-center">
              <div className="text-sm text-gray-500">New Deals</div>
              <div className="text-3xl font-bold text-gray-900 mt-1">142</div>
              <div className="text-xs text-green-600 flex items-center justify-center mt-1">
                <TrendingUpIcon size={12} className="mr-1" /> +18% QoQ
              </div>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 text-center">
              <div className="text-sm text-gray-500">Win Rate</div>
              <div className="text-3xl font-bold text-gray-900 mt-1">28%</div>
              <div className="text-xs text-green-600 flex items-center justify-center mt-1">
                <TrendingUpIcon size={12} className="mr-1" /> +3% QoQ
              </div>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 text-center">
              <div className="text-sm text-gray-500">Avg. Deal Size</div>
              <div className="text-3xl font-bold text-gray-900 mt-1">$32K</div>
              <div className="text-xs text-green-600 flex items-center justify-center mt-1">
                <TrendingUpIcon size={12} className="mr-1" /> +7% QoQ
              </div>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 text-center">
              <div className="text-sm text-gray-500">Sales Cycle</div>
              <div className="text-3xl font-bold text-gray-900 mt-1">42d</div>
              <div className="text-xs text-red-600 flex items-center justify-center mt-1">
                <TrendingUpIcon size={12} className="mr-1" /> +4d QoQ
              </div>
            </div>
          </div>
        </div>
      </div>;
  };
  // Render Marketing Effectiveness tab
  const renderMarketingEffectiveness = () => {
    if (generationProgress.marketing !== 'completed') {
      return <div className="h-96 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-lg font-medium text-gray-700">
              Analyzing marketing campaign data...
            </p>
            <p className="text-sm text-gray-500 mt-2">
              This may take a few moments
            </p>
          </div>
        </div>;
    }
    return <div className="text-center p-8 text-gray-500">
        Marketing analysis content would appear here
      </div>;
  };
  // Render Operations Efficiency tab
  const renderOperationsEfficiency = () => {
    if (generationProgress.operations !== 'completed') {
      return <div className="h-96 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-lg font-medium text-gray-700">
              Analyzing operational data...
            </p>
            <p className="text-sm text-gray-500 mt-2">
              This may take a few moments
            </p>
          </div>
        </div>;
    }
    return <div className="text-center p-8 text-gray-500">
        Operations analysis content would appear here
      </div>;
  };
  // Render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'revenue':
        return renderRevenueAnalysis();
      case 'customers':
        return renderCustomerSegmentation();
      case 'sales':
        return renderSalesPerformance();
      case 'marketing':
        return renderMarketingEffectiveness();
      case 'operations':
        return renderOperationsEfficiency();
      default:
        return <div>Select a tab to view data</div>;
    }
  };
  return <div className="h-full flex flex-col bg-white">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl font-bold">AI-Generated Business Analytics</h1>
          {isGenerating && <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium flex items-center">
              <PenToolIcon size={12} className="mr-1 animate-pulse" />
              Generating insights...
            </span>}
        </div>
        <div className="flex space-x-2">
          <div className="relative">
            <select value={timeRange} onChange={e => setTimeRange(e.target.value)} className="appearance-none bg-white border border-gray-300 rounded-md py-1 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
              <option value="ytd">Year to Date</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <FilterIcon size={14} />
            </div>
          </div>
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
            <RefreshCwIcon size={18} />
          </button>
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
            <DownloadIcon size={18} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex">
          <button className={`px-4 py-3 text-sm font-medium flex items-center space-x-1 ${activeTab === 'revenue' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`} onClick={() => setActiveTab('revenue')}>
            <TrendingUpIcon size={16} />
            <span>Revenue Analysis</span>
            <span className="ml-1">
              {getStatusIcon(generationProgress.revenue)}
            </span>
          </button>
          <button className={`px-4 py-3 text-sm font-medium flex items-center space-x-1 ${activeTab === 'customers' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`} onClick={() => setActiveTab('customers')}>
            <UsersIcon size={16} />
            <span>Customer Segmentation</span>
            <span className="ml-1">
              {getStatusIcon(generationProgress.customers)}
            </span>
          </button>
          <button className={`px-4 py-3 text-sm font-medium flex items-center space-x-1 ${activeTab === 'sales' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`} onClick={() => setActiveTab('sales')}>
            <DollarSignIcon size={16} />
            <span>Sales Performance</span>
            <span className="ml-1">
              {getStatusIcon(generationProgress.sales)}
            </span>
          </button>
          <button className={`px-4 py-3 text-sm font-medium flex items-center space-x-1 ${activeTab === 'marketing' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`} onClick={() => setActiveTab('marketing')}>
            <BarChart4Icon size={16} />
            <span>Marketing Effectiveness</span>
            <span className="ml-1">
              {getStatusIcon(generationProgress.marketing)}
            </span>
          </button>
          <button className={`px-4 py-3 text-sm font-medium flex items-center space-x-1 ${activeTab === 'operations' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`} onClick={() => setActiveTab('operations')}>
            <PieChartIcon size={16} />
            <span>Operations Efficiency</span>
            <span className="ml-1">
              {getStatusIcon(generationProgress.operations)}
            </span>
          </button>
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
        {renderTabContent()}
      </div>
    </div>;
};