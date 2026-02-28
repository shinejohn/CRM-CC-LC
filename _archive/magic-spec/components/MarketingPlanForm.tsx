import React, { useEffect, useState } from 'react';
import { CheckCircleIcon, ClockIcon, AlertCircleIcon, BarChart4Icon, UsersIcon, TrendingUpIcon, DollarSignIcon, CalendarIcon, TargetIcon, AlertTriangleIcon, PenToolIcon, EditIcon, SaveIcon, RefreshCwIcon, DownloadIcon } from 'lucide-react';
import { simulateApiDelay } from '../utils/mockApi';

type SectionStatus = 'completed' | 'in-progress' | 'pending';
type SectionName = 'executiveSummary' | 'targetMarket' | 'competitiveAnalysis' | 'marketingStrategy' | 'budget' | 'timeline' | 'metrics';
interface AITypingState {
  section: string;
  isTyping: boolean;
  text: string;
  fullText: string;
}
export const MarketingPlanForm = () => {
  const [completionStatus, setCompletionStatus] = useState<Record<SectionName, SectionStatus>>({
    executiveSummary: 'completed',
    targetMarket: 'completed',
    competitiveAnalysis: 'in-progress',
    marketingStrategy: 'in-progress',
    budget: 'pending',
    timeline: 'pending',
    metrics: 'pending'
  });
  const [aiTyping, setAiTyping] = useState<AITypingState>({
    section: 'competitiveAnalysis',
    isTyping: false,
    text: '',
    fullText: 'Based on market data analysis, three primary competitors have been identified: CompanyX (42% market share), CompanyY (27% market share), and CompanyZ (15% market share). Your company currently holds 8% of the market. CompanyX leads in product quality but has higher pricing, while CompanyY offers competitive pricing but lower customer satisfaction ratings (67% vs. your 82%).'
  });
  const [confidenceLevels] = useState({
    executiveSummary: 92,
    targetMarket: 88,
    competitiveAnalysis: 76,
    marketingStrategy: 84,
    budget: 70,
    timeline: 65,
    metrics: 80
  });
  // Simulate AI typing effect
  useEffect(() => {
    if (aiTyping.isTyping && aiTyping.text.length < aiTyping.fullText.length) {
      const typingSpeed = Math.floor(Math.random() * 30) + 20;
      const timer = simulateApiDelay(2000).then(() => {
        setAiTyping(prev => ({
          ...prev,
          text: prev.fullText.substring(0, prev.text.length + 1)
        }));
      }, typingSpeed);
      return () => clearTimeout(timer);
    } else if (aiTyping.isTyping && aiTyping.text.length === aiTyping.fullText.length) {
      const timer = setTimeout(() => {
        setAiTyping(prev => ({
          ...prev,
          isTyping: false
        }));
        if (aiTyping.section === 'competitiveAnalysis') {
          setCompletionStatus(prev => ({
            ...prev,
            competitiveAnalysis: 'completed'
          }));
          setTimeout(() => {
            setAiTyping({
              section: 'marketingStrategy',
              isTyping: true,
              text: '',
              fullText: 'Recommend a multi-channel approach focusing on digital marketing (60%) and targeted industry events (40%). Key digital channels should include LinkedIn for B2B engagement (estimated 3.2% conversion rate), Google Ads with industry-specific keywords (projected 2.8% CTR), and email marketing campaigns to existing clients (expected 22% open rate, 4.1% conversion).'
            });
          });
        } else if (aiTyping.section === 'marketingStrategy') {
          setCompletionStatus(prev => ({
            ...prev,
            marketingStrategy: 'completed',
            budget: 'in-progress'
          }));
          simulateApiDelay(2000).then(() => {
            setAiTyping({
              section: 'budget',
              isTyping: true,
              text: '',
              fullText: 'Based on industry benchmarks and projected ROI analysis, recommend allocating $125,000 quarterly with the following distribution: Digital Marketing (60%): $75,000, Industry Events (25%): $31,250, Content Creation (10%): $12,500, Contingency (5%): $6,250.'
            });
          });
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [aiTyping]);
  // Start the AI typing when component mounts
  useEffect(() => {
    const timer = simulateApiDelay(1500).then(() => {
      setAiTyping(prev => ({
        ...prev,
        isTyping: true
      }));
    });
    return () => clearTimeout(timer);
  }, []);
  const getStatusIcon = (status: SectionStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon size={18} className="text-green-500" />;
      case 'in-progress':
        return <ClockIcon size={18} className="text-blue-500 animate-pulse" />;
      case 'pending':
        return <ClockIcon size={18} className="text-gray-400" />;
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
  return <div className="h-full flex flex-col bg-white">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white">
        <div className="flex items-center">
          <h1 className="text-xl font-bold">AI-Generated Marketing Plan</h1>
          <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            Auto-generating
          </span>
        </div>
        <div className="flex space-x-2">
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
            <RefreshCwIcon size={18} />
          </button>
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
            <EditIcon size={18} />
          </button>
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
            <SaveIcon size={18} />
          </button>
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
            <DownloadIcon size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Client Info */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-medium text-gray-800">
                  Acme Corporation
                </h2>
                <p className="text-sm text-gray-600">
                  Industry: Software as a Service (SaaS)
                </p>
                <p className="text-sm text-gray-600">
                  Target Market: Mid-size businesses (100-500 employees)
                </p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-blue-700">
                  Analysis based on:
                </p>
                <ul className="text-xs text-blue-600 mt-1">
                  <li>• 3 years of historical data</li>
                  <li>• 1,245 customer records</li>
                  <li>• 14 market research reports</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
              <div className="flex items-center">
                <span className="mr-2">{getStatusIcon('completed')}</span>
                <h2 className="font-medium">Executive Summary</h2>
              </div>
              <div className="flex items-center space-x-2">
                {getConfidenceBadge(confidenceLevels.executiveSummary)}
              </div>
            </div>
            <div className="p-4 bg-white">
              <p className="text-gray-700">
                Analysis of Acme Corporation's current market position indicates
                significant growth opportunity in the mid-size business segment,
                particularly within the technology and financial services
                verticals. Current customer acquisition cost (CAC) of $1,250 is
                15% above industry average, while customer lifetime value (CLV)
                of $8,750 creates a healthy CLV:CAC ratio of 7:1.
              </p>
              <p className="text-gray-700 mt-3">
                Recommend focusing marketing efforts on digital channels with
                targeted messaging around cost reduction and operational
                efficiency, which aligns with primary customer pain points
                identified in recent surveys. Competitive analysis suggests
                emphasizing your platform's integration capabilities and
                superior customer support (NPS score of 72 vs. industry average
                of 45).
              </p>
            </div>
          </div>

          {/* Target Market Analysis */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
              <div className="flex items-center">
                <span className="mr-2">{getStatusIcon('completed')}</span>
                <h2 className="font-medium">Target Market Analysis</h2>
              </div>
              <div className="flex items-center space-x-2">
                {getConfidenceBadge(confidenceLevels.targetMarket)}
              </div>
            </div>
            <div className="p-4 bg-white">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <UsersIcon size={16} className="mr-1" /> Primary Audience
                  </h3>
                  <ul className="text-gray-700 space-y-2">
                    <li>
                      <span className="font-medium">Demographics:</span>{' '}
                      Mid-size businesses (100-500 employees)
                    </li>
                    <li>
                      <span className="font-medium">Key Industries:</span>{' '}
                      Technology (42%), Financial Services (28%), Healthcare
                      (15%)
                    </li>
                    <li>
                      <span className="font-medium">Decision Makers:</span> IT
                      Directors (37%), CTOs (32%), Operations Managers (24%)
                    </li>
                  </ul>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <TargetIcon size={16} className="mr-1" /> Key Pain Points
                  </h3>
                  <ul className="text-gray-700 space-y-2">
                    <li>
                      <span className="font-medium">Primary:</span> Cost
                      management (87% of survey respondents)
                    </li>
                    <li>
                      <span className="font-medium">Secondary:</span> System
                      integration difficulties (72%)
                    </li>
                    <li>
                      <span className="font-medium">Tertiary:</span> Reporting
                      and analytics capabilities (65%)
                    </li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 p-3 bg-yellow-50 rounded-md border border-yellow-200">
                <div className="flex items-start">
                  <AlertTriangleIcon size={18} className="text-yellow-500 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">
                      Market Opportunity Alert
                    </p>
                    <p className="text-sm text-yellow-700">
                      Data indicates an underserved segment within healthcare
                      industry (15% of current customers but 27% of total market
                      opportunity). Consider developing targeted messaging for
                      healthcare-specific use cases.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Competitive Analysis */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
              <div className="flex items-center">
                <span className="mr-2">
                  {getStatusIcon(completionStatus.competitiveAnalysis)}
                </span>
                <h2 className="font-medium">Competitive Analysis</h2>
              </div>
              <div className="flex items-center space-x-2">
                {completionStatus.competitiveAnalysis === 'completed' && getConfidenceBadge(confidenceLevels.competitiveAnalysis)}
                {completionStatus.competitiveAnalysis === 'in-progress' && <span className="text-xs text-blue-600 animate-pulse flex items-center">
                    <PenToolIcon size={12} className="mr-1" />
                    AI analyzing data...
                  </span>}
              </div>
            </div>
            <div className="p-4 bg-white">
              {completionStatus.competitiveAnalysis === 'completed' ? <p className="text-gray-700">{aiTyping.fullText}</p> : <div>
                  <p className="text-gray-700">
                    {aiTyping.section === 'competitiveAnalysis' ? aiTyping.text : ''}
                  </p>
                  {aiTyping.section === 'competitiveAnalysis' && aiTyping.isTyping && <span className="inline-block w-2 h-4 bg-blue-500 ml-1 animate-pulse"></span>}
                </div>}
            </div>
          </div>

          {/* Marketing Strategy */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
              <div className="flex items-center">
                <span className="mr-2">
                  {getStatusIcon(completionStatus.marketingStrategy)}
                </span>
                <h2 className="font-medium">Marketing Strategy</h2>
              </div>
              <div className="flex items-center space-x-2">
                {completionStatus.marketingStrategy === 'completed' && getConfidenceBadge(confidenceLevels.marketingStrategy)}
                {completionStatus.marketingStrategy === 'in-progress' && <span className="text-xs text-blue-600 animate-pulse flex items-center">
                    <PenToolIcon size={12} className="mr-1" />
                    AI generating recommendations...
                  </span>}
              </div>
            </div>
            <div className="p-4 bg-white">
              {completionStatus.marketingStrategy === 'completed' ? <p className="text-gray-700">
                  {aiTyping.section === 'marketingStrategy' ? aiTyping.fullText : ''}
                </p> : completionStatus.marketingStrategy === 'in-progress' ? <div>
                  <p className="text-gray-700">
                    {aiTyping.section === 'marketingStrategy' ? aiTyping.text : ''}
                  </p>
                  {aiTyping.section === 'marketingStrategy' && aiTyping.isTyping && <span className="inline-block w-2 h-4 bg-blue-500 ml-1 animate-pulse"></span>}
                </div> : <div className="flex items-center justify-center h-20 text-gray-400">
                  <ClockIcon size={18} className="mr-2" />
                  <span>Waiting to analyze data...</span>
                </div>}
            </div>
          </div>

          {/* Budget and Resources */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
              <div className="flex items-center">
                <span className="mr-2">
                  {getStatusIcon(completionStatus.budget)}
                </span>
                <h2 className="font-medium">Budget and Resources</h2>
              </div>
              <div className="flex items-center space-x-2">
                {completionStatus.budget === 'completed' && getConfidenceBadge(confidenceLevels.budget)}
                {completionStatus.budget === 'in-progress' && <span className="text-xs text-blue-600 animate-pulse flex items-center">
                    <PenToolIcon size={12} className="mr-1" />
                    AI calculating budget...
                  </span>}
              </div>
            </div>
            <div className="p-4 bg-white">
              {completionStatus.budget === 'completed' ? <p className="text-gray-700">
                  {aiTyping.section === 'budget' ? aiTyping.fullText : ''}
                </p> : completionStatus.budget === 'in-progress' ? <div>
                  <p className="text-gray-700">
                    {aiTyping.section === 'budget' ? aiTyping.text : ''}
                  </p>
                  {aiTyping.section === 'budget' && aiTyping.isTyping && <span className="inline-block w-2 h-4 bg-blue-500 ml-1 animate-pulse"></span>}
                </div> : <div className="flex items-center justify-center h-20 text-gray-400">
                  <ClockIcon size={18} className="mr-2" />
                  <span>Waiting to analyze data...</span>
                </div>}
            </div>
          </div>

          {/* Timeline and Implementation */}
          <div className="border border-gray-200 rounded-lg overflow-hidden opacity-60">
            <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
              <div className="flex items-center">
                <span className="mr-2">
                  {getStatusIcon(completionStatus.timeline)}
                </span>
                <h2 className="font-medium">Timeline and Implementation</h2>
              </div>
            </div>
            <div className="p-4 bg-white flex items-center justify-center h-20 text-gray-400">
              <ClockIcon size={18} className="mr-2" />
              <span>Waiting to analyze data...</span>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="border border-gray-200 rounded-lg overflow-hidden opacity-60">
            <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
              <div className="flex items-center">
                <span className="mr-2">
                  {getStatusIcon(completionStatus.metrics)}
                </span>
                <h2 className="font-medium">Performance Metrics</h2>
              </div>
            </div>
            <div className="p-4 bg-white flex items-center justify-center h-20 text-gray-400">
              <ClockIcon size={18} className="mr-2" />
              <span>Waiting to analyze data...</span>
            </div>
          </div>
        </div>
      </div>
    </div>;
};