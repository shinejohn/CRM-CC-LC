import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Share, Check, MessageSquare, Edit, X } from 'lucide-react';
export function ProposalDetailPage({
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
        <div className="flex gap-2">
          <button className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" /> Download PDF
          </button>
          <button className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2">
            <Share className="w-4 h-4" /> Share
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">
          📈 Q1 2025 Growth Strategy
        </h1>
        <div className="flex items-center gap-4 text-sm">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> AWAITING
            REVIEW
          </span>
          <span className="text-slate-500">Created: Dec 28, 2024</span>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">
          Executive Summary
        </h3>
        <p className="text-slate-700 mb-6 leading-relaxed">
          Based on analysis of your business performance over the past 90 days,
          I recommend two strategic additions to accelerate growth:
        </p>
        <ul className="space-y-2 mb-6 text-slate-700">
          <li className="flex items-start gap-2">
            <span className="font-bold text-slate-900">1.</span>
            Add Jennifer (Content Creator) - $99/month
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-slate-900">2.</span>
            Upgrade email capacity to Tier 3 - additional $50/month
          </li>
        </ul>
        <div className="bg-slate-50 rounded-lg p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-slate-500 mb-1">Total Investment</p>
            <p className="text-lg font-bold text-slate-900">$149/month</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 mb-1">Projected Return</p>
            <p className="text-lg font-bold text-emerald-600">+$4,200/month</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 mb-1">ROI</p>
            <p className="text-lg font-bold text-blue-600">28x over 6 months</p>
          </div>
        </div>
      </div>

      {/* Analysis */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-6 flex items-center gap-2">
          <span className="text-lg">📊</span> Analysis
        </h3>

        <div className="space-y-6">
          <div>
            <h4 className="font-bold text-slate-900 mb-3">
              Current Situation:
            </h4>
            <ul className="space-y-2">
              {['Your email marketing is performing exceptionally (28% open rate)', 'Website organic traffic is below industry average', "You're hitting email limits 2 months in a row", 'Customer acquisition cost: $85 (industry avg: $65)'].map((item, i) => <li key={i} className="flex items-start gap-2 text-slate-600 text-sm">
                  <span className="text-slate-400 mt-1">•</span>
                  {item}
                </li>)}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-3">
              Opportunity Identified:
            </h4>
            <ul className="space-y-2">
              {['SEO content could reduce customer acquisition cost by 30%', 'Higher email capacity allows more aggressive campaigns', 'Content marketing builds long-term organic traffic'].map((item, i) => <li key={i} className="flex items-start gap-2 text-slate-600 text-sm">
                  <span className="text-slate-400 mt-1">•</span>
                  {item}
                </li>)}
            </ul>
          </div>
        </div>
      </div>

      {/* Projected Impact */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-6 flex items-center gap-2">
          <span className="text-lg">💰</span> Projected Impact
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
            <h4 className="font-bold text-slate-900 mb-2">
              Month 1-2: Foundation
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>• Jennifer creates content strategy</li>
              <li>• SEO improvements begin to index</li>
              <li>• Expected: +5% website traffic</li>
            </ul>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
            <h4 className="font-bold text-slate-900 mb-2">Month 3-4: Growth</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>• Organic traffic increases 25%</li>
              <li>• Email campaigns reach more prospects</li>
              <li>• Expected: +10 leads/month</li>
            </ul>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
            <h4 className="font-bold text-slate-900 mb-2">Month 5-6: Scale</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>• SEO rankings established</li>
              <li>• Organic traffic up 40%</li>
              <li>• Expected: +$4,200/month revenue</li>
            </ul>
          </div>
        </div>

        <div className="border border-slate-100 rounded-lg p-6">
          <h4 className="font-bold text-slate-900 mb-4 text-sm">
            Revenue Projection Chart
          </h4>
          <div className="h-48 relative flex items-end">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-slate-400">
              <span>$20K</span>
              <span>$16K</span>
              <span>$12K</span>
              <span>$8K</span>
            </div>

            {/* Chart Area */}
            <div className="ml-10 flex-1 h-full relative border-l border-b border-slate-200">
              {/* Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between">
                <div className="border-t border-slate-100 w-full h-0" />
                <div className="border-t border-slate-100 w-full h-0" />
                <div className="border-t border-slate-100 w-full h-0" />
                <div className="border-t border-slate-100 w-full h-0" />
              </div>

              {/* Lines */}
              <svg className="absolute inset-0 w-full h-full overflow-visible">
                {/* Current Trajectory (Dashed) */}
                <path d="M0,144 L100,135 L200,125 L300,115 L400,105 L500,95" fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />
                {/* With Proposal (Solid) */}
                <path d="M0,144 L100,135 L200,110 L300,80 L400,40 L500,10" fill="none" stroke="#2563eb" strokeWidth="2" />
              </svg>

              {/* X-axis labels */}
              <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-slate-400">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-6 mt-8 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-slate-400 border-t border-dashed" />
              <span className="text-slate-600">Current trajectory</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-blue-600" />
              <span className="text-slate-600">With proposal</span>
            </div>
          </div>
        </div>
      </div>

      {/* Implementation Plan */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-6 flex items-center gap-2">
          <span className="text-lg">📋</span> Implementation Plan
        </h3>
        <div className="space-y-4 relative pl-4 border-l-2 border-slate-100 ml-2">
          {[{
          day: 'Day 1',
          task: 'Jennifer activated, reviews your website'
        }, {
          day: 'Day 3',
          task: 'Content strategy delivered for your approval'
        }, {
          day: 'Day 7',
          task: 'First 2 blog posts published'
        }, {
          day: 'Day 14',
          task: 'Email upgrade complete, capacity increased'
        }, {
          day: 'Day 30',
          task: 'First performance report delivered'
        }].map((item, i) => <div key={i} className="relative">
              <div className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full bg-blue-600 border-2 border-white shadow-sm" />
              <p className="text-sm">
                <span className="font-bold text-slate-900">{item.day}:</span>{' '}
                <span className="text-slate-600">{item.task}</span>
              </p>
            </div>)}
        </div>
        <p className="mt-6 text-sm text-slate-500 font-medium pl-6">
          Timeline: 30 days to full implementation
        </p>
      </div>

      {/* Decision Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-6">
          Decision
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-left hover:bg-emerald-100 transition-colors group">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mb-3 group-hover:bg-emerald-200 transition-colors">
              <Check className="w-5 h-5 text-emerald-600" />
            </div>
            <h4 className="font-bold text-emerald-900 mb-1">
              Accept & Implement
            </h4>
            <p className="text-xs text-emerald-700">Start today</p>
          </button>

          <button className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-left hover:bg-blue-100 transition-colors group">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-3 group-hover:bg-blue-200 transition-colors">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <h4 className="font-bold text-blue-900 mb-1">Discuss with AI</h4>
            <p className="text-xs text-blue-700">Ask questions</p>
          </button>

          <button className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-left hover:bg-amber-100 transition-colors group">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mb-3 group-hover:bg-amber-200 transition-colors">
              <Edit className="w-5 h-5 text-amber-600" />
            </div>
            <h4 className="font-bold text-amber-900 mb-1">Modify Proposal</h4>
            <p className="text-xs text-amber-700">Adjust scope</p>
          </button>
        </div>

        <button className="w-full py-3 border border-slate-200 text-slate-500 font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
          <X className="w-4 h-4" /> Decline Proposal - I'll review
          recommendations again later
        </button>
      </div>
    </motion.div>;
}