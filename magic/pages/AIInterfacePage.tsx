import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, Send, Paperclip, Sparkles, Zap, Brain, MessageSquare } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
interface AIInterfacePageProps {
  onNavigate?: (page: string) => void;
}
export function AIInterfacePage({
  onNavigate
}: AIInterfacePageProps) {
  const [message, setMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{
    role: 'user' | 'ai';
    content: string;
  }>>([{
    role: 'ai',
    content: "Hello! I'm your AI assistant. I can help you with business operations, customer management, analytics, and much more. What would you like to work on today?"
  }]);
  const handleSendMessage = () => {
    if (!message.trim()) return;
    setChatHistory([...chatHistory, {
      role: 'user',
      content: message
    }]);
    setMessage('');
    // Simulate AI response
    setTimeout(() => {
      setChatHistory(prev => [...prev, {
        role: 'ai',
        content: 'I understand. Let me help you with that. I can access your business data, create reports, manage tasks, and provide insights.'
      }]);
    }, 1000);
  };
  const quickActions = [{
    icon: MessageSquare,
    label: 'Generate Report',
    color: 'bg-blue-500'
  }, {
    icon: Brain,
    label: 'Analyze Data',
    color: 'bg-purple-500'
  }, {
    icon: Zap,
    label: 'Quick Task',
    color: 'bg-yellow-500'
  }, {
    icon: Sparkles,
    label: 'Get Insights',
    color: 'bg-pink-500'
  }];
  return <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-4xl">
          {/* AI Interface Card */}
          <motion.div initial={{
          y: 20,
          opacity: 0
        }} animate={{
          y: 0,
          opacity: 1
        }} transition={{
          duration: 0.5
        }} className="bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-purple-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div animate={{
                  rotate: 360
                }} transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear'
                }} className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </motion.div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      AI Assistant
                    </h2>
                    <p className="text-sm text-white/80">
                      Powered by advanced intelligence
                    </p>
                  </div>
                </div>
                <Badge className="bg-white/20 text-white border-white/30">
                  Active
                </Badge>
              </div>
            </div>

            {/* Chat History */}
            <div className="h-96 overflow-y-auto p-6 space-y-4 bg-slate-50">
              {chatHistory.map((msg, index) => <motion.div key={index} initial={{
              x: msg.role === 'user' ? 20 : -20,
              opacity: 0
            }} animate={{
              x: 0,
              opacity: 1
            }} transition={{
              duration: 0.3
            }} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] rounded-2xl p-4 ${msg.role === 'user' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' : 'bg-white border-2 border-purple-200 text-gray-900'}`}>
                    <p className="text-sm">{msg.content}</p>
                  </div>
                </motion.div>)}
            </div>

            {/* Quick Actions */}
            <div className="px-6 py-4 bg-white border-t-2 border-slate-200">
              <p className="text-xs font-semibold text-gray-600 mb-3">
                QUICK ACTIONS
              </p>
              <div className="grid grid-cols-4 gap-3">
                {quickActions.map((action, index) => {
                const Icon = action.icon;
                return <motion.button key={index} whileHover={{
                  scale: 1.05
                }} whileTap={{
                  scale: 0.95
                }} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                      <div className={`w-10 h-10 rounded-full ${action.color} flex items-center justify-center`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs font-medium text-gray-700">
                        {action.label}
                      </span>
                    </motion.button>;
              })}
              </div>
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white border-t-2 border-slate-200">
              <div className="flex items-center gap-3">
                <motion.button whileHover={{
                scale: 1.1
              }} whileTap={{
                scale: 0.9
              }} onClick={() => setIsListening(!isListening)} className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'}`}>
                  <Mic className="w-5 h-5 text-white" />
                </motion.button>

                <div className="flex-1 relative">
                  <Input value={message} onChange={e => setMessage(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSendMessage()} placeholder="Ask me anything..." className="h-12 pr-24 bg-slate-50 border-2 border-purple-200 focus:border-purple-400" />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Paperclip className="w-4 h-4" />
                    </Button>
                    <Button onClick={handleSendMessage} size="icon" className="h-8 w-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                <span>Press Enter to send • Click mic for voice input</span>
                <span className="font-semibold text-purple-600">
                  AI Mode Active
                </span>
              </div>
            </div>
          </motion.div>

          {/* Capabilities Grid */}
          <motion.div initial={{
          y: 20,
          opacity: 0
        }} animate={{
          y: 0,
          opacity: 1
        }} transition={{
          duration: 0.5,
          delay: 0.2
        }} className="mt-6 grid grid-cols-3 gap-4">
            {[{
            title: 'Business Intelligence',
            desc: 'Real-time analytics and insights'
          }, {
            title: 'Task Automation',
            desc: 'Streamline your workflows'
          }, {
            title: 'Data Analysis',
            desc: 'Deep dive into your metrics'
          }].map((capability, index) => <div key={index} className="bg-white rounded-xl p-4 border-2 border-slate-200 hover:border-purple-300 transition-colors">
                <h3 className="font-bold text-gray-900 mb-1">
                  {capability.title}
                </h3>
                <p className="text-xs text-gray-600">{capability.desc}</p>
              </div>)}
          </motion.div>
        </div>
      </div>
    </div>;
}