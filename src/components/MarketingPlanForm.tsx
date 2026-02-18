import React, { useEffect, useState } from 'react';
import { CheckCircleIcon, ClockIcon, AlertCircleIcon, BarChart4Icon, UsersIcon, TrendingUpIcon, DollarSignIcon, CalendarIcon, TargetIcon, AlertTriangleIcon, PenToolIcon, EditIcon, SaveIcon, RefreshCwIcon, DownloadIcon } from 'lucide-react';
export const MarketingPlanForm = () => {
  const [completionStatus, setCompletionStatus] = useState({
    executiveSummary: 'completed',
    targetMarket: 'completed',
    competitiveAnalysis: 'in-progress',
    marketingStrategy: 'in-progress',
    budget: 'pending',
    timeline: 'pending',
    metrics: 'pending'
  });
  // Mock AI content commented out - wire to campaign generation API when available
  // fullText: 'Based on market data analysis, three primary competitors...'
  const [aiTyping, setAiTyping] = useState({
    section: 'competitiveAnalysis',
    isTyping: false,
    text: '',
    fullText: '',
  });
  const [confidenceLevels, setConfidenceLevels] = useState({
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
      const typingSpeed = Math.floor(Math.random() * 30) + 20; // Random typing speed between 20-50ms
      const timer = setTimeout(() => {
        setAiTyping(prev => ({
          ...prev,
          text: prev.fullText.substring(0, prev.text.length + 1)
        }));
      }, typingSpeed);
      return () => clearTimeout(timer);
    } else if (aiTyping.isTyping && aiTyping.text.length === aiTyping.fullText.length) {
      // When typing is complete
      const timer = setTimeout(() => {
        setAiTyping(prev => ({
          ...prev,
          isTyping: false
        }));
        // Move to the next section
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
              fullText: '', // Wire to API for real recommendations
            });
          }, 2000);
        } else if (aiTyping.section === 'marketingStrategy') {
          setCompletionStatus(prev => ({
            ...prev,
            marketingStrategy: 'completed',
            budget: 'in-progress'
          }));
          setTimeout(() => {
            setAiTyping({
              section: 'budget',
              isTyping: true,
              text: '',
              fullText: '', // Wire to API for real budget recommendations
            });
          }, 2000);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [aiTyping]);
  // AI typing disabled - wire to campaign generation API for real content
  // useEffect(() => { setAiTyping(prev => ({ ...prev, isTyping: true })); }, []);
  const getStatusIcon = status => {
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
  const getConfidenceBadge = level => {
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
          {/* Client Info - load from SMB profile / business context API */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-medium text-gray-800">
                  {/* Acme Corporation - mock commented out */}
                  Business Profile
                </h2>
                <p className="text-sm text-gray-600">
                  Industry: — {/* Load from API */}
                </p>
                <p className="text-sm text-gray-600">
                  Target Market: — {/* Load from API */}
                </p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-blue-700">
                  Analysis based on:
                </p>
                <ul className="text-xs text-blue-600 mt-1">
                  {/* Mock data commented out: 3 years historical, 1245 records, 14 reports */}
                  <li>• Connect to CRM analytics for real data</li>
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
              {/* Mock executive summary commented out - wire to campaign generation API */}
              <p className="text-gray-500 italic">Executive summary will be generated from business data and campaign analytics.</p>
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
              {/* Mock target market data commented out - wire to CRM analytics API */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <UsersIcon size={16} className="mr-1" /> Primary Audience
                  </h3>
                  <p className="text-gray-500 italic text-sm">Load from CRM / customer analytics</p>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <TargetIcon size={16} className="mr-1" /> Key Pain Points
                  </h3>
                  <p className="text-gray-500 italic text-sm">Load from survey / conversation data</p>
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
              <div className="flex items-center space-x-2">
                {completionStatus.timeline === 'completed' && getConfidenceBadge(confidenceLevels.timeline)}
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
              <div className="flex items-center space-x-2">
                {completionStatus.metrics === 'completed' && getConfidenceBadge(confidenceLevels.metrics)}
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