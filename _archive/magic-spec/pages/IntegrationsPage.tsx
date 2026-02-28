import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Settings, Unlink, Calendar, Facebook, CreditCard, Instagram, DollarSign, Mail, MessageSquare, Zap, BarChart3, Clock } from 'lucide-react';
export function IntegrationsPage({
  onBack
}: {
  onBack: () => void;
}) {
  const connectedIntegrations = [{
    name: 'Google Calendar',
    icon: Calendar,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
    details: 'Syncing with: john@abchome.com',
    lastSync: 'Last sync: 5 minutes ago'
  }, {
    name: 'Facebook',
    icon: Facebook,
    iconColor: 'text-blue-700',
    iconBg: 'bg-blue-100',
    details: 'Page: ABC Home Services',
    lastSync: 'Permissions: Post, Read Messages'
  }, {
    name: 'Stripe',
    icon: CreditCard,
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-100',
    details: 'Account: ABC Home Services LLC',
    lastSync: 'Mode: Live'
  }];
  const availableIntegrations = [{
    name: 'Instagram',
    icon: Instagram,
    iconColor: 'text-pink-600',
    iconBg: 'bg-pink-100'
  }, {
    name: 'QuickBooks',
    icon: DollarSign,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-100'
  }, {
    name: 'Mailchimp',
    icon: Mail,
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-100'
  }, {
    name: 'Twilio',
    icon: MessageSquare,
    iconColor: 'text-red-600',
    iconBg: 'bg-red-100'
  }, {
    name: 'Google Analytics',
    icon: BarChart3,
    iconColor: 'text-orange-600',
    iconBg: 'bg-orange-100'
  }, {
    name: 'Calendly',
    icon: Clock,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100'
  }, {
    name: 'Slack',
    icon: MessageSquare,
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-100'
  }, {
    name: 'Zapier',
    icon: Zap,
    iconColor: 'text-orange-600',
    iconBg: 'bg-orange-100'
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
          <ArrowLeft className="w-4 h-4" /> Settings
        </button>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <span className="text-2xl">🔗</span> Integrations
        </h1>
        <div className="w-[120px]" /> {/* Spacer for alignment */}
      </div>

      {/* Connected Integrations */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">
            Connected ({connectedIntegrations.length})
          </h3>
        </div>
        <div className="divide-y divide-slate-100">
          {connectedIntegrations.map((integration, index) => <motion.div key={index} initial={{
          opacity: 0,
          x: -10
        }} animate={{
          opacity: 1,
          x: 0
        }} transition={{
          delay: index * 0.05
        }} className="p-6 hover:bg-slate-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl ${integration.iconBg} flex items-center justify-center ${integration.iconColor} shrink-0`}>
                    <integration.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-slate-900">
                        {integration.name}
                      </h4>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full flex items-center gap-1">
                        ✓ Connected
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">
                      {integration.details}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {integration.lastSync}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded transition-colors flex items-center gap-1">
                    <Settings className="w-3 h-3" /> Settings
                  </button>
                  <button className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded transition-colors flex items-center gap-1">
                    <Unlink className="w-3 h-3" /> Disconnect
                  </button>
                </div>
              </div>
            </motion.div>)}
        </div>
      </div>

      {/* Available Integrations */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">Available Integrations</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {availableIntegrations.map((integration, index) => <motion.div key={index} initial={{
            opacity: 0,
            scale: 0.9
          }} animate={{
            opacity: 1,
            scale: 1
          }} transition={{
            delay: index * 0.05
          }} whileHover={{
            y: -4
          }} className="border border-slate-200 rounded-xl p-4 flex flex-col items-center text-center gap-3 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group">
                <div className={`w-12 h-12 rounded-xl ${integration.iconBg} flex items-center justify-center ${integration.iconColor} group-hover:scale-110 transition-transform`}>
                  <integration.icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-2">
                    {integration.name}
                  </h4>
                  <button className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm w-full">
                    Connect
                  </button>
                </div>
              </motion.div>)}
          </div>
        </div>
      </div>
    </motion.div>;
}