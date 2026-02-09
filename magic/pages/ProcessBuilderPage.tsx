import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Eye, Plus, Edit2, Trash2, ArrowDown, GitBranch } from 'lucide-react';
export function ProcessBuilderPage({
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
          <ArrowLeft className="w-4 h-4" /> Back to Business Profile
        </button>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2">
            <Eye className="w-4 h-4" /> Preview
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2">
            <Save className="w-4 h-4" /> Save Process
          </button>
        </div>
      </div>

      <h1 className="text-2xl font-bold text-slate-900">
        📋 Edit Process: New Customer Intake
      </h1>

      {/* Process Details */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-6">
          Process Details
        </h3>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Process Name *
            </label>
            <input type="text" defaultValue="New Customer Intake Process" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea rows={2} defaultValue="Steps for handling new customer inquiries and booking first appointment." className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Assigned AI
            </label>
            <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20">
              <option>Olivia (Customer Service)</option>
              <option>Sarah (Marketing)</option>
              <option>Derek (Operations)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Process Steps */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide">
            Process Steps
          </h3>
          <button className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1">
            <Plus className="w-4 h-4" /> Add Step
          </button>
        </div>

        <div className="space-y-0">
          {/* Step 1 */}
          <div className="relative z-10">
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:border-blue-300 transition-colors group">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                    1
                  </span>
                  Capture Details
                </h4>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-3">
                Capture name, phone, email, and address
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded border border-emerald-100">
                  Required: Name
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded border border-emerald-100">
                  Required: Phone
                </span>
              </div>
            </div>
          </div>

          {/* Connector */}
          <div className="flex justify-center py-2">
            <ArrowDown className="w-5 h-5 text-slate-300" />
          </div>

          {/* Step 2 */}
          <div className="relative z-10">
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:border-blue-300 transition-colors group">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                    2
                  </span>
                  Identify Service
                </h4>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-3">
                Ask what service is needed
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded border border-blue-100">
                  Source: Service Catalog
                </span>
              </div>
            </div>
          </div>

          {/* Connector */}
          <div className="flex justify-center py-2">
            <ArrowDown className="w-5 h-5 text-slate-300" />
          </div>

          {/* Step 3 */}
          <div className="relative z-10">
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:border-blue-300 transition-colors group">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                    3
                  </span>
                  Check Service Area
                </h4>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-3">
                Check if address is in service area
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded border border-amber-100">
                  Action: Politely decline if outside
                </span>
              </div>
            </div>
          </div>

          {/* Connector */}
          <div className="flex justify-center py-2">
            <ArrowDown className="w-5 h-5 text-slate-300" />
          </div>

          {/* Step 4 */}
          <div className="relative z-10">
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:border-blue-300 transition-colors group">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                    4
                  </span>
                  Book Appointment
                </h4>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-3">
                Offer next available appointment
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded border border-purple-100">
                  Calendar: Derek's Schedule
                </span>
              </div>
            </div>
          </div>

          {/* Add Step Button */}
          <div className="flex justify-center pt-4">
            <button className="px-4 py-2 bg-slate-50 border border-slate-200 border-dashed text-slate-600 font-medium rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Step
            </button>
          </div>
        </div>
      </div>

      {/* Conditional Rules */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
            <GitBranch className="w-4 h-4" /> Conditional Rules
          </h3>
          <button className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1">
            <Plus className="w-4 h-4" /> Add Rule
          </button>
        </div>

        <div className="space-y-3">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-3">
            <span className="font-mono text-xs font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded">
              IF
            </span>
            <span className="text-sm text-slate-700">
              service = "Emergency"
            </span>
            <span className="font-mono text-xs font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded">
              THEN
            </span>
            <span className="text-sm text-slate-700">
              skip to step 4 and prioritize
            </span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-3">
            <span className="font-mono text-xs font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded">
              IF
            </span>
            <span className="text-sm text-slate-700">customer exists</span>
            <span className="font-mono text-xs font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded">
              THEN
            </span>
            <span className="text-sm text-slate-700">
              update record instead of create new
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <button className="px-6 py-2 text-red-600 font-medium hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2">
          <Trash2 className="w-4 h-4" /> Delete Process
        </button>
        <div className="flex gap-3">
          <button onClick={onBack} className="px-6 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
            Save Process
          </button>
        </div>
      </div>
    </motion.div>;
}