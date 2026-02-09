import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Wrench, Store, Check } from 'lucide-react';
import { useBusinessMode, BusinessMode } from '../contexts/BusinessModeContext';
export function BusinessModeSettingsPage() {
  const {
    mode,
    setMode
  } = useBusinessMode();
  const modes = [{
    id: 'b2b-pipeline' as BusinessMode,
    icon: Building2,
    name: 'B2B Pipeline',
    description: 'For wholesalers, agencies, and consultants',
    features: ['Deal pipeline', 'Proposals', 'Account management', 'Contact tracking'],
    terminology: 'Accounts, Contacts, Deals, Proposals'
  }, {
    id: 'b2c-services' as BusinessMode,
    icon: Wrench,
    name: 'B2C Services',
    description: 'For plumbers, lawyers, contractors, and service providers',
    features: ['Job scheduling', 'Quotes', 'Client management', 'Service history'],
    terminology: 'Clients, Jobs, Quotes, Schedule'
  }, {
    id: 'b2c-retail' as BusinessMode,
    icon: Store,
    name: 'B2C Retail',
    description: 'For restaurants, salons, and retail stores',
    features: ['Loyalty programs', 'Visit tracking', 'Promotions', 'Guest profiles'],
    terminology: 'Guests, Visits, Rewards, Reservations'
  }];
  return <motion.div initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} className="max-w-5xl mx-auto pb-12 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Business Mode</h1>
        <p className="text-slate-500">
          Choose how the platform adapts to your business type
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>What is Business Mode?</strong> This setting customizes the
          interface, terminology, and features to match your industry. You can
          change this anytime.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {modes.map(modeOption => {
        const Icon = modeOption.icon;
        const isSelected = mode === modeOption.id;
        return <motion.button key={modeOption.id} onClick={() => setMode(modeOption.id)} whileHover={{
          scale: 1.02
        }} whileTap={{
          scale: 0.98
        }} className={`relative text-left p-6 rounded-xl border-2 transition-all ${isSelected ? 'border-blue-600 bg-blue-50 shadow-lg' : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'}`}>
              {isSelected && <div className="absolute top-4 right-4 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>}

              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${isSelected ? 'bg-blue-100' : 'bg-slate-100'}`}>
                <Icon className={`w-6 h-6 ${isSelected ? 'text-blue-600' : 'text-slate-600'}`} />
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {modeOption.name}
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                {modeOption.description}
              </p>

              <div className="space-y-2 mb-4">
                {modeOption.features.map((feature, i) => <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                    <div className="w-1 h-1 rounded-full bg-slate-400" />
                    {feature}
                  </div>)}
              </div>

              <div className="pt-4 border-t border-slate-200">
                <p className="text-xs text-slate-500 font-medium">
                  Terminology:
                </p>
                <p className="text-xs text-slate-600 italic">
                  {modeOption.terminology}
                </p>
              </div>
            </motion.button>;
      })}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">
          What Changes?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-bold text-slate-900 mb-2">
              Navigation & Labels
            </h4>
            <p className="text-sm text-slate-600">
              Menu items, page titles, and field labels adapt to your industry's
              common terms.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-2">
              Available Features
            </h4>
            <p className="text-sm text-slate-600">
              Some features are mode-specific. For example, B2B gets a deal
              pipeline, while Retail gets loyalty programs.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-2">Reports & Metrics</h4>
            <p className="text-sm text-slate-600">
              Dashboard widgets and reports show metrics relevant to your
              business model.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-2">
              AI Recommendations
            </h4>
            <p className="text-sm text-slate-600">
              Your AI employees provide advice tailored to your industry and
              workflow.
            </p>
          </div>
        </div>
      </div>
    </motion.div>;
}