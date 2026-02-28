import React, { useEffect, useState, Component } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircleIcon, ClockIcon, UsersIcon, RefreshCwIcon, DownloadIcon, Share2Icon, PrinterIcon, FileTextIcon, GlobeIcon, BarChart4Icon, PenToolIcon, Sparkles } from 'lucide-react';
import { simulateApiDelay } from '../utils/mockApi';

type SectionStatus = 'completed' | 'in-progress' | 'pending';
interface CompletionStatus {
  companyInfo: SectionStatus;
  leadership: SectionStatus;
  financials: SectionStatus;
  products: SectionStatus;
  marketPosition: SectionStatus;
  growthOpportunities: SectionStatus;
  riskAssessment: SectionStatus;
}
export function BusinessProfileForm() {
  const [completionStatus, setCompletionStatus] = useState<CompletionStatus>({
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
  const [confidenceLevels] = useState({
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
          });
        } else if (aiTyping.section === 'products') {
          setCompletionStatus(prev => ({
            ...prev,
            products: 'completed',
            marketPosition: 'in-progress'
          }));
          simulateApiDelay(2000).then(() => {
            setAiTyping({
              section: 'marketPosition',
              isTyping: true,
              text: '',
              fullText: 'Current market position analysis indicates the company holds approximately 8.5% market share in the workflow automation segment (ranked 4th), 3.2% in security solutions (ranked 7th), and is an emerging player in cloud management. Primary competitors include EnterpriseFlow (22% market share), SecureTech (15%), and CloudSystems (12%). Key competitive advantages include superior customer support (NPS of 72 vs. industry average of 48) and product integration capabilities.'
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
        return <CheckCircleIcon size={18} className="text-emerald-500" />;
      case 'in-progress':
        return <ClockIcon size={18} className="text-blue-500 animate-pulse" />;
      case 'pending':
        return <ClockIcon size={18} className="text-slate-400" />;
    }
  };
  const getConfidenceBadge = (level: number) => {
    let colorClass = 'bg-slate-100 text-slate-700';
    if (level > 85) colorClass = 'bg-emerald-100 text-emerald-700';else if (level > 70) colorClass = 'bg-blue-100 text-blue-700';else if (level > 50) colorClass = 'bg-amber-100 text-amber-700';else colorClass = 'bg-red-100 text-red-700';
    return <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${colorClass} flex items-center`}>
        <BarChart4Icon size={12} className="mr-1" />
        {level}% confidence
      </div>;
  };
  return <div className="h-full flex flex-col bg-slate-50">
      {/* Header */}
      <motion.div initial={{
      y: -20,
      opacity: 0
    }} animate={{
      y: 0,
      opacity: 1
    }} className="p-6 border-b border-slate-200 flex justify-between items-center bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-slate-900">
            AI-Generated Business Profile
          </h1>
          <motion.span initial={{
          scale: 0
        }} animate={{
          scale: 1
        }} transition={{
          delay: 0.2,
          type: 'spring'
        }} className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-sm">
            <Sparkles size={12} className="animate-pulse" />
            Auto-generating
          </motion.span>
        </div>

        <div className="flex items-center gap-2">
          {[{
          icon: RefreshCwIcon,
          label: 'Refresh'
        }, {
          icon: PrinterIcon,
          label: 'Print'
        }, {
          icon: Share2Icon,
          label: 'Share'
        }, {
          icon: DownloadIcon,
          label: 'Download'
        }].map((action, i) => <motion.button key={action.label} initial={{
          opacity: 0,
          scale: 0
        }} animate={{
          opacity: 1,
          scale: 1
        }} transition={{
          delay: 0.3 + i * 0.05
        }} whileHover={{
          scale: 1.05
        }} whileTap={{
          scale: 0.95
        }} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" title={action.label}>
              <action.icon size={18} />
            </motion.button>)}
        </div>
      </motion.div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} transition={{
        delay: 0.2
      }} className="max-w-5xl mx-auto space-y-6">
          {/* Company Header */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.3
        }} className="flex items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              TS
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                TechSolutions Inc.
              </h1>
              <p className="text-slate-600">
                Enterprise Software • Founded 2015 • San Francisco, CA
              </p>
            </div>
          </motion.div>

          {/* Data Sources */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.4
        }} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-start gap-8">
              <div className="flex-1">
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
                  Profile Generated Using
                </h2>
                <div className="flex flex-wrap gap-2">
                  {[{
                  icon: FileTextIcon,
                  label: 'SEC Filings'
                }, {
                  icon: GlobeIcon,
                  label: 'Company Website'
                }, {
                  icon: UsersIcon,
                  label: 'LinkedIn Data'
                }, {
                  icon: BarChart4Icon,
                  label: 'Industry Reports'
                }].map(source => <span key={source.label} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium flex items-center gap-1.5 border border-blue-100">
                      <source.icon size={12} />
                      {source.label}
                    </span>)}
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
                  Last Updated
                </h2>
                <p className="text-sm text-slate-700">
                  June 12, 2023 (2 days ago)
                </p>
              </div>
            </div>
          </motion.div>

          {/* Company Information */}
          <ProfileSection title="Company Information" status={completionStatus.companyInfo} confidence={confidenceLevels.companyInfo} delay={0.5}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
                  Company Overview
                </h3>
                <p className="text-slate-700 leading-relaxed">
                  TechSolutions Inc. is a B2B software company specializing in
                  enterprise workflow automation, data security, and cloud
                  management solutions. Founded in 2015 by former Google
                  engineers, the company has grown to 187 employees across
                  offices in San Francisco (HQ), Boston, and London.
                </p>
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
                  Company Details
                </h3>
                <div className="space-y-2">
                  {[{
                  label: 'Legal Name',
                  value: 'TechSolutions, Inc.'
                }, {
                  label: 'Founded',
                  value: 'March 2015'
                }, {
                  label: 'Headquarters',
                  value: 'San Francisco, CA'
                }, {
                  label: 'Employees',
                  value: '187 (23% YoY growth)'
                }, {
                  label: 'Funding',
                  value: '$42M (Series B)'
                }].map(detail => <div key={detail.label} className="flex">
                      <span className="text-slate-500 w-32 text-sm">
                        {detail.label}:
                      </span>
                      <span className="text-slate-900 font-medium text-sm">
                        {detail.value}
                      </span>
                    </div>)}
                </div>
              </div>
            </div>
          </ProfileSection>

          {/* Leadership Team */}
          <ProfileSection title="Leadership Team" status={completionStatus.leadership} confidence={confidenceLevels.leadership} delay={0.6}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[{
              name: 'Sarah Chen',
              role: 'Co-Founder & CEO',
              background: 'Former Engineering Director at Google Cloud (2010-2015)'
            }, {
              name: 'Michael Rodriguez',
              role: 'Co-Founder & CTO',
              background: 'Former Senior Software Engineer at Google (2008-2015)'
            }, {
              name: 'David Wilson',
              role: 'Chief Financial Officer',
              background: 'Former VP of Finance at Salesforce (2012-2019)'
            }, {
              name: 'Jennifer Park',
              role: 'VP of Sales',
              background: 'Former Sales Director at Oracle (2014-2020)'
            }].map(leader => <div key={leader.name} className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                    <UsersIcon size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {leader.name}
                    </h3>
                    <p className="text-sm text-slate-600">{leader.role}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {leader.background}
                    </p>
                  </div>
                </div>)}
            </div>
          </ProfileSection>

          {/* Financial Overview */}
          <ProfileSection title="Financial Overview" status={completionStatus.financials} confidence={completionStatus.financials === 'completed' ? confidenceLevels.financials : undefined} isTyping={completionStatus.financials === 'in-progress'} delay={0.7}>
            {completionStatus.financials === 'completed' ? <p className="text-slate-700 leading-relaxed">
                {aiTyping.fullText}
              </p> : <div>
                <p className="text-slate-700 leading-relaxed">
                  {aiTyping.section === 'financials' ? aiTyping.text : ''}
                </p>
                {aiTyping.section === 'financials' && aiTyping.isTyping && <motion.span animate={{
              opacity: [1, 0]
            }} transition={{
              duration: 0.5,
              repeat: Infinity
            }} className="inline-block w-0.5 h-5 bg-blue-600 ml-1" />}
              </div>}
          </ProfileSection>

          {/* Products & Services */}
          <ProfileSection title="Products & Services" status={completionStatus.products} confidence={completionStatus.products === 'completed' ? confidenceLevels.products : undefined} isTyping={completionStatus.products === 'in-progress'} delay={0.8}>
            {completionStatus.products === 'completed' ? <p className="text-slate-700 leading-relaxed">
                {aiTyping.fullText}
              </p> : completionStatus.products === 'in-progress' ? <div>
                <p className="text-slate-700 leading-relaxed">
                  {aiTyping.section === 'products' ? aiTyping.text : ''}
                </p>
                {aiTyping.section === 'products' && aiTyping.isTyping && <motion.span animate={{
              opacity: [1, 0]
            }} transition={{
              duration: 0.5,
              repeat: Infinity
            }} className="inline-block w-0.5 h-5 bg-blue-600 ml-1" />}
              </div> : <div className="flex items-center justify-center h-20 text-slate-400">
                <ClockIcon size={18} className="mr-2" />
                <span>Waiting to analyze data...</span>
              </div>}
          </ProfileSection>

          {/* Market Position */}
          <ProfileSection title="Market Position" status={completionStatus.marketPosition} confidence={completionStatus.marketPosition === 'completed' ? confidenceLevels.marketPosition : undefined} isTyping={completionStatus.marketPosition === 'in-progress'} delay={0.9}>
            {completionStatus.marketPosition === 'completed' ? <p className="text-slate-700 leading-relaxed">
                {aiTyping.fullText}
              </p> : completionStatus.marketPosition === 'in-progress' ? <div>
                <p className="text-slate-700 leading-relaxed">
                  {aiTyping.section === 'marketPosition' ? aiTyping.text : ''}
                </p>
                {aiTyping.section === 'marketPosition' && aiTyping.isTyping && <motion.span animate={{
              opacity: [1, 0]
            }} transition={{
              duration: 0.5,
              repeat: Infinity
            }} className="inline-block w-0.5 h-5 bg-blue-600 ml-1" />}
              </div> : <div className="flex items-center justify-center h-20 text-slate-400">
                <ClockIcon size={18} className="mr-2" />
                <span>Waiting to analyze data...</span>
              </div>}
          </ProfileSection>

          {/* Growth Opportunities */}
          <ProfileSection title="Growth Opportunities" status={completionStatus.growthOpportunities} confidence={completionStatus.growthOpportunities === 'completed' ? confidenceLevels.growthOpportunities : undefined} delay={1.0} isPending>
            <div className="flex items-center justify-center h-20 text-slate-400">
              <ClockIcon size={18} className="mr-2" />
              <span>Waiting to analyze data...</span>
            </div>
          </ProfileSection>

          {/* Risk Assessment */}
          <ProfileSection title="Risk Assessment" status={completionStatus.riskAssessment} confidence={completionStatus.riskAssessment === 'completed' ? confidenceLevels.riskAssessment : undefined} delay={1.1} isPending>
            <div className="flex items-center justify-center h-20 text-slate-400">
              <ClockIcon size={18} className="mr-2" />
              <span>Waiting to analyze data...</span>
            </div>
          </ProfileSection>
        </motion.div>
      </div>
    </div>;
}
// Profile Section Component
interface ProfileSectionProps {
  title: string;
  status: SectionStatus;
  confidence?: number;
  isTyping?: boolean;
  isPending?: boolean;
  delay: number;
  children: ReactNode;
}
function ProfileSection({
  title,
  status,
  confidence,
  isTyping,
  isPending,
  delay,
  children
}: ProfileSectionProps) {
  const getStatusIcon = (status: SectionStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon size={18} className="text-emerald-500" />;
      case 'in-progress':
        return <ClockIcon size={18} className="text-blue-500 animate-pulse" />;
      case 'pending':
        return <ClockIcon size={18} className="text-slate-400" />;
    }
  };
  const getConfidenceBadge = (level: number) => {
    let colorClass = 'bg-slate-100 text-slate-700';
    if (level > 85) colorClass = 'bg-emerald-100 text-emerald-700';else if (level > 70) colorClass = 'bg-blue-100 text-blue-700';else if (level > 50) colorClass = 'bg-amber-100 text-amber-700';else colorClass = 'bg-red-100 text-red-700';
    return <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${colorClass} flex items-center`}>
        <BarChart4Icon size={12} className="mr-1" />
        {level}% confidence
      </div>;
  };
  return <motion.div initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    delay
  }} className={`border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white ${isPending ? 'opacity-60' : ''}`}>
      <div className="bg-slate-50 px-6 py-4 flex justify-between items-center border-b border-slate-200">
        <div className="flex items-center gap-2">
          {getStatusIcon(status)}
          <h2 className="font-semibold text-slate-900">{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          {confidence !== undefined && getConfidenceBadge(confidence)}
          {isTyping && <span className="text-xs text-blue-600 flex items-center gap-1.5 animate-pulse">
              <PenToolIcon size={12} />
              AI analyzing data...
            </span>}
        </div>
      </div>
      <div className="p-6">{children}</div>
    </motion.div>;
}