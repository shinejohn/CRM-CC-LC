import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, MapPin, UserPlus, Plus, FileText, Video } from 'lucide-react';
export function StrategySessionDetail({
  onBack
}: {
  onBack: () => void;
}) {
  return <motion.div initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} className="max-w-4xl mx-auto pb-12 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to AI Consulting
        </button>
      </div>

      <h1 className="text-2xl font-bold text-slate-900">
        📅 Strategy Session: Q1 Planning Review
      </h1>

      {/* Session Info Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-3 text-slate-700">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span className="font-medium">
              Wednesday, January 3, 2025 at 2:00 PM ET
            </span>
          </div>
          <div className="flex items-center gap-3 text-slate-700">
            <Clock className="w-5 h-5 text-blue-600" />
            <span>Duration: 30 minutes</span>
          </div>
          <div className="flex items-center gap-3 text-slate-700">
            <Video className="w-5 h-5 text-blue-600" />
            <span>Video Call (link will be sent 15 min before)</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
            Join Call
          </button>
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors">
            Reschedule
          </button>
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors">
            Add to Calendar
          </button>
          <button className="px-4 py-2 bg-white border border-slate-200 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors ml-auto">
            Cancel
          </button>
        </div>
      </div>

      {/* Attendees */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">
          Attendees
        </h3>
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm">
              👤
            </div>
            <span className="font-medium text-slate-900">
              You (Business Owner)
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm">
              🤖
            </div>
            <span className="font-medium text-slate-900">
              Account Manager AI
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-sm">
              🤖
            </div>
            <span className="font-medium text-slate-900">
              Strategy Expert AI
            </span>
          </div>
        </div>
        <button className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1">
          <UserPlus className="w-4 h-4" /> Invite Team Member
        </button>
      </div>

      {/* Proposed Agenda */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">
          Proposed Agenda
        </h3>
        <div className="space-y-6 mb-6">
          <div>
            <h4 className="font-bold text-slate-900 mb-2">
              1. Review Q4 2024 performance (5 min)
            </h4>
            <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
              <li>Revenue vs goals</li>
              <li>Customer growth</li>
              <li>Marketing effectiveness</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-2">
              2. Discuss Q1 2025 Growth Strategy proposal (15 min)
            </h4>
            <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
              <li>Jennifer (Content Creator) addition</li>
              <li>Email capacity upgrade</li>
              <li>ROI projections</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-2">
              3. Q1 goals and priorities (5 min)
            </h4>
            <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
              <li>Set revenue target</li>
              <li>Define key initiatives</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-2">
              4. Questions & next steps (5 min)
            </h4>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">
            Edit Agenda
          </button>
          <button className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1">
            <Plus className="w-4 h-4" /> Add Topic
          </button>
        </div>
      </div>

      {/* Preparation */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">
          Preparation
        </h3>
        <p className="text-sm text-slate-600 mb-4">
          We recommend reviewing these before the session:
        </p>
        <div className="space-y-3">
          {['Q4 2024 Performance Report', 'Q1 2025 Growth Strategy Proposal', 'Your Business Health Score'].map((doc, i) => <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-900">
                  {doc}
                </span>
              </div>
              <button className="text-xs font-bold text-blue-600 hover:underline">
                View
              </button>
            </div>)}
        </div>
      </div>

      {/* Your Questions */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">
          Your Questions
        </h3>
        <p className="text-sm text-slate-600 mb-4">
          Add questions you'd like to discuss:
        </p>
        <div className="flex gap-2 mb-6">
          <input type="text" placeholder="Type your question here..." className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          <button className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
            Add
          </button>
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-900 mb-3">
            Submitted questions:
          </h4>
          <ul className="space-y-2">
            <li className="flex items-start gap-2 text-sm text-slate-600">
              <span className="text-slate-400 mt-1">•</span>
              How long until I see ROI from Jennifer?
            </li>
            <li className="flex items-start gap-2 text-sm text-slate-600">
              <span className="text-slate-400 mt-1">•</span>
              Can I start with just the email upgrade?
            </li>
          </ul>
        </div>
      </div>
    </motion.div>;
}