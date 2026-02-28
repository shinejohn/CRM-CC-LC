import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, User, Clock, Target, Link, Check, AlertTriangle } from 'lucide-react';
export function AIEmployeeConfigurationPage({
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
          <ArrowLeft className="w-4 h-4" /> Back to My Services
        </button>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <span className="text-2xl">⚙️</span> Configure: Sarah (Marketing
          Manager)
        </h1>
        <button className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2">
          <Save className="w-4 h-4" /> Save Changes
        </button>
      </div>

      {/* Profile Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-4xl shadow-lg shrink-0">
            👩‍💼
          </div>
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Sarah - Marketing Manager
                </h2>
                <div className="flex items-center gap-4 mt-1 text-sm">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{' '}
                    Active
                  </span>
                  <span className="text-slate-600">
                    Performance:{' '}
                    <span className="font-bold text-emerald-600">
                      94% efficiency
                    </span>
                  </span>
                  <span className="text-slate-600">
                    Tasks this week:{' '}
                    <span className="font-bold text-slate-900">47</span>
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">
                  View Performance Report
                </button>
                <button className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">
                  Pause Sarah
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Personality & Communication */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-6 flex items-center gap-2">
          <User className="w-4 h-4" /> Personality & Communication
        </h3>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Communication Style
            </label>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="style" className="w-4 h-4 text-blue-600 focus:ring-blue-500" defaultChecked />
                <span className="text-sm text-slate-700">Friendly & Warm</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="style" className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm text-slate-700">Professional</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="style" className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm text-slate-700">Casual & Fun</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email Tone
              </label>
              <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                <option>Conversational but professional</option>
                <option>Strictly professional</option>
                <option>Enthusiastic and energetic</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Signature Name
              </label>
              <input type="text" defaultValue="Sarah from ABC Home Services" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
              <span className="text-sm text-slate-700">
                Include company signature in all emails
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
              <span className="text-sm text-slate-700">
                Use emojis occasionally (in subject lines)
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
              <span className="text-sm text-slate-700">
                Add personal touches (birthdays, holidays)
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Task Permissions */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-6 flex items-center gap-2">
          <Check className="w-4 h-4" /> Task Permissions
        </h3>

        <div className="mb-6">
          <h4 className="text-sm font-bold text-slate-900 mb-3">
            Sarah can automatically:
          </h4>
          <div className="space-y-2">
            {['Send scheduled email campaigns', 'Post to social media (approved content only)', 'Respond to simple email inquiries', 'Create and schedule content calendar'].map((perm, i) => <div key={i} className="flex items-center gap-3 text-sm text-slate-600">
                <Check className="w-4 h-4 text-emerald-500" />
                {perm}
              </div>)}
            {['Send promotional offers (requires approval)', 'Spend advertising budget (requires approval)'].map((perm, i) => <div key={i} className="flex items-center gap-3 text-sm text-slate-400">
                <div className="w-4 h-4 rounded-full border border-slate-300" />
                {perm}
              </div>)}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold text-slate-900 mb-3">
            Approval Required For:
          </h4>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
              <span className="text-sm text-slate-700">
                Campaigns over 500 recipients
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
              <span className="text-sm text-slate-700">
                Offers with discounts over 20%
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
              <span className="text-sm text-slate-700">
                Ad spend over $50/day
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Schedule & Availability */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-6 flex items-center gap-2">
          <Clock className="w-4 h-4" /> Schedule & Availability
        </h3>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Working Hours
            </label>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="hours" className="w-4 h-4 text-blue-600 focus:ring-blue-500" defaultChecked />
                <span className="text-sm text-slate-700">24/7</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="hours" className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm text-slate-700">
                  Business Hours Only
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="hours" className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm text-slate-700">Custom</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Email Campaign Days
            </label>
            <div className="flex flex-wrap gap-3">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => <label key={day} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked={day === 'Thu'} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                  <span className="text-sm text-slate-700">{day}</span>
                </label>)}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Preferred Send Time
            </label>
            <select className="w-full md:w-64 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20">
              <option>9:00 AM</option>
              <option>10:00 AM</option>
              <option>2:00 PM</option>
            </select>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
            <span className="text-sm text-slate-700">
              Optimize send times based on recipient engagement
            </span>
          </label>
        </div>
      </div>

      {/* Goals & Targets */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-6 flex items-center gap-2">
          <Target className="w-4 h-4" /> Goals & Targets
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Monthly Email Goal
            </label>
            <div className="relative">
              <input type="number" defaultValue={4} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              <span className="absolute right-3 top-2 text-sm text-slate-500">
                campaigns
              </span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Target Open Rate
            </label>
            <div className="relative">
              <input type="number" defaultValue={25} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              <span className="absolute right-3 top-2 text-sm text-slate-500">
                %
              </span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Target Click Rate
            </label>
            <div className="relative">
              <input type="number" defaultValue={3} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              <span className="absolute right-3 top-2 text-sm text-slate-500">
                %
              </span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Lead Generation Goal
            </label>
            <div className="relative">
              <input type="number" defaultValue={20} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              <span className="absolute right-3 top-2 text-sm text-slate-500">
                leads/month
              </span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold text-slate-900 mb-4">
            Current Performance vs Goals:
          </h4>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">Campaigns: 3 of 4</span>
                <span className="font-bold text-blue-600">75%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full w-[75%]" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">
                  Open Rate: 28% (▲ above target)
                </span>
                <Check className="w-4 h-4 text-emerald-500" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">
                  Click Rate: 4.2% (▲ above target)
                </span>
                <Check className="w-4 h-4 text-emerald-500" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">Leads: 18 of 20</span>
                <span className="font-bold text-blue-600">90%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full w-[90%]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Integrations */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-6 flex items-center gap-2">
          <Link className="w-4 h-4" /> Integrations
        </h3>
        <div className="space-y-3">
          {['Email Marketing (5,000 sends/mo)', 'CRM (customer data)', 'Social Media (Facebook, Instagram)'].map((integration, i) => <div key={i} className="flex items-center gap-3 text-sm text-slate-600">
              <Check className="w-4 h-4 text-emerald-500" />
              {integration}
            </div>)}
          <div className="flex items-center gap-3 text-sm text-slate-400">
            <div className="w-4 h-4 rounded-full border border-slate-300" />
            Advertising Platform{' '}
            <button className="text-blue-600 hover:underline font-medium">
              Connect →
            </button>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-400">
            <div className="w-4 h-4 rounded-full border border-slate-300" />
            Website Analytics{' '}
            <button className="text-blue-600 hover:underline font-medium">
              Connect →
            </button>
          </div>
        </div>
      </div>
    </motion.div>;
}