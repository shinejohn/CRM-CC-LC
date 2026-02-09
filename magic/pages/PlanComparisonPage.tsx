import React, { Fragment } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, X, Star } from 'lucide-react';
export function PlanComparisonPage({
  onBack,
  onUpgrade
}: {
  onBack: () => void;
  onUpgrade: () => void;
}) {
  const features = [{
    name: 'AI Employees',
    starter: '2 included',
    growth: '4 included',
    enterprise: 'Unlimited'
  }, {
    name: 'Email Sends',
    starter: '1,000/mo',
    growth: '5,000/mo',
    enterprise: '25,000/mo'
  }, {
    name: 'CRM Contacts',
    starter: '500',
    growth: '2,500',
    enterprise: 'Unlimited'
  }, {
    name: 'Storage',
    starter: '5 GB',
    growth: '25 GB',
    enterprise: '100 GB'
  }, {
    name: 'Support',
    starter: 'Email',
    growth: 'Email + Chat',
    enterprise: 'Priority'
  }, {
    name: 'Analytics',
    starter: 'Basic',
    growth: 'Advanced',
    enterprise: 'Custom'
  }, {
    name: 'API Access',
    starter: false,
    growth: true,
    enterprise: true
  }, {
    name: 'White Label',
    starter: false,
    growth: false,
    enterprise: true
  }];
  return <motion.div initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} className="max-w-5xl mx-auto pb-12 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to My Services
        </button>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <span className="text-2xl">📊</span> Compare Plans
        </h1>
        <div className="w-24" /> {/* Spacer */}
      </div>

      <div className="text-center mb-8">
        <span className="inline-block px-4 py-2 bg-blue-50 text-blue-700 font-medium rounded-full text-sm border border-blue-100">
          Your Current Plan: <span className="font-bold">Tier 2 Growth</span>
        </span>
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="grid grid-cols-4 divide-x divide-slate-100">
          {/* Header Row */}
          <div className="p-6 bg-slate-50"></div>
          <div className="p-6 bg-slate-50 text-center">
            <h3 className="font-bold text-slate-900 text-lg">Starter</h3>
            <p className="text-slate-500 font-medium mt-1">$99/mo</p>
          </div>
          <div className="p-6 bg-blue-50 text-center relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500" />
            <div className="flex items-center justify-center gap-1 mb-1">
              <h3 className="font-bold text-blue-900 text-lg">Growth</h3>
              <Star className="w-4 h-4 text-amber-400 fill-current" />
            </div>
            <p className="text-blue-700 font-medium">$199/mo</p>
            <span className="inline-block px-2 py-0.5 bg-blue-200 text-blue-800 text-xs font-bold rounded mt-2">
              Current
            </span>
          </div>
          <div className="p-6 bg-slate-50 text-center">
            <h3 className="font-bold text-slate-900 text-lg">Enterprise</h3>
            <p className="text-slate-500 font-medium mt-1">$399/mo</p>
          </div>

          {/* Feature Rows */}
          {features.map((feature, index) => <Fragment key={index}>
              <div className="p-4 px-6 text-sm font-medium text-slate-700 bg-white flex items-center border-t border-slate-100">
                {feature.name}
              </div>
              <div className="p-4 text-sm text-slate-600 text-center bg-white border-t border-slate-100 flex items-center justify-center">
                {typeof feature.starter === 'boolean' ? feature.starter ? <Check className="w-5 h-5 text-emerald-500" /> : <X className="w-5 h-5 text-slate-300" /> : feature.starter}
              </div>
              <div className="p-4 text-sm text-slate-900 font-medium text-center bg-blue-50/30 border-t border-slate-100 flex items-center justify-center">
                {typeof feature.growth === 'boolean' ? feature.growth ? <Check className="w-5 h-5 text-emerald-500" /> : <X className="w-5 h-5 text-slate-300" /> : feature.growth}
              </div>
              <div className="p-4 text-sm text-slate-600 text-center bg-white border-t border-slate-100 flex items-center justify-center">
                {typeof feature.enterprise === 'boolean' ? feature.enterprise ? <Check className="w-5 h-5 text-emerald-500" /> : <X className="w-5 h-5 text-slate-300" /> : feature.enterprise}
              </div>
            </Fragment>)}

          {/* Action Row */}
          <div className="p-6 bg-white border-t border-slate-100"></div>
          <div className="p-6 bg-white border-t border-slate-100 text-center">
            <button className="w-full py-2 border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-colors">
              Downgrade
            </button>
          </div>
          <div className="p-6 bg-blue-50/30 border-t border-slate-100 text-center">
            <button disabled className="w-full py-2 bg-slate-100 text-slate-400 font-medium rounded-lg cursor-not-allowed">
              Current Plan
            </button>
          </div>
          <div className="p-6 bg-white border-t border-slate-100 text-center">
            <button onClick={onUpgrade} className="w-full py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
              Upgrade
            </button>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
          <span className="text-xl">💡</span>
        </div>
        <div>
          <p className="text-blue-900 font-medium mb-1">AI Recommendation</p>
          <p className="text-blue-700 text-sm">
            Based on your usage, you're a good fit for Growth. Enterprise would
            unlock unlimited AI employees and 5x email capacity, which might be
            useful if you plan to scale your team significantly in the next
            quarter.
          </p>
        </div>
      </div>
    </motion.div>;
}