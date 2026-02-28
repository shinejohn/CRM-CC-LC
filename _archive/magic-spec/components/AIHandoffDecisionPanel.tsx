import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Workflow, Brain, ArrowRight, CheckCircle, Clock, Sparkles, MessageSquare, Zap, TrendingUp, AlertCircle, UserPlus } from 'lucide-react';
import { simulateApiDelay } from '../utils/mockApi';

interface AIAgent {
  id: string;
  name: string;
  specialty: string;
  avatar: string;
  availability: 'available' | 'busy' | 'offline';
  expertise: string[];
  successRate: number;
  avgResponseTime: string;
}
interface WorkflowOption {
  id: string;
  name: string;
  description: string;
  estimatedTime: string;
  automationLevel: number;
  steps: string[];
}
interface HandoffDecision {
  scenario: string;
  customerNeed: string;
  currentContext: string;
  aiRecommendation: 'specialist' | 'workflow';
  confidence: number;
  reasoning: string;
}
export function AIHandoffDecisionPanel() {
  const [activeDecision, setActiveDecision] = useState<HandoffDecision | null>(null);
  const [selectedOption, setSelectedOption] = useState<'specialist' | 'workflow' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  // Example AI agents available for handoff
  const availableAgents: AIAgent[] = [{
    id: 'ai-sales',
    name: 'Sales Specialist AI',
    specialty: 'Pricing & Proposals',
    avatar: '💼',
    availability: 'available',
    expertise: ['Pricing Strategy', 'ROI Analysis', 'Contract Negotiation'],
    successRate: 94,
    avgResponseTime: '2 min'
  }, {
    id: 'ai-technical',
    name: 'Technical Consultant AI',
    specialty: 'Implementation & Integration',
    avatar: '⚙️',
    availability: 'available',
    expertise: ['API Integration', 'System Architecture', 'Technical Requirements'],
    successRate: 91,
    avgResponseTime: '3 min'
  }, {
    id: 'ai-onboarding',
    name: 'Onboarding Specialist AI',
    specialty: 'Customer Success',
    avatar: '🎯',
    availability: 'busy',
    expertise: ['Training', 'Best Practices', 'Change Management'],
    successRate: 96,
    avgResponseTime: '5 min'
  }];
  // Example workflow alternatives
  const workflowOptions: WorkflowOption[] = [{
    id: 'auto-proposal',
    name: 'Automated Proposal Generation',
    description: 'Generate and send customized proposal based on conversation context',
    estimatedTime: '30 seconds',
    automationLevel: 95,
    steps: ['Extract requirements from conversation', 'Match to pricing tiers', 'Generate proposal document', 'Send via email with tracking']
  }, {
    id: 'data-collection',
    name: 'Structured Data Collection Workflow',
    description: 'Guide customer through data entry with validation and auto-population',
    estimatedTime: '5-8 minutes',
    automationLevel: 85,
    steps: ['Present data collection form', 'Validate inputs in real-time', 'Auto-populate from external sources', 'Store in customer database']
  }];
  // Simulate AI making a decision
  const simulateDecision = () => {
    setIsProcessing(true);
    simulateApiDelay(2000).then(() => {
      setActiveDecision({
        scenario: 'Customer Pricing Inquiry',
        customerNeed: 'Customer asked about enterprise pricing and wants to understand ROI for their 500-person organization',
        currentContext: 'Discovery call, 12 minutes in, high engagement, healthcare industry',
        aiRecommendation: 'specialist',
        confidence: 87,
        reasoning: 'Complex pricing discussion with ROI analysis requires nuanced conversation. Sales Specialist AI has 94% success rate with enterprise pricing discussions and can provide personalized value proposition.'
      });
      setIsProcessing(false);
    });
  };
  const handleHandoff = (option: 'specialist' | 'workflow') => {
    setSelectedOption(option);
    // Simulate handoff process
    simulateApiDelay(3000).then(() => {
      setActiveDecision(null);
      setSelectedOption(null);
    });
  };
  return <div className="h-full flex flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <Brain className="text-blue-600" size={28} />
                AI Handoff Decision System
              </h1>
              <p className="text-slate-600 mt-1">
                Autonomous decision-making: Specialist AI vs. Automated Workflow
              </p>
            </div>
            <motion.button whileHover={{
            scale: 1.02
          }} whileTap={{
            scale: 0.98
          }} onClick={simulateDecision} disabled={isProcessing || activeDecision !== null} className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
              <Sparkles size={18} />
              Simulate AI Decision
            </motion.button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            {isProcessing ? <ProcessingState key="processing" /> : activeDecision ? <DecisionView key="decision" decision={activeDecision} agents={availableAgents} workflows={workflowOptions} selectedOption={selectedOption} onSelectOption={handleHandoff} /> : <IdleState key="idle" onSimulate={simulateDecision} />}
          </AnimatePresence>
        </div>
      </div>
    </div>;
}
// Processing State
function ProcessingState() {
  return <motion.div initial={{
    opacity: 0,
    scale: 0.95
  }} animate={{
    opacity: 1,
    scale: 1
  }} exit={{
    opacity: 0,
    scale: 0.95
  }} className="flex flex-col items-center justify-center py-20">
      <motion.div animate={{
      rotate: 360
    }} transition={{
      duration: 2,
      repeat: Infinity,
      ease: 'linear'
    }} className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full mb-6" />
      <h3 className="text-xl font-semibold text-slate-900 mb-2">
        AI Analyzing Situation...
      </h3>
      <p className="text-slate-600">
        Evaluating best approach for customer needs
      </p>
    </motion.div>;
}
// Idle State
function IdleState({
  onSimulate
}: {
  onSimulate: () => void;
}) {
  return <motion.div initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} exit={{
    opacity: 0,
    y: -20
  }} className="text-center py-20">
      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Brain size={40} className="text-blue-600" />
      </div>
      <h3 className="text-2xl font-bold text-slate-900 mb-3">
        AI Decision Engine Ready
      </h3>
      <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
        When a customer need is identified, the AI will autonomously decide
        whether to bring in a specialist AI for personalized engagement or route
        to an automated workflow for efficiency.
      </p>
      <motion.button whileHover={{
      scale: 1.05
    }} whileTap={{
      scale: 0.95
    }} onClick={onSimulate} className="px-8 py-4 bg-blue-600 text-white rounded-lg font-medium text-lg hover:bg-blue-700 transition-colors shadow-lg">
        Simulate AI Decision
      </motion.button>
    </motion.div>;
}
// Decision View
interface DecisionViewProps {
  decision: HandoffDecision;
  agents: AIAgent[];
  workflows: WorkflowOption[];
  selectedOption: 'specialist' | 'workflow' | null;
  onSelectOption: (option: 'specialist' | 'workflow') => void;
}
function DecisionView({
  decision,
  agents,
  workflows,
  selectedOption,
  onSelectOption
}: DecisionViewProps) {
  const recommendedAgent = agents.find(a => a.availability === 'available');
  const recommendedWorkflow = workflows[0];
  return <motion.div initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} exit={{
    opacity: 0,
    y: -20
  }} className="space-y-6">
      {/* Context Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <MessageSquare className="text-blue-600" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {decision.scenario}
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-slate-700">
                  Customer Need:
                </span>
                <p className="text-slate-600 mt-1">{decision.customerNeed}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-slate-700">
                  Current Context:
                </span>
                <p className="text-slate-600 mt-1">{decision.currentContext}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Recommendation */}
      <motion.div initial={{
      opacity: 0,
      scale: 0.95
    }} animate={{
      opacity: 1,
      scale: 1
    }} transition={{
      delay: 0.2
    }} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-600 rounded-lg">
            <Brain className="text-white" size={24} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-slate-900">
                AI Recommendation
              </h3>
              <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-medium">
                {decision.confidence}% Confidence
              </span>
            </div>
            <p className="text-slate-700 mb-3">{decision.reasoning}</p>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle size={16} className="text-emerald-600" />
              <span className="font-medium text-slate-900">
                Recommended:{' '}
                {decision.aiRecommendation === 'specialist' ? 'Bring in Specialist AI' : 'Use Automated Workflow'}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Options */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Specialist Option */}
        <motion.div initial={{
        opacity: 0,
        x: -20
      }} animate={{
        opacity: 1,
        x: 0
      }} transition={{
        delay: 0.3
      }}>
          <SpecialistOption agent={recommendedAgent!} isRecommended={decision.aiRecommendation === 'specialist'} isSelected={selectedOption === 'specialist'} onSelect={() => onSelectOption('specialist')} />
        </motion.div>

        {/* Workflow Option */}
        <motion.div initial={{
        opacity: 0,
        x: 20
      }} animate={{
        opacity: 1,
        x: 0
      }} transition={{
        delay: 0.4
      }}>
          <WorkflowOptionCard workflow={recommendedWorkflow} isRecommended={decision.aiRecommendation === 'workflow'} isSelected={selectedOption === 'workflow'} onSelect={() => onSelectOption('workflow')} />
        </motion.div>
      </div>

      {/* Handoff Status */}
      <AnimatePresence>
        {selectedOption && <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} exit={{
        opacity: 0,
        y: -20
      }} className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <motion.div animate={{
            rotate: 360
          }} transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear'
          }} className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full" />
              <div>
                <h4 className="font-semibold text-emerald-900 mb-1">
                  {selectedOption === 'specialist' ? 'Connecting to Specialist AI...' : 'Initiating Workflow...'}
                </h4>
                <p className="text-sm text-emerald-700">
                  {selectedOption === 'specialist' ? 'Transferring conversation context and introducing specialist to customer' : 'Setting up automated workflow with customer data'}
                </p>
              </div>
            </div>
          </motion.div>}
      </AnimatePresence>
    </motion.div>;
}
// Specialist Option Card
interface SpecialistOptionProps {
  agent: AIAgent;
  isRecommended: boolean;
  isSelected: boolean;
  onSelect: () => void;
}
function SpecialistOption({
  agent,
  isRecommended,
  isSelected,
  onSelect
}: SpecialistOptionProps) {
  return <div className={`bg-white rounded-xl border-2 p-6 transition-all ${isRecommended ? 'border-blue-500 shadow-lg' : 'border-slate-200'} ${isSelected ? 'ring-4 ring-emerald-200' : ''}`}>
      {isRecommended && <div className="flex items-center gap-2 mb-4 text-blue-600">
          <Sparkles size={16} />
          <span className="text-sm font-semibold">AI Recommended</span>
        </div>}

      <div className="flex items-start gap-4 mb-4">
        <div className="text-4xl">{agent.avatar}</div>
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900 mb-1">{agent.name}</h3>
          <p className="text-sm text-slate-600 mb-3">{agent.specialty}</p>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${agent.availability === 'available' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span className="text-slate-600 capitalize">
                {agent.availability}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp size={14} className="text-emerald-600" />
              <span className="text-slate-600">
                {agent.successRate}% success
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={14} className="text-slate-400" />
              <span className="text-slate-600">{agent.avgResponseTime}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="text-xs font-medium text-slate-700 mb-2">
          Expertise:
        </div>
        <div className="flex flex-wrap gap-2">
          {agent.expertise.map(skill => <span key={skill} className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs">
              {skill}
            </span>)}
        </div>
      </div>

      <motion.button whileHover={{
      scale: 1.02
    }} whileTap={{
      scale: 0.98
    }} onClick={onSelect} disabled={isSelected} className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${isSelected ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
        {isSelected ? <>
            <CheckCircle size={18} />
            Connecting...
          </> : <>
            <UserPlus size={18} />
            Bring in Specialist
          </>}
      </motion.button>
    </div>;
}
// Workflow Option Card
interface WorkflowOptionCardProps {
  workflow: WorkflowOption;
  isRecommended: boolean;
  isSelected: boolean;
  onSelect: () => void;
}
function WorkflowOptionCard({
  workflow,
  isRecommended,
  isSelected,
  onSelect
}: WorkflowOptionCardProps) {
  return <div className={`bg-white rounded-xl border-2 p-6 transition-all ${isRecommended ? 'border-blue-500 shadow-lg' : 'border-slate-200'} ${isSelected ? 'ring-4 ring-emerald-200' : ''}`}>
      {isRecommended && <div className="flex items-center gap-2 mb-4 text-blue-600">
          <Sparkles size={16} />
          <span className="text-sm font-semibold">AI Recommended</span>
        </div>}

      <div className="flex items-start gap-4 mb-4">
        <div className="p-3 bg-purple-100 rounded-lg">
          <Workflow className="text-purple-600" size={24} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900 mb-1">{workflow.name}</h3>
          <p className="text-sm text-slate-600 mb-3">{workflow.description}</p>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Clock size={14} className="text-slate-400" />
              <span className="text-slate-600">{workflow.estimatedTime}</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap size={14} className="text-amber-500" />
              <span className="text-slate-600">
                {workflow.automationLevel}% automated
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="text-xs font-medium text-slate-700 mb-2">
          Workflow Steps:
        </div>
        <div className="space-y-2">
          {workflow.steps.map((step, index) => <div key={index} className="flex items-start gap-2 text-sm text-slate-600">
              <div className="w-5 h-5 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-medium shrink-0 mt-0.5">
                {index + 1}
              </div>
              <span>{step}</span>
            </div>)}
        </div>
      </div>

      <motion.button whileHover={{
      scale: 1.02
    }} whileTap={{
      scale: 0.98
    }} onClick={onSelect} disabled={isSelected} className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${isSelected ? 'bg-emerald-600 text-white' : 'bg-purple-600 text-white hover:bg-purple-700'}`}>
        {isSelected ? <>
            <CheckCircle size={18} />
            Initiating...
          </> : <>
            <Workflow size={18} />
            Use Workflow
          </>}
      </motion.button>
    </div>;
}