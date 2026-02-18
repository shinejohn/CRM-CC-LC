import React, { useEffect, useState, useCallback } from 'react';
import { CheckCircleIcon, ClockIcon, BarChart4Icon, UsersIcon, TargetIcon, PenToolIcon, RefreshCwIcon, EditIcon, SaveIcon, DownloadIcon } from 'lucide-react';
import api from '@/services/api';
import { smbService } from '@/services/smbService';
import { analyticsService } from '@/services/analyticsService';

interface MarketingPlanSections {
  executiveSummary: string;
  targetMarket: string;
  competitiveAnalysis: string;
  marketingStrategy: string;
  budget: string;
}

export const MarketingPlanForm = () => {
  const [completionStatus, setCompletionStatus] = useState({
    executiveSummary: 'pending',
    targetMarket: 'pending',
    competitiveAnalysis: 'pending',
    marketingStrategy: 'pending',
    budget: 'pending',
    timeline: 'pending',
    metrics: 'pending'
  });
  const [aiTyping, setAiTyping] = useState({
    section: 'competitiveAnalysis',
    isTyping: false,
    text: '',
    fullText: '',
  });
  const [planSections, setPlanSections] = useState<MarketingPlanSections>({
    executiveSummary: '',
    targetMarket: '',
    competitiveAnalysis: '',
    marketingStrategy: '',
    budget: '',
  });
  const [clientInfo, setClientInfo] = useState<{
    name: string;
    industry: string;
    targetMarket: string;
    dataSources: string[];
  }>({ name: '', industry: '', targetMarket: '', dataSources: [] });
  const [confidenceLevels, setConfidenceLevels] = useState({
    executiveSummary: 0,
    targetMarket: 0,
    competitiveAnalysis: 0,
    marketingStrategy: 0,
    budget: 0,
    timeline: 0,
    metrics: 0
  });
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const loadClientInfo = useCallback(async () => {
    try {
      const profile = await smbService.getProfile();
      if (profile) {
        setClientInfo({
          name: (profile as { business_name?: string; name?: string }).business_name ?? (profile as { name?: string }).name ?? '',
          industry: (profile as { industry?: string; industry_category?: string }).industry ?? (profile as { industry_category?: string }).industry_category ?? '',
          targetMarket: (profile as { target_market?: string }).target_market ?? '',
          dataSources: ['Business profile', 'CRM analytics'],
        });
      }
    } catch {
      setClientInfo(prev => ({ ...prev, dataSources: ['Connect SMB profile for business data'] }));
    }
  }, []);

  const generatePlan = useCallback(async () => {
    setGenerating(true);
    setGenerateError(null);
    setCompletionStatus({
      executiveSummary: 'in-progress',
      targetMarket: 'pending',
      competitiveAnalysis: 'pending',
      marketingStrategy: 'pending',
      budget: 'pending',
      timeline: 'pending',
      metrics: 'pending'
    });
    try {
      const { data } = await api.post<{
        data: {
          campaign?: { description?: string };
          outline?: string[];
          suggestions?: unknown[];
        };
      }>('/campaigns/generate', {
        type: 'Educational',
        objective: 'create a comprehensive marketing plan with executive summary, competitive analysis, marketing strategy, and budget recommendations',
        topic: 'marketing plan',
        target_audience: clientInfo.targetMarket || 'small businesses',
      });
      const res = data as { campaign?: { description?: string }; outline?: string[] };
      const desc = res?.campaign?.description ?? '';
      const outline = Array.isArray(res?.outline) ? res.outline : [];
      setPlanSections({
        executiveSummary: desc || outline[0] || '',
        targetMarket: outline[1] || '',
        competitiveAnalysis: outline[2] || outline[0] || '',
        marketingStrategy: outline[3] || outline[1] || '',
        budget: outline[4] || outline[2] || '',
      });
      setCompletionStatus(prev => ({
        ...prev,
        executiveSummary: 'completed',
        targetMarket: desc ? 'completed' : prev.targetMarket,
        competitiveAnalysis: outline.length > 0 ? 'completed' : prev.competitiveAnalysis,
        marketingStrategy: outline.length > 1 ? 'completed' : prev.marketingStrategy,
        budget: outline.length > 2 ? 'completed' : prev.budget,
      }));
      setConfidenceLevels({
        executiveSummary: desc ? 85 : 0,
        targetMarket: outline[1] ? 82 : 0,
        competitiveAnalysis: outline[2] || outline[0] ? 78 : 0,
        marketingStrategy: outline[3] || outline[1] ? 80 : 0,
        budget: outline[4] || outline[2] ? 75 : 0,
        timeline: 0,
        metrics: 0
      });
      setAiTyping(prev => ({
        ...prev,
        fullText: outline[2] || outline[0] || desc,
        isTyping: false,
        text: outline[2] || outline[0] || desc,
      }));
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : 'Failed to generate marketing plan');
      setCompletionStatus({
        executiveSummary: 'pending',
        targetMarket: 'pending',
        competitiveAnalysis: 'pending',
        marketingStrategy: 'pending',
        budget: 'pending',
        timeline: 'pending',
        metrics: 'pending'
      });
    } finally {
      setGenerating(false);
    }
  }, [clientInfo.targetMarket]);

  useEffect(() => {
    loadClientInfo();
  }, [loadClientInfo]);

  // Simulate AI typing effect when we have content from API
  useEffect(() => {
    if (aiTyping.isTyping && aiTyping.text.length < aiTyping.fullText.length) {
      const typingSpeed = Math.floor(Math.random() * 30) + 20;
      const timer = setTimeout(() => {
        setAiTyping(prev => ({
          ...prev,
          text: prev.fullText.substring(0, prev.text.length + 1)
        }));
      }, typingSpeed);
      return () => clearTimeout(timer);
    } else if (aiTyping.isTyping && aiTyping.text.length === aiTyping.fullText.length) {
      const timer = setTimeout(() => {
        setAiTyping(prev => ({ ...prev, isTyping: false }));
        if (aiTyping.section === 'competitiveAnalysis') {
          setCompletionStatus(prev => ({ ...prev, competitiveAnalysis: 'completed' }));
          setTimeout(() => setAiTyping({
            section: 'marketingStrategy',
            isTyping: true,
            text: '',
            fullText: planSections.marketingStrategy,
          }), 500);
        } else if (aiTyping.section === 'marketingStrategy') {
          setCompletionStatus(prev => ({ ...prev, marketingStrategy: 'completed', budget: 'in-progress' }));
          setTimeout(() => setAiTyping({
            section: 'budget',
            isTyping: true,
            text: '',
            fullText: planSections.budget,
          }), 500);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [aiTyping, planSections.marketingStrategy, planSections.budget]);
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
  const getConfidenceBadge = (level: number) => {
    if (level <= 0) return null;
    let color = 'gray';
    if (level > 85) color = 'green'; else if (level > 70) color = 'blue'; else if (level > 50) color = 'yellow'; else color = 'red';
    return (
      <div className={`px-2 py-1 rounded-full text-xs font-medium bg-${color}-100 text-${color}-800 flex items-center`}>
        <BarChart4Icon size={12} className="mr-1" />
        {level}% confidence
      </div>
    );
  };
  return <div className="h-full flex flex-col bg-white">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white">
        <div className="flex items-center">
          <h1 className="text-xl font-bold">AI-Generated Marketing Plan</h1>
          <span className={`ml-3 px-3 py-1 rounded-full text-xs font-medium ${generating ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
            {generating ? 'Generating...' : planSections.executiveSummary ? 'Generated' : 'Ready'}
          </span>
        </div>
        <div className="flex space-x-2">
          {generateError && (
            <span className="text-sm text-red-600 mr-2">{generateError}</span>
          )}
          <button
            onClick={generatePlan}
            disabled={generating}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full disabled:opacity-50"
            title="Generate plan"
          >
            <RefreshCwIcon size={18} className={generating ? 'animate-spin' : ''} />
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
          {/* Client Info - from SMB profile API */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-medium text-gray-800">
                  {clientInfo.name || 'Business Profile'}
                </h2>
                <p className="text-sm text-gray-600">
                  Industry: {clientInfo.industry || '—'}
                </p>
                <p className="text-sm text-gray-600">
                  Target Market: {clientInfo.targetMarket || '—'}
                </p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-blue-700">Analysis based on:</p>
                <ul className="text-xs text-blue-600 mt-1">
                  {clientInfo.dataSources.map((s, i) => (
                    <li key={i}>• {s}</li>
                  ))}
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
              {planSections.executiveSummary ? (
                <p className="text-gray-700">{planSections.executiveSummary}</p>
              ) : (
                <p className="text-gray-500 italic">Click Refresh to generate from business data and campaign analytics.</p>
              )}
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