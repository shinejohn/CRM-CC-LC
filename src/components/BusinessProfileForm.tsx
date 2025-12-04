import React, { useEffect, useState } from 'react';
import { CheckCircleIcon, ClockIcon, BuildingIcon, UsersIcon, TrendingUpIcon, DollarSignIcon, ShieldIcon, PackageIcon, GlobeIcon, AlertTriangleIcon, PenToolIcon, BarChart4Icon, FileTextIcon, RefreshCwIcon, DownloadIcon, Share2Icon, PrinterIcon } from 'lucide-react';
export const BusinessProfileForm = () => {
  const [completionStatus, setCompletionStatus] = useState({
    companyInfo: 'completed',
    leadership: 'completed',
    financials: 'in-progress',
    products: 'pending',
    marketPosition: 'pending',
    growthOpportunities: 'pending',
    riskAssessment: 'pending'
  });
  const [aiTyping, setAiTyping] = useState({
    section: 'financials',
    isTyping: false,
    text: '',
    fullText: 'Based on the last 3 fiscal years, revenue has grown at a CAGR of 18.7%, from $4.2M in FY2020 to $5.9M in FY2022. Gross margin has improved from 62% to 68% during this period. EBITDA margin stands at 22.4%, which is 3.2 percentage points above industry average. Current ratio is healthy at 2.3, with a debt-to-equity ratio of 0.4, indicating strong financial stability and room for additional leverage if needed for expansion.'
  });
  const [confidenceLevels, setConfidenceLevels] = useState({
    companyInfo: 95,
    leadership: 90,
    financials: 87,
    products: 82,
    marketPosition: 78,
    growthOpportunities: 73,
    riskAssessment: 68
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
        if (aiTyping.section === 'financials') {
          setCompletionStatus(prev => ({
            ...prev,
            financials: 'completed',
            products: 'in-progress'
          }));
          setTimeout(() => {
            setAiTyping({
              section: 'products',
              isTyping: true,
              text: '',
              fullText: 'The company offers 3 core product lines: TechFlow (enterprise workflow automation), SecureConnect (data security suite), and CloudManage (cloud resource optimization). TechFlow is the flagship product, contributing 62% of revenue with 24% YoY growth. SecureConnect (23% of revenue) is growing at 31% YoY, while CloudManage (15% of revenue) was launched 18 months ago and is gaining traction in the mid-market segment.'
            });
          }, 2000);
        } else if (aiTyping.section === 'products') {
          setCompletionStatus(prev => ({
            ...prev,
            products: 'completed',
            marketPosition: 'in-progress'
          }));
          setTimeout(() => {
            setAiTyping({
              section: 'marketPosition',
              isTyping: true,
              text: '',
              fullText: 'Current market position analysis indicates the company holds approximately 8.5% market share in the workflow automation segment (ranked 4th), 3.2% in security solutions (ranked 7th), and is an emerging player in cloud management. Primary competitors include EnterpriseFlow (22% market share), SecureTech (15%), and CloudSystems (12%). Key competitive advantages include superior customer support (NPS of 72 vs. industry average of 48) and product integration capabilities.'
            });
          }, 2000);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [aiTyping]);
  // Start the AI typing when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setAiTyping(prev => ({
        ...prev,
        isTyping: true
      }));
    }, 1500);
    return () => clearTimeout(timer);
  }, []);
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
          <h1 className="text-xl font-bold">AI-Generated Business Profile</h1>
          <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            Auto-generating
          </span>
        </div>
        <div className="flex space-x-2">
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
            <RefreshCwIcon size={18} />
          </button>
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
            <PrinterIcon size={18} />
          </button>
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
            <Share2Icon size={18} />
          </button>
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
            <DownloadIcon size={18} />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Company Header */}
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center text-white text-2xl font-bold">
              TS
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                TechSolutions Inc.
              </h1>
              <p className="text-gray-500">
                Enterprise Software | Founded 2015 | San Francisco, CA
              </p>
            </div>
          </div>
          {/* Data Sources */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-start">
              <div className="flex-1">
                <h2 className="text-sm font-medium text-gray-500">
                  PROFILE GENERATED USING
                </h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium flex items-center">
                    <FileTextIcon size={12} className="mr-1" /> SEC Filings
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium flex items-center">
                    <GlobeIcon size={12} className="mr-1" /> Company Website
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium flex items-center">
                    <UsersIcon size={12} className="mr-1" /> LinkedIn Data
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium flex items-center">
                    <BarChart4Icon size={12} className="mr-1" /> Industry
                    Reports
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-sm font-medium text-gray-500">
                  LAST UPDATED
                </h2>
                <p className="mt-2 text-sm text-gray-700">
                  June 12, 2023 (2 days ago)
                </p>
              </div>
            </div>
          </div>
          {/* Company Information */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
              <div className="flex items-center">
                <span className="mr-2">
                  {getStatusIcon(completionStatus.companyInfo)}
                </span>
                <h2 className="font-medium">Company Information</h2>
              </div>
              <div className="flex items-center space-x-2">
                {getConfidenceBadge(confidenceLevels.companyInfo)}
              </div>
            </div>
            <div className="p-4 bg-white">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    COMPANY OVERVIEW
                  </h3>
                  <p className="text-gray-700">
                    TechSolutions Inc. is a B2B software company specializing in
                    enterprise workflow automation, data security, and cloud
                    management solutions. Founded in 2015 by former Google
                    engineers, the company has grown to 187 employees across
                    offices in San Francisco (HQ), Boston, and London.
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    COMPANY DETAILS
                  </h3>
                  <div className="space-y-2">
                    <div className="flex">
                      <span className="text-gray-500 w-32">Legal Name:</span>
                      <span className="text-gray-700 font-medium">
                        TechSolutions, Inc.
                      </span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 w-32">Founded:</span>
                      <span className="text-gray-700 font-medium">
                        March 2015
                      </span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 w-32">Headquarters:</span>
                      <span className="text-gray-700 font-medium">
                        San Francisco, CA
                      </span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 w-32">Employees:</span>
                      <span className="text-gray-700 font-medium">
                        187 (23% YoY growth)
                      </span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 w-32">Funding:</span>
                      <span className="text-gray-700 font-medium">
                        $42M (Series B)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Leadership Team */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
              <div className="flex items-center">
                <span className="mr-2">
                  {getStatusIcon(completionStatus.leadership)}
                </span>
                <h2 className="font-medium">Leadership Team</h2>
              </div>
              <div className="flex items-center space-x-2">
                {getConfidenceBadge(confidenceLevels.leadership)}
              </div>
            </div>
            <div className="p-4 bg-white">
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                    <UsersIcon size={20} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Sarah Chen</h3>
                    <p className="text-sm text-gray-500">Co-Founder & CEO</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Former Engineering Director at Google Cloud (2010-2015)
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                    <UsersIcon size={20} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Michael Rodriguez
                    </h3>
                    <p className="text-sm text-gray-500">Co-Founder & CTO</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Former Senior Software Engineer at Google (2008-2015)
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                    <UsersIcon size={20} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">David Wilson</h3>
                    <p className="text-sm text-gray-500">
                      Chief Financial Officer
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Former VP of Finance at Salesforce (2012-2019)
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                    <UsersIcon size={20} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Jennifer Park</h3>
                    <p className="text-sm text-gray-500">VP of Sales</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Former Sales Director at Oracle (2014-2020)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Financial Overview */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
              <div className="flex items-center">
                <span className="mr-2">
                  {getStatusIcon(completionStatus.financials)}
                </span>
                <h2 className="font-medium">Financial Overview</h2>
              </div>
              <div className="flex items-center space-x-2">
                {completionStatus.financials === 'completed' && getConfidenceBadge(confidenceLevels.financials)}
                {completionStatus.financials === 'in-progress' && <span className="text-xs text-blue-600 animate-pulse flex items-center">
                    <PenToolIcon size={12} className="mr-1" />
                    AI analyzing financial data...
                  </span>}
              </div>
            </div>
            <div className="p-4 bg-white">
              {completionStatus.financials === 'completed' ? <p className="text-gray-700">{aiTyping.fullText}</p> : <div>
                  <p className="text-gray-700">
                    {aiTyping.section === 'financials' ? aiTyping.text : ''}
                  </p>
                  {aiTyping.section === 'financials' && aiTyping.isTyping && <span className="inline-block w-2 h-4 bg-blue-500 ml-1 animate-pulse"></span>}
                </div>}
            </div>
          </div>
          {/* Products & Services */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
              <div className="flex items-center">
                <span className="mr-2">
                  {getStatusIcon(completionStatus.products)}
                </span>
                <h2 className="font-medium">Products & Services</h2>
              </div>
              <div className="flex items-center space-x-2">
                {completionStatus.products === 'completed' && getConfidenceBadge(confidenceLevels.products)}
                {completionStatus.products === 'in-progress' && <span className="text-xs text-blue-600 animate-pulse flex items-center">
                    <PenToolIcon size={12} className="mr-1" />
                    AI analyzing product data...
                  </span>}
              </div>
            </div>
            <div className="p-4 bg-white">
              {completionStatus.products === 'completed' ? <p className="text-gray-700">{aiTyping.fullText}</p> : completionStatus.products === 'in-progress' ? <div>
                  <p className="text-gray-700">
                    {aiTyping.section === 'products' ? aiTyping.text : ''}
                  </p>
                  {aiTyping.section === 'products' && aiTyping.isTyping && <span className="inline-block w-2 h-4 bg-blue-500 ml-1 animate-pulse"></span>}
                </div> : <div className="flex items-center justify-center h-20 text-gray-400">
                  <ClockIcon size={18} className="mr-2" />
                  <span>Waiting to analyze data...</span>
                </div>}
            </div>
          </div>
          {/* Market Position */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
              <div className="flex items-center">
                <span className="mr-2">
                  {getStatusIcon(completionStatus.marketPosition)}
                </span>
                <h2 className="font-medium">Market Position</h2>
              </div>
              <div className="flex items-center space-x-2">
                {completionStatus.marketPosition === 'completed' && getConfidenceBadge(confidenceLevels.marketPosition)}
                {completionStatus.marketPosition === 'in-progress' && <span className="text-xs text-blue-600 animate-pulse flex items-center">
                    <PenToolIcon size={12} className="mr-1" />
                    AI analyzing market data...
                  </span>}
              </div>
            </div>
            <div className="p-4 bg-white">
              {completionStatus.marketPosition === 'completed' ? <p className="text-gray-700">{aiTyping.fullText}</p> : completionStatus.marketPosition === 'in-progress' ? <div>
                  <p className="text-gray-700">
                    {aiTyping.section === 'marketPosition' ? aiTyping.text : ''}
                  </p>
                  {aiTyping.section === 'marketPosition' && aiTyping.isTyping && <span className="inline-block w-2 h-4 bg-blue-500 ml-1 animate-pulse"></span>}
                </div> : <div className="flex items-center justify-center h-20 text-gray-400">
                  <ClockIcon size={18} className="mr-2" />
                  <span>Waiting to analyze data...</span>
                </div>}
            </div>
          </div>
          {/* Growth Opportunities */}
          <div className="border border-gray-200 rounded-lg overflow-hidden opacity-60">
            <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
              <div className="flex items-center">
                <span className="mr-2">
                  {getStatusIcon(completionStatus.growthOpportunities)}
                </span>
                <h2 className="font-medium">Growth Opportunities</h2>
              </div>
              <div className="flex items-center space-x-2">
                {completionStatus.growthOpportunities === 'completed' && getConfidenceBadge(confidenceLevels.growthOpportunities)}
              </div>
            </div>
            <div className="p-4 bg-white flex items-center justify-center h-20 text-gray-400">
              <ClockIcon size={18} className="mr-2" />
              <span>Waiting to analyze data...</span>
            </div>
          </div>
          {/* Risk Assessment */}
          <div className="border border-gray-200 rounded-lg overflow-hidden opacity-60">
            <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
              <div className="flex items-center">
                <span className="mr-2">
                  {getStatusIcon(completionStatus.riskAssessment)}
                </span>
                <h2 className="font-medium">Risk Assessment</h2>
              </div>
              <div className="flex items-center space-x-2">
                {completionStatus.riskAssessment === 'completed' && getConfidenceBadge(confidenceLevels.riskAssessment)}
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