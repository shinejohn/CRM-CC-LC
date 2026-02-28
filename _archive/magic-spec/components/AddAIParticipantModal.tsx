import React, { useState, Component } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, UserPlus, Sparkles, TrendingUp, Clock, CheckCircle, Zap, Brain, MessageSquare, BarChart3, DollarSign, Users, Shield } from 'lucide-react';
interface AIAgent {
  id: string;
  name: string;
  role: string;
  specialty: string;
  avatar: string;
  avatarColor: string;
  status: 'available' | 'busy' | 'in-call';
  expertise: string[];
  stats: {
    successRate: number;
    avgResponseTime: string;
    totalSessions: number;
    customerSatisfaction: number;
  };
  description: string;
  strengths: string[];
}
interface AddAIParticipantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAgent?: (agent: AIAgent) => void;
  onNavigateToConversation?: (agentId: string) => void;
  currentParticipants: string[];
}
export function AddAIParticipantModal({
  isOpen,
  onClose,
  onAddAgent,
  onNavigateToConversation,
  currentParticipants
}: AddAIParticipantModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const availableAgents: AIAgent[] = [{
    id: 'ai-sales-specialist',
    name: 'Alex Chen',
    role: 'Sales Specialist',
    specialty: 'Enterprise Sales & Pricing',
    avatar: '💼',
    avatarColor: 'from-blue-500 to-blue-600',
    status: 'available',
    expertise: ['Pricing Strategy', 'ROI Analysis', 'Contract Negotiation', 'Value Proposition'],
    stats: {
      successRate: 94,
      avgResponseTime: '2 min',
      totalSessions: 342,
      customerSatisfaction: 4.8
    },
    description: 'Expert in enterprise pricing discussions and ROI analysis. Specializes in converting complex requirements into compelling value propositions.',
    strengths: ['Enterprise Deals', 'Custom Pricing', 'Objection Handling']
  }, {
    id: 'ai-technical',
    name: 'Jordan Rivera',
    role: 'Technical Consultant',
    specialty: 'Implementation & Integration',
    avatar: '⚙️',
    avatarColor: 'from-purple-500 to-purple-600',
    status: 'available',
    expertise: ['API Integration', 'System Architecture', 'Technical Requirements', 'Security Compliance'],
    stats: {
      successRate: 91,
      avgResponseTime: '3 min',
      totalSessions: 267,
      customerSatisfaction: 4.7
    },
    description: 'Technical expert who bridges business needs with implementation reality. Excels at explaining complex technical concepts in accessible terms.',
    strengths: ['API Design', 'Security Standards', 'Technical Feasibility']
  }, {
    id: 'ai-onboarding',
    name: 'Morgan Taylor',
    role: 'Customer Success Manager',
    specialty: 'Onboarding & Training',
    avatar: '🎯',
    avatarColor: 'from-emerald-500 to-emerald-600',
    status: 'in-call',
    expertise: ['Customer Onboarding', 'Training Programs', 'Best Practices', 'Change Management'],
    stats: {
      successRate: 96,
      avgResponseTime: '2 min',
      totalSessions: 489,
      customerSatisfaction: 4.9
    },
    description: 'Dedicated to ensuring smooth customer transitions and adoption. Creates tailored onboarding plans that drive quick time-to-value.',
    strengths: ['Training Design', 'Adoption Strategy', 'User Enablement']
  }, {
    id: 'ai-data-analyst',
    name: 'Casey Kim',
    role: 'Data Analyst',
    specialty: 'Analytics & Insights',
    avatar: '📊',
    avatarColor: 'from-amber-500 to-amber-600',
    status: 'available',
    expertise: ['Data Analysis', 'Reporting', 'KPI Definition', 'Performance Metrics'],
    stats: {
      successRate: 89,
      avgResponseTime: '4 min',
      totalSessions: 198,
      customerSatisfaction: 4.6
    },
    description: 'Transforms raw data into actionable insights. Helps customers understand their metrics and optimize performance.',
    strengths: ['Custom Reports', 'Data Visualization', 'Trend Analysis']
  }, {
    id: 'ai-compliance-specialist',
    name: 'Riley Martinez',
    role: 'Compliance Specialist',
    specialty: 'Regulatory & Security',
    avatar: '🔒',
    avatarColor: 'from-red-500 to-red-600',
    status: 'available',
    expertise: ['HIPAA Compliance', 'GDPR', 'SOC 2', 'Security Audits'],
    stats: {
      successRate: 98,
      avgResponseTime: '3 min',
      totalSessions: 156,
      customerSatisfaction: 4.9
    },
    description: 'Ensures all solutions meet regulatory requirements. Expert in healthcare, finance, and enterprise security standards.',
    strengths: ['Healthcare Compliance', 'Data Privacy', 'Audit Preparation']
  }];
  const filteredAgents = availableAgents.filter(agent => !currentParticipants.includes(agent.id) && (agent.name.toLowerCase().includes(searchQuery.toLowerCase()) || agent.role.toLowerCase().includes(searchQuery.toLowerCase()) || agent.specialty.toLowerCase().includes(searchQuery.toLowerCase()) || agent.expertise.some(exp => exp.toLowerCase().includes(searchQuery.toLowerCase()))));
  const handleAddAgent = async (agent: AIAgent) => {
    setIsAdding(true);
    // Simulate AI joining process
    await new Promise(resolve => setTimeout(resolve, 1500));
    // If we have a navigation callback, use it to open conversation
    if (onNavigateToConversation) {
      onNavigateToConversation(agent.id);
    } else if (onAddAgent) {
      // Otherwise use the legacy add agent callback
      onAddAgent(agent);
    }
    setIsAdding(false);
    setSelectedAgent(null);
    onClose();
  };
  if (!isOpen) return null;
  return <AnimatePresence>
      <motion.div initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} exit={{
      opacity: 0
    }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={onClose}>
        <motion.div initial={{
        scale: 0.95,
        opacity: 0
      }} animate={{
        scale: 1,
        opacity: 1
      }} exit={{
        scale: 0.95,
        opacity: 0
      }} onClick={e => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <UserPlus className="text-blue-600" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Add AI Specialist
                  </h2>
                  <p className="text-slate-600 text-sm">
                    Bring an expert AI into the conversation
                  </p>
                </div>
              </div>
              <motion.button whileHover={{
              scale: 1.05
            }} whileTap={{
              scale: 0.95
            }} onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={24} className="text-slate-600" />
              </motion.button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Search by name, role, or expertise..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden flex">
            {/* Agent List */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                  {filteredAgents.map((agent, index) => <AgentCard key={agent.id} agent={agent} index={index} isSelected={selectedAgent?.id === agent.id} onClick={() => setSelectedAgent(agent)} />)}
                </AnimatePresence>
              </div>

              {filteredAgents.length === 0 && <div className="text-center py-12">
                  <Users size={48} className="mx-auto text-slate-300 mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">
                    No agents found
                  </h3>
                  <p className="text-slate-600">Try adjusting your search</p>
                </div>}
            </div>

            {/* Agent Detail Panel */}
            <AnimatePresence mode="wait">
              {selectedAgent && <motion.div key={selectedAgent.id} initial={{
              x: 300,
              opacity: 0
            }} animate={{
              x: 0,
              opacity: 1
            }} exit={{
              x: 300,
              opacity: 0
            }} transition={{
              type: 'spring',
              damping: 25,
              stiffness: 200
            }} className="w-96 border-l border-slate-200 bg-slate-50 overflow-y-auto">
                  <AgentDetailPanel agent={selectedAgent} isAdding={isAdding} onAdd={() => handleAddAgent(selectedAgent)} onClose={() => setSelectedAgent(null)} />
                </motion.div>}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>;
}
// Agent Card Component (unchanged)
interface AgentCardProps {
  agent: AIAgent;
  index: number;
  isSelected: boolean;
  onClick: () => void;
}
function AgentCard({
  agent,
  index,
  isSelected,
  onClick
}: AgentCardProps) {
  const statusConfig = {
    available: {
      color: 'bg-emerald-500',
      label: 'Available'
    },
    busy: {
      color: 'bg-amber-500',
      label: 'Busy'
    },
    'in-call': {
      color: 'bg-red-500',
      label: 'In Call'
    }
  };
  const status = statusConfig[agent.status];
  return <motion.div layout initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} exit={{
    opacity: 0,
    scale: 0.9
  }} transition={{
    duration: 0.3,
    delay: index * 0.05
  }} whileHover={{
    y: -2
  }} onClick={onClick} className={`bg-white rounded-xl border-2 p-4 cursor-pointer transition-all ${isSelected ? 'border-blue-500 shadow-lg' : 'border-slate-200 hover:border-slate-300 hover:shadow-md'}`}>
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${agent.avatarColor} flex items-center justify-center text-2xl shadow-lg`}>
          {agent.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-slate-900 truncate">
              {agent.name}
            </h3>
            <Sparkles size={14} className="text-blue-600 shrink-0" />
          </div>
          <p className="text-sm text-slate-600 truncate">{agent.role}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <div className={`w-2 h-2 rounded-full ${status.color}`} />
            <span className="text-xs text-slate-500">{status.label}</span>
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-600 mb-3 line-clamp-2">
        {agent.specialty}
      </p>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1">
          <TrendingUp size={12} className="text-emerald-600" />
          <span className="text-slate-600">
            {agent.stats.successRate}% success
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Clock size={12} className="text-slate-400" />
          <span className="text-slate-600">{agent.stats.avgResponseTime}</span>
        </div>
      </div>
    </motion.div>;
}
// Agent Detail Panel (unchanged except button text)
interface AgentDetailPanelProps {
  agent: AIAgent;
  isAdding: boolean;
  onAdd: () => void;
  onClose: () => void;
}
function AgentDetailPanel({
  agent,
  isAdding,
  onAdd,
  onClose
}: AgentDetailPanelProps) {
  return <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900">Agent Details</h3>
        <motion.button whileHover={{
        scale: 1.05
      }} whileTap={{
        scale: 0.95
      }} onClick={onClose} className="p-1 hover:bg-slate-200 rounded transition-colors">
          <X size={20} className="text-slate-600" />
        </motion.button>
      </div>

      {/* Agent Header */}
      <div className="text-center mb-6">
        <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${agent.avatarColor} flex items-center justify-center text-4xl mx-auto mb-3 shadow-xl`}>
          {agent.avatar}
        </div>
        <h4 className="text-xl font-bold text-slate-900 mb-1">{agent.name}</h4>
        <p className="text-slate-600 mb-2">{agent.role}</p>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
          <Sparkles size={14} />
          <span>AI Specialist</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white rounded-lg p-3 border border-slate-200">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={16} className="text-emerald-600" />
            <span className="text-xs text-slate-600">Success Rate</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {agent.stats.successRate}%
          </div>
        </div>
        <div className="bg-white rounded-lg p-3 border border-slate-200">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={16} className="text-blue-600" />
            <span className="text-xs text-slate-600">Response Time</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {agent.stats.avgResponseTime}
          </div>
        </div>
        <div className="bg-white rounded-lg p-3 border border-slate-200">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare size={16} className="text-purple-600" />
            <span className="text-xs text-slate-600">Sessions</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {agent.stats.totalSessions}
          </div>
        </div>
        <div className="bg-white rounded-lg p-3 border border-slate-200">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 size={16} className="text-amber-600" />
            <span className="text-xs text-slate-600">Satisfaction</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {agent.stats.customerSatisfaction}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mb-6">
        <h5 className="text-sm font-semibold text-slate-900 mb-2">About</h5>
        <p className="text-sm text-slate-600 leading-relaxed">
          {agent.description}
        </p>
      </div>

      {/* Expertise */}
      <div className="mb-6">
        <h5 className="text-sm font-semibold text-slate-900 mb-2">Expertise</h5>
        <div className="flex flex-wrap gap-2">
          {agent.expertise.map(skill => <span key={skill} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs border border-blue-100">
              {skill}
            </span>)}
        </div>
      </div>

      {/* Strengths */}
      <div className="mb-6">
        <h5 className="text-sm font-semibold text-slate-900 mb-2">
          Key Strengths
        </h5>
        <div className="space-y-2">
          {agent.strengths.map(strength => <div key={strength} className="flex items-center gap-2 text-sm text-slate-700">
              <CheckCircle size={14} className="text-emerald-600 shrink-0" />
              <span>{strength}</span>
            </div>)}
        </div>
      </div>

      {/* Add Button */}
      <motion.button whileHover={{
      scale: 1.02
    }} whileTap={{
      scale: 0.98
    }} onClick={onAdd} disabled={isAdding || agent.status === 'in-call'} className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${isAdding ? 'bg-blue-400 text-white cursor-wait' : agent.status === 'in-call' ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
        {isAdding ? <>
            <motion.div animate={{
          rotate: 360
        }} transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear'
        }} className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
            Opening Conversation...
          </> : agent.status === 'in-call' ? <>
            <X size={18} />
            Currently Unavailable
          </> : <>
            <MessageSquare size={18} />
            Start Conversation
          </>}
      </motion.button>

      {agent.status === 'busy' && !isAdding && <p className="text-xs text-amber-600 text-center mt-2 flex items-center justify-center gap-1">
          <Clock size={12} />
          Agent is busy but can join
        </p>}
    </div>;
}