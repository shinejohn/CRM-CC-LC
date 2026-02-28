import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, AlertTriangle, Check, X, Pause, Trash2 } from 'lucide-react';
export function ServiceConfigurationPage({
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
          <span className="text-2xl">⚙️</span> Configure: Email Marketing
        </h1>
        <button className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2">
          <Save className="w-4 h-4" /> Save Changes
        </button>
      </div>

      {/* Service Status */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">
          Service Status
        </h3>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-slate-600 font-medium">Status:</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{' '}
                Active
              </span>
            </div>
            <p className="text-sm text-slate-600">
              Active Since:{' '}
              <span className="font-medium text-slate-900">
                November 15, 2024
              </span>
            </p>
            <p className="text-sm text-slate-600">
              Monthly Cost:{' '}
              <span className="font-medium text-slate-900">
                $0 (included in Growth Plan)
              </span>
            </p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2">
              <Pause className="w-4 h-4" /> Pause Service
            </button>
            <button className="px-4 py-2 bg-white border border-slate-200 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2">
              <X className="w-4 h-4" /> Cancel Service
            </button>
          </div>
        </div>
      </div>

      {/* Usage This Month */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">
          Usage This Month
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-slate-700">
              Emails Sent: 3,200 of 5,000
            </span>
            <span className="font-bold text-blue-600">64%</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full w-[64%]" />
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="text-sm text-slate-500">
              Resets in:{' '}
              <span className="font-medium text-slate-900">15 days</span>
            </span>
            <button className="text-sm font-bold text-blue-600 hover:underline">
              Upgrade Limit
            </button>
          </div>
        </div>
      </div>

      {/* Email Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-6 flex items-center gap-2">
          <span className="text-lg">📧</span> Email Settings
        </h3>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                From Name
              </label>
              <input type="text" defaultValue="ABC Home Services" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                From Email
              </label>
              <input type="email" defaultValue="marketing@abchome.com" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Reply-To Email
            </label>
            <input type="email" defaultValue="info@abchome.com" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Default Footer
            </label>
            <textarea rows={4} defaultValue={`ABC Home Services | 123 Main St, Anytown FL\n(555) 123-4567 | www.abchomeservices.com\n[Unsubscribe] [Preferences]`} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono text-sm" />
          </div>
        </div>
      </div>

      {/* Schedule Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-6 flex items-center gap-2">
          <span className="text-lg">📅</span> Schedule Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Preferred Send Day
            </label>
            <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20">
              <option>Thursday</option>
              <option>Monday</option>
              <option>Tuesday</option>
              <option>Wednesday</option>
              <option>Friday</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Preferred Send Time
            </label>
            <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20">
              <option>9:00 AM</option>
              <option>10:00 AM</option>
              <option>11:00 AM</option>
              <option>2:00 PM</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Time Zone
            </label>
            <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20">
              <option>Eastern (ET)</option>
              <option>Central (CT)</option>
              <option>Mountain (MT)</option>
              <option>Pacific (PT)</option>
            </select>
          </div>
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
          <span className="text-sm text-slate-700">
            Allow Sarah to optimize send times based on open rates
          </span>
        </label>
      </div>

      {/* Integrations */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-6 flex items-center gap-2">
          <span className="text-lg">🔗</span> Integrations
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                <Check className="w-3 h-3 text-emerald-600" />
              </div>
              <span className="font-medium text-slate-900">
                Connected to CRM (sync customer emails)
              </span>
            </div>
            <span className="text-xs text-emerald-600 font-bold">Active</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                <Check className="w-3 h-3 text-emerald-600" />
              </div>
              <span className="font-medium text-slate-900">
                Connected to Website (signup forms)
              </span>
            </div>
            <span className="text-xs text-emerald-600 font-bold">Active</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 border-dashed">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-slate-400" />
              </div>
              <span className="font-medium text-slate-500">
                Not connected to Social Media
              </span>
            </div>
            <button className="text-xs font-bold text-blue-600 hover:underline">
              Connect
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 rounded-xl border border-red-100 p-6">
        <h3 className="text-sm font-bold text-red-800 uppercase tracking-wide mb-6 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> Danger Zone
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-red-900">Pause Service</h4>
              <p className="text-sm text-red-700">
                Temporarily stop email sending. Your data will be preserved.
              </p>
            </div>
            <button className="px-4 py-2 bg-white border border-red-200 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors">
              Pause Service
            </button>
          </div>
          <div className="h-px bg-red-200" />
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-red-900">Cancel Service</h4>
              <p className="text-sm text-red-700">
                Remove email marketing from your plan. This cannot be undone.
              </p>
            </div>
            <button className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors">
              Cancel Service
            </button>
          </div>
        </div>
      </div>
    </motion.div>;
}