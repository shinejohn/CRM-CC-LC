import React, { useEffect, useState } from 'react';
import { CheckCircleIcon, ClockIcon, AlertCircleIcon, BarChart4Icon, UsersIcon, CalendarIcon, TargetIcon, DollarSignIcon, FileTextIcon, CheckSquareIcon, ListIcon, AlertTriangleIcon, PenToolIcon, EditIcon, SaveIcon, RefreshCwIcon, DownloadIcon, Share2Icon, ClipboardCheckIcon, ZapIcon } from 'lucide-react';
export const ProposalForm = () => {
  const [completionStatus, setCompletionStatus] = useState({
    executiveSummary: 'completed',
    projectScope: 'completed',
    methodology: 'in-progress',
    deliverables: 'in-progress',
    timeline: 'pending',
    pricing: 'pending',
    team: 'pending'
  });
  const [aiTyping, setAiTyping] = useState({
    section: 'methodology',
    isTyping: false,
    text: '',
    fullText: 'Our proprietary AI-driven approach combines machine learning, natural language processing, and predictive analytics to deliver actionable insights. Phase 1 involves data collection and cleaning (2 weeks), Phase 2 focuses on model development and training (3 weeks), and Phase 3 centers on implementation and integration with your existing systems (2 weeks). Throughout the process, we employ agile methodologies with weekly sprints and stakeholder reviews to ensure alignment with business objectives.'
  });
  const [confidenceLevels, setConfidenceLevels] = useState({
    executiveSummary: 94,
    projectScope: 91,
    methodology: 87,
    deliverables: 85,
    timeline: 82,
    pricing: 89,
    team: 92
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
        if (aiTyping.section === 'methodology') {
          setCompletionStatus(prev => ({
            ...prev,
            methodology: 'completed'
          }));
          setTimeout(() => {
            setAiTyping({
              section: 'deliverables',
              isTyping: true,
              text: '',
              fullText: 'Our team will deliver: 1) Custom AI model tailored to your specific business needs, 2) Interactive dashboard with real-time data visualization, 3) API integration with your existing systems, 4) Comprehensive documentation and training materials, 5) 3 months of post-implementation support with weekly check-ins. Each deliverable includes quality assurance testing and will be provided according to the timeline outlined in section 5.'
            });
          }, 2000);
        } else if (aiTyping.section === 'deliverables') {
          setCompletionStatus(prev => ({
            ...prev,
            deliverables: 'completed',
            timeline: 'in-progress'
          }));
          setTimeout(() => {
            setAiTyping({
              section: 'timeline',
              isTyping: true,
              text: '',
              fullText: 'Week 1-2: Discovery and data collection, Week 3-5: Model development and initial training, Week 6-7: System integration and testing, Week 8: Deployment and staff training, Week 9-20: Ongoing support and optimization. Key milestones include: Initial data assessment (Week 2), Model validation (Week 5), User acceptance testing (Week 7), and Go-live (Week 8). We estimate project completion within 8 weeks from contract signing.'
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
    if (level > 90) color = 'green';else if (level > 80) color = 'blue';else if (level > 70) color = 'yellow';else color = 'red';
    return <div className={`px-2 py-1 rounded-full text-xs font-medium bg-${color}-100 text-${color}-800 flex items-center`}>
        <BarChart4Icon size={12} className="mr-1" />
        {level}% confidence
      </div>;
  };
  return <div className="h-full flex flex-col bg-white">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white">
        <div className="flex items-center">
          <h1 className="text-xl font-bold">AI-Generated Client Proposal</h1>
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
            <Share2Icon size={18} />
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
                  Global Innovations Inc.
                </h2>
                <p className="text-sm text-gray-600">
                  Industry: Financial Technology
                </p>
                <p className="text-sm text-gray-600">
                  Project: AI-Powered Risk Assessment System
                </p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-blue-700">
                  Proposal based on:
                </p>
                <ul className="text-xs text-blue-600 mt-1">
                  <li>• Initial discovery meeting (June 5, 2023)</li>
                  <li>• Client requirements document</li>
                  <li>• Industry benchmarks from 8 similar projects</li>
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
                Global Innovations Inc. seeks to develop an AI-powered risk
                assessment system to enhance their credit decisioning process.
                This proposal outlines our approach to building a custom machine
                learning solution that will analyze traditional and alternative
                data sources to improve risk prediction accuracy by an estimated
                28% while reducing false positives by approximately 35%.
              </p>
              <p className="text-gray-700 mt-3">
                Our team of data scientists and engineers will deliver a
                fully-integrated solution within 8 weeks, with ongoing support
                for 3 months post-implementation. The system will seamlessly
                integrate with your existing infrastructure and provide
                real-time insights through an intuitive dashboard. Based on
                similar implementations, we project a potential ROI of 215%
                within the first 12 months of deployment.
              </p>
            </div>
          </div>
          {/* Project Scope */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
              <div className="flex items-center">
                <span className="mr-2">{getStatusIcon('completed')}</span>
                <h2 className="font-medium">Project Scope</h2>
              </div>
              <div className="flex items-center space-x-2">
                {getConfidenceBadge(confidenceLevels.projectScope)}
              </div>
            </div>
            <div className="p-4 bg-white">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <CheckSquareIcon size={16} className="mr-1" /> In Scope
                  </h3>
                  <ul className="text-gray-700 space-y-2">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      Development of custom machine learning models for risk
                      assessment
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      Integration with existing CRM and financial systems
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      Interactive dashboard with real-time risk scoring
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      API development for third-party data sources
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      Staff training and comprehensive documentation
                    </li>
                  </ul>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <ListIcon size={16} className="mr-1" /> Out of Scope
                  </h3>
                  <ul className="text-gray-700 space-y-2">
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2">✕</span>
                      Hardware provisioning or infrastructure upgrades
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2">✕</span>
                      Modification of existing internal databases
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2">✕</span>
                      End-user customer support systems
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2">✕</span>
                      Regulatory compliance certifications
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2">✕</span>
                      Data migration from legacy systems
                    </li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 p-3 bg-yellow-50 rounded-md border border-yellow-200">
                <div className="flex items-start">
                  <AlertTriangleIcon size={18} className="text-yellow-500 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">
                      Key Assumptions
                    </p>
                    <p className="text-sm text-yellow-700">
                      This proposal assumes: 1) Access to historical credit
                      decision data, 2) Availability of key stakeholders for
                      weekly review meetings, 3) Existing API documentation for
                      all systems requiring integration, and 4) Completion of
                      data privacy assessment prior to project kickoff.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Methodology */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
              <div className="flex items-center">
                <span className="mr-2">
                  {getStatusIcon(completionStatus.methodology)}
                </span>
                <h2 className="font-medium">Methodology & Approach</h2>
              </div>
              <div className="flex items-center space-x-2">
                {completionStatus.methodology === 'completed' && getConfidenceBadge(confidenceLevels.methodology)}
                {completionStatus.methodology === 'in-progress' && <span className="text-xs text-blue-600 animate-pulse flex items-center">
                    <PenToolIcon size={12} className="mr-1" />
                    AI drafting content...
                  </span>}
              </div>
            </div>
            <div className="p-4 bg-white">
              {completionStatus.methodology === 'completed' ? <p className="text-gray-700">{aiTyping.fullText}</p> : <div>
                  <p className="text-gray-700">
                    {aiTyping.section === 'methodology' ? aiTyping.text : ''}
                  </p>
                  {aiTyping.section === 'methodology' && aiTyping.isTyping && <span className="inline-block w-2 h-4 bg-blue-500 ml-1 animate-pulse"></span>}
                </div>}
            </div>
          </div>
          {/* Deliverables */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
              <div className="flex items-center">
                <span className="mr-2">
                  {getStatusIcon(completionStatus.deliverables)}
                </span>
                <h2 className="font-medium">Deliverables</h2>
              </div>
              <div className="flex items-center space-x-2">
                {completionStatus.deliverables === 'completed' && getConfidenceBadge(confidenceLevels.deliverables)}
                {completionStatus.deliverables === 'in-progress' && <span className="text-xs text-blue-600 animate-pulse flex items-center">
                    <PenToolIcon size={12} className="mr-1" />
                    AI generating list...
                  </span>}
              </div>
            </div>
            <div className="p-4 bg-white">
              {completionStatus.deliverables === 'completed' ? <p className="text-gray-700">
                  {aiTyping.section === 'deliverables' ? aiTyping.fullText : ''}
                </p> : completionStatus.deliverables === 'in-progress' ? <div>
                  <p className="text-gray-700">
                    {aiTyping.section === 'deliverables' ? aiTyping.text : ''}
                  </p>
                  {aiTyping.section === 'deliverables' && aiTyping.isTyping && <span className="inline-block w-2 h-4 bg-blue-500 ml-1 animate-pulse"></span>}
                </div> : <div className="flex items-center justify-center h-20 text-gray-400">
                  <ClockIcon size={18} className="mr-2" />
                  <span>Waiting to generate content...</span>
                </div>}
            </div>
          </div>
          {/* Timeline */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
              <div className="flex items-center">
                <span className="mr-2">
                  {getStatusIcon(completionStatus.timeline)}
                </span>
                <h2 className="font-medium">Project Timeline</h2>
              </div>
              <div className="flex items-center space-x-2">
                {completionStatus.timeline === 'completed' && getConfidenceBadge(confidenceLevels.timeline)}
                {completionStatus.timeline === 'in-progress' && <span className="text-xs text-blue-600 animate-pulse flex items-center">
                    <PenToolIcon size={12} className="mr-1" />
                    AI calculating timeline...
                  </span>}
              </div>
            </div>
            <div className="p-4 bg-white">
              {completionStatus.timeline === 'completed' ? <p className="text-gray-700">
                  {aiTyping.section === 'timeline' ? aiTyping.fullText : ''}
                </p> : completionStatus.timeline === 'in-progress' ? <div>
                  <p className="text-gray-700">
                    {aiTyping.section === 'timeline' ? aiTyping.text : ''}
                  </p>
                  {aiTyping.section === 'timeline' && aiTyping.isTyping && <span className="inline-block w-2 h-4 bg-blue-500 ml-1 animate-pulse"></span>}
                </div> : <div className="flex items-center justify-center h-20 text-gray-400">
                  <ClockIcon size={18} className="mr-2" />
                  <span>Waiting to generate content...</span>
                </div>}
            </div>
          </div>
          {/* Pricing */}
          <div className="border border-gray-200 rounded-lg overflow-hidden opacity-80">
            <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
              <div className="flex items-center">
                <span className="mr-2">
                  {getStatusIcon(completionStatus.pricing)}
                </span>
                <h2 className="font-medium">Investment & Pricing</h2>
              </div>
              <div className="flex items-center space-x-2">
                {completionStatus.pricing === 'completed' && getConfidenceBadge(confidenceLevels.pricing)}
              </div>
            </div>
            <div className="p-4 bg-white flex items-center justify-center h-20 text-gray-400">
              <ClockIcon size={18} className="mr-2" />
              <span>Waiting to generate pricing details...</span>
            </div>
          </div>
          {/* Team */}
          <div className="border border-gray-200 rounded-lg overflow-hidden opacity-80">
            <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
              <div className="flex items-center">
                <span className="mr-2">
                  {getStatusIcon(completionStatus.team)}
                </span>
                <h2 className="font-medium">Project Team</h2>
              </div>
              <div className="flex items-center space-x-2">
                {completionStatus.team === 'completed' && getConfidenceBadge(confidenceLevels.team)}
              </div>
            </div>
            <div className="p-4 bg-white flex items-center justify-center h-20 text-gray-400">
              <ClockIcon size={18} className="mr-2" />
              <span>Waiting to generate team profiles...</span>
            </div>
          </div>
        </div>
      </div>
    </div>;
};