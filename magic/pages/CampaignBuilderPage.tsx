import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Sparkles, Bold, Italic, Underline, Link, Image, Layout, Type, Eye } from 'lucide-react';
export function CampaignBuilderPage({
  onBack
}: {
  onBack: () => void;
}) {
  const [step, setStep] = useState(2);
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
          <ArrowLeft className="w-4 h-4" /> Back to Communications
        </button>
        <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2">
          <Save className="w-4 h-4" /> Save Draft
        </button>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">
          📧 Create Email Campaign
        </h1>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm font-medium text-slate-500 mb-2">
          <span>Step {step} of 4: Design Email</span>
        </div>
        <div className="relative flex items-center justify-between">
          <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-slate-200 -z-10" />
          <div className="absolute left-0 top-1/2 h-0.5 bg-blue-600 -z-10 transition-all duration-500" style={{
          width: '33%'
        }} />

          {['Audience', 'Design', 'Schedule', 'Review'].map((label, i) => <div key={i} className="flex flex-col items-center gap-2 bg-slate-50 px-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${i + 1 < step ? 'bg-blue-600 text-white' : i + 1 === step ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                {i + 1 < step ? '✓' : i + 1}
              </div>
              <span className={`text-xs font-medium ${i + 1 <= step ? 'text-blue-600' : 'text-slate-500'}`}>
                {label}
              </span>
            </div>)}
        </div>
      </div>

      {/* Campaign Details */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-6">
          Campaign Details
        </h3>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Campaign Name *
            </label>
            <input type="text" defaultValue="January Newsletter" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Subject Line *
            </label>
            <input type="text" defaultValue="🔧 New Year, New Home Tips from ABC Home Services" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Preview Text
            </label>
            <input type="text" defaultValue="Start the year with a healthy home - exclusive tips inside..." className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="font-bold text-blue-900 text-sm">
                AI Suggestions
              </span>
            </div>
            <div className="space-y-2">
              <button className="w-full text-left p-2 hover:bg-blue-100 rounded transition-colors text-sm text-blue-800 flex justify-between">
                <span>"5 Home Maintenance Tips for January"</span>
                <span className="text-blue-600 font-medium">32% open rate</span>
              </button>
              <button className="w-full text-left p-2 hover:bg-blue-100 rounded transition-colors text-sm text-blue-800 flex justify-between">
                <span>"Your 2025 Home Care Checklist"</span>
                <span className="text-blue-600 font-medium">28% open rate</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Email Content */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide">
            Email Content
          </h3>
          <div className="flex gap-3">
            <select className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700">
              <option>Newsletter Template</option>
              <option>Promotional Template</option>
              <option>Plain Text</option>
            </select>
            <button className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2">
              <Eye className="w-4 h-4" /> Preview
            </button>
          </div>
        </div>

        <div className="border border-slate-200 rounded-lg overflow-hidden">
          {/* Toolbar */}
          <div className="bg-slate-50 border-b border-slate-200 p-2 flex gap-1">
            <button className="p-1.5 hover:bg-slate-200 rounded text-slate-600">
              <Bold className="w-4 h-4" />
            </button>
            <button className="p-1.5 hover:bg-slate-200 rounded text-slate-600">
              <Italic className="w-4 h-4" />
            </button>
            <button className="p-1.5 hover:bg-slate-200 rounded text-slate-600">
              <Underline className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-slate-300 mx-1" />
            <button className="p-1.5 hover:bg-slate-200 rounded text-slate-600">
              <Link className="w-4 h-4" />
            </button>
            <button className="p-1.5 hover:bg-slate-200 rounded text-slate-600">
              <Image className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-slate-300 mx-1" />
            <button className="p-1.5 hover:bg-slate-200 rounded text-slate-600">
              <Layout className="w-4 h-4" />
            </button>
            <button className="p-1.5 hover:bg-slate-200 rounded text-slate-600">
              <Type className="w-4 h-4" />
            </button>
            <div className="flex-1" />
            <button className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full flex items-center gap-1 hover:bg-blue-200 transition-colors">
              <Sparkles className="w-3 h-3" /> AI Write
            </button>
          </div>

          {/* Editor */}
          <textarea className="w-full h-96 p-6 focus:outline-none resize-none font-sans text-slate-700 leading-relaxed" defaultValue={`Hi {{first_name}},

Happy New Year from everyone at ABC Home Services! 🎉

As we kick off 2025, it's the perfect time to give your home some attention. Here are our top tips for starting the year right:

1. Check your air filters
2. Inspect your water heater
3. Test smoke detectors

Need help with any of these? We're just a call away.

Best,
The ABC Team`} />
        </div>
      </div>

      {/* Audience Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-1">
            Audience Summary
          </h3>
          <p className="text-slate-900 font-medium">
            Sending to: <span className="font-bold">All Active Customers</span>{' '}
            (245 recipients)
          </p>
        </div>
        <button className="text-sm font-bold text-blue-600 hover:underline">
          Edit Audience
        </button>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <button onClick={() => setStep(Math.max(1, step - 1))} className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-colors">
          Back
        </button>
        <button onClick={() => setStep(Math.min(4, step + 1))} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
          Next Step
        </button>
      </div>
    </motion.div>;
}