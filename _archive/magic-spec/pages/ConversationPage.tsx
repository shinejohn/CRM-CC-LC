import React, { useEffect, useState, useRef, Component } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Paperclip, Mic, MoreVertical, Sparkles, TrendingUp, Clock, Award, Phone, Video, Users } from 'lucide-react';
import { simulateApiDelay } from '../../magic/utils/mockApi';

interface AISpecialist {
  id: string;
  name: string;
  role: string;
  specialty: string;
  avatar: string;
  avatarColor: string;
  expertise: string[];
  stats: {
    successRate: number;
    avgResponseTime: string;
    totalSessions: number;
    customerSatisfaction: number;
  };
  greeting: string;
  suggestedTopics: string[];
}
interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
  isTyping?: boolean;
}
const AI_SPECIALISTS: Record<string, AISpecialist> = {
  'ai-sales-specialist': {
    id: 'ai-sales-specialist',
    name: 'Alex Chen',
    role: 'Sales Specialist',
    specialty: 'Enterprise Sales & Pricing Strategy',
    avatar: '💼',
    avatarColor: 'from-blue-500 to-blue-600',
    expertise: ['Pricing Strategy', 'ROI Analysis', 'Contract Negotiation', 'Value Proposition'],
    stats: {
      successRate: 94,
      avgResponseTime: '2 min',
      totalSessions: 342,
      customerSatisfaction: 4.8
    },
    greeting: "Hi! I'm Alex, your sales advisor. I specialize in helping businesses find the right solutions and pricing that work for their specific needs. What brings you here today?",
    suggestedTopics: ['Discuss pricing options', 'Understand ROI for my business', 'Compare different packages', 'Custom enterprise solutions']
  },
  'ai-technical': {
    id: 'ai-technical',
    name: 'Jordan Rivera',
    role: 'Technical Consultant',
    specialty: 'Implementation & Integration',
    avatar: '⚙️',
    avatarColor: 'from-purple-500 to-purple-600',
    expertise: ['API Integration', 'System Architecture', 'Technical Requirements', 'Security Compliance'],
    stats: {
      successRate: 91,
      avgResponseTime: '3 min',
      totalSessions: 267,
      customerSatisfaction: 4.7
    },
    greeting: "Hello! I'm Jordan, your technical advisor. I help businesses understand the technical side of implementation and ensure everything integrates smoothly with your existing systems. How can I help you today?",
    suggestedTopics: ['Integration requirements', 'Technical architecture review', 'Security and compliance', 'API capabilities']
  },
  'ai-onboarding': {
    id: 'ai-onboarding',
    name: 'Morgan Taylor',
    role: 'Customer Success Manager',
    specialty: 'Onboarding & Training',
    avatar: '🎯',
    avatarColor: 'from-emerald-500 to-emerald-600',
    expertise: ['Customer Onboarding', 'Training Programs', 'Best Practices', 'Change Management'],
    stats: {
      successRate: 96,
      avgResponseTime: '2 min',
      totalSessions: 489,
      customerSatisfaction: 4.9
    },
    greeting: "Hi there! I'm Morgan, your customer success advisor. I'm here to help you get the most value from our solutions and ensure your team is set up for success. What would you like to explore?",
    suggestedTopics: ['Onboarding process', 'Team training options', 'Best practices', 'Success metrics']
  },
  'marcus-social': {
    id: 'marcus-social',
    name: 'Marcus',
    role: 'Social Media Strategist',
    specialty: 'Social Media Management & Strategy',
    avatar: '📱',
    avatarColor: 'from-pink-500 to-rose-600',
    expertise: ['Content Strategy', 'Community Management', 'Paid Advertising', 'Analytics'],
    stats: {
      successRate: 93,
      avgResponseTime: '2 min',
      totalSessions: 215,
      customerSatisfaction: 4.8
    },
    greeting: "Hey! I'm Marcus, your social media advisor. I help businesses build engaging social media presence and reach their target audience effectively. What are your social media goals?",
    suggestedTopics: ['Social media strategy', 'Content planning', 'Audience engagement', 'Paid advertising']
  }
};
interface ConversationPageProps {
  specialistId: string;
  onBack: () => void;
}
export function ConversationPage({
  specialistId,
  onBack
}: ConversationPageProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isAITyping, setIsAITyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const specialist = AI_SPECIALISTS[specialistId];
  useEffect(() => {
    if (specialist) {
      // Add greeting message
      simulateApiDelay(500).then(() => {
        setMessages([{
          id: '1',
          sender: 'ai',
          text: specialist.greeting,
          timestamp: new Date()
        }]);
      });
    }
  }, [specialist]);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [messages]);
  if (!specialist) {
    return <div className="h-full flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Specialist not found
          </h2>
          <button onClick={onBack} className="text-blue-600 hover:text-blue-700">
            Return to AI Hub
          </button>
        </div>
      </div>;
  }
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputValue,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsAITyping(true);
    // Simulate AI response
    simulateApiDelay(2000).then(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: `I understand you're interested in "${inputValue}". Let me help you with that. Based on your needs, I can provide detailed insights and recommendations tailored to your specific situation.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsAITyping(false);
    });
  };
  const handleSuggestedTopic = (topic: string) => {
    setInputValue(topic);
  };
  return <div className="h-full flex flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button whileHover={{
              scale: 1.05
            }} whileTap={{
              scale: 0.95
            }} onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <ArrowLeft size={20} className="text-slate-600" />
              </motion.button>

              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${specialist.avatarColor} flex items-center justify-center text-2xl shadow-lg relative`}>
                  {specialist.avatar}
                  <motion.div animate={{
                  scale: [1, 1.2, 1]
                }} transition={{
                  duration: 2,
                  repeat: Infinity
                }} className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg font-bold text-slate-900">
                      {specialist.name}
                    </h1>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1">
                      <Sparkles size={10} />
                      AI Advisor
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">
                    {specialist.specialty}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <motion.button whileHover={{
              scale: 1.05
            }} whileTap={{
              scale: 0.95
            }} className="p-2 hover:bg-slate-100 rounded-lg transition-colors" title="Start voice call">
                <Phone size={20} className="text-slate-600" />
              </motion.button>
              <motion.button whileHover={{
              scale: 1.05
            }} whileTap={{
              scale: 0.95
            }} className="p-2 hover:bg-slate-100 rounded-lg transition-colors" title="Start video call">
                <Video size={20} className="text-slate-600" />
              </motion.button>
              <motion.button whileHover={{
              scale: 1.05
            }} whileTap={{
              scale: 0.95
            }} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <MoreVertical size={20} className="text-slate-600" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="max-w-3xl mx-auto space-y-4">
              <AnimatePresence mode="popLayout">
                {messages.map((message, index) => <MessageBubble key={message.id} message={message} index={index} />)}
              </AnimatePresence>

              {isAITyping && <TypingIndicator specialist={specialist} />}

              {/* Suggested Topics (show after greeting) */}
              {messages.length === 1 && !isAITyping && <motion.div initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: 0.5
            }} className="flex flex-wrap gap-2 justify-start max-w-[85%]">
                  {specialist.suggestedTopics.map((topic, index) => <motion.button key={index} initial={{
                opacity: 0,
                scale: 0.9
              }} animate={{
                opacity: 1,
                scale: 1
              }} transition={{
                delay: 0.6 + index * 0.1
              }} whileHover={{
                scale: 1.05
              }} whileTap={{
                scale: 0.95
              }} onClick={() => handleSuggestedTopic(topic)} className="px-4 py-2 bg-white border border-slate-300 rounded-full text-sm text-slate-700 hover:border-blue-400 hover:bg-blue-50 transition-colors">
                      {topic}
                    </motion.button>)}
                </motion.div>}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-slate-200 bg-white p-4">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-end gap-3">
                <motion.button whileHover={{
                scale: 1.05
              }} whileTap={{
                scale: 0.95
              }} className="p-3 hover:bg-slate-100 rounded-lg transition-colors">
                  <Paperclip size={20} className="text-slate-600" />
                </motion.button>

                <div className="flex-1 relative">
                  <textarea value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyPress={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }} placeholder={`Message ${specialist.name}...`} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" rows={1} style={{
                  minHeight: '48px',
                  maxHeight: '120px'
                }} />
                </div>

                <motion.button whileHover={{
                scale: 1.05
              }} whileTap={{
                scale: 0.95
              }} className="p-3 hover:bg-slate-100 rounded-lg transition-colors">
                  <Mic size={20} className="text-slate-600" />
                </motion.button>

                <motion.button whileHover={{
                scale: 1.05
              }} whileTap={{
                scale: 0.95
              }} onClick={handleSendMessage} disabled={!inputValue.trim()} className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  <Send size={20} />
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Specialist Info */}
        <motion.div initial={{
        x: 300,
        opacity: 0
      }} animate={{
        x: 0,
        opacity: 1
      }} className="w-80 border-l border-slate-200 bg-white overflow-y-auto">
          <SpecialistSidebar specialist={specialist} />
        </motion.div>
      </div>
    </div>;
}
// Message Bubble Component
function MessageBubble({
  message,
  index
}: {
  message: Message;
  index: number;
}) {
  return <motion.div initial={{
    opacity: 0,
    y: 10
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    delay: index * 0.05
  }} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${message.sender === 'user' ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-white border border-slate-200 text-slate-900 rounded-bl-sm shadow-sm'}`}>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.text}
        </p>
        <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-blue-100' : 'text-slate-500'}`}>
          {message.timestamp.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })}
        </p>
      </div>
    </motion.div>;
}
// Typing Indicator
function TypingIndicator({
  specialist
}: {
  specialist: AISpecialist;
}) {
  return <motion.div initial={{
    opacity: 0,
    y: 10
  }} animate={{
    opacity: 1,
    y: 0
  }} className="flex justify-start">
      <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${specialist.avatarColor} flex items-center justify-center text-xs`}>
            {specialist.avatar}
          </div>
          <div className="flex gap-1">
            <motion.div animate={{
            scale: [1, 1.2, 1]
          }} transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: 0
          }} className="w-2 h-2 bg-slate-400 rounded-full" />
            <motion.div animate={{
            scale: [1, 1.2, 1]
          }} transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: 0.2
          }} className="w-2 h-2 bg-slate-400 rounded-full" />
            <motion.div animate={{
            scale: [1, 1.2, 1]
          }} transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: 0.4
          }} className="w-2 h-2 bg-slate-400 rounded-full" />
          </div>
        </div>
      </div>
    </motion.div>;
}
// Specialist Sidebar
function SpecialistSidebar({
  specialist
}: {
  specialist: AISpecialist;
}) {
  return <div className="p-6">
      {/* Profile */}
      <div className="text-center mb-6">
        <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${specialist.avatarColor} flex items-center justify-center text-4xl mx-auto mb-3 shadow-xl`}>
          {specialist.avatar}
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">
          {specialist.name}
        </h3>
        <p className="text-sm text-slate-600 mb-2">{specialist.role}</p>
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
          <Sparkles size={12} />
          AI Specialist
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={14} className="text-emerald-600" />
            <span className="text-xs text-slate-600">Success Rate</span>
          </div>
          <div className="text-xl font-bold text-slate-900">
            {specialist.stats.successRate}%
          </div>
        </div>
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={14} className="text-blue-600" />
            <span className="text-xs text-slate-600">Response Time</span>
          </div>
          <div className="text-xl font-bold text-slate-900">
            {specialist.stats.avgResponseTime}
          </div>
        </div>
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
          <div className="flex items-center gap-2 mb-1">
            <Users size={14} className="text-purple-600" />
            <span className="text-xs text-slate-600">Sessions</span>
          </div>
          <div className="text-xl font-bold text-slate-900">
            {specialist.stats.totalSessions}
          </div>
        </div>
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
          <div className="flex items-center gap-2 mb-1">
            <Award size={14} className="text-amber-600" />
            <span className="text-xs text-slate-600">Satisfaction</span>
          </div>
          <div className="text-xl font-bold text-slate-900">
            {specialist.stats.customerSatisfaction}
          </div>
        </div>
      </div>

      {/* Expertise */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-slate-900 mb-3">Expertise</h4>
        <div className="flex flex-wrap gap-2">
          {specialist.expertise.map((skill, index) => <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs border border-blue-100">
              {skill}
            </span>)}
        </div>
      </div>

      {/* Specialty */}
      <div>
        <h4 className="text-sm font-semibold text-slate-900 mb-2">Specialty</h4>
        <p className="text-sm text-slate-600 leading-relaxed">
          {specialist.specialty}
        </p>
      </div>
    </div>;
}