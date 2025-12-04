import React, { useEffect, useState } from 'react';
import { BarChart4Icon, PieChartIcon, LineChartIcon, TrendingUpIcon, UsersIcon, ShoppingCartIcon, DollarSignIcon, CalendarIcon, RefreshCwIcon, DownloadIcon, FilterIcon, CheckCircleIcon, ClockIcon, PlusIcon, MinusIcon, AlertCircleIcon, PenToolIcon } from 'lucide-react';
export const DataAnalyticsPanel = () => {
  const [activeTab, setActiveTab] = useState('revenue');
  const [timeRange, setTimeRange] = useState('quarter');
  const [isGenerating, setIsGenerating] = useState(true);
  const [generationProgress, setGenerationProgress] = useState({
    revenue: 'completed',
    customers: 'completed',
    sales: 'in-progress',
    marketing: 'pending',
    operations: 'pending'
  });
  const [confidenceLevels, setConfidenceLevels] = useState({
    revenue: 92,
    customers: 88,
    sales: 84,
    marketing: 79,
    operations: 76
  });
  // Simulating AI generating analytics data
  useEffect(() => {
    if (isGenerating) {
      const timer = setTimeout(() => {
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
            }, 8000);
          }, 6000);
        }
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isGenerating, generationProgress]);
  const getStatusIcon = status => {
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
  const getConfidenceBadge = level => {
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
      <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Revenue Breakdown</h3>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-3">
              BY PRODUCT LINE
            </h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>TechFlow</span>
                  <span className="font-medium">$3.66M (62%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{
                  width: '62%'
                }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>SecureConnect</span>
                  <span className="font-medium">$1.36M (23%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{
                  width: '23%'
                }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>CloudManage</span>
                  <span className="font-medium">$0.88M (15%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{
                  width: '15%'
                }}></div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-3">
              BY REGION
            </h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>North America</span>
                  <span className="font-medium">$3.42M (58%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-indigo-500 h-2 rounded-full" style={{
                  width: '58%'
                }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Europe</span>
                  <span className="font-medium">$1.71M (29%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{
                  width: '29%'
                }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Asia Pacific</span>
                  <span className="font-medium">$0.77M (13%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{
                  width: '13%'
                }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Key Insights</h3>
        </div>
        <div className="space-y-3">
          <div className="p-3 border border-blue-200 rounded-md bg-blue-50">
            <div className="flex items-start">
              <TrendingUpIcon size={18} className="text-blue-600 mr-2 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800">
                  Strong Growth Trajectory
                </p>
                <p className="text-sm text-blue-700">
                  Revenue CAGR of 18.7% over the past 3 years exceeds industry
                  average of 12.3%, positioning the company in the top quartile
                  of growth performers.
                </p>
              </div>
            </div>
          </div>
          <div className="p-3 border border-green-200 rounded-md bg-green-50">
            <div className="flex items-start">
              <DollarSignIcon size={18} className="text-green-600 mr-2 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  Improving Margins
                </p>
                <p className="text-sm text-green-700">
                  Gross margin improvement from 62% to 68% indicates successful
                  product scaling and operational efficiency. Further
                  improvements expected as CloudManage matures.
                </p>
              </div>
            </div>
          </div>
          <div className="p-3 border border-yellow-200 rounded-md bg-yellow-50">
            <div className="flex items-start">
              <AlertCircleIcon size={18} className="text-yellow-600 mr-2 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Geographic Expansion Opportunity
                </p>
                <p className="text-sm text-yellow-700">
                  Asia Pacific region represents only 13% of revenue despite
                  being 28% of global market. Significant growth opportunity
                  with targeted expansion strategy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
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
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-500 mb-3">
            CUSTOMER SEGMENTS
          </h4>
          <div className="h-64 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center relative overflow-hidden">
            {/* Simulated donut chart */}
            <div className="w-48 h-48 rounded-full border-[24px] border-blue-500 relative">
              <div className="absolute inset-0 border-[24px] border-transparent border-t-green-500 border-r-green-500 rounded-full transform rotate-45"></div>
              <div className="absolute inset-0 border-[24px] border-transparent border-t-purple-500 rounded-full transform rotate-[160deg]"></div>
            </div>
            <div className="absolute top-4 right-4 space-y-2">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-sm mr-2"></div>
                <span className="text-xs">Enterprise (42%)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-sm mr-2"></div>
                <span className="text-xs">Mid-Market (38%)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-500 rounded-sm mr-2"></div>
                <span className="text-xs">SMB (20%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Customer Insights</h3>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-3">
              INDUSTRY DISTRIBUTION
            </h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Technology</span>
                  <span className="font-medium">186 (38%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{
                  width: '38%'
                }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Financial Services</span>
                  <span className="font-medium">121 (25%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{
                  width: '25%'
                }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Healthcare</span>
                  <span className="font-medium">78 (16%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{
                  width: '16%'
                }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Manufacturing</span>
                  <span className="font-medium">53 (11%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{
                  width: '11%'
                }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Other</span>
                  <span className="font-medium">49 (10%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{
                  width: '10%'
                }}></div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-3">
              CUSTOMER LIFETIME VALUE
            </h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Enterprise</span>
                  <span className="font-medium">$86,400</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-indigo-500 h-2 rounded-full" style={{
                  width: '90%'
                }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Mid-Market</span>
                  <span className="font-medium">$42,300</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{
                  width: '45%'
                }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>SMB</span>
                  <span className="font-medium">$18,500</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-teal-500 h-2 rounded-full" style={{
                  width: '20%'
                }}></div>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-500 mb-2">
                CUSTOMER SATISFACTION
              </h4>
              <div className="flex items-center">
                <span className="text-3xl font-bold text-gray-900">72</span>
                <span className="ml-1 text-sm text-gray-500">NPS Score</span>
                <span className="ml-3 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Industry Top Quartile
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Key Opportunities</h3>
        </div>
        <div className="space-y-3">
          <div className="p-3 border border-blue-200 rounded-md bg-blue-50">
            <div className="flex items-start">
              <UsersIcon size={18} className="text-blue-600 mr-2 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800">
                  Enterprise Customer Expansion
                </p>
                <p className="text-sm text-blue-700">
                  Enterprise segment shows 42% higher upsell rate than other
                  segments. Recommend focusing account management resources on
                  the 38 enterprise accounts with highest growth potential.
                </p>
              </div>
            </div>
          </div>
          <div className="p-3 border border-green-200 rounded-md bg-green-50">
            <div className="flex items-start">
              <TrendingUpIcon size={18} className="text-green-600 mr-2 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  Healthcare Vertical Growth
                </p>
                <p className="text-sm text-green-700">
                  Healthcare customers show 31% higher retention and 24% higher
                  LTV than average. Recommend developing healthcare-specific
                  features and marketing campaigns.
                </p>
              </div>
            </div>
          </div>
          <div className="p-3 border border-yellow-200 rounded-md bg-yellow-50">
            <div className="flex items-start">
              <AlertCircleIcon size={18} className="text-yellow-600 mr-2 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  SMB Churn Risk
                </p>
                <p className="text-sm text-yellow-700">
                  SMB segment shows 2.3x higher churn risk in first 90 days.
                  Recommend enhancing onboarding process and creating SMB
                  success team to address specific needs.
                </p>
              </div>
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
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Pipeline Analysis</h3>
            </div>
            <div className="h-64 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center relative overflow-hidden">
              {/* Simulated funnel chart */}
              <div className="w-full px-12">
                <div className="h-10 bg-blue-500 w-full rounded-t-lg"></div>
                <div className="h-10 bg-blue-500 w-[85%] mx-auto"></div>
                <div className="h-10 bg-blue-500 w-[65%] mx-auto"></div>
                <div className="h-10 bg-blue-500 w-[40%] mx-auto"></div>
                <div className="h-10 bg-blue-500 w-[28%] mx-auto rounded-b-lg"></div>
              </div>
              <div className="absolute top-0 bottom-0 left-4 flex flex-col justify-between py-2">
                <div className="text-xs">Lead (312)</div>
                <div className="text-xs">MQL (265)</div>
                <div className="text-xs">SQL (202)</div>
                <div className="text-xs">Proposal (125)</div>
                <div className="text-xs">Won (87)</div>
              </div>
              <div className="absolute top-0 bottom-0 right-4 flex flex-col justify-between py-2">
                <div className="text-xs">100%</div>
                <div className="text-xs">85%</div>
                <div className="text-xs">65%</div>
                <div className="text-xs">40%</div>
                <div className="text-xs">28%</div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-start">
                <AlertCircleIcon size={16} className="text-yellow-600 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    Pipeline Analysis
                  </p>
                  <p className="text-xs text-yellow-700">
                    Significant drop-off between SQL and Proposal stages (37%
                    conversion vs. 52% benchmark). Recommend sales enablement
                    focus on proposal preparation and competitive
                    differentiation.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Sales Rep Performance</h3>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Jennifer Park</span>
                  <span className="font-medium">$1.24M (147% of quota)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{
                  width: '147%'
                }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Robert Chen</span>
                  <span className="font-medium">$0.92M (108% of quota)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{
                  width: '108%'
                }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Sarah Johnson</span>
                  <span className="font-medium">$0.86M (101% of quota)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{
                  width: '101%'
                }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Michael Brown</span>
                  <span className="font-medium">$0.79M (93% of quota)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{
                  width: '93%'
                }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>David Wilson</span>
                  <span className="font-medium">$0.68M (80% of quota)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{
                  width: '80%'
                }}></div>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-500 mb-3">
                TOP PERFORMER ANALYSIS
              </h4>
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-start">
                  <UsersIcon size={16} className="text-green-600 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      Success Patterns
                    </p>
                    <p className="text-xs text-green-700">
                      Top performers spend 38% more time on discovery calls and
                      send 2.4x more personalized content to prospects. They
                      also involve solution architects 27% earlier in the sales
                      process.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Recommendations</h3>
          </div>
          <div className="space-y-3">
            <div className="p-3 border border-blue-200 rounded-md bg-blue-50">
              <div className="flex items-start">
                <TrendingUpIcon size={18} className="text-blue-600 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    Sales Enablement Focus
                  </p>
                  <p className="text-sm text-blue-700">
                    Implement structured discovery call framework based on top
                    performer practices. Create battle cards addressing key
                    competitor differentiators at proposal stage.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-3 border border-green-200 rounded-md bg-green-50">
              <div className="flex items-start">
                <DollarSignIcon size={18} className="text-green-600 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-800">
                    Territory Optimization
                  </p>
                  <p className="text-sm text-green-700">
                    Northeast territory shows 32% higher win rates but is
                    understaffed by 2 reps. Recommend rebalancing territories to
                    capitalize on this opportunity.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-3 border border-purple-200 rounded-md bg-purple-50">
              <div className="flex items-start">
                <ShoppingCartIcon size={18} className="text-purple-600 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-purple-800">
                    Product Focus
                  </p>
                  <p className="text-sm text-purple-700">
                    SecureConnect shows highest win rate (34%) and fastest sales
                    cycle (36 days). Recommend increasing pipeline generation
                    activities for this product line.
                  </p>
                </div>
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