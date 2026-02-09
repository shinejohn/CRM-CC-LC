import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Plus, Clock, Mail, GitBranch, Zap, Trash2, Edit2, ArrowDown } from 'lucide-react';
export function AutomationRuleBuilder({
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
          <ArrowLeft className="w-4 h-4" /> Back to Automations
        </button>
        <button className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2">
          <Save className="w-4 h-4" /> Save Automation
        </button>
      </div>

      <h1 className="text-2xl font-bold text-slate-900">
        ⚡ Create Automation
      </h1>

      {/* Automation Name */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Automation Name *
        </label>
        <input type="text" defaultValue="Welcome Sequence for New Customers" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
      </div>

      {/* Workflow Builder */}
      <div className="space-y-0 relative">
        {/* Trigger */}
        <div className="relative z-10">
          <div className="bg-white border-2 border-blue-100 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Zap className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">TRIGGER</h3>
                <p className="text-xs text-slate-500">When this happens</p>
              </div>
            </div>
            <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20">
              <option>New customer is created</option>
              <option>Appointment booked</option>
              <option>Job completed</option>
            </select>
          </div>
        </div>

        {/* Connector */}
        <div className="flex justify-center py-4">
          <div className="h-8 w-0.5 bg-slate-300" />
        </div>

        {/* Step 1: Wait */}
        <div className="relative z-10">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:border-blue-300 transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="font-bold text-slate-900">WAIT</h3>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex gap-3">
              <input type="number" defaultValue={1} className="w-20 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-center" />
              <select className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                <option>hour(s)</option>
                <option>day(s)</option>
                <option>minute(s)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Connector */}
        <div className="flex justify-center py-4">
          <div className="h-8 w-0.5 bg-slate-300" />
        </div>

        {/* Step 2: Send Email */}
        <div className="relative z-10">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:border-blue-300 transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="font-bold text-slate-900">SEND EMAIL</h3>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="space-y-3">
              <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                <option>Welcome Email 1</option>
                <option>Service Reminder</option>
              </select>
              <div className="text-sm text-slate-500 bg-slate-50 p-3 rounded border border-slate-200 italic">
                Subject: "Welcome to ABC Home Services, {'{{first_name}}'}!"
              </div>
              <div className="flex gap-3 text-sm">
                <button className="text-blue-600 hover:underline font-medium">
                  Preview
                </button>
                <button className="text-blue-600 hover:underline font-medium">
                  Edit Template
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Connector */}
        <div className="flex justify-center py-4">
          <div className="h-8 w-0.5 bg-slate-300" />
        </div>

        {/* Step 3: Condition */}
        <div className="relative z-10">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:border-blue-300 transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <GitBranch className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="font-bold text-slate-900">CONDITION</h3>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg mb-4">
              <option>Customer has NOT booked appointment</option>
              <option>Email was opened</option>
              <option>Link was clicked</option>
            </select>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-50 border border-emerald-100 rounded p-3 text-center">
                <span className="text-xs font-bold text-emerald-700 block mb-1">
                  YES
                </span>
                <span className="text-sm text-slate-600">Send Follow-up</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded p-3 text-center">
                <span className="text-xs font-bold text-slate-500 block mb-1">
                  NO
                </span>
                <span className="text-sm text-slate-600">End Sequence</span>
              </div>
            </div>
          </div>
        </div>

        {/* Add Step Button */}
        <div className="flex justify-center pt-8">
          <button className="px-4 py-2 bg-slate-50 border border-slate-200 border-dashed text-slate-600 font-medium rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Step
          </button>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mt-8">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">
          Settings
        </h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
            <span className="text-sm text-slate-700">
              Active - Start running this automation immediately
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
            <span className="text-sm text-slate-700">
              Send during business hours only (9 AM - 6 PM)
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
            <span className="text-sm text-slate-700">
              Don't send to unsubscribed contacts
            </span>
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button onClick={onBack} className="px-6 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors">
          Cancel
        </button>
        <button className="px-6 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors">
          Save as Draft
        </button>
        <button className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
          Activate
        </button>
      </div>
    </motion.div>;
}