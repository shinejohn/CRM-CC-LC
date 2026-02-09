import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Calendar, Sparkles, TrendingUp, Code, FileText, DollarSign } from 'lucide-react';
export function AccountTeamPanel() {
  const specialists = [{
    id: 1,
    name: 'Strategy Expert',
    icon: TrendingUp,
    color: 'bg-blue-100 text-blue-600'
  }, {
    id: 2,
    name: 'Technical Expert',
    icon: Code,
    color: 'bg-purple-100 text-purple-600'
  }, {
    id: 3,
    name: 'Content Expert',
    icon: FileText,
    color: 'bg-emerald-100 text-emerald-600'
  }, {
    id: 4,
    name: 'Finance Expert',
    icon: DollarSign,
    color: 'bg-amber-100 text-amber-600'
  }];
  return <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">👋</span>
        <h2 className="text-lg font-bold text-slate-900">Your Account Team</h2>
      </div>

      {/* Main Account Manager Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Account Manager Card */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl p-6 text-white shadow-lg flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 border-4 border-white/30">
            <Sparkles className="w-10 h-10" />
          </div>
          <h3 className="font-bold text-lg mb-1">Account Manager AI</h3>
          <div className="flex items-center gap-2 mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm text-white/90">Available Now</span>
          </div>
          <div className="space-y-2 w-full">
            <button className="w-full py-2 px-4 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
              <MessageSquare className="w-4 h-4" /> Start Chat
            </button>
            <button className="w-full py-2 px-4 bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg font-medium hover:bg-white/20 transition-colors flex items-center justify-center gap-2">
              <Calendar className="w-4 h-4" /> Schedule Call
            </button>
          </div>
        </motion.div>

        {/* Welcome Message Card */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.1
      }} className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border-l-4 border-blue-500 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-3">
              Hi there! I'm your Account Manager.
            </h3>
            <p className="text-slate-600 leading-relaxed mb-4">
              I've been analyzing your business performance and growth patterns.
              Based on your current trajectory and goals, I've identified
              several opportunities to optimize your operations and accelerate
              growth.
            </p>
            <p className="text-slate-600 leading-relaxed">
              I've prepared a detailed analysis with actionable recommendations
              that could increase your revenue by an estimated 28% over the next
              quarter.
            </p>
          </div>
          <div className="flex gap-3 mt-6">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm">
              Review Recommendations
            </button>
            <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors">
              View My Analysis
            </button>
          </div>
        </motion.div>
      </div>

      {/* Supporting Team */}
      <div>
        <h3 className="text-sm font-medium text-slate-500 mb-3">
          Supporting Team
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {specialists.map((specialist, index) => <motion.div key={specialist.id} initial={{
          opacity: 0,
          scale: 0.9
        }} animate={{
          opacity: 1,
          scale: 1
        }} transition={{
          delay: 0.2 + index * 0.1
        }} whileHover={{
          scale: 1.05,
          y: -2
        }} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col items-center text-center cursor-pointer group">
              <div className={`w-12 h-12 rounded-full ${specialist.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <specialist.icon className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                {specialist.name}
              </h4>
              <p className="text-xs text-slate-500 mt-1">Available</p>
            </motion.div>)}
        </div>
      </div>
    </div>;
}